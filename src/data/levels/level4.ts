// src/data/levels/level4.ts
import { ILevelConfig } from './types';

export const level4: ILevelConfig = {
  levelNumber: 4,
  title: 'Sky High',
  subtitle: 'Tower of Super Trampolines',
  worldWidth: 3200,
  worldHeight: 900,
  spawnPoint: { x: 120, y: 780 },
  portal: { x: 3000, y: 160 },
  checkpoints: [{ triggerX: 1500, spawn: { x: 1540, y: 560 } }],
  backgroundTheme: { skyTint: 0xe0e7ff, mountainTint: 0x818cf8, treesTint: 0x3730a3 },
  groundSpans: [
    { startX: 0, endX: 600, surfaceY: 828 },
    { startX: 600, endX: 1450, surfaceY: 860 }, // Abyss with bottom spikes
    { startX: 1450, endX: 1850, surfaceY: 620 }, // High cloud plateau checkpoint
    { startX: 1850, endX: 2750, surfaceY: 860 },
    { startX: 2750, endX: 3200, surfaceY: 260 }, // Stratosphere summit
  ],
  platforms: [
    { x: 750, y: 520, widthTiles: 2 },
    { x: 1100, y: 360, widthTiles: 2 },
    { x: 2000, y: 460, widthTiles: 2 },
    { x: 2350, y: 300, widthTiles: 2 },
    { x: 2650, y: 340, widthTiles: 2 }, // Stepping platform to stratosphere summit
  ],
  bouncers: [
    // 2.5x super trampoline power launches ball upwards through sky!
    { x: 450, y: 816, powerMultiplier: 2.5 },
    { x: 800, y: 508, powerMultiplier: 2.5 },
    { x: 1250, y: 740, powerMultiplier: 2.6 },
    { x: 1750, y: 608, powerMultiplier: 2.5 },
    { x: 2150, y: 720, powerMultiplier: 2.6 },
    { x: 2500, y: 460, powerMultiplier: 2.5 },
  ],
  spikes: [
    { x: 620, y: 860, count: 23 },
    { x: 1870, y: 860, count: 24 },
    // Wall hazard spikes
    { x: 1000, y: 420, count: 2 },
    { x: 2250, y: 360, count: 2 },
  ],
  coins: [
    { x: 250, y: 780 },
    { x: 450, y: 620 },
    { x: 450, y: 480 },
    { x: 800, y: 320 },
    { x: 1100, y: 220 },
    { x: 1250, y: 400 },
    { x: 1600, y: 560 },
    { x: 1750, y: 400 },
    { x: 2000, y: 320 },
    { x: 2150, y: 420 },
    { x: 2350, y: 180 },
    { x: 2500, y: 200 },
    { x: 2850, y: 200 },
  ],
};
