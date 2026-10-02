// src/objects/WindZone.ts

import Phaser from 'phaser';

export class WindZone extends Phaser.GameObjects.Zone {
  public forceY: number;
  private particleEmitter?: Phaser.GameObjects.Particles.ParticleEmitter;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    width: number,
    height: number,
    forceY: number = -1400
  ) {
    super(scene, x, y, width, height);

    this.forceY = forceY;

    scene.add.existing(this);
    scene.physics.add.existing(this, false);

    const body = this.body as Phaser.Physics.Arcade.Body;
    if (body) {
      body.setAllowGravity(false);
      body.setSize(width, height);
    }

    // Upward breeze air particles
    if (scene.textures.exists('wind-particle')) {
      this.particleEmitter = scene.add.particles(0, 0, 'wind-particle', {
        x: { min: x - width / 2 + 8, max: x + width / 2 - 8 },
        y: y + height / 2,
        speedY: { min: -220, max: -360 },
        speedX: { min: -10, max: 10 },
        scale: { start: 1, end: 0.2 },
        alpha: { start: 0.75, end: 0 },
        lifespan: Math.round((height / 280) * 1000),
        frequency: 110,
      });
      this.particleEmitter.setDepth(3);
    }
  }

  public destroy(fromScene?: boolean): void {
    if (this.particleEmitter) {
      this.particleEmitter.destroy();
    }
    super.destroy(fromScene);
  }
}
