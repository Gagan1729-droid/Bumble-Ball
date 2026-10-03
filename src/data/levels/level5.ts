// src/data/levels/level5.ts
import { ILevelConfig } from './types';

/**
 * ====================================================================================
 * 3 SNAPPING MONSTERS GAUNTLET - FEASIBILITY & SPACING CALCULATION
 * ====================================================================================
 * 
 * 1. Player Standard Jump Physics:
 *    - Horizontal Move Speed (v_x): 240 px/s
 *    - Jump Force (v_y0): -430 px/s
 *    - World Gravity (g): 1000 px/s^2
 *    - Player Height: 30 px (radius = 15 px)
 * 
 * 2. Apex Height Calculation:
 *    - Time to apex: t_apex = |v_y0| / g = 430 / 1000 = 0.43 s
 *    - Apex displacement: h_apex = v_y0^2 / (2 * g) = 184900 / 2000 = 92.45 px (~92 px)
 *    - Monster Mouth Vertical Center:
 *      Monster.Y = Platform.surfaceY - h_apex = 500 - 92 = 408 px
 *      -> Aligns the mouth opening perfectly with the apex of the jump arc!
 * 
 * 3. Horizontal Gap & Air Time:
 *    - Total Air Time: t_air = 2 * t_apex = 0.86 s
 *    - Maximum Horizontal Jump Reach: D_max = v_x * t_air = 240 * 0.86 = 206.4 px
 *    - Spacing Safeguard: Gap distance between platform edges is set to 160 px (<= 206.4 px).
 * 
 * 4. The 3 Snapping Monsters Sequence:
 *    - Monster 1: Gap [1350 - 1510], Monster at X = 1430, Y = 408, startDelay: 0ms
 *    - Platform 2: [1510 - 1710], surfaceY = 500
 *    - Monster 2: Gap [1710 - 1870], Monster at X = 1790, Y = 408, startDelay: 600ms
 *    - Platform 3: [1870 - 2070], surfaceY = 500
 *    - Monster 3: Gap [2070 - 2230], Monster at X = 2150, Y = 408, startDelay: 1200ms
 *    - Landing Platform: [2230 - 2550], surfaceY = 500
 * 
 * 5. The Safe Window:
 *    - Clearance between jaws when fully open = Player.Height + (Player.Height * 1.5) = 75 px.
 * ====================================================================================
 */

export const level5: ILevelConfig = {
  levelNumber: 5,
  title: "The Beast's Maw",
  subtitle: 'The Triple Snapping Monster Gauntlet',
  worldWidth: 3800,
  worldHeight: 650,
  spawnPoint: { x: 120, y: 460 },
  portal: { x: 3650, y: 440 },
  checkpoints: [
    { triggerX: 1510, spawn: { x: 1560, y: 440 } }, // After Monster 1
    { triggerX: 2230, spawn: { x: 2280, y: 440 } }, // After Monster 3
  ],
  backgroundTheme: { skyTint: 0xdcfce7, mountainTint: 0x4ade80, treesTint: 0x166534 },
  groundSpans: [
    // Outside meadow approach
    { startX: 0, endX: 450, surfaceY: 500 },

    // [STARTING PLATFORM 1]: Leading to Monster 1
    { startX: 1100, endX: 1350, surfaceY: 500 },

    // [INTERMEDIATE PLATFORM 2]: In between Monster 1 and Monster 2
    { startX: 1510, endX: 1710, surfaceY: 500 },

    // [INTERMEDIATE PLATFORM 3]: In between Monster 2 and Monster 3
    { startX: 1870, endX: 2070, surfaceY: 500 },

    // [LANDING PLATFORM]: Across Monster 3 leading into the stomach chamber
    { startX: 2230, endX: 2550, surfaceY: 500 },

    // Interior stomach chamber
    { startX: 2550, endX: 2850, surfaceY: 540 }, // Gastric acid bed 1
    { startX: 2850, endX: 3200, surfaceY: 520 },
    { startX: 3200, endX: 3550, surfaceY: 540 }, // Gastric acid bed 2
    { startX: 3550, endX: 3800, surfaceY: 500 },
  ],
  curvedTerrains: [
    {
      startX: 400,
      startY: 480,
      length: 700,
      amplitude: 45,
      frequency: 0.012,
      theme: { grassColor: 0x16a34a, dirtColor: 0x78350f },
    },
    {
      startX: 2600,
      startY: 510,
      length: 550,
      amplitude: 35,
      frequency: 0.016,
      theme: { grassColor: 0x991b1b, dirtColor: 0x450a0a, innerDirtColor: 0x2a040d },
    },
    {
      startX: 3200,
      startY: 510,
      length: 500,
      amplitude: 30,
      frequency: 0.016,
      theme: { grassColor: 0x991b1b, dirtColor: 0x450a0a, innerDirtColor: 0x2a040d },
    },
  ],
  // The 3 Snapping Monster Timing Traps (Synchronously opening and snapping shut):
  snappingMonsters: [
    // Monster 1
    {
      x: 1430,
      y: 408,
      openDuration: 1000,
      holdOpenTime: 900,
      snapDuration: 200,
      holdShutTime: 600,
      startDelay: 0,
    },
    // Monster 2
    {
      x: 1790,
      y: 408,
      openDuration: 1000,
      holdOpenTime: 900,
      snapDuration: 200,
      holdShutTime: 600,
      startDelay: 0,
    },
    // Monster 3
    {
      x: 2150,
      y: 408,
      openDuration: 1000,
      holdOpenTime: 900,
      snapDuration: 200,
      holdShutTime: 600,
      startDelay: 0,
    },
  ],
  bouncers: [],
  mudZones: [
    { x: 2650, y: 535, width: 300, height: 50 },
    { x: 3250, y: 535, width: 300, height: 50 },
  ],
  platforms: [
    { x: 2700, y: 430, widthTiles: 2 },
    { x: 3300, y: 430, widthTiles: 2 },
  ],
  spikes: [
    // Pits below the 3 Snapping Monsters
    { x: 1410, y: 620, count: 3 },
    { x: 1770, y: 620, count: 3 },
    { x: 2130, y: 620, count: 3 },
    // Stomach acid spikes
    { x: 2750, y: 546, count: 4 },
    { x: 3350, y: 546, count: 4 },
  ],
  coins: [
    { x: 250, y: 470 },
    { x: 550, y: 430 },
    { x: 750, y: 410 },
    { x: 1050, y: 440 },
    { x: 1300, y: 450 },
    { x: 1430, y: 408 }, // Floating through Monster 1
    { x: 1610, y: 450 }, // Platform 2
    { x: 1790, y: 408 }, // Floating through Monster 2
    { x: 1970, y: 450 }, // Platform 3
    { x: 2150, y: 408 }, // Floating through Monster 3
    { x: 2330, y: 450 }, // Landing Platform
    { x: 2700, y: 370 },
    { x: 3000, y: 460 },
    { x: 3300, y: 370 },
    { x: 3650, y: 390 },
  ],
};
