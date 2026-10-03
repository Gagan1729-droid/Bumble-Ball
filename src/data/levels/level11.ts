// src/data/levels/level11.ts
import { ILevelConfig } from './types';

export const level11: ILevelConfig = {
  levelNumber: 11,
  title: 'The Spike Gauntlet',
  subtitle: 'The Needle-Thread Choke Point',
  worldWidth: 3500,
  worldHeight: 700,
  spawnPoint: { x: 140, y: 500 },
  portal: { x: 3350, y: 380 },
  checkpoints: [
    { triggerX: 1750, spawn: { x: 1800, y: 460 } },
  ],
  backgroundTheme: { skyTint: 0x18181b, mountainTint: 0x3f3f46, treesTint: 0x27272a },
  groundSpans: [
    // Starting safe ledge
    { startX: 0, endX: 380, surfaceY: 560 },
    // Midpoint sanctuary
    { startX: 1750, endX: 2000, surfaceY: 520 },
    // Final victory pedestal
    { startX: 3200, endX: 3500, surfaceY: 440 },
  ],
  // Trampolines (Bouncers) initiating high-velocity launches across spike pits
  bouncers: [
    // Gauntlet 1 Launch
    { x: 480, y: 556, powerMultiplier: 2.5 },
    // Gauntlet 2 Launch
    { x: 2050, y: 516, powerMultiplier: 2.5 },
  ],
  // Isolated single-tile breakable blocks floating amidst spike cages
  breakableBlocks: [
    // Gauntlet 1 Perch (must land, immediately leap before it crumbles)
    { x: 920, y: 390, widthTiles: 1 },
    // Gauntlet 2 Perches
    { x: 2450, y: 380, widthTiles: 1 },
    { x: 2650, y: 350, widthTiles: 1 },
  ],
  // Small Water Pockets strategically positioned to kill high-velocity momentum
  waterZones: [
    // Pocket 1: Catch pocket after Breakable Block 1
    {
      x: 1350,
      y: 420,
      width: 320,
      height: 340,
      title: 'Dampening Well 1',
    },
    // Pocket 2: Needle-thread water chute
    {
      x: 2950,
      y: 410,
      width: 340,
      height: 360,
      title: 'Dampening Well 2',
    },
  ],
  platforms: [
    // Framing walls creating needle-thread channels
    { x: 1220, y: 320, widthTiles: 1 },
    { x: 1480, y: 320, widthTiles: 1 },
    { x: 2820, y: 300, widthTiles: 1 },
    { x: 3080, y: 300, widthTiles: 1 },
  ],
  // Lethal spike arrays: pit spikes, ceiling spikes, and needle-thread choke gaps
  spikes: [
    // Pit Spikes beneath Gauntlet 1
    { x: 420, y: 680, count: 18 },

    // Spikes surrounding Breakable Block 1 (Left & Right hazard pillars)
    { x: 820, y: 390, count: 2 },
    { x: 1020, y: 390, count: 2 },

    // Needle-thread spike gap inside Water Pocket 1 (Only center clearance!)
    { x: 1240, y: 440, count: 2 },
    { x: 1440, y: 440, count: 2 },

    // Pit Spikes beneath Gauntlet 2
    { x: 2050, y: 680, count: 18 },

    // Spikes flanking Breakable Blocks in Gauntlet 2
    { x: 2350, y: 380, count: 2 },
    { x: 2550, y: 350, count: 2 },

    // Needle-thread spike gap inside Water Pocket 2
    { x: 2840, y: 430, count: 2 },
    { x: 3040, y: 430, count: 2 },
  ],
  coins: [
    { x: 240, y: 500 },
    { x: 480, y: 440 },
    { x: 700, y: 300 }, // Apex of launch 1
    { x: 920, y: 340 }, // Atop breakable block 1
    { x: 1150, y: 380 },
    { x: 1350, y: 350 }, // Inside water pocket 1
    { x: 1350, y: 470 }, // Inside needle gap
    { x: 1600, y: 480 },
    { x: 1870, y: 460 },
    { x: 2050, y: 410 },
    { x: 2250, y: 280 }, // Apex of launch 2
    { x: 2450, y: 330 },
    { x: 2650, y: 300 },
    { x: 2950, y: 340 }, // Inside water pocket 2
    { x: 2950, y: 470 }, // Inside needle gap 2
    { x: 3350, y: 340 },
  ],
};
