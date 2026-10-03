// src/data/levels/level6.ts
import { ILevelConfig } from './types';

export const level6: ILevelConfig = {
  levelNumber: 6,
  title: 'Belly of the Beast',
  subtitle: 'Intestinal Valves & Vertical Descent',
  worldWidth: 2000,
  worldHeight: 2200,
  spawnPoint: { x: 200, y: 220 },
  portal: { x: 1750, y: 380 },
  checkpoints: [
    { triggerY: 1200, spawn: { x: 900, y: 1150 } },
  ],
  backgroundTheme: { skyTint: 0x450a0a, mountainTint: 0x881337, treesTint: 0x2a040d },
  groundSpans: [
    // Top entry ledge
    { startX: 80, endX: 380, surfaceY: 280 },
    // Chamber 1 Bottom (Acid Floor with Valve A)
    { startX: 150, endX: 650, surfaceY: 2080 },
    // Midpoint Intestinal Shelf
    { startX: 750, endX: 1150, surfaceY: 1220 },
    // Chamber 2 Bottom (Acid Floor with Valve B)
    { startX: 1050, endX: 1550, surfaceY: 2080 },
    // Exit Portal Sanctuary
    { startX: 1600, endX: 1920, surfaceY: 440 },
  ],
  // Fleshy walls and corridor shelves
  platforms: [
    // Esophagus dividing wall
    { x: 500, y: 600, widthTiles: 1 },
    { x: 500, y: 1000, widthTiles: 1 },
    { x: 500, y: 1400, widthTiles: 1 },
    { x: 500, y: 1800, widthTiles: 1 },

    // Chamber 2 dividing wall
    { x: 1350, y: 600, widthTiles: 1 },
    { x: 1350, y: 1000, widthTiles: 1 },
    { x: 1350, y: 1400, widthTiles: 1 },

    // Stepping perches
    { x: 260, y: 800, widthTiles: 2 },
    { x: 380, y: 1350, widthTiles: 2 },
    { x: 1180, y: 1550, widthTiles: 2 },
    { x: 1480, y: 850, widthTiles: 2 },
  ],
  // Organ Valve Gates (Fleshy sphincters opened by pressure switches)
  gates: [
    // Valve Gate 1: Opens ascent path to Midpoint Shelf
    { id: 'valve1', x: 620, y: 1220, height: 120 },
    // Valve Gate 2: Opens ascent path to Exit Sanctuary
    { id: 'valve2', x: 1520, y: 700, height: 140 },
  ],
  switches: [
    // Valve Switch 1 at bottom of Chamber 1
    { id: 'valve1', x: 320, y: 2070 },
    // Valve Switch 2 at bottom of Chamber 2
    { id: 'valve2', x: 1250, y: 2070 },
  ],
  // Trampolines at the bottom to propel Bumble back up through opened valves
  bouncers: [
    { x: 520, y: 2076, powerMultiplier: 2.8 }, // Launches up to Midpoint Shelf at y: 1220
    { x: 1420, y: 2076, powerMultiplier: 2.9 }, // Launches up to Exit Sanctuary at y: 440
  ],
  // Spikes lining throat corridor walls during vertical plunges
  spikes: [
    // Esophagus drop hazards
    { x: 140, y: 750, count: 2 },
    { x: 420, y: 1150, count: 2 },
    { x: 160, y: 1650, count: 3 },
    // Intestinal drop hazards
    { x: 1060, y: 1450, count: 2 },
    { x: 1300, y: 1750, count: 2 },
  ],
  coins: [
    { x: 200, y: 200 },
    { x: 260, y: 740 },
    { x: 380, y: 1290 },
    { x: 320, y: 2010 },
    { x: 520, y: 1600 },
    { x: 520, y: 1300 },
    { x: 900, y: 1150 },
    { x: 1180, y: 1490 },
    { x: 1250, y: 2010 },
    { x: 1420, y: 1400 },
    { x: 1420, y: 800 },
    { x: 1480, y: 790 },
    { x: 1750, y: 360 },
  ],
};
