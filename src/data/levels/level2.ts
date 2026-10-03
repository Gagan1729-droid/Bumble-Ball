// src/data/levels/level2.ts
import { ILevelConfig } from './types';

export const level2: ILevelConfig = {
  levelNumber: 2,
  title: 'The Vertical Shaft',
  subtitle: 'Extreme Vertical Ascent',
  worldWidth: 960,
  worldHeight: 2800,
  spawnPoint: { x: 480, y: 2680 },
  portal: { x: 480, y: 160 },
  checkpoints: [
    { triggerY: 1500, spawn: { x: 480, y: 1420 } },
  ],
  backgroundTheme: { skyTint: 0x0f172a, mountainTint: 0x334155, treesTint: 0x1e293b },
  groundSpans: [
    // Bottom floor launch chamber
    { startX: 180, endX: 780, surfaceY: 2740 },
    // Midpoint rest plateau
    { startX: 380, endX: 580, surfaceY: 1460 },
    // Top summit portal pedestal
    { startX: 360, endX: 600, surfaceY: 220 },
  ],
  platforms: [
    // Left boundary containment pillars
    { x: 140, y: 2400, widthTiles: 1 },
    { x: 140, y: 2000, widthTiles: 1 },
    { x: 140, y: 1600, widthTiles: 1 },
    { x: 140, y: 1100, widthTiles: 1 },
    { x: 140, y: 700, widthTiles: 1 },
    // Right boundary containment pillars
    { x: 800, y: 2400, widthTiles: 1 },
    { x: 800, y: 2000, widthTiles: 1 },
    { x: 800, y: 1600, widthTiles: 1 },
    { x: 800, y: 1100, widthTiles: 1 },
    { x: 800, y: 700, widthTiles: 1 },

    // Intermediate recovery perches
    { x: 432, y: 2160, widthTiles: 2 },
    { x: 432, y: 1820, widthTiles: 2 },
    { x: 432, y: 1050, widthTiles: 2 },
    { x: 432, y: 680, widthTiles: 2 },
  ],
  // Trampolines (Bouncers) positioned centrally to blast upward through the shaft
  bouncers: [
    { x: 480, y: 2736, powerMultiplier: 2.6 }, // Tier 1 launch (climbs to ~2160)
    { x: 480, y: 2156, powerMultiplier: 2.4 }, // Tier 2 launch (climbs to ~1820)
    { x: 480, y: 1816, powerMultiplier: 2.5 }, // Tier 3 launch (climbs to midpoint 1460)
    { x: 480, y: 1456, powerMultiplier: 2.6 }, // Tier 4 launch (climbs to ~1050)
    { x: 480, y: 1046, powerMultiplier: 2.5 }, // Tier 5 launch (climbs to ~680)
    { x: 480, y: 676, powerMultiplier: 2.7 },  // Final Tier launch to summit portal!
  ],
  // Wall Spikes: Lined along left and right walls. Off-center bounces result in spike impacts!
  spikes: [
    // Lower Shaft Wall Spikes
    { x: 180, y: 2520, count: 4 },
    { x: 640, y: 2520, count: 4 },
    { x: 180, y: 2280, count: 4 },
    { x: 640, y: 2280, count: 4 },
    { x: 180, y: 1950, count: 4 },
    { x: 640, y: 1950, count: 4 },

    // Upper Shaft Wall Spikes (Narrower corridor, higher precision)
    { x: 220, y: 1280, count: 4 },
    { x: 600, y: 1280, count: 4 },
    { x: 220, y: 920, count: 4 },
    { x: 600, y: 920, count: 4 },
    { x: 220, y: 520, count: 4 },
    { x: 600, y: 520, count: 4 },
  ],
  coins: [
    // Airborne ascension collection rings
    { x: 480, y: 2450 },
    { x: 480, y: 2350 },
    { x: 480, y: 2000 },
    { x: 480, y: 1900 },
    { x: 480, y: 1650 },
    { x: 480, y: 1550 },
    { x: 440, y: 1420 },
    { x: 520, y: 1420 },
    { x: 480, y: 1250 },
    { x: 480, y: 1150 },
    { x: 480, y: 880 },
    { x: 480, y: 780 },
    { x: 480, y: 500 },
    { x: 480, y: 380 },
    { x: 480, y: 180 },
  ],
};
