// src/objects/SnappingMonster.ts

import Phaser from 'phaser';
import { soundManager } from '../utils/audio';

export interface SnappingMonsterTiming {
  openDuration?: number; // Time to open jaws slowly (default: 1000ms)
  holdOpenTime?: number; // The Safe Window duration (default: 900ms)
  snapDuration?: number; // Time to snap shut quickly (default: 200ms)
  holdShutTime?: number; // Time to hold shut (default: 600ms)
  startDelay?: number;   // Initial offset delay before starting chomp loop
}

/**
 * SnappingMonster: A precision mid-air timing trap.
 *
 * Creature Design:
 * - Upper Head Sprite: Full cranial monster face covering mouth to forehead, with curved obsidian horns,
 *   furrowed brow ridges, TWO menacing amber predator eyes with slitted pupils, snout with nostrils,
 *   and jagged ivory fangs pointing down.
 * - Lower Jaw Sprite: Sharp upward-pointing ivory fangs, crimson gums, and an armored spiky chin plate.
 * - Unobstructed Throat: The throat corridor is a clear, dark, open cavern void without any confusing
 *   obstructions, making the jump passage immediately obvious to the player.
 * - Strict Feasibility: Maximum clearance when fully open is strictly Player.Height + (Player.Height * 1.5) = 75px.
 * - Kinematic Arcade Physics bodies synced via tween onUpdate every frame.
 * - Synchronous Audio/VFX Throttling for multiple simultaneous traps.
 */
export class SnappingMonster extends Phaser.GameObjects.Container {
  // Static timestamp to debounce audio & camera shake across multiple synchronous monsters
  private static lastGlobalChompTime: number = 0;

  public readonly upperJaw: Phaser.Physics.Arcade.Sprite;
  public readonly lowerJaw: Phaser.Physics.Arcade.Sprite;

  private bgBeastGraphic: Phaser.GameObjects.Graphics;
  private salivaEmitter?: Phaser.GameObjects.Particles.ParticleEmitter;

  // Exact vertical jaw positions
  private readonly centerY: number;
  private readonly closedUpperY: number;
  private readonly closedLowerY: number;
  private readonly openUpperY: number;
  private readonly openLowerY: number;

  // Timing parameters
  private readonly openDuration: number;
  private readonly holdOpenTime: number;
  private readonly snapDuration: number;
  private readonly holdShutTime: number;
  private readonly startDelay: number;

  private isTrapActive: boolean = true;
  private activeTween?: Phaser.Tweens.Tween;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    timing?: SnappingMonsterTiming
  ) {
    super(scene, x, y);

    this.centerY = y;

    this.openDuration = timing?.openDuration ?? 1000;
    this.holdOpenTime = timing?.holdOpenTime ?? 900;
    this.snapDuration = timing?.snapDuration ?? 200;
    this.holdShutTime = timing?.holdShutTime ?? 600;
    this.startDelay = timing?.startDelay ?? 0;

    // --- Strict Feasibility Calculations ---
    // Player.Height = 30px (Radius = 15px).
    // The Safe Window clearance must be: Player.Height + (Player.Height * 1.5) = 30 + 45 = 75px.
    const playerHeight = 30;
    const safeWindowClearance = playerHeight + playerHeight * 1.5; // Exactly 75px
    const halfClearance = safeWindowClearance / 2; // 37.5px

    // monster-head-upper: 120x96px. Fangs end at bottom edge (halfHeight = 48).
    // When closed, fang tips meet centerY -> upperJaw center is at centerY - 48.
    const upperHalfHeight = 48;
    this.closedUpperY = y - upperHalfHeight;
    this.openUpperY = this.closedUpperY - halfClearance;

    // monster-jaw-lower: 120x56px. Fangs start at top edge (halfHeight = 28).
    // When closed, fang tips meet centerY -> lowerJaw center is at centerY + 28.
    const lowerHalfHeight = 28;
    this.closedLowerY = y + lowerHalfHeight;
    this.openLowerY = this.closedLowerY + halfClearance;

    // 1. Clear dark throat void in the background (No confusing eyeball in the mouth!)
    this.bgBeastGraphic = scene.add.graphics();
    this.renderBackgroundMonster();
    this.add(this.bgBeastGraphic);

    // 2. Upper Head Sprite: forehead, horns, 2 eyes, snout, and upper fangs
    this.upperJaw = scene.physics.add.sprite(x, this.closedUpperY, 'monster-head-upper');
    this.setupJawBody(this.upperJaw, 84, 32, 18, 64);

    // 3. Lower Jaw Sprite: upward fangs, gum, and spiky armored chin
    this.lowerJaw = scene.physics.add.sprite(x, this.closedLowerY, 'monster-jaw-lower');
    this.setupJawBody(this.lowerJaw, 84, 30, 18, 0);

    this.setupParticles();

    scene.add.existing(this);
    this.setDepth(4);
    this.upperJaw.setDepth(6);
    this.lowerJaw.setDepth(6);

    // 4. Start the Rhythmic Animation Loop (with optional start delay)
    if (this.startDelay > 0) {
      scene.time.delayedCall(this.startDelay, () => {
        this.startChompCycle();
      });
    } else {
      this.startChompCycle();
    }

    this.once('destroy', () => {
      this.isTrapActive = false;
      this.activeTween?.stop();
      this.salivaEmitter?.destroy();
      this.upperJaw.destroy();
      this.lowerJaw.destroy();
    });
  }

  private setupJawBody(
    sprite: Phaser.Physics.Arcade.Sprite,
    bodyW: number,
    bodyH: number,
    offsetX: number,
    offsetY: number
  ): void {
    const body = sprite.body as Phaser.Physics.Arcade.Body;
    if (body) {
      body.setAllowGravity(false);
      body.setImmovable(true);
      body.moves = false; // Moved strictly via tween with updateFromGameObject()
      body.setSize(bodyW, bodyH);
      body.setOffset(offsetX, offsetY);
      body.updateFromGameObject();
    }
  }

  /**
   * Cavernous throat void behind the jaws.
   * Completely open, dark, and unobstructed so the jump path is unmistakable!
   */
  private renderBackgroundMonster(): void {
    const g = this.bgBeastGraphic;
    g.clear();

    // Dark cavernous throat passage
    g.fillStyle(0x180507, 1);
    g.fillEllipse(0, 0, 92, 74);

    // Fleshy gullet perimeter rings
    g.lineStyle(2, 0x881337, 0.45);
    g.strokeEllipse(0, 0, 76, 58);
    g.strokeEllipse(0, 0, 50, 36);

    // Subtle atmospheric passage glow guiding the player's leap
    g.fillStyle(0x38bdf8, 0.06);
    g.fillEllipse(0, 0, 64, 30);
  }

  private setupParticles(): void {
    if (this.scene.textures.exists('dust')) {
      this.salivaEmitter = this.scene.add.particles(this.x, this.centerY, 'dust', {
        x: { min: -25, max: 25 },
        y: { min: -5, max: 5 },
        speedY: { min: 20, max: 65 },
        speedX: { min: -4, max: 4 },
        scale: { start: 0.5, end: 0.1 },
        alpha: { start: 0.7, end: 0 },
        tint: [0xa3e635, 0x84cc16, 0xef4444],
        lifespan: 800,
        frequency: 450,
      });
      this.salivaEmitter.setDepth(5);
    }
  }

  /**
   * The Animation Loop:
   * 1. Open slowly (openDuration, e.g. 1000ms)
   * 2. Hold open for the Safe Window (holdOpenTime, e.g. 900ms)
   * 3. Snap shut quickly (snapDuration, e.g. 200ms) + single unified sound + subtle shake
   * 4. Hold shut (holdShutTime, e.g. 600ms)
   * 5. Repeat.
   */
  private startChompCycle(): void {
    if (!this.isTrapActive) return;

    // Step 1: Open Slowly (0 -> 1)
    this.activeTween = this.scene.tweens.addCounter({
      from: 0,
      to: 1,
      duration: this.openDuration,
      ease: 'Cubic.easeOut',
      onUpdate: (tween) => {
        const t = tween.getValue() ?? 0;
        this.upperJaw.y = Phaser.Math.Linear(this.closedUpperY, this.openUpperY, t);
        this.lowerJaw.y = Phaser.Math.Linear(this.closedLowerY, this.openLowerY, t);

        // CRITICAL: Sync Arcade Physics hitboxes with jaw movement every frame!
        this.upperJaw.body?.updateFromGameObject();
        this.lowerJaw.body?.updateFromGameObject();
      },
      onComplete: () => {
        if (!this.isTrapActive) return;

        // Step 2: Hold open for the Safe Window
        this.scene.time.delayedCall(this.holdOpenTime, () => {
          if (!this.isTrapActive) return;

          // Step 3: Snap Shut Quickly! (1 -> 0)
          this.activeTween = this.scene.tweens.addCounter({
            from: 1,
            to: 0,
            duration: this.snapDuration,
            ease: 'Quad.easeIn',
            onUpdate: (tween) => {
              const t = tween.getValue() ?? 0;
              this.upperJaw.y = Phaser.Math.Linear(this.closedUpperY, this.openUpperY, t);
              this.lowerJaw.y = Phaser.Math.Linear(this.closedLowerY, this.openLowerY, t);

              this.upperJaw.body?.updateFromGameObject();
              this.lowerJaw.body?.updateFromGameObject();
            },
            onComplete: () => {
              if (!this.isTrapActive) return;

              // Synchronous Clamp Feedback:
              // Debounce so 3 synchronous monsters produce a SINGLE chomp sound and subtle shake
              const now = this.scene.time.now;
              const player = (this.scene as any).player;
              const playerNearby = !player || Math.abs(player.x - this.x) < 700;

              if (playerNearby && now - SnappingMonster.lastGlobalChompTime > 350) {
                SnappingMonster.lastGlobalChompTime = now;
                soundManager.playChomp();
                // Gentle, non-disorienting camera shake (80ms duration, 0.005 intensity)
                this.scene.cameras.main.shake(80, 0.005);
              }

              // Step 4: Hold shut
              this.scene.time.delayedCall(this.holdShutTime, () => {
                // Loop back to Step 1
                this.startChompCycle();
              });
            },
          });
        });
      },
    });
  }

  /**
   * Returns jaw sprites for collider registration in GameScene.
   */
  public getJawSprites(): Phaser.Physics.Arcade.Sprite[] {
    return [this.upperJaw, this.lowerJaw];
  }
}
