// src/scenes/GameScene.ts

import Phaser from 'phaser';
import { Player, MobileInputState } from '../objects/Player';
import { soundManager } from '../utils/audio';

export interface LevelStats {
  score: number;
  health: number;
  maxHealth: number;
  coinsCollected: number;
  totalCoins: number;
  startTime: number;
}

export class GameScene extends Phaser.Scene {
  public static readonly WORLD_WIDTH: number = 3840;
  public static readonly WORLD_HEIGHT: number = 600;

  public player!: Player;
  private platforms!: Phaser.Physics.Arcade.StaticGroup;
  private spikes!: Phaser.Physics.Arcade.StaticGroup;
  private coins!: Phaser.Physics.Arcade.Group;
  private springs!: Phaser.Physics.Arcade.StaticGroup;
  private portal!: Phaser.Physics.Arcade.Sprite;

  private bgSky!: Phaser.GameObjects.TileSprite;
  private bgMountains!: Phaser.GameObjects.TileSprite;
  private bgTrees!: Phaser.GameObjects.TileSprite;

  private coinSparkleEmitter!: Phaser.GameObjects.Particles.ParticleEmitter;
  private hazardEmitter!: Phaser.GameObjects.Particles.ParticleEmitter;
  private portalEmitter!: Phaser.GameObjects.Particles.ParticleEmitter;

  private stats: LevelStats = {
    score: 0,
    health: 3,
    maxHealth: 3,
    coinsCollected: 0,
    totalCoins: 0,
    startTime: 0,
  };

  // Checkpoints kept strictly as background logic
  private checkpoint: { x: number; y: number } = { x: 120, y: 480 };
  private checkpointReached: boolean = false;
  private isLevelCompleted: boolean = false;

  constructor() {
    super('GameScene');
  }

  public create(): void {
    this.isLevelCompleted = false;
    this.checkpoint = { x: 120, y: 480 };
    this.checkpointReached = false;
    this.stats = {
      score: 0,
      health: 3,
      maxHealth: 3,
      coinsCollected: 0,
      totalCoins: 0,
      startTime: this.time.now,
    };

    // Configure arcade physics world bounds
    this.physics.world.setBounds(0, 0, GameScene.WORLD_WIDTH, GameScene.WORLD_HEIGHT);

    // 1. Build Parallax Background Layers
    this.createParallaxLayers();

    // 2. Setup Particle Systems
    this.createParticleSystems();

    // 3. Build Level Geometry & Entities
    this.createLevel();

    // 4. Create Player
    this.player = new Player(this, this.checkpoint.x, this.checkpoint.y);

    // 5. Setup Collisions and Overlaps
    this.setupPhysicsInteractions();

    // 6. Setup Camera Tracking
    this.setupCamera();

    // 7. Connect UI Events & Listeners
    this.setupUIEvents();

    // 8. Start Continuous Background Music
    soundManager.startBgMusic();
  }

  private createParallaxLayers(): void {
    const W = GameScene.WORLD_WIDTH;
    const H = GameScene.WORLD_HEIGHT;

    this.bgSky = this.add.tileSprite(0, 0, this.scale.width, H, 'bg-sky');
    this.bgSky.setOrigin(0, 0).setScrollFactor(0);

    this.bgMountains = this.add.tileSprite(0, H - 320, W, 320, 'bg-mountains');
    this.bgMountains.setOrigin(0, 0).setScrollFactor(0.15, 1);

    this.bgTrees = this.add.tileSprite(0, H - 240, W, 240, 'bg-trees');
    this.bgTrees.setOrigin(0, 0).setScrollFactor(0.4, 1);

    const cloudPositions = [
      { x: 300, y: 100, scale: 1 },
      { x: 900, y: 140, scale: 0.8 },
      { x: 1600, y: 90, scale: 1.2 },
      { x: 2300, y: 130, scale: 0.9 },
      { x: 3100, y: 110, scale: 1.1 },
    ];

    cloudPositions.forEach((pos) => {
      const cloud = this.add.image(pos.x, pos.y, 'cloud');
      cloud.setScale(pos.scale).setAlpha(0.8).setScrollFactor(0.25, 1);
      this.tweens.add({
        targets: cloud,
        x: cloud.x + 60,
        duration: 8000 + Math.random() * 4000,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut',
      });
    });
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

  private createLevel(): void {
    this.platforms = this.physics.add.staticGroup();
    this.spikes = this.physics.add.staticGroup();
    this.coins = this.physics.add.group();
    this.springs = this.physics.add.staticGroup();

    const H = GameScene.WORLD_HEIGHT;

    const addGround = (startX: number, endX: number, surfaceY: number) => {
      const tileSize = 48;
      for (let x = startX; x < endX; x += tileSize) {
        this.platforms.create(x + tileSize / 2, surfaceY + tileSize / 2, 'ground');
        for (let y = surfaceY + tileSize; y < H; y += tileSize) {
          this.platforms.create(x + tileSize / 2, y + tileSize / 2, 'ground-inner');
        }
      }
    };

    const addPlatform = (x: number, y: number, widthTiles: number = 2) => {
      for (let i = 0; i < widthTiles; i++) {
        this.platforms.create(x + i * 48, y, 'platform');
      }
    };

    const addSpikes = (startX: number, count: number, y: number) => {
      for (let i = 0; i < count; i++) {
        const spike = this.spikes.create(startX + i * 36 + 18, y - 18, 'spike') as Phaser.Physics.Arcade.Sprite;
        const spikeBody = spike.body as Phaser.Physics.Arcade.StaticBody;
        if (spikeBody) {
          spikeBody.setSize(28, 20);
          spikeBody.setOffset(4, 16);
        }
      }
    };

    const addCoin = (x: number, y: number) => {
      const coin = this.coins.create(x, y, 'coin') as Phaser.Physics.Arcade.Sprite;
      const coinBody = coin.body as Phaser.Physics.Arcade.Body;
      if (coinBody) {
        coinBody.setAllowGravity(false);
        coinBody.setCircle(14);
      }
      this.tweens.add({
        targets: coin,
        y: y - 6,
        duration: 1200 + Math.random() * 400,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut',
      });
      this.stats.totalCoins++;
    };

    const addSpring = (x: number, y: number) => {
      const spring = this.springs.create(x, y, 'spring') as Phaser.Physics.Arcade.Sprite;
      const springBody = spring.body as Phaser.Physics.Arcade.StaticBody;
      if (springBody) {
        springBody.setSize(34, 18);
        springBody.setOffset(1, 6);
      }
    };

    // SECTION 1: Meadow Start (x: 0 to 680)
    addGround(0, 680, 528);
    addCoin(260, 480);
    addCoin(360, 460);
    addCoin(460, 440);
    addPlatform(520, 420, 2);
    addCoin(544, 380);

    // SECTION 2: The First Chasm & Stepping Platforms (x: 680 to 1300)
    addGround(680, 1300, 560);
    addSpikes(720, 15, 560);
    addPlatform(720, 440, 2);
    addCoin(744, 390);
    addPlatform(880, 360, 2);
    addCoin(904, 310);
    addPlatform(1040, 320, 2);
    addCoin(1064, 270);
    addPlatform(1180, 390, 2);
    addCoin(1204, 340);

    // SECTION 3: Spring Launch Meadow (x: 1300 to 1840)
    addGround(1300, 1840, 528);
    addSpring(1440, 516);
    addPlatform(1440, 240, 3);
    addCoin(1464, 190);
    addCoin(1512, 190);
    addCoin(1560, 190);
    addCoin(1680, 480);
    addCoin(1760, 480);

    // SECTION 4: Midpoint Checkpoint (Background logic) & Fortress (x: 1840 to 2440)
    addGround(1840, 2100, 528);
    addGround(2100, 2440, 460);
    addSpikes(2140, 3, 460);
    addPlatform(2260, 360, 2);
    addCoin(2284, 310);
    addSpikes(2340, 2, 460);

    // SECTION 5: The Grand Spiked Canyon (x: 2440 to 3100)
    addGround(2440, 3120, 560);
    addSpikes(2460, 17, 560);
    addPlatform(2520, 410, 2);
    addCoin(2544, 360);
    addPlatform(2680, 340, 2);
    addSpring(2704, 328);
    addCoin(2780, 180);
    addCoin(2840, 150);
    addCoin(2900, 180);
    addPlatform(2960, 360, 2);
    addCoin(2984, 310);

    // SECTION 6: The Final Mountain Ascent (x: 3120 to 3840)
    addGround(3120, 3840, 528);
    addGround(3300, 3840, 460);
    addSpikes(3340, 3, 460);
    addPlatform(3440, 380, 2);
    addCoin(3464, 330);
    addGround(3560, 3840, 390);
    addCoin(3620, 340);

    // GOAL PORTAL
    this.portal = this.physics.add.sprite(3720, 340, 'portal');
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

    this.portalEmitter.setPosition(this.portal.x, this.portal.y);
  }

  private setupPhysicsInteractions(): void {
    this.physics.add.collider(this.player, this.platforms);

    // Spikes hazard overlap passing specific spike object
    this.physics.add.overlap(this.player, this.spikes, (_player, spikeObj) => {
      this.handleHazardHit(spikeObj as Phaser.Physics.Arcade.Sprite);
    });

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
    cam.setBounds(0, 0, GameScene.WORLD_WIDTH, GameScene.WORLD_HEIGHT);
    cam.startFollow(this.player, true, 0.08, 0.08);
    cam.setDeadzone(120, 80);
  }

  private setupUIEvents(): void {
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

    this.player.update(time, delta);

    if (this.isLevelCompleted) return;

    // Silent background checkpoint logic
    if (!this.checkpointReached && this.player.x >= 1880) {
      this.checkpointReached = true;
      this.checkpoint = { x: 1880, y: 480 };
    }

    // Abyss pit fall check
    if (!this.player.isDying && this.player.y > GameScene.WORLD_HEIGHT + 40) {
      this.handleAbyssFall();
    }

    const progress = (this.player.x - 120) / (3720 - 120);
    this.events.emit('updateProgress', { progress });
  }

  /**
   * Handles player colliding with a spike prick:
   * Action is disabled for that moment showing the sad bounce, then restarts at previous checkpoint!
   */
  private handleHazardHit(hazardObj?: Phaser.Physics.Arcade.Sprite): void {
    if (this.player.isInvulnerable() || this.player.isActionDisabled || this.isLevelCompleted || this.player.isDying) return;

    // Camera shake and flash
    this.cameras.main.shake(180, 0.012);
    this.cameras.main.flash(160, 225, 29, 72, true);
    this.hazardEmitter.emitParticleAt(this.player.x, this.player.y, 14);

    this.stats.health--;
    this.events.emit('updateHealth', {
      health: this.stats.health,
      maxHealth: this.stats.maxHealth,
    });

    if (this.stats.health <= 0) {
      // Game Over: stop bg music and trigger death plunge animation
      soundManager.stopBgMusic();
      this.player.triggerDeathSequence(() => {
        this.events.emit('gameOver', { score: this.stats.score });
      });
    } else {
      // User's action is disabled for that moment showing the sad bounce at that place,
      // and then cleanly restarts at the previous checkpoint!
      this.player.playPrickReaction(hazardObj?.x, () => {
        this.player.respawnAtCheckpoint(this.checkpoint.x, this.checkpoint.y);
      });
    }
  }

  /**
   * Handles player falling into the deep abyss pit.
   */
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
      this.player.respawnAtCheckpoint(this.checkpoint.x, this.checkpoint.y);
    }
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

    this.stats.score += 100;
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
      this.player.launchFromSpring();

      this.tweens.killTweensOf(spring);
      spring.setScale(1.2, 0.4);
      this.tweens.add({
        targets: spring,
        scaleX: 1,
        scaleY: 1,
        duration: 250,
        ease: 'Elastic.easeOut',
      });
    }
  }

  /**
   * Success / Goal Reached Handler:
   * Ends continuous background music, plays victory fanfare, stops player right at the portal,
   * displays happy blushing face with inverted 'C' eyes (⌒ ⌒), and ensures face and eyes stay perfectly centered.
   */
  private handleLevelComplete(): void {
    if (this.isLevelCompleted) return;
    this.isLevelCompleted = true;

    // 1. End continuous background music immediately as requested
    soundManager.stopBgMusic();

    // 2. Play victory fanfare
    soundManager.playVictory();

    // 3. Stop player right at this spot and switch to celebratory happy face
    this.player.setHappyFace();

    // 4. Sparkle emission at portal
    this.coinSparkleEmitter.emitParticleAt(this.portal.x, this.portal.y, 35);

    // 5. Joyful celebration hover tween right in front of portal
    this.tweens.add({
      targets: this.player,
      y: this.player.y - 18,
      duration: 400,
      yoyo: true,
      repeat: 1,
      ease: 'Sine.easeInOut',
      onComplete: () => {
        // Swirl cleanly into the portal
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
        score: this.stats.score + 500,
        coins: this.stats.coinsCollected,
        totalCoins: this.stats.totalCoins,
        timeSec,
      });
    });
  }
}
