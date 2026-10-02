// src/objects/BreakableBlock.ts

import Phaser from 'phaser';
import { soundManager } from '../utils/audio';

export class BreakableBlock extends Phaser.Physics.Arcade.Sprite {
  public startX: number;
  public startY: number;
  public isTriggered: boolean = false;
  public isBroken: boolean = false;

  constructor(scene: Phaser.Scene, x: number, y: number, widthTiles: number = 1) {
    const textureKey = scene.textures.exists(`breakable-block-${widthTiles}`)
      ? `breakable-block-${widthTiles}`
      : 'breakable-block';
    super(scene, x, y, textureKey);

    this.startX = x;
    this.startY = y;

    scene.add.existing(this);
    scene.physics.add.existing(this);

    const body = this.body as Phaser.Physics.Arcade.Body;
    if (body) {
      body.setAllowGravity(false);
      body.setImmovable(true);
      // FULL SOLID 4-SIDED COLLISION: Solid stone block, player cannot pass through from bottom or sides
      body.checkCollision.none = false;
      body.checkCollision.up = true;
      body.checkCollision.down = true;
      body.checkCollision.left = true;
      body.checkCollision.right = true;
    }
  }

  /**
   * Triggers the 500ms crumbling countdown upon player contact.
   */
  public triggerBreak(): void {
    if (this.isTriggered || this.isBroken) return;
    this.isTriggered = true;

    // Shaking tween with progressive amber/red danger tint
    this.scene.tweens.add({
      targets: this,
      x: { from: this.startX - 3, to: this.startX + 3 },
      duration: 40,
      yoyo: true,
      repeat: 6,
      onUpdate: () => {
        this.setTint(0xf59e0b);
      },
      onComplete: () => {
        if (!this.active || this.isBroken) return;
        this.collapse();
      },
    });
  }

  /**
   * Disables block visually and physically without destroying it, so it can be restored on retry.
   */
  private collapse(): void {
    this.isBroken = true;
    soundManager.playBreak();

    // Spawn crumbling stone particles
    if (this.scene.textures.exists('dust')) {
      const emitter = this.scene.add.particles(this.startX, this.startY, 'dust', {
        speed: { min: 30, max: 100 },
        scale: { start: 1, end: 0 },
        tint: [0x78716c, 0xa8a29e, 0x44403c],
        lifespan: 400,
        emitting: false,
      });
      emitter.explode(10);
      this.scene.time.delayedCall(450, () => emitter.destroy());
    }

    this.setVisible(false);
    const body = this.body as Phaser.Physics.Arcade.Body;
    if (body) {
      body.enable = false;
    }
  }

  /**
   * Restores block to pristine state when player retries from a prick/respawn.
   */
  public resetBlock(): void {
    this.scene.tweens.killTweensOf(this);
    this.isTriggered = false;
    this.isBroken = false;
    this.x = this.startX;
    this.y = this.startY;
    this.setVisible(true);
    this.setAlpha(1);
    this.clearTint();

    const body = this.body as Phaser.Physics.Arcade.Body;
    if (body) {
      body.enable = true;
      body.reset(this.startX, this.startY);
    }
  }
}
