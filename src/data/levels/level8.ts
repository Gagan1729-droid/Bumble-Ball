// src/data/levels/level8.ts
import { ILevelConfig } from './types';

export const level8: ILevelConfig = {
  levelNumber: 8,
  title: 'The Crushers',
  subtitle: 'Rhythm of the Iron Pistons',
  worldWidth: 3800,
  worldHeight: 600,
  spawnPoint: { x: 120, y: 480 },
  portal: { x: 3650, y: 420 },
  checkpoints: [{ triggerX: 1800, spawn: { x: 1850, y: 460 } }],
  backgroundTheme: { skyTint: 0xfef2f2, mountainTint: 0xef4444, treesTint: 0x991b1b },
  groundSpans: [
    { startX: 0, endX: 700, surfaceY: 528 },
    { startX: 700, endX: 1800, surfaceY: 528 }, // Crusher Corridor 1
    { startX: 1800, endX: 2400, surfaceY: 528 }, // Midpoint sanctuary
    { startX: 2400, endX: 3800, surfaceY: 528 }, // Crusher Corridor 2
  ],
  crushers: [
    // Corridor 1: Sequential staggered crushers
    { x: 850, y: 260, dropDistance: 220, upWait: 1800, dropDuration: 200, downWait: 900, riseDuration: 1200 },
    { x: 1100, y: 260, dropDistance: 220, upWait: 2200, dropDuration: 200, downWait: 900, riseDuration: 1200 },
    { x: 1350, y: 260, dropDistance: 220, upWait: 1600, dropDuration: 200, downWait: 900, riseDuration: 1200 },
    { x: 1600, y: 260, dropDistance: 220, upWait: 2400, dropDuration: 200, downWait: 900, riseDuration: 1200 },
    // Corridor 2: Tighter high-speed pistons
    { x: 2550, y: 260, dropDistance: 220, upWait: 1500, dropDuration: 180, downWait: 800, riseDuration: 1000 },
    { x: 2800, y: 260, dropDistance: 220, upWait: 2000, dropDuration: 180, downWait: 800, riseDuration: 1000 },
    { x: 3050, y: 260, dropDistance: 220, upWait: 1700, dropDuration: 180, downWait: 800, riseDuration: 1000 },
    { x: 3300, y: 260, dropDistance: 220, upWait: 2200, dropDuration: 180, downWait: 800, riseDuration: 1000 },
  ],
  platforms: [
    { x: 975, y: 410, widthTiles: 1 },
    { x: 1225, y: 410, widthTiles: 1 },
    { x: 1475, y: 410, widthTiles: 1 },
    { x: 2675, y: 410, widthTiles: 1 },
    { x: 2925, y: 410, widthTiles: 1 },
    { x: 3175, y: 410, widthTiles: 1 },
  ],
  coins: [
    { x: 350, y: 480 },
    { x: 850, y: 480 },
    { x: 975, y: 360 },
    { x: 1100, y: 480 },
    { x: 1225, y: 360 },
    { x: 1350, y: 480 },
    { x: 1950, y: 480 },
    { x: 2550, y: 480 },
    { x: 2675, y: 360 },
    { x: 2800, y: 480 },
    { x: 3050, y: 480 },
    { x: 3480, y: 480 },
  ],
};
