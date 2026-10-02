// src/objects/Bouncer.ts

import Phaser from 'phaser';
import { soundManager } from '../utils/audio';
import { Player } from './Player';

export class Bouncer extends Phaser.Physics.Arcade.Sprite {
  public powerMultiplier: number;

  constructor(scene: Phaser.Scene, x: number, y: number, powerMultiplier: number = 2.5) {
    super(scene, x, y, 'bouncer');

    this.powerMultiplier = powerMultiplier;

    scene.add.existing(this);
    scene.physics.add.existing(this);

    const body = this.body as Phaser.Physics.Arcade.Body;
    if (body) {
      body.setAllowGravity(false);
      body.setImmovable(true);
      body.setSize(38, 18);
      body.setOffset(1, 6);
    }
  }

  /**
   * Triggers super trampoline launch on player.
   */
  public triggerBounce(player: Player): void {
    const body = player.body as Phaser.Physics.Arcade.Body;
    if (!body) return;

    soundManager.playSuperBounce();

    // Pad squash & spring recoil tween
    this.scene.tweens.add({
      targets: this,
      scaleY: 0.35,
      duration: 60,
      yoyo: true,
      ease: 'Quad.easeOut',
    });

    // 2.5x normal jump power (~ -1225 force)
    const superJumpForce = Math.round(player.JUMP_FORCE * this.powerMultiplier);

    // Launch player safely
    player.launchFromSpring(this.y, superJumpForce);

    // Green energetic sparkle particles
    if (this.scene.textures.exists('sparkle')) {
      const emitter = this.scene.add.particles(this.x, this.y - 10, 'sparkle', {
        speed: { min: 60, max: 180 },
        angle: { min: 240, max: 300 },
        scale: { start: 1, end: 0 },
        tint: [0x22c55e, 0x4ade80, 0x86efac],
        lifespan: 500,
        emitting: false,
      });
      emitter.explode(12);
      this.scene.time.delayedCall(550, () => emitter.destroy());
    }
  }
}
