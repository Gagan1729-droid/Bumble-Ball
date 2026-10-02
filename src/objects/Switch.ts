// src/objects/Switch.ts

import Phaser from 'phaser';
import { soundManager } from '../utils/audio';

export class Switch extends Phaser.Physics.Arcade.Sprite {
  public switchId: string;
  public isPressed: boolean = false;
  private onTriggerCallback?: (switchId: string) => void;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    switchId: string,
    onTrigger?: (switchId: string) => void
  ) {
    super(scene, x, y, 'switch-unpressed');

    this.switchId = switchId;
    this.onTriggerCallback = onTrigger;

    scene.add.existing(this);
    scene.physics.add.existing(this);

    const body = this.body as Phaser.Physics.Arcade.Body;
    if (body) {
      body.setAllowGravity(false);
      body.setImmovable(true);
      body.setSize(30, 14);
      body.setOffset(1, 2);
    }
  }

  public press(): void {
    if (this.isPressed) return;
    this.isPressed = true;

    soundManager.playSwitch();
    this.setTexture('switch-pressed');

    // Bounce press feedback
    this.scene.tweens.add({
      targets: this,
      scaleY: 0.7,
      duration: 80,
      yoyo: true,
      ease: 'Quad.easeOut',
    });

    if (this.onTriggerCallback) {
      this.onTriggerCallback(this.switchId);
    }
  }

  /**
   * Restores switch to unpressed state upon level retry.
   */
  public resetSwitch(): void {
    this.isPressed = false;
    this.setTexture('switch-unpressed');
    this.setScale(1, 1);
  }
}
