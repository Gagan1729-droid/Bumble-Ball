// src/objects/Player.ts

import Phaser from 'phaser';
import { soundManager } from '../utils/audio';
import { getCurvedTerrainAt } from '../utils/LevelGenerator';
import { GAME_CONFIG } from '../config/gameConstants';

export interface MobileInputState {
  left: boolean;
  right: boolean;
  jump: boolean;
}

export type PlayerFaceState = 'NORMAL' | 'WAITING' | 'HAPPY' | 'CRYING' | 'HURT';

export class Player extends Phaser.Physics.Arcade.Sprite {
  // Movement & physics tuning parameters from GAME_CONFIG
  public readonly MOVE_SPEED: number = GAME_CONFIG.PLAYER.MOVE_SPEED;
  public readonly ACCELERATION: number = GAME_CONFIG.PLAYER.ACCELERATION;
  public readonly JUMP_FORCE: number = GAME_CONFIG.PLAYER.JUMP_FORCE;
  public readonly SPRING_FORCE: number = GAME_CONFIG.PHYSICS.SPRING_LAUNCH_FORCE;
  public readonly COYOTE_DURATION: number = GAME_CONFIG.PLAYER.COYOTE_TIME_MS;

  // State management
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private wasdKeys!: {
    W: Phaser.Input.Keyboard.Key;
    A: Phaser.Input.Keyboard.Key;
    S: Phaser.Input.Keyboard.Key;
    D: Phaser.Input.Keyboard.Key;
    SPACE: Phaser.Input.Keyboard.Key;
  };

  private mobileControls: MobileInputState = { left: false, right: false, jump: false };
  private lastGroundedTime: number = 0;
  private isJumping: boolean = false;
  private wasGrounded: boolean = false;
  private prevVelocityY: number = 0;

  // Environmental modifier states
  public inMud: boolean = false;
  public inWater: boolean = false;
  public isOnCurve: boolean = false;
  public windForceY: number = 0;
  public ridingPlatformDeltaX: number = 0;
  public ridingPlatformDeltaY: number = 0;

  // Invulnerability and action disable flags
  private invulnerableUntil: number = 0;
  public isActionDisabled: boolean = false;

  // Living creature face & idle expression system
  public faceState: PlayerFaceState = 'NORMAL';
  private faceGraphics: Phaser.GameObjects.Graphics;
  private lastMovedTime: number = 0;
  public isDying: boolean = false;
  public isWon: boolean = false;
  private onDeathFinished?: () => void;

  private dustEmitter?: Phaser.GameObjects.Particles.ParticleEmitter;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, 'player');

    // Add to scene display and arcade physics world
    scene.add.existing(this);
    scene.physics.add.existing(this);

    // Setup circular arcade body and high restitution
    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setCircle(15, 1, 1);
    this.setBounce(0.62, 0.62);
    this.setCollideWorldBounds(true);
    this.setDragX(350);
    this.setMaxVelocity(320, 950);
    this.setOrigin(0.5, 0.5);

    // Living creature face graphics overlay
    this.faceGraphics = scene.add.graphics();
    this.faceGraphics.setDepth(this.depth + 2);

    this.lastMovedTime = scene.time.now;

    // Setup keyboard inputs
    if (scene.input.keyboard) {
      this.cursors = scene.input.keyboard.createCursorKeys();
      this.wasdKeys = {
        W: scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W),
        A: scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A),
        S: scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S),
        D: scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D),
        SPACE: scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE),
      };
    }

    this.createDustParticles();
  }

  private createDustParticles(): void {
    if (this.scene.textures.exists('dust')) {
      this.dustEmitter = this.scene.add.particles(0, 0, 'dust', {
        speed: { min: 20, max: 50 },
        angle: { min: 220, max: 320 },
        scale: { start: 0.8, end: 0.1 },
        alpha: { start: 0.6, end: 0 },
        lifespan: 300,
        emitting: false,
      });
      this.dustEmitter.setDepth(this.depth - 1);
    }
  }

  public isInvulnerable(): boolean {
    return this.scene.time.now < this.invulnerableUntil;
  }

  public setMobileInput(state: Partial<MobileInputState>): void {
    this.mobileControls = { ...this.mobileControls, ...state };
  }

  public setInMud(value: boolean = true): void {
    this.inMud = value;
  }

  public setInWater(value: boolean = true): void {
    this.inWater = value;
  }

  public applyWind(forceY: number): void {
    this.windForceY = forceY;
  }

  public setRidingDelta(dx: number, dy: number): void {
    this.ridingPlatformDeltaX = dx;
    this.ridingPlatformDeltaY = dy;
  }

  /**
   * PreUpdate guarantees face graphics and invulnerability visuals are locked
   * to the ball's center every engine frame, without reliance on fragile alpha tweens.
   */
  public preUpdate(time: number, delta: number): void {
    super.preUpdate(time, delta);
    this.updateInvulnerabilityVisuals(time);
    this.updateFace(time);
  }

  /**
   * Declarative invulnerability visual handler:
   * Rapidly blinks during invulnerability, and immediately restores 100% full vibrant color
   * the instant invulnerability ends or when not active.
   */
  private updateInvulnerabilityVisuals(time: number): void {
    if (this.isDying) return;

    if (this.isInvulnerable()) {
      // Rapid visual blink between 0.45 and 1.0 while invulnerable
      const isDim = Math.floor(time / 80) % 2 === 0;
      this.setAlpha(isDim ? 0.45 : 1);
    } else {
      // Ensure player is 100% restored to vibrant normal opacity
      if (this.alpha !== 1) {
        this.setAlpha(1);
      }
      this.clearTint();
    }
  }

  public update(time: number, delta: number): void {
    const body = this.body as Phaser.Physics.Arcade.Body;
    if (!body) return;

    // Handle dying arc plunge animation
    if (this.isDying) {
      if (this.y > (this.scene.physics.world.bounds.height + 60)) {
        if (this.onDeathFinished) {
          const cb = this.onDeathFinished;
          this.onDeathFinished = undefined;
          cb();
        }
      }
      return;
    }

    // If level is won, lock body and stay joyful
    if (this.isWon) {
      body.setVelocity(0, 0);
      body.setAcceleration(0, 0);
      return;
    }

    // 1. Organic Curved Terrain Query
    const currentLevel = (this.scene as any).currentLevel;
    const curve = getCurvedTerrainAt(this.x, currentLevel?.curvedTerrains);

    const isGrounded = body.blocked.down || body.touching.down;
    this.isOnCurve = !!(curve && isGrounded);

    // Coyote time tracking
    if (isGrounded) {
      this.lastGroundedTime = time;
      this.isJumping = false;
    }

    // Squash & Stretch Juice on Ground Impact
    if (isGrounded && !this.wasGrounded) {
      if (this.prevVelocityY > 120) {
        const impactRatio = Math.min(this.prevVelocityY / 500, 1);
        soundManager.playBounce(impactRatio);

        // Keep squash subtle and strictly symmetric so shape is never distorted,
        // and avoid Back.easeOut overshooting downward into ground tiles
        this.scene.tweens.killTweensOf(this);
        this.setScale(1 + impactRatio * 0.14, 1 - impactRatio * 0.12);
        this.scene.tweens.add({
          targets: this,
          scaleX: 1,
          scaleY: 1,
          duration: 120,
          ease: 'Sine.easeOut',
          onComplete: () => {
            this.setScale(1, 1);
            const b = this.body as Phaser.Physics.Arcade.Body;
            if (b) b.setCircle(15, 1, 1);
          },
        });

        if (impactRatio > 0.4 && this.dustEmitter) {
          const dustCount = Math.min(Math.floor(4 + impactRatio * 4), 8);
          this.dustEmitter.emitParticleAt(this.x, this.y + 14, dustCount);
        }
      }
    }
    this.wasGrounded = isGrounded;
    this.prevVelocityY = body.velocity.y;

    // Apply riding platform position delta so player stays locked on moving platform
    if (this.ridingPlatformDeltaX !== 0 || this.ridingPlatformDeltaY !== 0) {
      this.x += this.ridingPlatformDeltaX;
      this.y += this.ridingPlatformDeltaY;
      body.position.x += this.ridingPlatformDeltaX;
      body.position.y += this.ridingPlatformDeltaY;
      this.ridingPlatformDeltaX = 0;
      this.ridingPlatformDeltaY = 0;
    }

    // Environmental physics tuning: Water, Mud & Wind
    let currentAccel = this.inMud ? this.ACCELERATION * 0.5 : this.ACCELERATION;
    let currentDragX = this.inMud ? 850 : 350;
    let currentDragY = 0;
    let currentJumpForce = this.inMud ? Math.round(this.JUMP_FORCE * 0.6) : this.JUMP_FORCE;
    let effectiveForceY = this.windForceY;

    if (this.inWater) {
      // 1. Gravity reduced by 70%: standard gravity is 1000px/s^2, counteracted by -700px/s^2 buoyant upward acceleration
      effectiveForceY += -700;
      // 2. Drag drastically increased in fluid
      currentDragX = 750;
      currentDragY = 520;
      currentAccel = this.ACCELERATION * 0.65;

      // Soft cap sinking velocity in water
      if (body.velocity.y > 140) {
        body.setVelocityY(140);
      }
    }

    body.setDragX(currentDragX);
    body.setDragY(currentDragY);
    body.setAccelerationY(effectiveForceY);

    // Reset frame-based environmental flags
    const wasInWaterThisFrame = this.inWater;
    this.inWater = false;
    this.inMud = false;
    this.windForceY = 0;

    // When action is disabled (during prick sad bounce or hurt moment), ignore all user controls
    if (this.isActionDisabled) {
      return;
    }

    // Movement Input Detection
    const moveLeft =
      this.cursors?.left.isDown || this.wasdKeys?.A.isDown || this.mobileControls.left;
    const moveRight =
      this.cursors?.right.isDown || this.wasdKeys?.D.isDown || this.mobileControls.right;
    const jumpRequested =
      Phaser.Input.Keyboard.JustDown(this.cursors.up) ||
      (this.wasdKeys?.W && Phaser.Input.Keyboard.JustDown(this.wasdKeys.W)) ||
      (this.wasdKeys?.SPACE && Phaser.Input.Keyboard.JustDown(this.wasdKeys.SPACE)) ||
      this.mobileControls.jump;

    const hasUserMoved = moveLeft || moveRight || jumpRequested;
    if (hasUserMoved) {
      this.lastMovedTime = time;
    }

    // Determine Face State (Living Creature logic)
    if (this.faceState !== 'HAPPY' && this.faceState !== 'CRYING') {
      if (this.isInvulnerable() && time < this.invulnerableUntil - 400) {
        this.faceState = 'HURT';
      } else if (time - this.lastMovedTime >= 2000) {
        // Idle for 2 seconds -> eyes show up moving pupils left to right waiting
        this.faceState = 'WAITING';
      } else {
        this.faceState = 'NORMAL';
      }
    }

    // Slope physics: Downhill gravitational acceleration (F = g * sin(angle))
    let slopeForceX = 0;
    if (this.isOnCurve && curve) {
      slopeForceX = Math.sin(curve.angle) * 920;
    }

    // Horizontal Movement
    if (moveLeft) {
      body.setAccelerationX(-currentAccel + slopeForceX);
      this.angle -= (Math.abs(body.velocity.x) * delta) / 75;
    } else if (moveRight) {
      body.setAccelerationX(currentAccel + slopeForceX);
      this.angle += (Math.abs(body.velocity.x) * delta) / 75;
    } else {
      // Natural downhill roll when keys are released!
      body.setAccelerationX(slopeForceX);
      if (Math.abs(body.velocity.x) > 5) {
        this.angle += ((body.velocity.x > 0 ? 1 : -1) * Math.abs(body.velocity.x) * delta) / 75;
      }
    }

    // Dynamic downhill rolling top speed boost (allows building huge momentum down valleys!)
    const slopeSpeedBoost = this.isOnCurve && Math.sign(body.velocity.x) === Math.sign(slopeForceX)
      ? Math.abs(slopeForceX) * 0.16
      : 0;
    const maxSpeed = (wasInWaterThisFrame ? this.MOVE_SPEED * 0.75 : this.MOVE_SPEED) + slopeSpeedBoost;
    if (Math.abs(body.velocity.x) > maxSpeed) {
      body.setVelocityX(Math.sign(body.velocity.x) * maxSpeed);
    }

    // Ground rolling dust emission
    if (isGrounded && Math.abs(body.velocity.x) > 120 && this.dustEmitter && Phaser.Math.Between(0, 10) > 7) {
      this.dustEmitter.emitParticleAt(this.x, this.y + 14, 1);
    }

    // Jump & Swimming Logic
    if (wasInWaterThisFrame) {
      // In Water: Jump button executes upward swim stroke / impulse
      if (jumpRequested) {
        body.setVelocityY(-190);
        soundManager.playSwim();

        // Subtle fluid stretch
        this.setScale(0.88, 1.16);
        this.scene.tweens.add({
          targets: this,
          scaleX: 1,
          scaleY: 1,
          duration: 180,
          ease: 'Quad.easeOut',
        });

        if (this.dustEmitter) {
          this.dustEmitter.emitParticleAt(this.x, this.y, 3);
        }

        if (this.mobileControls.jump) {
          this.mobileControls.jump = false;
        }
      }
    } else {
      // Normal Grounded Jump (with Coyote Time leniency)
      const canJump = !this.isJumping && (isGrounded || this.isOnCurve || (time - this.lastGroundedTime <= this.COYOTE_DURATION));

      if (jumpRequested && canJump) {
        this.isJumping = true;
        this.isOnCurve = false;
        body.setAllowGravity(true);
        body.setVelocityY(currentJumpForce);

        // If launching off a sloped curve, add launch impulse along surface normal!
        if (curve) {
          body.setVelocityX(body.velocity.x + curve.normalX * 70);
        }

        soundManager.playJump();

        // Stretch on jump
        this.setScale(0.82, 1.25);
        this.scene.tweens.add({
          targets: this,
          scaleX: 1,
          scaleY: 1,
          duration: 160,
          ease: 'Quad.easeOut',
        });

        if (this.dustEmitter) {
          this.dustEmitter.emitParticleAt(this.x, this.y + 14, 3);
        }

        if (this.mobileControls.jump) {
          this.mobileControls.jump = false;
        }
      }
    }
  }

  /**
   * Renders the living creature face directly centered on the ball.
   */
  private updateFace(time: number): void {
    if (!this.faceGraphics || !this.active) return;

    const g = this.faceGraphics;
    g.clear();

    const cx = this.x;
    const cy = this.y;
    const sx = Math.abs(this.scaleX);
    const sy = Math.abs(this.scaleY);

    if (sx < 0.15 || sy < 0.15 || this.alpha < 0.05) {
      g.setVisible(false);
      return;
    }

    g.setAlpha(this.alpha);
    g.setVisible(this.visible);

    const isBlinking = time % 2600 < 130 && this.faceState !== 'HAPPY' && this.faceState !== 'CRYING';

    // 1. HAPPY VICTORY FACE (Inverted 'C' eyes (⌒ ⌒), rosy blush cheeks, cheerful smile)
    if (this.faceState === 'HAPPY') {
      g.fillStyle(0xf43f5e, 0.85);
      g.fillEllipse(cx - 9.5 * sx, cy + 3 * sy, 6.5 * sx, 4.2 * sy);
      g.fillEllipse(cx + 9.5 * sx, cy + 3 * sy, 6.5 * sx, 4.2 * sy);

      g.lineStyle(2.5 * sx, 0x1e1b4b, 1);
      g.beginPath();
      g.arc(cx - 5.5 * sx, cy - 2 * sy, 4.5 * sx, Phaser.Math.DegToRad(200), Phaser.Math.DegToRad(340), false);
      g.strokePath();

      g.beginPath();
      g.arc(cx + 5.5 * sx, cy - 2 * sy, 4.5 * sx, Phaser.Math.DegToRad(200), Phaser.Math.DegToRad(340), false);
      g.strokePath();

      g.fillStyle(0x881337, 1);
      g.beginPath();
      g.arc(cx, cy + 4 * sy, 4 * sx, 0, Math.PI, false);
      g.fillPath();
      return;
    }

    // 2. CRYING DEFEAT FACE (Sad downturned eyes (╥ ╥), tear streams, open mouth)
    if (this.faceState === 'CRYING') {
      g.lineStyle(2.5 * sx, 0x1e1b4b, 1);
      g.beginPath();
      g.moveTo(cx - 8 * sx, cy - 1 * sy);
      g.lineTo(cx - 3 * sx, cy - 4 * sy);
      g.strokePath();

      g.beginPath();
      g.moveTo(cx + 8 * sx, cy - 1 * sy);
      g.lineTo(cx + 3 * sx, cy - 4 * sy);
      g.strokePath();

      g.fillStyle(0x38bdf8, 0.95);
      g.fillEllipse(cx - 6 * sx, cy + 5 * sy, 3 * sx, 5.5 * sy);
      g.fillEllipse(cx + 6 * sx, cy + 5 * sy, 3 * sx, 5.5 * sy);

      g.fillCircle(cx - 8 * sx, cy + 9 * sy, 1.5 * sx);
      g.fillCircle(cx + 8 * sx, cy + 9 * sy, 1.5 * sx);

      g.fillStyle(0x450a0a, 1);
      g.fillEllipse(cx, cy + 5 * sy, 4.5 * sx, 5 * sy);
      return;
    }

    // 3. HURT / SAD PRICK BOUNCE FACE
    if (this.faceState === 'HURT') {
      g.lineStyle(2.2 * sx, 0x1e1b4b, 1);
      g.beginPath();
      g.moveTo(cx - 7 * sx, cy - 5 * sy);
      g.lineTo(cx - 4 * sx, cy - 2 * sy);
      g.lineTo(cx - 7 * sx, cy + 1 * sy);
      g.strokePath();

      g.beginPath();
      g.moveTo(cx + 7 * sx, cy - 5 * sy);
      g.lineTo(cx + 4 * sx, cy - 2 * sy);
      g.lineTo(cx + 7 * sx, cy + 1 * sy);
      g.strokePath();

      g.fillStyle(0x38bdf8, 0.9);
      g.fillCircle(cx + 6 * sx, cy + 2 * sy, 2 * sx);

      g.lineStyle(2 * sx, 0x881337, 1);
      g.beginPath();
      g.arc(cx, cy + 6 * sy, 3.5 * sx, Phaser.Math.DegToRad(200), Phaser.Math.DegToRad(340), false);
      g.strokePath();
      return;
    }

    // 4. NORMAL / WAITING LIVING CREATURE EYES
    const eyeSpacing = 6 * sx;
    const eyeY = cy - 2 * sy;
    const eyeWidth = 4.8 * sx;
    const eyeHeight = 6.5 * sy;

    if (isBlinking) {
      g.lineStyle(2 * sx, 0x1e1b4b, 1);
      g.beginPath();
      g.moveTo(cx - eyeSpacing - 3 * sx, eyeY);
      g.lineTo(cx - eyeSpacing + 3 * sx, eyeY);
      g.moveTo(cx + eyeSpacing - 3 * sx, eyeY);
      g.lineTo(cx + eyeSpacing + 3 * sx, eyeY);
      g.strokePath();
      return;
    }

    g.fillStyle(0xffffff, 1);
    g.fillEllipse(cx - eyeSpacing, eyeY, eyeWidth * 2, eyeHeight * 2);
    g.fillEllipse(cx + eyeSpacing, eyeY, eyeWidth * 2, eyeHeight * 2);

    g.lineStyle(1.2 * sx, 0x881337, 0.7);
    g.strokeEllipse(cx - eyeSpacing, eyeY, eyeWidth * 2, eyeHeight * 2);
    g.strokeEllipse(cx + eyeSpacing, eyeY, eyeWidth * 2, eyeHeight * 2);

    let pupilOffsetX = 0;
    let pupilOffsetY = 0;

    if (this.faceState === 'WAITING') {
      const idleElapsed = time - this.lastMovedTime - 2000;
      pupilOffsetX = Math.sin(idleElapsed * 0.0035) * (2.8 * sx);
      pupilOffsetY = Math.cos(idleElapsed * 0.002) * (0.8 * sy);
    } else {
      const body = this.body as Phaser.Physics.Arcade.Body;
      if (body) {
        if (body.velocity.x > 30) {
          pupilOffsetX = 1.8 * sx;
        } else if (body.velocity.x < -30) {
          pupilOffsetX = -1.8 * sx;
        }
        if (body.velocity.y < -50) {
          pupilOffsetY = -1.2 * sy;
        } else if (body.velocity.y > 50) {
          pupilOffsetY = 1.2 * sy;
        }
      }
    }

    g.fillStyle(0x0f172a, 1);
    g.fillCircle(cx - eyeSpacing + pupilOffsetX, eyeY + pupilOffsetY, 2.5 * sx);
    g.fillCircle(cx + eyeSpacing + pupilOffsetX, eyeY + pupilOffsetY, 2.5 * sx);

    g.fillStyle(0xffffff, 1);
    g.fillCircle(cx - eyeSpacing + pupilOffsetX - 0.8 * sx, eyeY + pupilOffsetY - 0.8 * sy, 1 * sx);
    g.fillCircle(cx + eyeSpacing + pupilOffsetX - 0.8 * sx, eyeY + pupilOffsetY - 0.8 * sy, 1 * sx);

    g.lineStyle(1.5 * sx, 0x881337, 0.9);
    g.beginPath();
    g.arc(cx, cy + 4 * sy, 3 * sx, Phaser.Math.DegToRad(15), Phaser.Math.DegToRad(165), false);
    g.strokePath();
  }

  /**
   * Smoothly launches the player from a spring without distorting the ball's round shape
   * or clipping into ground tiles.
   */
  public launchFromSpring(springY: number, launchVelocityY: number = -760): void {
    const body = this.body as Phaser.Physics.Arcade.Body;
    if (!body) return;

    soundManager.playSpring();

    // Kill any conflicting scale tweens immediately
    this.scene.tweens.killTweensOf(this);

    // Keep ball pristine and reset scale to perfect round circle
    this.setScale(1, 1);
    body.setCircle(15, 1, 1);

    // Ensure ball's bottom is positioned safely above spring top (spring texture is 24px tall)
    if (this.y > springY - 14) {
      this.y = springY - 14;
    }

    body.setVelocityY(launchVelocityY);

    // Subtle momentary vertical spring stretch that immediately returns to (1, 1)
    this.setScale(0.92, 1.1);
    this.scene.tweens.add({
      targets: this,
      scaleX: 1,
      scaleY: 1,
      duration: 160,
      ease: 'Sine.easeOut',
      onComplete: () => {
        this.setScale(1, 1);
        if (body) body.setCircle(15, 1, 1);
      },
    });
  }

  /**
   * Called when hit by a prick/spike.
   * Disables user's action for that moment, shows the sad bounce animation at that position,
   * then calls onComplete to restart at the previous checkpoint.
   */
  public playPrickReaction(hazardX: number | undefined, onComplete: () => void): void {
    this.isActionDisabled = true;
    this.faceState = 'HURT';

    soundManager.playHurt();
    soundManager.playBounce(0.75);

    const body = this.body as Phaser.Physics.Arcade.Body;
    if (body) {
      const knockDir = hazardX !== undefined && this.x < hazardX ? -140 : 140;
      body.setVelocity(knockDir, -280);
      body.setAcceleration(0, 0);
    }

    // Squash & Stretch wince - always ease cleanly back to 1, 1 with Sine.easeOut
    this.scene.tweens.killTweensOf(this);
    this.setScale(1.15, 0.88);
    this.scene.tweens.add({
      targets: this,
      scaleX: 1,
      scaleY: 1,
      duration: 180,
      ease: 'Sine.easeOut',
      onComplete: () => {
        this.setScale(1, 1);
        if (body) body.setCircle(15, 1, 1);
      },
    });

    // Disable action for respawn delay, then restore normal color and restart at checkpoint
    this.scene.time.delayedCall(GAME_CONFIG.PLAYER.RESPAWN_DELAY_MS, () => {
      this.setAlpha(1);
      this.clearTint();
      onComplete();
    });
  }

  /**
   * Restarts at checkpoint: resets position, re-enables user action, and grants invulnerability window.
   */
  public respawnAtCheckpoint(spawnX: number, spawnY: number): void {
    this.scene.tweens.killTweensOf(this);

    const body = this.body as Phaser.Physics.Arcade.Body;
    if (body) {
      body.setVelocity(0, 0);
      body.setAcceleration(0, 0);
      body.setCircle(15, 1, 1);
    }

    this.setPosition(spawnX, spawnY);
    this.setScale(1, 1);
    this.setAngle(0);
    this.setAlpha(1);
    this.clearTint();
    this.isActionDisabled = false;
    this.faceState = 'NORMAL';

    // Set invulnerability duration from GAME_CONFIG
    this.invulnerableUntil = this.scene.time.now + GAME_CONFIG.PLAYER.INVULNERABILITY_MS;
  }

  /**
   * Dramatic Arcade Game Over Death Animation:
   * Expresses brief cry of disappointment, sad tears, leaps up rapidly, then plunges down past screen bottom.
   */
  public triggerDeathSequence(onComplete: () => void): void {
    this.isDying = true;
    this.isActionDisabled = true;
    this.faceState = 'CRYING';
    this.onDeathFinished = onComplete;

    soundManager.playDeathSound();

    const body = this.body as Phaser.Physics.Arcade.Body;
    if (body) {
      body.setCollideWorldBounds(false);
      body.checkCollision.none = true;
      body.setAcceleration(0, 0);
      body.setVelocity(Phaser.Math.Between(-30, 30), -520);
      body.setGravityY(1300);
    }
  }

  public setHappyFace(): void {
    this.isWon = true;
    this.isActionDisabled = true;
    this.faceState = 'HAPPY';
    const body = this.body as Phaser.Physics.Arcade.Body;
    if (body) {
      body.setVelocity(0, 0);
      body.setAcceleration(0, 0);
      body.setAllowGravity(false);
    }
  }

  public destroy(fromScene?: boolean): void {
    if (this.faceGraphics) {
      this.faceGraphics.destroy();
    }
    if (this.dustEmitter) {
      this.dustEmitter.destroy();
    }
    super.destroy(fromScene);
  }
}
