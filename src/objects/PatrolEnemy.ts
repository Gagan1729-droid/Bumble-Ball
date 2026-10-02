// src/objects/PatrolEnemy.ts

import Phaser from 'phaser';

export class PatrolEnemy extends Phaser.Physics.Arcade.Sprite {
  public startX: number;
  public patrolDistance: number;
  public patrolSpeed: number;
  private movingRight: boolean = true;

  constructor(scene: Phaser.Scene, x: number, y: number, patrolDistance: number = 200, speed: number = 90) {
    super(scene, x, y, 'patrol-enemy');

    this.startX = x;
    this.patrolDistance = patrolDistance;
    this.patrolSpeed = speed;

    scene.add.existing(this);
    scene.physics.add.existing(this);

    const body = this.body as Phaser.Physics.Arcade.Body;
    if (body) {
      body.setCircle(14, 2, 2);
      body.setAllowGravity(false);
      body.setImmovable(true);
      body.setVelocityX(this.patrolSpeed);
    }
  }

  public update(): void {
    const body = this.body as Phaser.Physics.Arcade.Body;
    if (!body) return;

    // Spin rolling animation
    this.angle += (body.velocity.x > 0 ? 1 : -1) * 3;

    // Check bounds
    if (this.movingRight && this.x >= this.startX + this.patrolDistance) {
      this.movingRight = false;
      body.setVelocityX(-this.patrolSpeed);
    } else if (!this.movingRight && this.x <= this.startX) {
      this.movingRight = true;
      body.setVelocityX(this.patrolSpeed);
    }
  }
}
