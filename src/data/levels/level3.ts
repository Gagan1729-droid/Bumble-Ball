// src/data/levels/level3.ts
import { ILevelConfig } from './types';

export const level3: ILevelConfig = {
  levelNumber: 3,
  title: 'The Brittle Bridge',
  subtitle: 'Momentum Across the Chasm',
  worldWidth: 3800,
  worldHeight: 650,
  spawnPoint: { x: 140, y: 440 },
  portal: { x: 3620, y: 440 },
  checkpoints: [
    { triggerX: 1900, spawn: { x: 1940, y: 400 } },
  ],
  backgroundTheme: { skyTint: 0xfef9c3, mountainTint: 0xfacc15, treesTint: 0xca8a04 },
  groundSpans: [
    // Left launch cliff
    { startX: 0, endX: 420, surfaceY: 500 },
    // Midpoint rest pillar
    { startX: 1880, endX: 2040, surfaceY: 480 },
    // Right destination cliff
    { startX: 3480, endX: 3800, surfaceY: 500 },
  ],
  // Single path of 1-tile Breakable Blocks arranged in a sine-wave arch across the bottomless chasm!
  breakableBlocks: [
    // Arc 1: Chasm Crossing to Midpoint Sanctuary
    { x: 580, y: 480, widthTiles: 1 },
    { x: 740, y: 430, widthTiles: 1 },
    { x: 900, y: 390, widthTiles: 1 },
    { x: 1060, y: 380, widthTiles: 1 },
    { x: 1220, y: 400, widthTiles: 1 },
    { x: 1380, y: 440, widthTiles: 1 },
    { x: 1540, y: 480, widthTiles: 1 },
    { x: 1700, y: 460, widthTiles: 1 },

    // Arc 2: Climax Crossing to Destination Cliff
    { x: 2200, y: 460, widthTiles: 1 },
    { x: 2360, y: 420, widthTiles: 1 },
    { x: 2520, y: 380, widthTiles: 1 },
    { x: 2680, y: 360, widthTiles: 1 },
    { x: 2840, y: 370, widthTiles: 1 },
    { x: 3000, y: 410, widthTiles: 1 },
    { x: 3160, y: 450, widthTiles: 1 },
    { x: 3320, y: 480, widthTiles: 1 },
  ],
  // Hazards: Spikes on the midpoint sanctuary borders to punish overshooting
  spikes: [
    { x: 1890, y: 480, count: 1 },
    { x: 2010, y: 480, count: 1 },
  ],
  coins: [
    { x: 260, y: 450 },
    { x: 580, y: 420 },
    { x: 740, y: 370 },
    { x: 900, y: 330 },
    { x: 1060, y: 320 },
    { x: 1220, y: 340 },
    { x: 1380, y: 380 },
    { x: 1540, y: 420 },
    { x: 1960, y: 420 },
    { x: 2200, y: 400 },
    { x: 2360, y: 360 },
    { x: 2520, y: 320 },
    { x: 2680, y: 300 },
    { x: 2840, y: 310 },
    { x: 3000, y: 350 },
    { x: 3160, y: 390 },
    { x: 3320, y: 420 },
    { x: 3550, y: 440 },
  ],
};
