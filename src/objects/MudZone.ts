// src/objects/MudZone.ts

import Phaser from 'phaser';

export class MudZone extends Phaser.GameObjects.Zone {
  private visualGraphics: Phaser.GameObjects.Graphics;
  private bubbleEmitter?: Phaser.GameObjects.Particles.ParticleEmitter;

  constructor(scene: Phaser.Scene, x: number, y: number, width: number, height: number) {
    super(scene, x, y, width, height);

    scene.add.existing(this);
    scene.physics.add.existing(this, false);

    const body = this.body as Phaser.Physics.Arcade.Body;
    if (body) {
      body.setAllowGravity(false);
      body.setSize(width, height);
    }

    // Semi-transparent viscous mud visual representation
    this.visualGraphics = scene.add.graphics();
    this.visualGraphics.fillStyle(0x451a03, 0.65);
    this.visualGraphics.fillRect(x - width / 2, y - height / 2, width, height);

    // Mud rim
    this.visualGraphics.fillStyle(0x78350f, 0.85);
    this.visualGraphics.fillRect(x - width / 2, y - height / 2, width, 6);

    // Subtle surface mud bubbles
    if (scene.textures.exists('mud-bubble')) {
      this.bubbleEmitter = scene.add.particles(0, 0, 'mud-bubble', {
        x: { min: x - width / 2 + 10, max: x + width / 2 - 10 },
        y: y - height / 2 + 4,
        speedY: { min: -10, max: -2 },
        scale: { start: 0.8, end: 0 },
        alpha: { start: 0.7, end: 0 },
        lifespan: 800,
        frequency: 450,
      });
      this.bubbleEmitter.setDepth(2);
    }

    this.visualGraphics.setDepth(2);
    this.setDepth(2);
  }

  public destroy(fromScene?: boolean): void {
    if (this.bubbleEmitter) {
      this.bubbleEmitter.destroy();
    }
    if (this.visualGraphics) {
      this.visualGraphics.destroy();
    }
    super.destroy(fromScene);
  }
}
