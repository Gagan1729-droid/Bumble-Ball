// src/data/levels/level6.ts
import { ILevelConfig } from './types';

export const level6: ILevelConfig = {
  levelNumber: 6,
  title: 'Lock & Key',
  subtitle: 'The Gated Citadel',
  worldWidth: 3800,
  worldHeight: 600,
  spawnPoint: { x: 120, y: 480 },
  portal: { x: 3650, y: 220 },
  checkpoints: [{ triggerX: 1800, spawn: { x: 1850, y: 440 } }],
  backgroundTheme: { skyTint: 0xffedd5, mountainTint: 0xfb923c, treesTint: 0x9a3412 },
  groundSpans: [
    { startX: 0, endX: 700, surfaceY: 528 },
    { startX: 700, endX: 1800, surfaceY: 560 }, // Lower dungeon cavern
    { startX: 1800, endX: 2500, surfaceY: 480 }, // Midpoint keep
    { startX: 2500, endX: 3800, surfaceY: 528 }, // Upper fortress
    { startX: 3300, endX: 3800, surfaceY: 280 }, // Elevated portal chamber
  ],
  platforms: [
    { x: 500, y: 420, widthTiles: 2 },
    { x: 800, y: 440, widthTiles: 2 },
    { x: 1050, y: 400, widthTiles: 2 },
    { x: 1300, y: 460, widthTiles: 2 },
    { x: 1550, y: 390, widthTiles: 2 },
    { x: 2200, y: 380, widthTiles: 2 },
    { x: 2700, y: 420, widthTiles: 2 },
    { x: 2950, y: 360, widthTiles: 2 },
    { x: 3200, y: 300, widthTiles: 2 },
  ],
  gates: [
    // Gate 1: Blocks the bridge to the upper keep
    { id: 'gate_red', x: 2450, y: 432, height: 96 },
    // Gate 2: Blocks entrance to final portal
    { id: 'gate_blue', x: 3320, y: 232, height: 96 },
  ],
  switches: [
    // Switch 1: Hidden in the deep lower dungeon
    { id: 'gate_red', x: 1300, y: 448 },
    // Switch 2: High in the upper fortress rafters
    { id: 'gate_blue', x: 2950, y: 348 },
  ],
  spikes: [
    { x: 740, y: 560, count: 28 },
    { x: 2720, y: 528, count: 4 },
  ],
  coins: [
    { x: 320, y: 480 },
    { x: 500, y: 370 },
    { x: 800, y: 390 },
    { x: 1050, y: 350 },
    { x: 1300, y: 400 },
    { x: 1550, y: 330 },
    { x: 1950, y: 420 },
    { x: 2200, y: 330 },
    { x: 2700, y: 360 },
    { x: 2950, y: 290 },
    { x: 3480, y: 220 },
  ],
};
