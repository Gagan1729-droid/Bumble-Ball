// src/data/levels/level10.ts
import { ILevelConfig } from './types';

export const level10: ILevelConfig = {
  levelNumber: 10,
  title: 'Rhythm of the Crushers',
  subtitle: 'Wavy Slopes & Piston Traps',
  worldWidth: 3800,
  worldHeight: 650,
  spawnPoint: { x: 140, y: 460 },
  portal: { x: 3620, y: 440 },
  checkpoints: [
    { triggerX: 1850, spawn: { x: 1900, y: 440 } },
  ],
  backgroundTheme: { skyTint: 0x450a0a, mountainTint: 0xef4444, treesTint: 0x991b1b },
  groundSpans: [
    // Flat start launch bay
    { startX: 0, endX: 380, surfaceY: 520 },
    // Midpoint rest bunker
    { startX: 1800, endX: 2050, surfaceY: 520 },
    // Destination bunker
    { startX: 3500, endX: 3800, surfaceY: 500 },
  ],
  // Wavy, undulating terrain beneath the ceiling crushers!
  curvedTerrains: [
    // Gauntlet 1 Wavy Floor
    {
      startX: 360,
      startY: 500,
      length: 1460,
      amplitude: 50,
      frequency: 0.014,
      theme: { grassColor: 0xb91c1c, dirtColor: 0x450a0a, innerDirtColor: 0x180507 },
    },
    // Gauntlet 2 Wavy Floor
    {
      startX: 2020,
      startY: 500,
      length: 1500,
      amplitude: 55,
      frequency: 0.014,
      theme: { grassColor: 0xb91c1c, dirtColor: 0x450a0a, innerDirtColor: 0x180507 },
    },
  ],
  // Industrial Crusher pistons dropping onto the rolling slopes
  crushers: [
    // Gauntlet 1: Staggered rhythm pistons
    { x: 620, y: 220, dropDistance: 230, upWait: 1800, dropDuration: 190, downWait: 800, riseDuration: 1100 },
    { x: 920, y: 220, dropDistance: 260, upWait: 2100, dropDuration: 190, downWait: 800, riseDuration: 1100 },
    { x: 1220, y: 220, dropDistance: 230, upWait: 1700, dropDuration: 190, downWait: 800, riseDuration: 1100 },
    { x: 1520, y: 220, dropDistance: 270, upWait: 2200, dropDuration: 190, downWait: 800, riseDuration: 1100 },

    // Gauntlet 2: Tighter high-speed timing pistons
    { x: 2300, y: 220, dropDistance: 230, upWait: 1600, dropDuration: 180, downWait: 750, riseDuration: 1000 },
    { x: 2600, y: 220, dropDistance: 270, upWait: 1900, dropDuration: 180, downWait: 750, riseDuration: 1000 },
    { x: 2900, y: 220, dropDistance: 240, upWait: 1500, dropDuration: 180, downWait: 750, riseDuration: 1000 },
    { x: 3200, y: 220, dropDistance: 270, upWait: 2000, dropDuration: 180, downWait: 750, riseDuration: 1000 },
  ],
  // Ceilings and upper structures
  platforms: [
    { x: 620, y: 180, widthTiles: 2 },
    { x: 920, y: 180, widthTiles: 2 },
    { x: 1220, y: 180, widthTiles: 2 },
    { x: 1520, y: 180, widthTiles: 2 },
    { x: 2300, y: 180, widthTiles: 2 },
    { x: 2600, y: 180, widthTiles: 2 },
    { x: 2900, y: 180, widthTiles: 2 },
    { x: 3200, y: 180, widthTiles: 2 },
  ],
  spikes: [
    // Spikes flanking the crusher impact zones
    { x: 770, y: 520, count: 2 },
    { x: 1070, y: 480, count: 2 },
    { x: 1370, y: 530, count: 2 },
    { x: 2450, y: 530, count: 2 },
    { x: 2750, y: 480, count: 2 },
    { x: 3050, y: 530, count: 2 },
  ],
  coins: [
    { x: 260, y: 480 },
    { x: 620, y: 410 }, // Below crusher 1
    { x: 770, y: 440 },
    { x: 920, y: 420 }, // Below crusher 2
    { x: 1070, y: 400 },
    { x: 1220, y: 410 }, // Below crusher 3
    { x: 1370, y: 450 },
    { x: 1520, y: 420 }, // Below crusher 4
    { x: 1920, y: 470 },
    { x: 2300, y: 410 },
    { x: 2450, y: 450 },
    { x: 2600, y: 420 },
    { x: 2750, y: 400 },
    { x: 2900, y: 410 },
    { x: 3050, y: 450 },
    { x: 3200, y: 420 },
    { x: 3620, y: 430 },
  ],
};
