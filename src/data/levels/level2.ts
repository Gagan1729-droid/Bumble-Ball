// src/data/levels/level2.ts
import { ILevelConfig } from './types';

export const level2: ILevelConfig = {
  levelNumber: 2,
  title: 'The Moving World',
  subtitle: 'Timing & Shifting Grounds',
  worldWidth: 3600,
  worldHeight: 600,
  spawnPoint: { x: 120, y: 480 },
  portal: { x: 3420, y: 200 },
  checkpoints: [{ triggerX: 1600, spawn: { x: 1650, y: 460 } }],
  backgroundTheme: { skyTint: 0xdbeafe, mountainTint: 0x93c5fd, treesTint: 0x1d4ed8 },
  groundSpans: [
    { startX: 0, endX: 650, surfaceY: 528 },
    { startX: 650, endX: 1600, surfaceY: 560 }, // Pit of spikes below moving platforms
    { startX: 1600, endX: 2050, surfaceY: 528 }, // Midpoint island
    { startX: 2050, endX: 2900, surfaceY: 560 }, // Second chasm with vertical elevator
    { startX: 2900, endX: 3600, surfaceY: 528 }, // Goal plateau
    { startX: 3250, endX: 3600, surfaceY: 260 }, // Elevated summit for portal
  ],
  platforms: [
    { x: 500, y: 430, widthTiles: 2 },
    { x: 1520, y: 430, widthTiles: 2 },
    { x: 2850, y: 400, widthTiles: 2 },
    { x: 3100, y: 320, widthTiles: 2 },
  ],
  movingPlatforms: [
    // Section 1: Horizontal ferry across spike pit
    { x: 700, y: 430, widthTiles: 3, distanceX: 380, distanceY: 0, duration: 2600 },
    { x: 1160, y: 380, widthTiles: 2, distanceX: 280, distanceY: 0, duration: 2200 },
    // Section 2: Diagonal and vertical elevators to summit
    { x: 2150, y: 440, widthTiles: 3, distanceX: 300, distanceY: -80, duration: 2400 },
    { x: 2600, y: 480, widthTiles: 2, distanceX: 0, distanceY: -220, duration: 2500 },
  ],
  spikes: [
    { x: 670, y: 560, count: 25 },
    { x: 2070, y: 560, count: 22 },
  ],
  coins: [
    { x: 300, y: 480 },
    { x: 420, y: 450 },
    { x: 740, y: 370 },
    { x: 890, y: 370 },
    { x: 1040, y: 370 },
    { x: 1220, y: 320 },
    { x: 1380, y: 320 },
    { x: 1750, y: 470 },
    { x: 1880, y: 470 },
    { x: 2220, y: 380 },
    { x: 2360, y: 350 },
    { x: 2600, y: 380 },
    { x: 2600, y: 300 },
    { x: 2950, y: 470 },
    { x: 3150, y: 260 },
    { x: 3340, y: 200 },
  ],
};
