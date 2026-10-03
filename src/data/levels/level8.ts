// src/data/levels/level8.ts
import { ILevelConfig } from './types';

export const level8: ILevelConfig = {
  levelNumber: 8,
  title: 'Deep Water Precision',
  subtitle: 'Abyssal Mazes & Spike Corridors',
  worldWidth: 3600,
  worldHeight: 750,
  spawnPoint: { x: 140, y: 380 },
  portal: { x: 3450, y: 380 },
  checkpoints: [
    { triggerX: 1800, spawn: { x: 1850, y: 380 } },
  ],
  backgroundTheme: { skyTint: 0x082f49, mountainTint: 0x075985, treesTint: 0x0c4a6e },
  groundSpans: [
    // Launch platform
    { startX: 0, endX: 350, surfaceY: 460 },
    // Deep underwater seabed floor
    { startX: 350, endX: 3250, surfaceY: 720 },
    // Destination temple
    { startX: 3250, endX: 3600, surfaceY: 460 },
  ],
  // Abyssal deep water zone filling the labyrinth
  waterZones: [
    {
      x: 1800,
      y: 450,
      width: 2900,
      height: 580,
      title: 'Abyssal Trench',
    },
  ],
  // Tight underwater maze walls forcing 90-degree S-turn navigation
  platforms: [
    // Trench Barrier 1 (Upper hanging stalactite)
    { x: 650, y: 320, widthTiles: 2 },
    { x: 650, y: 220, widthTiles: 2 },
    // Trench Barrier 1 (Lower rising stalagmite)
    { x: 950, y: 580, widthTiles: 2 },
    { x: 950, y: 480, widthTiles: 2 },

    // Trench Barrier 2 (Tight zigzag channel)
    { x: 1300, y: 300, widthTiles: 2 },
    { x: 1550, y: 560, widthTiles: 2 },
    // Midpoint rest shelf
    { x: 1850, y: 440, widthTiles: 2 },

    // Trench Barrier 3 (Choke point gauntlet)
    { x: 2150, y: 280, widthTiles: 2 },
    { x: 2450, y: 600, widthTiles: 2 },
    { x: 2750, y: 320, widthTiles: 2 },
    { x: 3000, y: 580, widthTiles: 2 },
    { x: 3200, y: 580, widthTiles: 2 }, // Stepping shelf onto dry destination temple
  ],
  // Dense spike clusters lining the 90-degree corners and channels
  spikes: [
    // Spike clusters around Barrier 1
    { x: 660, y: 350, count: 2 }, // Tip of stalactite
    { x: 960, y: 480, count: 2 }, // Tip of stalagmite
    { x: 800, y: 720, count: 4 }, // Sea floor trap

    // Spike clusters around Barrier 2
    { x: 1310, y: 330, count: 2 },
    { x: 1560, y: 560, count: 2 },
    { x: 1400, y: 720, count: 4 },

    // Needle-thread spike gauntlet (Tier 3)
    { x: 2160, y: 310, count: 2 },
    { x: 2460, y: 600, count: 2 },
    { x: 2760, y: 350, count: 2 },
    { x: 3010, y: 580, count: 2 },
    { x: 2600, y: 720, count: 6 },
  ],
  coins: [
    { x: 220, y: 400 },
    { x: 650, y: 480 }, // Dive route
    { x: 800, y: 420 },
    { x: 950, y: 360 }, // Upward swim route
    { x: 1150, y: 420 },
    { x: 1300, y: 520 },
    { x: 1550, y: 380 },
    { x: 1850, y: 380 },
    { x: 2150, y: 460 },
    { x: 2300, y: 420 },
    { x: 2450, y: 380 },
    { x: 2750, y: 500 },
    { x: 3000, y: 380 },
    { x: 3200, y: 420 },
    { x: 3450, y: 400 },
  ],
};
