// src/data/levels/level1.ts
import { ILevelConfig } from './types';

export const level1: ILevelConfig = {
  levelNumber: 1,
  title: 'The Rolling Hills',
  subtitle: 'Rolling Momentum & Sloped Peaks',
  worldWidth: 3600,
  worldHeight: 600,
  spawnPoint: { x: 120, y: 440 },
  portal: { x: 3500, y: 440 },
  checkpoints: [{ triggerX: 1800, spawn: { x: 1840, y: 440 } }],
  backgroundTheme: { skyTint: 0xffffff, mountainTint: 0xffffff, treesTint: 0xffffff },
  groundSpans: [
    // Flat launch and goal pads at surfaceY = 480
    { startX: 0, endX: 280, surfaceY: 480 },
    { startX: 3420, endX: 3600, surfaceY: 480 },
  ],
  // Seamless wavy rolling terrain starting at 280 and completing full cycles to 3420
  curvedTerrains: [
    {
      startX: 280,
      startY: 480,
      length: 3140, // 3140 * 0.012 ≈ 12*PI radians (6 full hill waves ending smoothly at Y=480)
      amplitude: 65,
      frequency: 0.012,
      theme: {
        grassColor: 0x15803d,
        grassHighlight: 0x22c55e,
        dirtColor: 0x78350f,
        innerDirtColor: 0x451a03,
      },
    },
  ],
  // Hazards: Spikes placed in valleys to teach rolling momentum and jumping over troughs
  spikes: [
    { x: 1180, y: 545, count: 2 }, // Valley 2
    { x: 2220, y: 545, count: 2 }, // Valley 4
    { x: 2750, y: 545, count: 2 }, // Valley 5
  ],
  // Coins floating along the sine curve trajectory
  coins: [
    { x: 200, y: 440 },
    { x: 420, y: 430 },
    { x: 540, y: 415 }, // Crest 1
    { x: 670, y: 490 },
    { x: 940, y: 440 },
    { x: 1060, y: 415 }, // Crest 2
    { x: 1190, y: 460 }, // Above valley 2 spikes
    { x: 1460, y: 440 },
    { x: 1580, y: 415 }, // Crest 3
    { x: 1840, y: 430 },
    { x: 2100, y: 415 }, // Crest 4
    { x: 2230, y: 460 }, // Above valley 4 spikes
    { x: 2500, y: 440 },
    { x: 2620, y: 415 }, // Crest 5
    { x: 2760, y: 460 }, // Above valley 5 spikes
    { x: 3020, y: 440 },
    { x: 3140, y: 415 }, // Crest 6
    { x: 3380, y: 450 },
  ],
};
