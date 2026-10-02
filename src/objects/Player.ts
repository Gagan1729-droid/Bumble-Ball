// src/objects/Player.ts

import Phaser from 'phaser';
import { soundManager } from '../utils/audio';

export interface MobileInputState {
  left: boolean;
  right: boolean;
  jump: boolean;
}

export type PlayerFaceState = 'NORMAL' | 'WAITING' | 'HAPPY' | 'CRYING' | 'HURT';

export class Player extends Phaser.Physics.Arcade.Sprite {
  // Movement & physics tuning parameters
  public readonly MOVE_SPEED: number = 240;
  public readonly ACCELERATION: number = 850;
  public readonly JUMP_FORCE: number = -490;
  public readonly SPRING_FORCE: number = -680;
  public readonly COYOTE_DURATION: number = 140; // ms leniency

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
    body.setCircle(16);
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

  /**
   * PreUpdate guarantees the face graphics are locked to the ball's center
   * every single engine frame, including during tweens and celebrations.
   */
  public preUpdate(time: number, delta: number): void {
    super.preUpdate(time, delta);
    this.updateFace(time);
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

    const isGrounded = body.blocked.down || body.touching.down;

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

        // Squash on impact without resetting invulnerability
        this.setScale(1 + impactRatio * 0.35, 1 - impactRatio * 0.3);
        this.scene.tweens.add({
          targets: this,
          scaleX: 1,
          scaleY: 1,
          duration: 150,
          ease: 'Back.easeOut',
        });

        if (impactRatio > 0.4 && this.dustEmitter) {
          this.dustEmitter.emitParticleAt(this.x, this.y + 14, 4);
        }
      }
    }
    this.wasGrounded = isGrounded;
    this.prevVelocityY = body.velocity.y;

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

    // Horizontal Movement
    if (moveLeft) {
      body.setAccelerationX(-this.ACCELERATION);
      this.angle -= (Math.abs(body.velocity.x) * delta) / 100;
    } else if (moveRight) {
      body.setAccelerationX(this.ACCELERATION);
      this.angle += (Math.abs(body.velocity.x) * delta) / 100;
    } else {
      body.setAccelerationX(0);
      if (Math.abs(body.velocity.x) > 5) {
        this.angle += ((body.velocity.x > 0 ? 1 : -1) * Math.abs(body.velocity.x) * delta) / 100;
      }
    }

    // Clamp horizontal speed
    if (Math.abs(body.velocity.x) > this.MOVE_SPEED) {
      body.setVelocityX(Math.sign(body.velocity.x) * this.MOVE_SPEED);
    }

    // Ground rolling dust emission
    if (isGrounded && Math.abs(body.velocity.x) > 120 && this.dustEmitter && Phaser.Math.Between(0, 10) > 7) {
      this.dustEmitter.emitParticleAt(this.x, this.y + 14, 1);
    }

    // Jump Logic (with Coyote Time leniency)
    const canJump = !this.isJumping && (isGrounded || (time - this.lastGroundedTime <= this.COYOTE_DURATION));

    if (jumpRequested && canJump) {
      this.isJumping = true;
      body.setVelocityY(this.JUMP_FORCE);
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

  public launchFromSpring(): void {
    const body = this.body as Phaser.Physics.Arcade.Body;
    if (!body) return;

    body.setVelocityY(this.SPRING_FORCE);
    this.isJumping = true;
    soundManager.playSpring();

    this.setScale(0.7, 1.35);
    this.scene.tweens.add({
      targets: this,
      scaleX: 1,
      scaleY: 1,
      duration: 220,
      ease: 'Back.easeOut',
    });

    if (this.dustEmitter) {
      this.dustEmitter.emitParticleAt(this.x, this.y + 14, 6);
    }
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

    // Squash & Stretch wince
    this.setScale(1.25, 0.75);
    this.scene.tweens.add({
      targets: this,
      scaleX: 1,
      scaleY: 1,
      duration: 200,
      ease: 'Back.easeOut',
    });

    // Flashing during the hurt moment
    this.scene.tweens.add({
      targets: this,
      alpha: 0.35,
      duration: 90,
      yoyo: true,
      repeat: 4,
    });

    // Disable action for 850ms, then restart at checkpoint
    this.scene.time.delayedCall(850, () => {
      onComplete();
    });
  }

  /**
   * Restarts at checkpoint: resets position, re-enables user action, and grants 1.2s invulnerability.
   */
  public respawnAtCheckpoint(spawnX: number, spawnY: number): void {
    const body = this.body as Phaser.Physics.Arcade.Body;
    if (body) {
      body.setVelocity(0, 0);
      body.setAcceleration(0, 0);
    }

    this.setPosition(spawnX, spawnY);
    this.setScale(1, 1);
    this.setAngle(0);
    this.isActionDisabled = false;
    this.faceState = 'NORMAL';

    // 1200ms invulnerability
    this.invulnerableUntil = this.scene.time.now + 1200;

    // Visual invulnerability blinking
    this.scene.tweens.add({
      targets: this,
      alpha: 0.25,
      duration: 100,
      yoyo: true,
      repeat: 5,
      onComplete: () => {
        this.setAlpha(1);
      },
    });
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
