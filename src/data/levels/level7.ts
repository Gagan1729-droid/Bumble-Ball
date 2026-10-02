// src/data/levels/level7.ts
import { ILevelConfig } from './types';

export const level7: ILevelConfig = {
  levelNumber: 7,
  title: 'The Patrol',
  subtitle: 'Mechanical Rolling Sentinels',
  worldWidth: 3800,
  worldHeight: 600,
  spawnPoint: { x: 120, y: 480 },
  portal: { x: 3650, y: 420 },
  checkpoints: [{ triggerX: 1800, spawn: { x: 1850, y: 440 } }],
  backgroundTheme: { skyTint: 0xf1f5f9, mountainTint: 0x64748b, treesTint: 0x334155 },
  groundSpans: [
    { startX: 0, endX: 600, surfaceY: 528 },
    { startX: 600, endX: 1200, surfaceY: 480 }, // Patrol grounds 1
    { startX: 1200, endX: 1800, surfaceY: 440 }, // Patrol grounds 2
    { startX: 1800, endX: 2500, surfaceY: 528 }, // Midpoint sanctuary
    { startX: 2500, endX: 3100, surfaceY: 460 }, // High-speed sentry runway
    { startX: 3100, endX: 3800, surfaceY: 480 }, // Final gauntlet
  ],
  platforms: [
    { x: 800, y: 360, widthTiles: 3 },
    { x: 1400, y: 320, widthTiles: 3 },
    { x: 2200, y: 410, widthTiles: 2 },
    { x: 2750, y: 340, widthTiles: 3 },
    { x: 3350, y: 360, widthTiles: 2 },
  ],
  patrolEnemies: [
    { x: 650, y: 456, patrolDistance: 450, speed: 100 },
    { x: 820, y: 336, patrolDistance: 110, speed: 80 },
    { x: 1250, y: 416, patrolDistance: 450, speed: 110 },
    { x: 1420, y: 296, patrolDistance: 110, speed: 90 },
    { x: 2550, y: 436, patrolDistance: 480, speed: 130 },
    { x: 3150, y: 456, patrolDistance: 400, speed: 120 },
  ],
  spikes: [
    { x: 2000, y: 528, count: 4 },
    { x: 3000, y: 460, count: 3 },
  ],
  coins: [
    { x: 350, y: 480 },
    { x: 850, y: 300 },
    { x: 1450, y: 260 },
    { x: 1650, y: 380 },
    { x: 2100, y: 470 },
    { x: 2750, y: 280 },
    { x: 3350, y: 300 },
    { x: 3550, y: 430 },
  ],
};
