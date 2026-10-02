// src/data/levels/level9.ts
import { ILevelConfig } from './types';

export const level9: ILevelConfig = {
  levelNumber: 9,
  title: 'Updraft',
  subtitle: 'Sailing the Gusts',
  worldWidth: 3800,
  worldHeight: 700,
  spawnPoint: { x: 120, y: 560 },
  portal: { x: 3650, y: 280 },
  checkpoints: [{ triggerX: 1800, spawn: { x: 1850, y: 520 } }],
  backgroundTheme: { skyTint: 0xf0fdfa, mountainTint: 0x5eead4, treesTint: 0x0f766e },
  groundSpans: [
    { startX: 0, endX: 500, surfaceY: 600 },
    { startX: 500, endX: 1800, surfaceY: 680 }, // Endless abyss
    { startX: 1800, endX: 2200, surfaceY: 560 }, // Cloud island midpoint
    { startX: 2200, endX: 3400, surfaceY: 680 }, // Second chasm
    { startX: 3400, endX: 3800, surfaceY: 360 }, // Summit landing
  ],
  windZones: [
    // Updraft tunnels allowing the ball to glide across bottomless chasms
    { x: 750, y: 420, width: 220, height: 360, forceY: -1350 },
    { x: 1150, y: 380, width: 200, height: 400, forceY: -1400 },
    { x: 1550, y: 350, width: 200, height: 420, forceY: -1450 },
    { x: 2500, y: 400, width: 220, height: 380, forceY: -1350 },
    { x: 2900, y: 360, width: 220, height: 420, forceY: -1450 },
    { x: 3250, y: 320, width: 180, height: 450, forceY: -1500 },
  ],
  platforms: [
    { x: 950, y: 420, widthTiles: 2 },
    { x: 1350, y: 360, widthTiles: 2 },
    { x: 1720, y: 600, widthTiles: 2 }, // Stepping platform to midpoint cloud island
    { x: 2700, y: 390, widthTiles: 2 },
    { x: 3100, y: 310, widthTiles: 2 },
    { x: 3350, y: 420, widthTiles: 2 }, // Stepping platform to summit landing
  ],
  spikes: [
    // Floating spike mines in mid-air inside and around wind tunnels
    { x: 750, y: 260, count: 2 },
    { x: 1150, y: 210, count: 2 },
    { x: 1550, y: 190, count: 2 },
    { x: 2500, y: 240, count: 2 },
    { x: 2900, y: 200, count: 2 },
  ],
  coins: [
    { x: 300, y: 540 },
    { x: 750, y: 380 },
    { x: 750, y: 310 },
    { x: 950, y: 370 },
    { x: 1150, y: 330 },
    { x: 1350, y: 310 },
    { x: 1550, y: 280 },
    { x: 1950, y: 500 },
    { x: 2500, y: 340 },
    { x: 2700, y: 330 },
    { x: 2900, y: 290 },
    { x: 3100, y: 250 },
    { x: 3550, y: 300 },
  ],
};
