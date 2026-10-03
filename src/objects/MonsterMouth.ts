// src/objects/MonsterMouth.ts

import Phaser from 'phaser';
import { soundManager } from '../utils/audio';
import { MovingPlatform } from './MovingPlatform';

export class MonsterMouth extends Phaser.GameObjects.Container {
  public triggerWidth: number;
  public triggerHeight: number;
  public hasSwallowed: boolean = false;

  // The two independent horizontal moving bars (platforms)
  public leftPlatform: MovingPlatform;
  public rightPlatform: MovingPlatform;

  // Visual Monster parts
  private upperJaw: Phaser.GameObjects.Graphics;
  private lowerJaw: Phaser.GameObjects.Graphics;
  private monsterBodyGraphics: Phaser.GameObjects.Graphics;
  private throatGlow: Phaser.GameObjects.Graphics;
  private salivaEmitter?: Phaser.GameObjects.Particles.ParticleEmitter;

  // Mouth animation state
  public mouthOpenRatio: number = 0; // 0 = closed, 1 = open wide
  public isMouthOpen: boolean = false;

  private onSwallowedCallback?: () => void;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    triggerWidth: number = 180,
    triggerHeight: number = 220,
    onSwallowed?: () => void
  ) {
    super(scene, x, y);

    this.triggerWidth = triggerWidth;
    this.triggerHeight = triggerHeight;
    this.onSwallowedCallback = onSwallowed;

    // 1. Create the two horizontal moving bars close to the monster for a fair, achievable jump!
    // Left Platform at x - 105 (right edge at x - 57), moves gently up and down by 50px
    this.leftPlatform = new MovingPlatform(scene, x - 105, y - 10, 2, 0, 50, 2000);
    // Right Platform at x + 105 (left edge at x + 57), moves gently down and up by 50px
    this.rightPlatform = new MovingPlatform(scene, x + 105, y + 25, 2, 0, -50, 2000);

    // 2. Monster Main Skull & Eyes
    this.monsterBodyGraphics = scene.add.graphics();
    this.add(this.monsterBodyGraphics);

    // 3. Glowing Throat Void (Shows visual feedback when open)
    this.throatGlow = scene.add.graphics();
    this.add(this.throatGlow);

    // 4. Monster Jaws that move up and down
    this.upperJaw = scene.add.graphics();
    this.lowerJaw = scene.add.graphics();
    this.add(this.upperJaw);
    this.add(this.lowerJaw);

    this.renderMonsterBase();
    this.renderJaws(0);
    this.setupParticles();

    scene.add.existing(this);
    this.setDepth(5);

    // 5. Start the Mouth Opening & Closing Animation (Generous open timing!)
    this.startMouthAnimation();

    this.once('destroy', () => {
      this.salivaEmitter?.destroy();
      this.leftPlatform?.destroy();
      this.rightPlatform?.destroy();
    });
  }

  private renderMonsterBase(): void {
    const g = this.monsterBodyGraphics;
    g.clear();

    const w = 200;
    const h = 230;

    // Colossal Horned Beast Skull
    g.fillStyle(0x450a0a, 1);
    g.beginPath();
    g.moveTo(-w / 2 + 15, -h / 2 + 20);
    g.lineTo(w / 2 - 15, -h / 2 + 20);
    g.lineTo(w / 2 + 10, h / 2 - 30);
    g.lineTo(w / 2 - 25, h / 2 + 15);
    g.lineTo(-w / 2 + 25, h / 2 + 15);
    g.lineTo(-w / 2 - 10, h / 2 - 30);
    g.closePath();
    g.fillPath();

    // Horns
    g.fillStyle(0x27272a, 1);
    g.fillTriangle(-w / 2 + 20, -h / 2 + 20, -w / 2 - 20, -h / 2 - 25, -w / 2 + 55, -h / 2 + 10);
    g.fillTriangle(w / 2 - 20, -h / 2 + 20, w / 2 + 20, -h / 2 - 25, w / 2 - 55, -h / 2 + 10);

    // Menacing Amber Eyes
    const eyeY = -h / 2 + 55;
    [-38, 38].forEach((eyeX) => {
      g.fillStyle(0x2a040d, 1);
      g.fillEllipse(eyeX, eyeY, 36, 24);
      g.fillStyle(0xf59e0b, 1);
      g.fillEllipse(eyeX, eyeY, 28, 16);
      g.fillStyle(0x09090b, 1);
      g.fillEllipse(eyeX, eyeY, 8, 14);
      g.fillStyle(0xffffff, 0.9);
      g.fillCircle(eyeX - 3, eyeY - 2, 3);
    });
  }

  private renderJaws(openRatio: number): void {
    // Upper Jaw: moves UP when opening
    const upperY = -12 - openRatio * 42;
    this.upperJaw.clear();
    this.upperJaw.y = upperY;

    // Upper Jaw Gum
    this.upperJaw.fillStyle(0x7f1d1d, 1);
    this.upperJaw.fillRoundedRect(-60, -18, 120, 20, 6);

    // Upper Fangs (pointing DOWN)
    this.upperJaw.fillStyle(0xfef08a, 1);
    for (let x = -50; x <= 50; x += 22) {
      this.upperJaw.fillTriangle(x - 7, 2, x, 2 + 22, x + 7, 2);
      this.upperJaw.fillStyle(0xca8a04, 0.5);
      this.upperJaw.fillRect(x - 4, 0, 8, 4);
      this.upperJaw.fillStyle(0xfef08a, 1);
    }

    // Lower Jaw: moves DOWN when opening
    const lowerY = 12 + openRatio * 38;
    this.lowerJaw.clear();
    this.lowerJaw.y = lowerY;

    // Lower Jaw Gum
    this.lowerJaw.fillStyle(0x7f1d1d, 1);
    this.lowerJaw.fillRoundedRect(-60, 0, 120, 20, 6);

    // Lower Fangs (pointing UP)
    this.lowerJaw.fillStyle(0xfef08a, 1);
    for (let x = -40; x <= 40; x += 22) {
      this.lowerJaw.fillTriangle(x - 7, 0, x, -22, x + 7, 0);
      this.lowerJaw.fillStyle(0xca8a04, 0.5);
      this.lowerJaw.fillRect(x - 4, -4, 8, 4);
      this.lowerJaw.fillStyle(0xfef08a, 1);
    }

    // Throat Void Interior
    const tg = this.throatGlow;
    tg.clear();
    if (openRatio > 0.15) {
      // Glow green/gold when open showing clear passage!
      const alpha = Math.min(openRatio * 0.9, 0.9);
      tg.fillStyle(0x180507, 1);
      tg.fillEllipse(0, 0, 110, 30 + openRatio * 65);
      tg.lineStyle(2, 0x4ade80, alpha * 0.7);
      tg.strokeEllipse(0, 0, 95, 20 + openRatio * 55);
    } else {
      tg.fillStyle(0x180507, 1);
      tg.fillEllipse(0, 0, 90, 20);
    }
  }

  private startMouthAnimation(): void {
    // Generous, fair timing cycle:
    // Opens wide for 1400ms, Closes for 700ms
    this.scene.tweens.addCounter({
      from: 0,
      to: 1,
      duration: 800,
      hold: 1400, // Long open window making crossing completely achievable!
      yoyo: true,
      repeat: -1,
      ease: 'Cubic.easeInOut',
      onUpdate: (tween) => {
        const val = tween.getValue();
        this.mouthOpenRatio = typeof val === 'number' ? val : 0;
        // Mouth is considered safe to enter when openRatio > 0.35
        this.isMouthOpen = this.mouthOpenRatio > 0.35;
        this.renderJaws(this.mouthOpenRatio);
      },
    });
  }

  private setupParticles(): void {
    if (this.scene.textures.exists('dust')) {
      this.salivaEmitter = this.scene.add.particles(this.x, this.y, 'dust', {
        x: { min: -25, max: 25 },
        y: { min: -5, max: 10 },
        speedY: { min: 20, max: 60 },
        speedX: { min: -3, max: 3 },
        scale: { start: 0.5, end: 0.1 },
        alpha: { start: 0.7, end: 0 },
        tint: [0xa3e635, 0x84cc16],
        lifespan: 900,
        frequency: 500,
      });
      this.salivaEmitter.setDepth(6);
    }
  }

  /**
   * Checks player interaction with the Monster.
   * - When mouth is OPEN: jumping in between the jaws triggers SWALLOW / passage!
   * - When mouth is CLOSED: touching the jaws / fangs triggers HAZARD.
   * - Approaching from the sides onto the platforms never triggers false hazards.
   */
  public checkPlayerTimingOverlap(
    playerBounds: Phaser.Geom.Rectangle
  ): 'SWALLOW' | 'HAZARD' | 'NONE' {
    // Check if player is horizontally within the monster mouth zone
    const mouthLeft = this.x - 50;
    const mouthRight = this.x + 50;
    const isPlayerInMouthX = playerBounds.right > mouthLeft && playerBounds.left < mouthRight;

    if (!isPlayerInMouthX) {
      // Safely outside the monster zone on the platforms
      return 'NONE';
    }

    // Inside the monster horizontal zone:
    const currentUpperJawY = this.y + this.upperJaw.y + 24;
    const currentLowerJawY = this.y + this.lowerJaw.y - 24;

    if (this.isMouthOpen) {
      // When the mouth is open, there is a large, generous safe passage window in between!
      const playerCenterY = playerBounds.centerY;

      // If player is inside the open vertical corridor between the jaws:
      if (playerCenterY >= currentUpperJawY - 12 && playerCenterY <= currentLowerJawY + 12) {
        if (!this.hasSwallowed) {
          this.triggerSwallow();
          return 'SWALLOW';
        }
        return 'NONE';
      }

      // If player jumped way too high and hits the top skull or too low onto bottom chin:
      if (playerBounds.bottom < currentUpperJawY - 15 || playerBounds.top > currentLowerJawY + 15) {
        return 'HAZARD';
      }

      return 'NONE';
    } else {
      // When the mouth is CLOSED:
      // The jaws are clamped together! Touching the closed mouth is dangerous!
      const closedMouthTop = this.y - 25;
      const closedMouthBottom = this.y + 25;

      if (playerBounds.bottom > closedMouthTop && playerBounds.top < closedMouthBottom) {
        return 'HAZARD';
      }
    }

    return 'NONE';
  }

  public triggerSwallow(): void {
    if (this.hasSwallowed) return;
    this.hasSwallowed = true;

    // Visceral gulp sound
    soundManager.playSwallow();

    // Impact screen reaction
    this.scene.cameras.main.shake(300, 0.016);
    this.scene.cameras.main.flash(260, 153, 27, 27, true);

    // Gulp mist particles
    if (this.scene.textures.exists('dust')) {
      const emitter = this.scene.add.particles(this.x, this.y, 'dust', {
        speed: { min: 50, max: 150 },
        scale: { start: 1.1, end: 0.2 },
        tint: [0xef4444, 0x991b1b, 0x7f1d1d],
        lifespan: 500,
        emitting: false,
      });
      emitter.explode(20);
      this.scene.time.delayedCall(600, () => emitter.destroy());
    }

    // Environmental transition callback
    if (this.onSwallowedCallback) {
      this.onSwallowedCallback();
    }
  }
}
