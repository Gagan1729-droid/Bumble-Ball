// src/objects/Crusher.ts

import Phaser from 'phaser';
import { soundManager } from '../utils/audio';

export class Crusher extends Phaser.Physics.Arcade.Sprite {
  public startY: number;
  public targetY: number;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    dropDistance: number = 180,
    upWait: number = 2000,
    dropDuration: number = 220,
    downWait: number = 1000,
    riseDuration: number = 1200
  ) {
    super(scene, x, y, 'crusher');

    this.startY = y;
    this.targetY = y + dropDistance;

    scene.add.existing(this);
    scene.physics.add.existing(this);

    const body = this.body as Phaser.Physics.Arcade.Body;
    if (body) {
      body.setAllowGravity(false);
      body.setImmovable(true);
      body.moves = false;
      body.setSize(60, 44);
      body.position.set(x - 30, y - 22);
    }

    this.startCycle(upWait, dropDuration, downWait, riseDuration);
  }

  public syncBody(): void {
    const body = this.body as Phaser.Physics.Arcade.Body;
    if (body) {
      body.position.set(this.x - body.width / 2, this.y - body.height / 2);
    }
  }

  public preUpdate(time: number, delta: number): void {
    super.preUpdate(time, delta);
    this.syncBody();
  }

  private startCycle(
    upWait: number,
    dropDuration: number,
    downWait: number,
    riseDuration: number
  ): void {
    const cycle = () => {
      // 1. Wait at top
      this.scene.time.delayedCall(upWait, () => {
        if (!this.active) return;

        // 2. Rapid slam down with synchronized body
        this.scene.tweens.add({
          targets: this,
          y: this.targetY,
          duration: dropDuration,
          ease: 'Quad.easeIn',
          onUpdate: () => {
            this.syncBody();
          },
          onComplete: () => {
            if (!this.active) return;
            soundManager.playCrusherSlam();

            // Dust burst on impact
            if (this.scene.textures.exists('dust')) {
              const emitter = this.scene.add.particles(this.x, this.targetY + 22, 'dust', {
                speedX: { min: -100, max: 100 },
                speedY: { min: -40, max: -10 },
                scale: { start: 1, end: 0 },
                lifespan: 350,
                emitting: false,
              });
              emitter.explode(10);
              this.scene.time.delayedCall(400, () => emitter.destroy());
            }

            // 3. Wait on floor
            this.scene.time.delayedCall(downWait, () => {
              if (!this.active) return;

              // 4. Rise back up with synchronized body
              this.scene.tweens.add({
                targets: this,
                y: this.startY,
                duration: riseDuration,
                ease: 'Sine.easeInOut',
                onUpdate: () => {
                  this.syncBody();
                },
                onComplete: () => {
                  if (this.active) cycle();
                },
              });
            });
          },
        });
      });
    };

    cycle();
  }
}
