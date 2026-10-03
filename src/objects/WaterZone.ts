// src/objects/WaterZone.ts

import Phaser from 'phaser';
import { soundManager } from '../utils/audio';

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
    this.surfaceY = y - height / 2;

    this.waterGraphics = scene.add.graphics();
    this.add(this.waterGraphics);

    this.drawWaterBody();
    this.setupParticles();

    scene.add.existing(this);
    this.setDepth(6); // Render over background and terrain, under UI and foreground effects

    // Ambient floating bubble animation
    scene.events.on('update', this.onSceneUpdate, this);
    this.once('destroy', () => {
      scene.events.off('update', this.onSceneUpdate, this);
      this.bubbleEmitter?.destroy();
      this.splashEmitter?.destroy();
    });
  }

  private drawWaterBody(): void {
    const g = this.waterGraphics;
    g.clear();

    const halfW = this.zoneWidth / 2;
    const halfH = this.zoneHeight / 2;

    // 1. Deep water body fill (Semi-transparent crystalline azure)
    g.fillStyle(0x0284c7, 0.42);
    g.fillRect(-halfW, -halfH, this.zoneWidth, this.zoneHeight);

    // 2. Underwater abyss depth gradient (darker near bottom)
    g.fillStyle(0x0c4a6e, 0.35);
    g.fillRect(-halfW, 0, this.zoneWidth, halfH);

    // 3. Wavy animated water surface
    g.lineStyle(3, 0x38bdf8, 0.85);
    g.beginPath();
    const waveStep = 18;
    const waveAmp = 3.5;
    g.moveTo(-halfW, -halfH);
    for (let wx = -halfW; wx <= halfW; wx += waveStep) {
      const wy = -halfH + Math.sin((wx + this.waveOffset) * 0.045) * waveAmp;
      g.lineTo(wx, wy);
    }
    g.strokePath();

    // 4. Subtle caustic sunbeam highlights
    g.lineStyle(1.5, 0xe0f2fe, 0.3);
    for (let cx = -halfW + 40; cx < halfW - 40; cx += 110) {
      g.beginPath();
      g.moveTo(cx, -halfH + 10);
      g.lineTo(cx + 25, halfH - 15);
      g.strokePath();
    }
  }

  private setupParticles(): void {
    if (this.scene.textures.exists('sparkle')) {
      // Gentle rising ambient bubbles
      this.bubbleEmitter = this.scene.add.particles(this.x, this.y, 'sparkle', {
        x: { min: -this.zoneWidth / 2 + 10, max: this.zoneWidth / 2 - 10 },
        y: { min: -this.zoneHeight / 2 + 20, max: this.zoneHeight / 2 - 10 },
        speedY: { min: -40, max: -15 },
        speedX: { min: -8, max: 8 },
        scale: { start: 0.5, end: 0.1 },
        alpha: { start: 0.7, end: 0 },
        tint: [0x38bdf8, 0x7dd3fc, 0xffffff],
        lifespan: 1800,
        frequency: 320,
      });
      this.bubbleEmitter.setDepth(7);

      // Splash emitter on water entry/swim
      this.splashEmitter = this.scene.add.particles(0, 0, 'sparkle', {
        speed: { min: 40, max: 120 },
        angle: { min: 200, max: 340 },
        scale: { start: 0.8, end: 0.1 },
        alpha: { start: 0.9, end: 0 },
        tint: [0x38bdf8, 0xffffff],
        lifespan: 350,
        emitting: false,
      });
      this.splashEmitter.setDepth(8);
    }
  }

  public triggerSplash(atX: number, atY: number): void {
    soundManager.playWaterSplash();
    if (this.splashEmitter) {
      this.splashEmitter.emitParticleAt(atX, atY, 12);
    }
  }

  private onSceneUpdate(_time: number, delta: number): void {
    this.waveOffset += delta * 0.12;
    this.drawWaterBody();
  }

  public getBounds(): Phaser.Geom.Rectangle {
    return new Phaser.Geom.Rectangle(
      this.x - this.zoneWidth / 2,
      this.y - this.zoneHeight / 2,
      this.zoneWidth,
      this.zoneHeight
    );
  }
}
