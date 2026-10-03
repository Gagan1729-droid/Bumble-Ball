// src/data/levels/level7.ts
import { ILevelConfig } from './types';

/**
 * Level 7: The Submerged Ruins
 *
 * Overhauled with structural sunken pools:
 * - A massive deep underground lake (700px wide, 800px deep) enclosed by "U"-shaped solid stone terrain.
 * - Flush surface level (Y = 400) aligned with temple sanctuary ground.
 * - Pressure switch at the bottom of the abyssal lake (Y = 1170) required to unlock the sanctuary gate!
 * - Semi-transparent water reveals submerged ancient archways, stone pillars, and hidden deep-dive coin caches.
 */
export const level7: ILevelConfig = {
  levelNumber: 7,
  title: 'The Submerged Ruins',
  subtitle: 'The Deep Sunken Lake & Ancient Switch',
  worldWidth: 3600,
  worldHeight: 1400,
  spawnPoint: { x: 140, y: 350 },
  portal: { x: 3400, y: 340 },
  checkpoints: [
    { triggerX: 1450, spawn: { x: 1520, y: 350 } }, // Midpoint sanctuary after diving the deep lake
    { triggerX: 2650, spawn: { x: 2700, y: 350 } }, // Exit sanctuary
  ],
  backgroundTheme: { skyTint: 0x0284c7, mountainTint: 0x0369a1, treesTint: 0x075985 },

  // Ground Spans: Solid surface ground stopping at pool edges and resuming on the other side
  groundSpans: [
    // Entrance temple approach leading to the rim of the deep lake
    { startX: 0, endX: 700, surfaceY: 400 },

    // Mid-temple sanctuary between the deep lake and the sunken garden
    { startX: 1400, endX: 2000, surfaceY: 400 },

    // Exit temple sanctuary leading to the goal portal
    { startX: 2600, endX: 3600, surfaceY: 400 },
  ],

  // Sunken Pools: Completely enclosed "U"-shaped water basins
  pools: [
    // 1. The Abyssal Lake: 700px wide, 800px deep underground basin!
    // Surface flush at Y = 400, floor at Y = 1200.
    {
      x: 700,
      y: 400,
      width: 700,
      depth: 800,
      title: 'The Abyssal Lake',
    },

    // 2. The Sunken Garden: 600px wide, 550px deep basin!
    // Surface flush at Y = 400, floor at Y = 950.
    {
      x: 2000,
      y: 400,
      width: 600,
      depth: 550,
      title: 'The Sunken Garden',
    },
  ],

  // Gate on the mid-temple sanctuary: Blocks forward progress until the deep lake switch is activated!
  gates: [
    { x: 1750, y: 350, id: 'abyss-gate', height: 96 },
  ],

  // Switch at the bottom of the 800px deep lake!
  // Player must dive down through the water, navigate submerged ruins, and press the plate at Y = 1170.
  switches: [
    { x: 1050, y: 1170, id: 'abyss-gate' },
  ],

  // Submerged ruins, stepping platforms, and underwater stone shelves
  platforms: [
    // Inside Abyssal Lake:
    { x: 880, y: 650, widthTiles: 2 },  // Submerged archway shelf 1
    { x: 1200, y: 850, widthTiles: 2 }, // Submerged archway shelf 2
    { x: 930, y: 1050, widthTiles: 2 }, // Deep shelf guarding the switch

    // Inside Sunken Garden:
    { x: 2200, y: 620, widthTiles: 3 }, // Submerged reef pillar
    { x: 2450, y: 780, widthTiles: 2 }, // Low sunken step
  ],

  // Precision swimming hazards on submerged ruins
  spikes: [
    { x: 890, y: 638, count: 2 },
    { x: 1210, y: 838, count: 2 },
    { x: 2210, y: 608, count: 2 },
  ],

  // Collectible coins rewarding exploration, surface swimming, and deep dives
  coins: [
    { x: 250, y: 350 },
    { x: 500, y: 350 },
    { x: 750, y: 440 },  // Lake entry splash
    { x: 880, y: 570 },
    { x: 1050, y: 720 },
    { x: 1200, y: 920 },
    { x: 990, y: 1160 }, // Deep dive reward near switch!
    { x: 1110, y: 1160 }, // Deep dive reward near switch!
    { x: 1450, y: 350 },
    { x: 1600, y: 350 },
    { x: 1900, y: 350 },
    { x: 2050, y: 450 }, // Garden entry splash
    { x: 2200, y: 550 },
    { x: 2350, y: 700 },
    { x: 2450, y: 860 }, // Deep garden reward
    { x: 2750, y: 350 },
    { x: 3050, y: 350 },
    { x: 3350, y: 300 },
  ],
};
