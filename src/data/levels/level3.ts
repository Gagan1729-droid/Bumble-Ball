// src/data/levels/level3.ts
import { ILevelConfig } from './types';

export const level3: ILevelConfig = {
  levelNumber: 3,
  title: 'Brittle Ground',
  subtitle: 'Keep Moving or Fall!',
  worldWidth: 3600,
  worldHeight: 600,
  spawnPoint: { x: 120, y: 480 },
  portal: { x: 3450, y: 380 },
  checkpoints: [{ triggerX: 1650, spawn: { x: 1700, y: 440 } }],
  backgroundTheme: { skyTint: 0xfef08a, mountainTint: 0xd97706, treesTint: 0x92400e },
  groundSpans: [
    { startX: 0, endX: 550, surfaceY: 528 },
    { startX: 550, endX: 1650, surfaceY: 560 }, // Massive spike chasm
    { startX: 1650, endX: 2050, surfaceY: 480 }, // Midpoint sanctuary
    { startX: 2050, endX: 3150, surfaceY: 560 }, // Second chasm with tiered breakable steps
    { startX: 3150, endX: 3600, surfaceY: 480 }, // Final stretch
  ],
  breakableBlocks: [
    // The Grand Crumbly Bridge (Section 1)
    { x: 620, y: 450 },
    { x: 720, y: 430 },
    { x: 820, y: 410 },
    { x: 920, y: 390 },
    { x: 1020, y: 390 },
    { x: 1120, y: 410 },
    { x: 1220, y: 430 },
    { x: 1340, y: 430 },
    { x: 1460, y: 450 },
    { x: 1560, y: 460 },
    // Tiered Ascending Breakable Stepping Stones (Section 2)
    { x: 2160, y: 440 },
    { x: 2280, y: 400 },
    { x: 2400, y: 360 },
    { x: 2520, y: 320 },
    { x: 2660, y: 300 },
    { x: 2780, y: 340 },
    { x: 2900, y: 390 },
    { x: 3020, y: 440 },
  ],
  spikes: [
    { x: 570, y: 560, count: 30 },
    { x: 2070, y: 560, count: 30 },
  ],
  coins: [
    { x: 280, y: 480 },
    { x: 400, y: 480 },
    { x: 620, y: 390 },
    { x: 820, y: 350 },
    { x: 1020, y: 330 },
    { x: 1220, y: 370 },
    { x: 1460, y: 390 },
    { x: 1800, y: 420 },
    { x: 1920, y: 420 },
    { x: 2280, y: 340 },
    { x: 2520, y: 260 },
    { x: 2660, y: 240 },
    { x: 2900, y: 330 },
    { x: 3260, y: 420 },
    { x: 3360, y: 420 },
  ],
};
