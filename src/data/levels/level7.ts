// src/data/levels/level7.ts
import { ILevelConfig } from './types';

export const level7: ILevelConfig = {
  levelNumber: 7,
  title: 'The Submerged Ruins',
  subtitle: 'Buoyancy & Sunken Chambers',
  worldWidth: 3600,
  worldHeight: 700,
  spawnPoint: { x: 140, y: 320 },
  portal: { x: 3450, y: 320 },
  checkpoints: [
    { triggerX: 1800, spawn: { x: 1850, y: 360 } },
  ],
  backgroundTheme: { skyTint: 0x0284c7, mountainTint: 0x0369a1, treesTint: 0x075985 },
  groundSpans: [
    // Entry drainage chute
    { startX: 0, endX: 400, surfaceY: 420 },
    // Sunken lagoon seabed
    { startX: 400, endX: 3200, surfaceY: 660 },
    // Exit temple sanctuary
    { startX: 3200, endX: 3600, surfaceY: 420 },
  ],
  // Massive Submerged Lagoon WaterZone
  waterZones: [
    {
      x: 1800,
      y: 490,
      width: 2800,
      height: 380,
      title: 'Sunken Lagoon',
    },
  ],
  // Sunken stone ruins, pillars, and archways requiring non-linear navigation
  platforms: [
    // Sunken Gateway 1 (High barrier - must dive underneath)
    { x: 750, y: 360, widthTiles: 3 },
    { x: 1100, y: 520, widthTiles: 2 }, // Low stepping reef

    // Sunken Gateway 2 (Low barrier - must swim up and over)
    { x: 1450, y: 560, widthTiles: 3 },
    { x: 1800, y: 380, widthTiles: 3 }, // Midpoint sanctuary arch

    // Sunken Gateway 3 (Serpentine S-bend ruins)
    { x: 2200, y: 360, widthTiles: 3 },
    { x: 2550, y: 560, widthTiles: 3 },
    { x: 2900, y: 380, widthTiles: 3 },
    { x: 3150, y: 520, widthTiles: 2 }, // Stepping shelf onto dry exit temple
  ],
  spikes: [
    // Hazards on submerged pillar edges to encourage precision swimming
    { x: 760, y: 360, count: 2 },
    { x: 1460, y: 560, count: 2 },
    { x: 2210, y: 360, count: 2 },
    { x: 2560, y: 560, count: 2 },
  ],
  coins: [
    { x: 240, y: 360 },
    { x: 550, y: 460 },
    { x: 750, y: 580 }, // Deep dive reward
    { x: 950, y: 560 },
    { x: 1100, y: 460 },
    { x: 1450, y: 410 }, // Surface swim reward
    { x: 1800, y: 320 },
    { x: 2000, y: 460 },
    { x: 2200, y: 580 }, // Deep dive reward
    { x: 2400, y: 560 },
    { x: 2550, y: 410 }, // Surface swim reward
    { x: 2750, y: 460 },
    { x: 2900, y: 580 },
    { x: 3100, y: 420 },
    { x: 3350, y: 360 },
  ],
};
