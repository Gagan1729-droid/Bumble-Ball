// src/main.ts

import Phaser from 'phaser';
import { BootScene } from './scenes/BootScene';
import { MenuScene } from './scenes/MenuScene';
import { GameScene } from './scenes/GameScene';
import { UIScene } from './scenes/UIScene';

/**
 * Phaser Game Configuration for Bounce Tales Web.
 * Configured with responsive scaling, WebGL with Canvas fallback,
 * and tuned Arcade Physics with debug set to false.
 */
export const gameConfig: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  parent: 'game-container',
  width: 800,
  height: 600,
  backgroundColor: '#020617',
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.NO_CENTER,
    min: {
      width: 320,
      height: 240,
    },
    max: {
      width: 1600,
      height: 1200,
    },
  },
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { x: 0, y: 950 },
      debug: false, // Arcade Physics debug mode set to false as required
    },
  },
  scene: [BootScene, MenuScene, GameScene, UIScene],
  render: {
    pixelArt: false,
    antialias: true,
  },
};

// Initialize the Phaser Game instance
export const game = new Phaser.Game(gameConfig);
