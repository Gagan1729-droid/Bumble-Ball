// src/data/levels/level5.ts
import { ILevelConfig } from './types';

export const level5: ILevelConfig = {
  levelNumber: 5,
  title: 'The Swamp',
  subtitle: 'Muddy Waters & Heavy Drag',
  worldWidth: 3600,
  worldHeight: 600,
  spawnPoint: { x: 120, y: 480 },
  portal: { x: 3450, y: 410 },
  checkpoints: [{ triggerX: 1700, spawn: { x: 1750, y: 440 } }],
  backgroundTheme: { skyTint: 0xdcfce7, mountainTint: 0x4ade80, treesTint: 0x166534 },
  groundSpans: [
    { startX: 0, endX: 520, surfaceY: 528 },
    { startX: 520, endX: 980, surfaceY: 550 }, // Mud basin 1 (22px bank)
    { startX: 980, endX: 1280, surfaceY: 528 }, // Dry island 1
    { startX: 1280, endX: 1700, surfaceY: 550 }, // Mud basin 2 (22px bank)
    { startX: 1700, endX: 2020, surfaceY: 480 }, // Midpoint sanctuary
    { startX: 2020, endX: 2060, surfaceY: 526 }, // Mossy stone step down (24px drop to mud)
    { startX: 2060, endX: 2600, surfaceY: 550 }, // Deep mud bog 3
    { startX: 2600, endX: 2950, surfaceY: 528 }, // Dry island 2
    { startX: 2950, endX: 3300, surfaceY: 550 }, // Mud basin 4 (22px bank)
    { startX: 3300, endX: 3600, surfaceY: 480 }, // Goal island
  ],
  mudZones: [
    { x: 750, y: 520, width: 460, height: 60 },
    { x: 1490, y: 520, width: 420, height: 60 },
    { x: 2330, y: 520, width: 540, height: 60 },
    { x: 3125, y: 520, width: 350, height: 60 },
  ],
  platforms: [
    // Section 1: The Classic Precise Leap across Mud Basin 1 (Single challenging suspended bar)
    { x: 700, y: 440, widthTiles: 2 },

    // Section 2: Escalating challenge across Mud Basin 2 (Two-bar rhythm jump)
    { x: 1420, y: 440, widthTiles: 2 },
    { x: 1580, y: 420, widthTiles: 2 },

    // Section 3: Deep Mud Bog 3 (Static perch + Moving ferry + Single-tile precision perch)
    { x: 2180, y: 440, widthTiles: 2 },
    { x: 2510, y: 440, widthTiles: 1 }, // 1-tile precision landing

    // Section 4: Climax Gauntlet across Mud Basin 4 (2-tile bar into 1-tile perch into Goal Island)
    { x: 3080, y: 440, widthTiles: 2 },
    { x: 3220, y: 430, widthTiles: 1 },
  ],
  movingPlatforms: [
    // Section 3: Oscillating ferry over the deep mud bog
    { x: 2320, y: 420, widthTiles: 2, distanceX: 90, distanceY: 0, duration: 2000 },
  ],
  // No artificial springs in the swamp: Falling in mud is a real hazard.
  // The player must trudge back through the thick mud to the natural dry bank and re-attempt the jump!
  springs: [],
  spikes: [
    { x: 1100, y: 528, count: 3 },
    { x: 2750, y: 510, count: 3 },
  ],
  coins: [
    { x: 280, y: 480 },
    { x: 700, y: 380 },
    { x: 980, y: 460 },
    { x: 1130, y: 440 },
    { x: 1420, y: 380 },
    { x: 1580, y: 360 },
    { x: 1850, y: 420 },
    { x: 2180, y: 380 },
    { x: 2360, y: 360 },
    { x: 2510, y: 380 },
    { x: 2700, y: 440 },
    { x: 3080, y: 380 },
    { x: 3220, y: 370 },
    { x: 3450, y: 440 },
  ],
};
