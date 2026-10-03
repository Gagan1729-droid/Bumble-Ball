// src/data/levels/level6.ts
import { ILevelConfig } from './types';

/**
 * Level 6: Belly of the Beast
 *
 * Theme: Intestinal Valves, Switches & Spring Navigation
 *
 * Design Philosophy & Predictability:
 * - Clear 3-Act Structure:
 *   1. The First Valve (Tutorial): Visible closed Gate 1 with nearby Switch 1 and guiding coin arc.
 *   2. The Digestive Spring: Lower chamber Switch 2 opens elevated Gate 2; a tuned bouncer with a parabolic
 *      coin arc guides Bumble smoothly onto the upper terrace.
 *   3. The Peristaltic Run: Moving platforms across the digestive acid gap leading to the Exit Sanctuary.
 * - Perfectly readable platforming distances (< 180px) and well-framed camera (worldHeight: 750).
 * - Generous checkpoints placed immediately after each gate.
 */
export const level6: ILevelConfig = {
  levelNumber: 6,
  title: 'Belly of the Beast',
  subtitle: 'Intestinal Valves & Spring Navigation',
  worldWidth: 3200,
  worldHeight: 750,
  spawnPoint: { x: 120, y: 480 },
  portal: { x: 3050, y: 400 },
  checkpoints: [
    { triggerX: 920, spawn: { x: 960, y: 480 } },   // After Gate 1
    { triggerX: 1950, spawn: { x: 2000, y: 340 } }, // After Gate 2
  ],
  backgroundTheme: { skyTint: 0x450a0a, mountainTint: 0x881337, treesTint: 0x2a040d },

  // Ground Spans: Solid, predictable terrain with natural steps
  groundSpans: [
    // Act 1: Entry ledge and Switch 1 terrace
    { startX: 0, endX: 620, surfaceY: 540 },

    // Stepping ground under Gate 1
    { startX: 680, endX: 860, surfaceY: 540 },

    // Act 2: Post-Gate 1 plateau leading to the lower digestive chamber
    { startX: 920, endX: 1300, surfaceY: 540 },

    // Lower digestive chamber floor with Switch 2 and the bouncer
    { startX: 1360, endX: 1780, surfaceY: 600 },

    // Elevated terrace leading to Gate 2
    { startX: 1820, endX: 2050, surfaceY: 380 },

    // Act 3: Digestive acid pit floor below moving platforms
    { startX: 2100, endX: 2600, surfaceY: 680 },

    // Exit Sanctuary
    { startX: 2650, endX: 3200, surfaceY: 460 },
  ],

  // Organ Valve Gates (Fleshy sphincters opened by pressure switches)
  gates: [
    // Gate 1: Blocks the passage between Act 1 and Act 2
    { id: 'valve1', x: 860, y: 460, height: 110 },

    // Gate 2: Blocks the upper tunnel on the elevated terrace
    { id: 'valve2', x: 1920, y: 300, height: 110 },
  ],

  // Pressure Switches: Clearly visible and placed naturally along the route
  switches: [
    // Switch 1: Placed on the entrance ledge right before Gate 1
    { id: 'valve1', x: 540, y: 530 },

    // Switch 2: Placed in the lower digestive chamber to open Gate 2 on the terrace
    { id: 'valve2', x: 1460, y: 590 },
  ],

  // Bouncers: Tuned trampolines with clear trajectories
  bouncers: [
    // Launches Bumble smoothly from the lower chamber (Y: 600) up to the terrace (Y: 380)
    { x: 1680, y: 596, powerMultiplier: 1.48 },
  ],

  // Solid platforms: Ceilings above gates and stepping stones across gaps
  platforms: [
    // Ceiling block above Gate 1 (prevents jumping over the gate)
    { x: 860, y: 340, widthTiles: 2 },
    { x: 860, y: 292, widthTiles: 2 },

    // Ceiling block above Gate 2
    { x: 1920, y: 180, widthTiles: 2 },
    { x: 1920, y: 132, widthTiles: 2 },

    // Safe stepping ledges in Act 1
    { x: 720, y: 510, widthTiles: 2 },

    // Mid-air stepping shelf between lower chamber and terrace
    { x: 1750, y: 480, widthTiles: 2 },

    // Secret bonus coin shelf high above Act 2
    { x: 1550, y: 260, widthTiles: 2 },
  ],

  // Moving Platforms across the digestive acid gap in Act 3
  movingPlatforms: [
    { x: 2120, y: 400, distanceX: 180, duration: 2500, widthTiles: 2 },
    { x: 2380, y: 400, distanceX: 180, duration: 2000, widthTiles: 2 },
  ],

  // Mud zones simulating digestive bile
  mudZones: [
    { x: 1100, y: 535, width: 140, height: 25 },
  ],

  // Spikes (Acid deposits on the pit floor, never placed blindly)
  spikes: [
    // Acid spikes in the gap between Act 1 and stepping ledge
    { x: 640, y: 620, count: 2 },

    // Acid floor below the moving platforms in Act 3
    { x: 2200, y: 670, count: 4 },
    { x: 2420, y: 670, count: 4 },
  ],

  // Coins: Arranged in arcs to signpost the path, jumps, and bouncers
  coins: [
    // Act 1: Guiding arc to Switch 1
    { x: 250, y: 490 },
    { x: 380, y: 490 },
    { x: 480, y: 500 },
    { x: 540, y: 470 }, // Directly above Switch 1

    // Guiding arc through Gate 1
    { x: 720, y: 460 },
    { x: 800, y: 480 },
    { x: 860, y: 490 }, // In the center of Gate 1
    { x: 960, y: 490 },

    // Act 2: Guiding arc into the lower chamber
    { x: 1150, y: 490 },
    { x: 1320, y: 530 },
    { x: 1400, y: 560 },
    { x: 1460, y: 530 }, // Above Switch 2

    // Parabolic Bouncer Arc: Guiding Bumble from bouncer to the terrace!
    { x: 1680, y: 530 },
    { x: 1700, y: 420 },
    { x: 1740, y: 350 }, // Apex of bounce
    { x: 1780, y: 340 },
    { x: 1840, y: 340 }, // Landing on terrace

    // Through Gate 2
    { x: 1920, y: 330 }, // In the center of Gate 2
    { x: 2000, y: 340 },

    // Act 3: Across the moving platforms
    { x: 2180, y: 340 },
    { x: 2320, y: 320 },
    { x: 2450, y: 340 },
    { x: 2600, y: 350 },

    // Triumphal final run to the Exit Portal
    { x: 2750, y: 410 },
    { x: 2880, y: 410 },
    { x: 3000, y: 370 },
  ],
};
