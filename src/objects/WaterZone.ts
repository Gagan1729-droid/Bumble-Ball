// src/objects/WaterZone.ts

import Phaser from 'phaser';
import { soundManager } from '../utils/audio';

/**
 * WaterZone: A semi-transparent body of water constrained within sunken terrain basins.
 *
 * Visuals & Z-Index:
 * - Rendered with blue semi-transparent fill (alpha 0.55) so the pool's floor, ruins, and submerged
 *   player are crystal clear beneath the surface.
 * - Shimmering white surface crest and darker blue meniscus line at Y = 0 to clearly denote the water level.
 * - Depth Sorting: Depth 6 (in front of background depth 0 and terrain floor depth 2, allowing clear
 *   visibility of the floor and submerged objects).
 */
export class WaterZone extends Phaser.GameObjects.Container {
  public zoneWidth: number;
  public zoneHeight: number;
  public surfaceY: number;

  private waterGraphics: Phaser.GameObjects.Graphics;
  private bubbleEmitter?: Phaser.GameObjects.Particles.ParticleEmitter;
  private splashEmitter?: Phaser.GameObjects.Particles.ParticleEmitter;
  private waveOffset: number = 0;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    width: number,
    height: number,
    title?: string
  ) {
    super(scene, x, y);

    this.zoneWidth = width;
    this.zoneHeight = height;
    this.surfaceY = y;

    this.waterGraphics = scene.add.graphics();
    this.add(this.waterGraphics);

    this.drawWaterBody();
    this.setupParticles();

    scene.add.existing(this);
    // Depth sorting: in front of background (0) and terrain (2), so terrain floor is visible through water
    this.setDepth(6);

    scene.events.on('update', this.onSceneUpdate, this);
    this.once('destroy', () => {
      scene.events.off('update', this.onSceneUpdate, this);
      this.bubbleEmitter?.destroy();
      this.splashEmitter?.destroy();
    });
  }

  /**
   * Draws the semi-transparent water body, bottom abyss gradient, and the distinct surface line.
   */
  public drawWaterBody(): void {
    const g = this.waterGraphics;
    g.clear();

    const w = this.zoneWidth;
    const h = this.zoneHeight;

    // 1. Primary blue semi-transparent fill (alpha: 0.52 - 0.55)
    g.fillStyle(0x0284c7, 0.52);
    g.fillRect(0, 0, w, h);

    // 2. Underwater abyss depth darkening (darker near bottom of deep basins)
    g.fillStyle(0x0369a1, 0.16);
    g.fillRect(0, h * 0.45, w, h * 0.55);

    g.fillStyle(0x0c4a6e, 0.22);
    g.fillRect(0, h * 0.75, w, h * 0.25);

    // 3. Crisp white surface line denoting the water's surface (Y = 0)
    g.lineStyle(3, 0xffffff, 0.95);
    g.beginPath();
    g.moveTo(0, 0);
    const waveStep = 16;
    for (let wx = 0; wx <= w; wx += waveStep) {
      const wy = Math.sin((wx + this.waveOffset) * 0.04) * 2;
      g.lineTo(wx, wy);
    }
    g.strokePath();

    // 4. Slightly darker blue surface contour line immediately below the white line
    g.lineStyle(2, 0x0369a1, 0.85);
    g.beginPath();
    g.moveTo(0, 3);
    for (let wx = 0; wx <= w; wx += waveStep) {
      const wy = 3 + Math.sin((wx + this.waveOffset) * 0.04) * 1.5;
      g.lineTo(wx, wy);
    }
    g.strokePath();

    // 5. Subtle caustic sunbeam highlights drifting through the water
    g.lineStyle(1.5, 0xe0f2fe, 0.16);
    for (let cx = 35; cx < w - 35; cx += 90) {
      g.beginPath();
      g.moveTo(cx, 4);
      g.lineTo(cx + 25, h - 10);
      g.strokePath();
    }
  }

  private setupParticles(): void {
    if (this.scene.textures.exists('sparkle')) {
      // Gentle rising ambient underwater bubbles
      this.bubbleEmitter = this.scene.add.particles(this.x, this.y, 'sparkle', {
        x: { min: 15, max: this.zoneWidth - 15 },
        y: { min: 25, max: this.zoneHeight - 15 },
        speedY: { min: -45, max: -15 },
        speedX: { min: -8, max: 8 },
        scale: { start: 0.5, end: 0.1 },
        alpha: { start: 0.75, end: 0 },
        tint: [0x38bdf8, 0x7dd3fc, 0xffffff],
        lifespan: 1900,
        frequency: 280,
      });
      this.bubbleEmitter.setDepth(7);

      // Splash emitter on water entry/jump
      this.splashEmitter = this.scene.add.particles(0, 0, 'sparkle', {
        speed: { min: 50, max: 130 },
        angle: { min: 210, max: 330 },
        scale: { start: 0.85, end: 0.1 },
        alpha: { start: 0.9, end: 0 },
        tint: [0x38bdf8, 0xffffff],
        lifespan: 360,
        emitting: false,
      });
      this.splashEmitter.setDepth(8);
    }
  }

  public triggerSplash(atX: number, atY: number): void {
    soundManager.playWaterSplash();
    if (this.splashEmitter) {
      this.splashEmitter.emitParticleAt(atX, atY, 14);
    }
  }

  private onSceneUpdate(_time: number, delta: number): void {
    this.waveOffset += delta * 0.1;
    this.drawWaterBody();
  }

  /**
   * Bounding box precisely matches the [x, x + width] and [y, y + height] pool boundaries.
   */
  public getBounds(): Phaser.Geom.Rectangle {
    return new Phaser.Geom.Rectangle(this.x, this.y, this.zoneWidth, this.zoneHeight);
  }
}
