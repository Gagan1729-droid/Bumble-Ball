// src/data/levels/level9.ts
import { ILevelConfig } from './types';

export const level9: ILevelConfig = {
  levelNumber: 9,
  title: 'The Updraft Tunnels',
  subtitle: 'Mid-Air Aerial Slalom',
  worldWidth: 3600,
  worldHeight: 800,
  spawnPoint: { x: 140, y: 520 },
  portal: { x: 3450, y: 240 },
  checkpoints: [
    { triggerX: 1800, spawn: { x: 1850, y: 500 } },
  ],
  backgroundTheme: { skyTint: 0xe0f2fe, mountainTint: 0x38bdf8, treesTint: 0x0284c7 },
  groundSpans: [
    // Pre-flight plateau
    { startX: 0, endX: 400, surfaceY: 580 },
    // Midpoint canyon sanctuary
    { startX: 1750, endX: 2000, surfaceY: 560 },
    // Cloud citadel portal summit
    { startX: 3350, endX: 3600, surfaceY: 300 },
  ],
  // Staggered WindZones blasting Bumble upward into the atmosphere
  windZones: [
    // Chasm 1 Updraft: Staggered lower updraft
    { x: 650, y: 480, width: 220, height: 500, forceY: -1550 },
    // Chasm 1 Upper Updraft: Shifted right
    { x: 950, y: 380, width: 220, height: 520, forceY: -1600 },
    // Chasm 1 Boost to Midpoint
    { x: 1350, y: 420, width: 240, height: 480, forceY: -1500 },

    // Chasm 2 Updrafts: Staggered zig-zag updrafts with floating mines
    { x: 2250, y: 480, width: 220, height: 520, forceY: -1600 },
    { x: 2550, y: 380, width: 220, height: 520, forceY: -1650 },
    { x: 2950, y: 360, width: 240, height: 550, forceY: -1650 },
  ],
  platforms: [
    // Catch perches between updrafts
    { x: 1150, y: 380, widthTiles: 2 },
    { x: 1550, y: 420, widthTiles: 2 },
    { x: 2400, y: 360, widthTiles: 1 },
    { x: 2750, y: 320, widthTiles: 1 },
    { x: 3180, y: 320, widthTiles: 2 },
  ],
  // Floating Spike Mines placed directly along the default center trajectory paths
  spikes: [
    // Chasm 1 floating mines (player must weave left/right to dodge)
    { x: 650, y: 400, count: 2 },
    { x: 950, y: 320, count: 2 },
    { x: 1350, y: 340, count: 2 },

    // Chasm 2 floating mines (tighter slalom)
    { x: 2250, y: 420, count: 2 },
    { x: 2250, y: 280, count: 2 },
    { x: 2550, y: 320, count: 2 },
    { x: 2950, y: 300, count: 2 },
    { x: 2950, y: 180, count: 2 },

    // Chasm floor hazards below
    { x: 500, y: 780, count: 8 },
    { x: 2100, y: 780, count: 8 },
  ],
  coins: [
    // Airborne weaving collection path
    { x: 240, y: 520 },
    { x: 580, y: 420 }, // Left weave
    { x: 720, y: 340 }, // Right weave
    { x: 880, y: 280 }, // Left weave
    { x: 1020, y: 240 },
    { x: 1180, y: 320 },
    { x: 1550, y: 360 },
    { x: 1880, y: 500 },
    { x: 2180, y: 420 }, // Left weave
    { x: 2320, y: 320 }, // Right weave
    { x: 2480, y: 260 },
    { x: 2620, y: 220 },
    { x: 2880, y: 240 },
    { x: 3020, y: 180 },
    { x: 3200, y: 260 },
    { x: 3450, y: 240 },
  ],
};
