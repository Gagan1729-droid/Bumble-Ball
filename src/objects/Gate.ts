// src/objects/Gate.ts

import Phaser from 'phaser';

export class Gate extends Phaser.Physics.Arcade.Sprite {
  public startX: number;
  public startY: number;
  public gateId: string;
  public isOpen: boolean = false;

  constructor(scene: Phaser.Scene, x: number, y: number, gateId: string, height: number = 96) {
    super(scene, x, y, 'gate');

    this.startX = x;
    this.startY = y;
    this.gateId = gateId;

    scene.add.existing(this);
    scene.physics.add.existing(this);

    const body = this.body as Phaser.Physics.Arcade.Body;
    if (body) {
      body.setAllowGravity(false);
      body.setImmovable(true);
      this.setDisplaySize(32, height);
      body.setSize(32, height);
    }
  }

  /**
   * Tweens gate upwards into ceiling and disables its collider.
   */
  public open(): void {
    if (this.isOpen) return;
    this.isOpen = true;

    const body = this.body as Phaser.Physics.Arcade.Body;
    if (body) {
      body.enable = false;
    }

    this.scene.tweens.add({
      targets: this,
      y: this.startY - this.displayHeight - 10,
      alpha: 0.1,
      duration: 750,
      ease: 'Back.easeIn',
      onComplete: () => {
        this.setVisible(false);
      },
    });
  }

  /**
   * Restores gate to initial closed position upon level retry.
   */
  public resetGate(): void {
    this.scene.tweens.killTweensOf(this);
    this.isOpen = false;
    this.x = this.startX;
    this.y = this.startY;
    this.setVisible(true);
    this.setAlpha(1);

    const body = this.body as Phaser.Physics.Arcade.Body;
    if (body) {
      body.enable = true;
      body.reset(this.startX, this.startY);
    }
  }
}
