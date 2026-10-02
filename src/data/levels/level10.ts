// src/data/levels/level10.ts
import { ILevelConfig } from './types';

export const level10: ILevelConfig = {
  levelNumber: 10,
  title: 'The Gauntlet',
  subtitle: 'The Ultimate Master Trial',
  worldWidth: 4600,
  worldHeight: 700,
  spawnPoint: { x: 120, y: 560 },
  portal: { x: 4420, y: 240 },
  checkpoints: [
    { triggerX: 1500, spawn: { x: 1550, y: 480 } },
    { triggerX: 3000, spawn: { x: 3050, y: 480 } },
  ],
  backgroundTheme: { skyTint: 0x4c0519, mountainTint: 0x9f1239, treesTint: 0x881337 },
  groundSpans: [
    // Stage 1: Crumbling bridge over swamp mud
    { startX: 0, endX: 500, surfaceY: 600 },
    { startX: 500, endX: 1500, surfaceY: 640 }, // Mud basin below breakables
    // Stage 2: Moving platform crossing crusher corridor
    { startX: 1500, endX: 2000, surfaceY: 540 }, // Platform sanctuary
    { startX: 2000, endX: 3000, surfaceY: 640 }, // Spike pit below crushers
    // Stage 3: Wind tunnel climb with airborne switch and security gate
    { startX: 3000, endX: 3450, surfaceY: 540 }, // Pre-flight plateau
    { startX: 3450, endX: 4300, surfaceY: 660 }, // Bottomless abyss
    { startX: 4300, endX: 4600, surfaceY: 320 }, // Grand Victory Citadel
  ],
  // 1. Breakable blocks bridge over viscous mud
  breakableBlocks: [
    { x: 580, y: 540 },
    { x: 700, y: 520 },
    { x: 820, y: 500 },
    { x: 940, y: 480 },
    { x: 1060, y: 500 },
    { x: 1180, y: 520 },
    { x: 1300, y: 540 },
    { x: 1420, y: 530 },
  ],
  mudZones: [
    { x: 1000, y: 620, width: 1000, height: 80 },
  ],
  springs: [
    // Rescue spring in mud basin if player falls from breakable blocks
    { x: 1000, y: 626 },
  ],
  // 2. Moving platforms through heavy crusher corridor
  movingPlatforms: [
    { x: 2050, y: 520, widthTiles: 3, distanceX: 400, distanceY: 0, duration: 3200 },
    { x: 2550, y: 500, widthTiles: 3, distanceX: 380, distanceY: 0, duration: 3000 },
  ],
  crushers: [
    { x: 2250, y: 260, dropDistance: 240, upWait: 1800, dropDuration: 190, downWait: 800, riseDuration: 1100 },
    { x: 2750, y: 260, dropDistance: 240, upWait: 1900, dropDuration: 190, downWait: 800, riseDuration: 1100 },
  ],
  // 3. Wind updrafts + Trampoline bouncers + Mid-air switch opening gate to portal
  windZones: [
    { x: 3600, y: 420, width: 220, height: 420, forceY: -1450 },
    { x: 4050, y: 360, width: 240, height: 460, forceY: -1500 },
  ],
  bouncers: [
    { x: 3350, y: 528, powerMultiplier: 2.6 },
  ],
  platforms: [
    { x: 1450, y: 570, widthTiles: 2 }, // Bridges Stage 1 into Stage 2
    { x: 2950, y: 570, widthTiles: 2 }, // Bridges Stage 2 into Stage 3
    { x: 3850, y: 380, widthTiles: 2 },
    { x: 4250, y: 380, widthTiles: 2 }, // Stepping platform to Citadel summit
  ],
  switches: [
    // Mid-air switch perched on floating platform in the wind channel
    { id: 'gate_citadel', x: 3850, y: 368 },
  ],
  gates: [
    // Gate guarding the Citadel Summit Portal
    { id: 'gate_citadel', x: 4320, y: 260, height: 110 },
  ],
  patrolEnemies: [
    { x: 1600, y: 512, patrolDistance: 320, speed: 110 },
    { x: 3050, y: 512, patrolDistance: 320, speed: 120 },
  ],
  spikes: [
    { x: 2020, y: 640, count: 26 },
    { x: 3600, y: 220, count: 2 }, // Floating spike mine in wind
    { x: 4050, y: 190, count: 2 },
  ],
  coins: [
    { x: 250, y: 540 },
    { x: 700, y: 460 },
    { x: 940, y: 420 },
    { x: 1180, y: 460 },
    { x: 1750, y: 480 },
    { x: 2250, y: 450 },
    { x: 2500, y: 440 },
    { x: 2750, y: 440 },
    { x: 3200, y: 480 },
    { x: 3600, y: 320 },
    { x: 3850, y: 320 },
    { x: 4050, y: 280 },
    { x: 4420, y: 200 },
  ],
};
