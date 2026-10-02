// src/objects/MovingPlatform.ts

import Phaser from 'phaser';

export class MovingPlatform extends Phaser.Physics.Arcade.Sprite {
  public startX: number;
  public startY: number;
  public targetX: number;
  public targetY: number;
  public minX: number;
  public maxX: number;
  public minY: number;
  public maxY: number;
  public speedX: number = 0;
  public speedY: number = 0;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    widthTiles: number = 2,
    distanceX: number = 0,
    distanceY: number = 0,
    duration: number = 2500
  ) {
    const textureKey = scene.textures.exists(`moving-platform-${widthTiles}`)
      ? `moving-platform-${widthTiles}`
      : 'moving-platform';
    super(scene, x, y, textureKey);

    this.startX = x;
    this.startY = y;
    this.targetX = x + distanceX;
    this.targetY = y + distanceY;
    this.minX = Math.min(this.startX, this.targetX);
    this.maxX = Math.max(this.startX, this.targetX);
    this.minY = Math.min(this.startY, this.targetY);
    this.maxY = Math.max(this.startY, this.targetY);

    scene.add.existing(this);
    scene.physics.add.existing(this);

    const body = this.body as Phaser.Physics.Arcade.Body;
    if (body) {
      body.setAllowGravity(false);
      body.setImmovable(true);
      body.moves = true;
      body.setFriction(1, 0);

      // FULL SOLID 4-SIDED COLLISION: Cannot be crossed from bottom, sides, or top
      body.checkCollision.none = false;
      body.checkCollision.up = true;
      body.checkCollision.down = true;
      body.checkCollision.left = true;
      body.checkCollision.right = true;
    }

    const durSec = Math.max(duration / 1000, 0.5);
    if (distanceX !== 0) {
      this.speedX = Math.abs(distanceX) / durSec;
      const dirX = distanceX > 0 ? 1 : -1;
      body?.setVelocityX(this.speedX * dirX);
    }

    if (distanceY !== 0) {
      this.speedY = Math.abs(distanceY) / durSec;
      const dirY = distanceY > 0 ? 1 : -1;
      body?.setVelocityY(this.speedY * dirY);
    }
  }

  /**
   * Resets the moving platform back to its initial start position when the player retries from a prick.
   */
  public resetPosition(): void {
    const body = this.body as Phaser.Physics.Arcade.Body;
    this.x = this.startX;
    this.y = this.startY;
    if (body) {
      body.reset(this.startX, this.startY);
      if (this.speedX !== 0) {
        const dirX = this.targetX >= this.startX ? 1 : -1;
        body.setVelocityX(this.speedX * dirX);
      }
      if (this.speedY !== 0) {
        const dirY = this.targetY >= this.startY ? 1 : -1;
        body.setVelocityY(this.speedY * dirY);
      }
    }
  }

  /**
   * Ping-pongs smoothly between start and target positions.
   */
  public update(): void {
    const body = this.body as Phaser.Physics.Arcade.Body;
    if (!body) return;

    if (this.speedX > 0) {
      if (this.x >= this.maxX && body.velocity.x > 0) {
        this.x = this.maxX;
        body.setVelocityX(-this.speedX);
      } else if (this.x <= this.minX && body.velocity.x < 0) {
        this.x = this.minX;
        body.setVelocityX(this.speedX);
      }
    }

    if (this.speedY > 0) {
      if (this.y >= this.maxY && body.velocity.y > 0) {
        this.y = this.maxY;
        body.setVelocityY(-this.speedY);
      } else if (this.y <= this.minY && body.velocity.y < 0) {
        this.y = this.minY;
        body.setVelocityY(this.speedY);
      }
    }
  }
}
