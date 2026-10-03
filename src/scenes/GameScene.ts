// src/scenes/GameScene.ts

import Phaser from 'phaser';
import { Player, MobileInputState } from '../objects/Player';
import { soundManager } from '../utils/audio';
import { ytPlayables } from '../utils/ytPlayables';
import {
  getLevelConfig,
  getTotalLevels,
  hasNextLevel,
  ILevelConfig,
} from '../data/LevelConfig';
import { MovingPlatform } from '../objects/MovingPlatform';
import { BreakableBlock } from '../objects/BreakableBlock';
import { Bouncer } from '../objects/Bouncer';
import { MudZone } from '../objects/MudZone';
import { Switch } from '../objects/Switch';
import { Gate } from '../objects/Gate';
import { PatrolEnemy } from '../objects/PatrolEnemy';
import { Crusher } from '../objects/Crusher';
import { WindZone } from '../objects/WindZone';
import { WaterZone } from '../objects/WaterZone';
import { MonsterMouth } from '../objects/MonsterMouth';
import { createCurvedTerrain } from '../utils/LevelGenerator';
import { GAME_CONFIG } from '../config/gameConstants';

export interface LevelStats {
  score: number;
  health: number;
  maxHealth: number;
  coinsCollected: number;
  totalCoins: number;
  startTime: number;
}

export class GameScene extends Phaser.Scene {
  public currentLevelNumber: number = 1;
  public currentLevel!: ILevelConfig;

  public player!: Player;
  private platforms!: Phaser.Physics.Arcade.StaticGroup;
  private spikes!: Phaser.Physics.Arcade.StaticGroup;
  private coins!: Phaser.Physics.Arcade.Group;
  private springs!: Phaser.Physics.Arcade.StaticGroup;
  private portal!: Phaser.Physics.Arcade.Sprite;

  // Progressive Mechanics Containers & Groups
  private movingPlatforms: MovingPlatform[] = [];
  private breakableBlocks!: Phaser.Physics.Arcade.StaticGroup;
  private bouncers!: Phaser.Physics.Arcade.StaticGroup;
  private mudZones: MudZone[] = [];
  private waterZones: WaterZone[] = [];
  private monsterMouths: MonsterMouth[] = [];
  private curvedGraphics: Phaser.GameObjects.Graphics[] = [];
  private switches: Switch[] = [];
  private gates: Map<string, Gate> = new Map();
  private patrolEnemies: PatrolEnemy[] = [];
  private crushers: Crusher[] = [];
  private windZones: WindZone[] = [];

  private bgSky!: Phaser.GameObjects.TileSprite;
  private bgMountains!: Phaser.GameObjects.TileSprite;
  private bgTrees!: Phaser.GameObjects.TileSprite;

  private coinSparkleEmitter!: Phaser.GameObjects.Particles.ParticleEmitter;
  private hazardEmitter!: Phaser.GameObjects.Particles.ParticleEmitter;
  private portalEmitter!: Phaser.GameObjects.Particles.ParticleEmitter;

  private stats: LevelStats = {
    score: 0,
    health: GAME_CONFIG.PLAYER.INITIAL_HEALTH,
    maxHealth: GAME_CONFIG.PLAYER.MAX_HEALTH,
    coinsCollected: 0,
    totalCoins: 0,
    startTime: 0,
  };

  private checkpoint: { x: number; y: number } = { x: 120, y: 480 };
  private isLevelCompleted: boolean = false;

  constructor() {
    super('GameScene');
  }

  public init(data?: { levelNumber?: number }): void {
    this.currentLevelNumber = data?.levelNumber && data.levelNumber > 0 ? data.levelNumber : 1;
    this.currentLevel = getLevelConfig(this.currentLevelNumber);
  }

  public create(): void {
    if (!this.currentLevel) {
      this.currentLevel = getLevelConfig(this.currentLevelNumber);
    }

    this.isLevelCompleted = false;
    this.checkpoint = { ...this.currentLevel.spawnPoint };
    this.stats = {
      score: 0,
      health: GAME_CONFIG.PLAYER.INITIAL_HEALTH,
      maxHealth: GAME_CONFIG.PLAYER.MAX_HEALTH,
      coinsCollected: 0,
      totalCoins: 0,
      startTime: this.time.now,
    };

    // Configure arcade physics world bounds for current level
    this.physics.world.setBounds(
      0,
      0,
      this.currentLevel.worldWidth,
      this.currentLevel.worldHeight + 140
    );
    this.physics.world.checkCollision.down = false;

    // 1. Build Parallax Background Layers
    this.createParallaxLayers();

    // 2. Setup Particle Systems
    this.createParticleSystems();

    // 3. Build Level Geometry & Entities dynamically from LevelConfig
    this.createLevel();

    // 4. Create Player at Level's initial spawn point
    this.player = new Player(this, this.checkpoint.x, this.checkpoint.y);

    // 5. Setup Collisions and Overlaps
    this.setupPhysicsInteractions();

    // 6. Setup Camera Tracking
    this.setupCamera();

    // 7. Connect UI Events & Listeners
    this.setupUIEvents();

    // 8. Setup YouTube Playables Pause / Resume Listeners
    const cleanupPause = ytPlayables.onPause(() => {
      if (this.scene.isActive('GameScene')) {
        this.physics.pause();
        this.player.isActionDisabled = true;
      }
    });

    const cleanupResume = ytPlayables.onResume(() => {
      if (this.scene.isActive('GameScene')) {
        this.physics.resume();
        this.player.isActionDisabled = false;
      }
    });

    this.events.once('shutdown', () => {
      cleanupPause();
      cleanupResume();
      soundManager.stopBgMusic();
      this.cleanupMechanicObjects();
    });

    // 9. Start Continuous Background Music
    soundManager.startBgMusic();
  }

  private cleanupMechanicObjects(): void {
    this.movingPlatforms.forEach((p) => p.destroy());
    this.movingPlatforms = [];

    this.mudZones.forEach((m) => m.destroy());
    this.mudZones = [];

    this.switches.forEach((s) => s.destroy());
    this.switches = [];

    this.gates.forEach((g) => g.destroy());
    this.gates.clear();

    this.patrolEnemies.forEach((e) => e.destroy());
    this.patrolEnemies = [];

    this.crushers.forEach((c) => c.destroy());
    this.crushers = [];

    this.windZones.forEach((w) => w.destroy());
    this.windZones = [];

    this.waterZones.forEach((w) => w.destroy());
    this.waterZones = [];

    this.monsterMouths.forEach((m) => m.destroy());
    this.monsterMouths = [];

    this.curvedGraphics.forEach((g) => g.destroy());
    this.curvedGraphics = [];
  }

  private createParallaxLayers(): void {
    const W = this.currentLevel.worldWidth;
    const H = this.currentLevel.worldHeight;
    const theme = this.currentLevel.backgroundTheme;

    this.bgSky = this.add.tileSprite(0, 0, this.scale.width, H, 'bg-sky');
    this.bgSky.setOrigin(0, 0).setScrollFactor(0);
    if (theme?.skyTint) {
      this.bgSky.setTint(theme.skyTint);
    }

    this.bgMountains = this.add.tileSprite(0, H - 320, W, 320, 'bg-mountains');
    this.bgMountains.setOrigin(0, 0).setScrollFactor(0.15, 1);
    if (theme?.mountainTint) {
      this.bgMountains.setTint(theme.mountainTint);
    }

    this.bgTrees = this.add.tileSprite(0, H - 240, W, 240, 'bg-trees');
    this.bgTrees.setOrigin(0, 0).setScrollFactor(0.4, 1);
    if (theme?.treesTint) {
      this.bgTrees.setTint(theme.treesTint);
    }

    const cloudCount = Math.floor(W / 650);
    for (let i = 0; i < cloudCount; i++) {
      const cx = 200 + i * 650 + Math.sin(i * 1.5) * 120;
      const cy = 70 + (i % 3) * 35;
      const cloud = this.add.image(cx, cy, 'cloud');
      cloud.setScale(0.85 + (i % 3) * 0.2).setAlpha(0.8).setScrollFactor(0.25, 1);
      this.tweens.add({
        targets: cloud,
        x: cloud.x + 50,
        duration: 8000 + (i % 4) * 2000,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut',
      });
    }
  }

  private createParticleSystems(): void {
    this.coinSparkleEmitter = this.add.particles(0, 0, 'sparkle', {
      speed: { min: 40, max: 140 },
      scale: { start: 1.2, end: 0.1 },
      alpha: { start: 1, end: 0 },
      lifespan: 450,
      emitting: false,
    });
    this.coinSparkleEmitter.setDepth(15);

    this.hazardEmitter = this.add.particles(0, 0, 'dust', {
      speed: { min: 60, max: 180 },
      scale: { start: 1.4, end: 0.2 },
      tint: [0xe11d48, 0xf43f5e, 0x991b1b],
      lifespan: 500,
      emitting: false,
    });
    this.hazardEmitter.setDepth(15);

    this.portalEmitter = this.add.particles(0, 0, 'sparkle', {
      speed: { min: 20, max: 60 },
      angle: { min: 0, max: 360 },
      scale: { start: 0.8, end: 0 },
      tint: [0x06b6d4, 0x8b5cf6, 0xffffff],
      lifespan: 600,
      frequency: 120,
    });
    this.portalEmitter.setDepth(10);
  }

  /**
   * Dynamically constructs the environment and entities parsed from LevelConfig.ts
   */
  private createLevel(): void {
    this.cleanupMechanicObjects();

    this.platforms = this.physics.add.staticGroup();
    this.spikes = this.physics.add.staticGroup();
    this.coins = this.physics.add.group();
    this.springs = this.physics.add.staticGroup();
    this.breakableBlocks = this.physics.add.staticGroup();
    this.bouncers = this.physics.add.staticGroup();

    const config = this.currentLevel;
    const H = config.worldHeight;

    // 1. Spawn Ground Spans
    const tileSize = GAME_CONFIG.PHYSICS.TILE_SIZE;
    config.groundSpans.forEach((span) => {
      for (let x = span.startX; x < span.endX; x += tileSize) {
        // Top surface tile provides solid collision
        this.platforms.create(x + tileSize / 2, span.surfaceY + tileSize / 2, 'ground');
        // Subsurface soil is rendered as display images only to prevent player getting stuck
        for (let y = span.surfaceY + tileSize; y < H; y += tileSize) {
          this.add.image(x + tileSize / 2, y + tileSize / 2, 'ground-inner');
        }
      }
    });

    // 2. Spawn Static Platforms (Solid floating bars: cannot cross from bottom, sides, or top)
    config.platforms?.forEach((p) => {
      const width = p.widthTiles || 2;
      const textureKey = this.textures.exists(`platform-${width}`) ? `platform-${width}` : 'platform';
      const centerX = p.x + ((width - 1) * tileSize) / 2;
      const plat = this.platforms.create(centerX, p.y, textureKey) as Phaser.Physics.Arcade.Sprite;
      const pBody = plat.body as Phaser.Physics.Arcade.StaticBody;
      if (pBody) {
        // FULL SOLID 4-SIDED COLLISION: Solid bar that blocks from bottom, sides, and top
        pBody.checkCollision.none = false;
        pBody.checkCollision.up = true;
        pBody.checkCollision.down = true;
        pBody.checkCollision.left = true;
        pBody.checkCollision.right = true;
      }
    });

    // 3. Spawn Spikes
    config.spikes?.forEach((s) => {
      const count = s.count || 1;
      for (let i = 0; i < count; i++) {
        const spike = this.spikes.create(s.x + i * 36 + 18, s.y - 18, 'spike') as Phaser.Physics.Arcade.Sprite;
        const spikeBody = spike.body as Phaser.Physics.Arcade.StaticBody;
        if (spikeBody) {
          spikeBody.setSize(28, 20);
          spikeBody.setOffset(4, 16);
        }
      }
    });

    // 4. Spawn Coins
    config.coins?.forEach((c) => {
      const coin = this.coins.create(c.x, c.y, 'coin') as Phaser.Physics.Arcade.Sprite;
      const coinBody = coin.body as Phaser.Physics.Arcade.Body;
      if (coinBody) {
        coinBody.setAllowGravity(false);
        coinBody.setCircle(14);
      }
      this.tweens.add({
        targets: coin,
        y: c.y - 6,
        duration: 1200 + Math.random() * 400,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut',
      });
      this.stats.totalCoins++;
    });

    // 5. Spawn Springs
    config.springs?.forEach((sp) => {
      const spring = this.springs.create(sp.x, sp.y, 'spring') as Phaser.Physics.Arcade.Sprite;
      const springBody = spring.body as Phaser.Physics.Arcade.StaticBody;
      if (springBody) {
        springBody.setSize(34, 18);
        springBody.setOffset(1, 6);
      }
    });

    // 6. Spawn Moving Platforms (Level 2+)
    config.movingPlatforms?.forEach((mp) => {
      const moving = new MovingPlatform(
        this,
        mp.x,
        mp.y,
        mp.widthTiles || 2,
        mp.distanceX || 0,
        mp.distanceY || 0,
        mp.duration || 2500
      );
      this.movingPlatforms.push(moving);
    });

    // 7. Spawn Breakable Blocks (Level 3+)
    config.breakableBlocks?.forEach((bb) => {
      const block = new BreakableBlock(this, bb.x, bb.y, bb.widthTiles || 1);
      this.breakableBlocks.add(block);
    });

    // 8. Spawn Bouncers (Level 4+)
    config.bouncers?.forEach((bc) => {
      const bouncer = new Bouncer(this, bc.x, bc.y, bc.powerMultiplier || 2.5);
      this.bouncers.add(bouncer);
    });

    // 9. Spawn Mud Zones (Level 5+)
    config.mudZones?.forEach((mz) => {
      const mud = new MudZone(this, mz.x, mz.y, mz.width, mz.height);
      this.mudZones.push(mud);
    });

    // 10. Spawn Gates & Switches (Level 6+)
    config.gates?.forEach((g) => {
      const gate = new Gate(this, g.x, g.y, g.id, g.height || 96);
      this.gates.set(g.id, gate);
    });

    config.switches?.forEach((sw) => {
      const plate = new Switch(this, sw.x, sw.y, sw.id, (switchId) => {
        this.handleSwitchActivated(switchId);
      });
      this.switches.push(plate);
    });

    // 11. Spawn Patrol Enemies (Level 7+)
    config.patrolEnemies?.forEach((pe) => {
      const enemy = new PatrolEnemy(this, pe.x, pe.y, pe.patrolDistance, pe.speed || 90);
      this.patrolEnemies.push(enemy);
    });

    // 12. Spawn Crushers (Level 8+)
    config.crushers?.forEach((cr) => {
      const crusher = new Crusher(
        this,
        cr.x,
        cr.y,
        cr.dropDistance,
        cr.upWait,
        cr.dropDuration,
        cr.downWait,
        cr.riseDuration
      );
      this.crushers.push(crusher);
    });

    // 13. Spawn Wind Zones (Level 9+)
    config.windZones?.forEach((wz) => {
      const wind = new WindZone(this, wz.x, wz.y, wz.width, wz.height, wz.forceY || -1400);
      this.windZones.push(wind);
    });

    // 14. Spawn Curved/Organic Wavy Terrains
    config.curvedTerrains?.forEach((ct) => {
      const res = createCurvedTerrain(
        this,
        this.platforms,
        ct.startX,
        ct.startY,
        ct.length,
        ct.amplitude,
        ct.frequency,
        ct.theme
      );
      this.curvedGraphics.push(res.graphics);
    });

    // 15. Spawn Water Zones (Level 7+)
    config.waterZones?.forEach((wz) => {
      const water = new WaterZone(this, wz.x, wz.y, wz.width, wz.height, wz.title);
      this.waterZones.push(water);
    });

    // 16. Spawn Monster Mouths (Level 5+)
    config.monsterMouths?.forEach((mm) => {
      const mouth = new MonsterMouth(
        this,
        mm.x,
        mm.y,
        mm.triggerWidth || 180,
        mm.triggerHeight || 220,
        () => this.transitionToMonsterInterior()
      );
      this.monsterMouths.push(mouth);
      // Register the two independent horizontal moving bars so player can stand on and ride them
      this.movingPlatforms.push(mouth.leftPlatform);
      this.movingPlatforms.push(mouth.rightPlatform);
    });

    // 17. Goal Portal
    this.portal = this.physics.add.sprite(config.portal.x, config.portal.y, 'portal');
    const portalBody = this.portal.body as Phaser.Physics.Arcade.Body;
    if (portalBody) {
      portalBody.setAllowGravity(false);
      portalBody.setImmovable(true);
      portalBody.setSize(44, 64);
    }

    this.tweens.add({
      targets: this.portal,
      scaleX: 1.12,
      scaleY: 1.12,
      duration: 1000,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });

    this.portalEmitter.setPosition(config.portal.x, config.portal.y);
  }

  private handleSwitchActivated(switchId: string): void {
    const gate = this.gates.get(switchId);
    if (gate && !gate.isOpen) {
      // Brief screen shake and gate opening
      this.triggerScreenShake(140, 0.008);
      gate.open();

      // Sparkle feedback
      if (this.coinSparkleEmitter) {
        this.coinSparkleEmitter.emitParticleAt(gate.x, gate.y, 25);
      }
    }
  }

  private setupPhysicsInteractions(): void {
    // 1. Solid platforms & Breakable blocks
    this.physics.add.collider(this.player, this.platforms);

    this.physics.add.collider(this.player, this.breakableBlocks, (_player, blockObj) => {
      const block = blockObj as BreakableBlock;
      block.triggerBreak();
    });

    // 2. Gates (Solid while closed)
    this.gates.forEach((gate) => {
      this.physics.add.collider(this.player, gate);
    });

    // 3. Moving Platforms (Solid surface with native friction)
    this.movingPlatforms.forEach((mp) => {
      this.physics.add.collider(this.player, mp);
    });

    // 4. Bouncers (Super Trampolines)
    this.physics.add.overlap(this.player, this.bouncers, (_player, bouncerObj) => {
      const bouncer = bouncerObj as Bouncer;
      bouncer.triggerBounce(this.player);
    });

    // 5. Switches (Pressure plates)
    this.switches.forEach((sw) => {
      this.physics.add.overlap(this.player, sw, () => {
        sw.press();
      });
    });

    // 6. Hazards: Spikes, Patrol Enemies, Crushers
    this.physics.add.overlap(this.player, this.spikes, (_player, spikeObj) => {
      this.handleHazardHit(spikeObj as Phaser.Physics.Arcade.Sprite);
    });

    this.patrolEnemies.forEach((pe) => {
      this.physics.add.overlap(this.player, pe, () => {
        this.handleHazardHit(pe);
      });
    });

    this.crushers.forEach((cr) => {
      this.physics.add.overlap(this.player, cr, () => {
        this.handleHazardHit(cr);
      });
    });

    // 7. Pickups & Springs & Portal
    this.physics.add.overlap(this.player, this.coins, (_player, coinObj) => {
      this.handleCoinCollection(coinObj as Phaser.Physics.Arcade.Sprite);
    });

    this.physics.add.overlap(this.player, this.springs, (_player, springObj) => {
      this.handleSpringHit(springObj as Phaser.Physics.Arcade.Sprite);
    });

    this.physics.add.overlap(this.player, this.portal, () => {
      this.handleLevelComplete();
    });
  }

  private setupCamera(): void {
    const cam = this.cameras.main;
    cam.setBounds(0, 0, this.currentLevel.worldWidth, this.currentLevel.worldHeight);
    // Smooth lerp on both horizontal and vertical axes for high-speed drops & ascents
    cam.startFollow(this.player, true, 0.08, 0.08);
    // Compact deadzone so camera responds promptly on vertical movement
    cam.setDeadzone(80, 60);
  }

  private transitionToMonsterInterior(): void {
    // Smoothly shift background parallax layers to fleshy visceral dark crimson
    this.tweens.addCounter({
      from: 0,
      to: 100,
      duration: 1200,
      onUpdate: (tween) => {
        const rawVal = tween ? tween.getValue() : 0;
        const factor = typeof rawVal === 'number' ? rawVal / 100 : 0;
        if (this.bgSky) {
          this.bgSky.setTint(
            Phaser.Display.Color.Interpolate.ColorWithColor(
              Phaser.Display.Color.ValueToColor(0x38bdf8),
              Phaser.Display.Color.ValueToColor(0x450a0a),
              100,
              factor * 100
            ).color
          );
        }
        if (this.bgMountains) {
          this.bgMountains.setTint(
            Phaser.Display.Color.Interpolate.ColorWithColor(
              Phaser.Display.Color.ValueToColor(0x64748b),
              Phaser.Display.Color.ValueToColor(0x881337),
              100,
              factor * 100
            ).color
          );
        }
        if (this.bgTrees) {
          this.bgTrees.setTint(
            Phaser.Display.Color.Interpolate.ColorWithColor(
              Phaser.Display.Color.ValueToColor(0x0f766e),
              Phaser.Display.Color.ValueToColor(0x991b1b),
              100,
              factor * 100
            ).color
          );
        }
      },
    });
  }

  public triggerScreenShake(duration: number = 180, intensity: number = 0.014): void {
    if (this.cameras?.main) {
      this.cameras.main.shake(duration, intensity);
    }
  }

  private setupUIEvents(): void {
    this.events.emit('updateLevel', {
      levelNumber: this.currentLevelNumber,
      levelName: this.currentLevel.title,
      totalLevels: getTotalLevels(),
    });
    this.events.emit('updateScore', {
      score: this.stats.score,
      coinsCollected: this.stats.coinsCollected,
      totalCoins: this.stats.totalCoins,
    });
    this.events.emit('updateHealth', {
      health: this.stats.health,
      maxHealth: this.stats.maxHealth,
    });

    this.events.off('mobileControlsUpdate');
    this.events.on('mobileControlsUpdate', (state: Partial<MobileInputState>) => {
      if (this.player) {
        this.player.setMobileInput(state);
      }
    });
  }

  public update(time: number, delta: number): void {
    if (!this.player) return;

    // 1. Advance moving platforms physics motion
    this.movingPlatforms.forEach((mp) => mp.update());

    // 2. Moving platform rider carrier
    const playerBody = this.player.body as Phaser.Physics.Arcade.Body;
    if (playerBody && (playerBody.touching.down || playerBody.blocked.down)) {
      for (const mp of this.movingPlatforms) {
        const mpBody = mp.body as Phaser.Physics.Arcade.Body;
        if (!mpBody) continue;
        const halfW = (mp.displayWidth || mp.width) / 2;
        const halfH = (mp.displayHeight || mp.height) / 2;
        if (
          this.player.x >= mp.x - halfW - 4 &&
          this.player.x <= mp.x + halfW + 4 &&
          Math.abs(this.player.y + 15 - (mp.y - halfH)) <= 8
        ) {
          if (mpBody.velocity.x !== 0) {
            const dx = (mpBody.velocity.x * delta) / 1000;
            this.player.x += dx;
            playerBody.position.x += dx;
          }
          if (mpBody.velocity.y !== 0) {
            const dy = (mpBody.velocity.y * delta) / 1000;
            this.player.y += dy;
            playerBody.position.y += dy;
          }
          break;
        }
      }
    }

    // Update patrol enemies movement
    this.patrolEnemies.forEach((pe) => pe.update());

    // Update Mud Zones overlap check
    const pBounds = this.player.getBounds();
    this.mudZones.forEach((mz) => {
      const mBounds = mz.getBounds();
      if (Phaser.Geom.Intersects.RectangleToRectangle(pBounds, mBounds)) {
        this.player.setInMud(true);
      }
    });

    // Update Wind Zones overlap check
    this.windZones.forEach((wz) => {
      const wBounds = wz.getBounds();
      if (Phaser.Geom.Intersects.RectangleToRectangle(pBounds, wBounds)) {
        this.player.applyWind(wz.forceY);
      }
    });

    // Update Water Zones overlap check
    this.waterZones.forEach((wz) => {
      const wBounds = wz.getBounds();
      if (Phaser.Geom.Intersects.RectangleToRectangle(pBounds, wBounds)) {
        this.player.setInWater(true);
      }
    });

    // Update Monster Mouths timing overlap check (Two moving bars + chomping jaws)
    this.monsterMouths.forEach((mm) => {
      const status = mm.checkPlayerTimingOverlap(pBounds);
      if (status === 'HAZARD') {
        this.handleHazardHit();
      }
    });

    // Dynamic vertical and horizontal camera tracking offset based on player velocity
    if (playerBody) {
      const targetOffsetY = Phaser.Math.Clamp(playerBody.velocity.y * 0.22, -130, 130);
      const targetOffsetX = Phaser.Math.Clamp(playerBody.velocity.x * 0.18, -90, 90);

      this.cameras.main.followOffset.x = Phaser.Math.Linear(
        this.cameras.main.followOffset.x,
        targetOffsetX,
        0.06
      );
      this.cameras.main.followOffset.y = Phaser.Math.Linear(
        this.cameras.main.followOffset.y,
        targetOffsetY,
        0.06
      );
    }

    // Update Player logic
    this.player.update(time, delta);

    if (this.isLevelCompleted) return;

    // Checkpoints update
    if (this.currentLevel.checkpoints) {
      for (const cp of this.currentLevel.checkpoints) {
        const triggeredX = cp.triggerX !== undefined && this.player.x >= cp.triggerX && this.checkpoint.x < cp.spawn.x;
        const triggeredY = cp.triggerY !== undefined && this.player.y <= cp.triggerY && this.checkpoint.y > cp.spawn.y;
        if (triggeredX || triggeredY) {
          this.checkpoint = { ...cp.spawn };
        }
      }
    }

    // Abyss pit fall check: catches drops into bottomless chasms
    if (!this.player.isDying && this.player.y >= this.currentLevel.worldHeight - 10) {
      this.handleAbyssFall();
    }

    // Progress bar tracking (supports both horizontal levels and vertical shafts)
    let progress = 0;
    const isVertical = this.currentLevel.worldHeight > this.currentLevel.worldWidth * 1.5;
    if (isVertical) {
      const startY = this.currentLevel.spawnPoint.y;
      const endY = this.currentLevel.portal.y;
      progress = (startY - this.player.y) / (startY - endY);
    } else {
      const startX = this.currentLevel.spawnPoint.x;
      const endX = this.currentLevel.portal.x;
      progress = (this.player.x - startX) / (endX - startX);
    }
    this.events.emit('updateProgress', { progress: Phaser.Math.Clamp(progress, 0, 1) });
  }

  private handleHazardHit(hazardObj?: Phaser.Physics.Arcade.Sprite): void {
    if (
      this.player.isInvulnerable() ||
      this.player.isActionDisabled ||
      this.isLevelCompleted ||
      this.player.isDying
    )
      return;

    this.triggerScreenShake(220, 0.022);
    this.cameras.main.flash(180, 225, 29, 72, true);
    this.hazardEmitter.emitParticleAt(this.player.x, this.player.y, 16);

    this.stats.health--;
    this.events.emit('updateHealth', {
      health: this.stats.health,
      maxHealth: this.stats.maxHealth,
    });

    if (this.stats.health <= 0) {
      soundManager.stopBgMusic();
      this.player.triggerDeathSequence(() => {
        this.events.emit('gameOver', { score: this.stats.score });
      });
    } else {
      this.player.playPrickReaction(hazardObj?.x, () => {
        this.resetLevelMechanics();
        this.player.respawnAtCheckpoint(this.checkpoint.x, this.checkpoint.y);
      });
    }
  }

  private handleAbyssFall(): void {
    if (this.player.isInvulnerable() || this.player.isActionDisabled || this.player.isDying) return;

    this.stats.health--;
    this.events.emit('updateHealth', {
      health: this.stats.health,
      maxHealth: this.stats.maxHealth,
    });

    if (this.stats.health <= 0) {
      soundManager.stopBgMusic();
      this.player.triggerDeathSequence(() => {
        this.events.emit('gameOver', { score: this.stats.score });
      });
    } else {
      soundManager.playHurt();
      this.resetLevelMechanics();
      this.player.respawnAtCheckpoint(this.checkpoint.x, this.checkpoint.y);
    }
  }

  /**
   * Re-brings disappearing breakable blocks and resets interactive level elements
   * whenever the player hits a prick and respawns, so retry paths are always restored.
   */
  private resetLevelMechanics(): void {
    // 1. Re-bring disappearing breakable blocks
    this.breakableBlocks.getChildren().forEach((blockObj) => {
      const block = blockObj as BreakableBlock;
      block.resetBlock();
    });

    // 2. Reset moving platforms to start positions
    this.movingPlatforms.forEach((mp) => {
      mp.resetPosition();
    });

    // 3. Reset switches
    this.switches.forEach((sw) => {
      sw.resetSwitch();
    });

    // 4. Reset gates
    this.gates.forEach((gate) => {
      gate.resetGate();
    });
  }

  private handleCoinCollection(coin: Phaser.Physics.Arcade.Sprite): void {
    if (!coin.active) return;

    coin.setActive(false);
    soundManager.playCoin();
    this.coinSparkleEmitter.emitParticleAt(coin.x, coin.y, 8);

    this.tweens.add({
      targets: coin,
      scaleX: 1.6,
      scaleY: 1.6,
      alpha: 0,
      duration: 160,
      ease: 'Quad.easeOut',
      onComplete: () => {
        coin.destroy();
      },
    });

    this.stats.score += GAME_CONFIG.SCORING.COIN_POINTS;
    this.stats.coinsCollected++;

    this.events.emit('updateScore', {
      score: this.stats.score,
      coinsCollected: this.stats.coinsCollected,
      totalCoins: this.stats.totalCoins,
    });
  }

  private handleSpringHit(spring: Phaser.Physics.Arcade.Sprite): void {
    const playerBody = this.player.body as Phaser.Physics.Arcade.Body;
    if (playerBody.velocity.y > -50 && this.player.y < spring.y + 10) {
      this.tweens.add({
        targets: spring,
        scaleY: 0.45,
        duration: 80,
        yoyo: true,
        ease: 'Quad.easeOut',
      });

      this.player.launchFromSpring(spring.y, GAME_CONFIG.PHYSICS.SPRING_LAUNCH_FORCE);
    }
  }

  private handleLevelComplete(): void {
    if (this.isLevelCompleted) return;
    this.isLevelCompleted = true;

    soundManager.stopBgMusic();
    soundManager.playVictory();

    this.player.setHappyFace();
    this.coinSparkleEmitter.emitParticleAt(this.portal.x, this.portal.y, 35);

    this.tweens.add({
      targets: this.player,
      y: this.player.y - 18,
      duration: 400,
      yoyo: true,
      repeat: 1,
      ease: 'Sine.easeInOut',
      onComplete: () => {
        this.tweens.add({
          targets: this.player,
          x: this.portal.x,
          y: this.portal.y,
          scaleX: 0.1,
          scaleY: 0.1,
          alpha: 0,
          angle: 720,
          duration: 600,
          ease: 'Quad.easeIn',
        });
      },
    });

    const timeSec = Math.floor((this.time.now - this.stats.startTime) / 1000);

    this.time.delayedCall(1200, () => {
      this.events.emit('levelComplete', {
        levelNumber: this.currentLevelNumber,
        levelName: this.currentLevel.title,
        hasNextLevel: hasNextLevel(this.currentLevelNumber),
        totalLevels: getTotalLevels(),
        score: this.stats.score + GAME_CONFIG.SCORING.LEVEL_CLEAR_POINTS,
        coins: this.stats.coinsCollected,
        totalCoins: this.stats.totalCoins,
        timeSec,
      });
    });
  }
}
