// src/data/levels/level5.ts
import { ILevelConfig } from './types';

export const level5: ILevelConfig = {
  levelNumber: 5,
  title: "The Beast's Maw",
  subtitle: 'Timing the Chomping Jaws',
  worldWidth: 3600,
  worldHeight: 650,
  spawnPoint: { x: 120, y: 460 },
  portal: { x: 3450, y: 440 },
  checkpoints: [
    { triggerX: 1650, spawn: { x: 1720, y: 420 } },
  ],
  backgroundTheme: { skyTint: 0xdcfce7, mountainTint: 0x4ade80, treesTint: 0x166534 },
  groundSpans: [
    // Outside meadow approach
    { startX: 0, endX: 450, surfaceY: 500 },
    // Approach cliff leading right to the Left Moving Bar
    { startX: 1100, endX: 1400, surfaceY: 440 },
    // Stomach chamber ground starting right by the Right Moving Bar
    { startX: 1700, endX: 2050, surfaceY: 480 },
    { startX: 2050, endX: 2550, surfaceY: 540 }, // Gastric acid bed 1
    { startX: 2550, endX: 2900, surfaceY: 520 },
    { startX: 2900, endX: 3350, surfaceY: 540 }, // Gastric acid bed 2
    { startX: 3350, endX: 3600, surfaceY: 500 },
  ],
  // Wavy meadow rolling hills outside, followed by bumpy fleshy gullet terrain inside
  curvedTerrains: [
    // Exterior approach roller hills
    {
      startX: 400,
      startY: 480,
      length: 700,
      amplitude: 45,
      frequency: 0.012,
      theme: { grassColor: 0x16a34a, dirtColor: 0x78350f },
    },
    // Bumpy interior stomach lining (fleshy red / maroon tissue)
    {
      startX: 2000,
      startY: 510,
      length: 600,
      amplitude: 35,
      frequency: 0.016,
      theme: { grassColor: 0x991b1b, dirtColor: 0x450a0a, innerDirtColor: 0x2a040d },
    },
    {
      startX: 2850,
      startY: 510,
      length: 550,
      amplitude: 30,
      frequency: 0.016,
      theme: { grassColor: 0x991b1b, dirtColor: 0x450a0a, innerDirtColor: 0x2a040d },
    },
  ],
  // Monster Maw Encounter with two independent horizontal moving bars (left at 1445, right at 1655)
  monsterMouths: [
    { x: 1550, y: 390, triggerWidth: 180, triggerHeight: 220 },
  ],
  // NO bouncers / jumpers to help - pure player timing & skill!
  bouncers: [],
  // Gastric Acid Pools (Mud Zones) inside the beast
  mudZones: [
    { x: 1850, y: 535, width: 340, height: 50 },
    { x: 2700, y: 535, width: 320, height: 50 },
    { x: 3100, y: 535, width: 280, height: 50 },
  ],
  // Fleshy platforms floating above the gastric acid pools
  platforms: [
    { x: 1900, y: 420, widthTiles: 2 },
    { x: 2300, y: 430, widthTiles: 2 },
    { x: 2700, y: 410, widthTiles: 2 },
    { x: 3150, y: 430, widthTiles: 2 },
  ],
  spikes: [
    // Stomach acid spikes in the deep flesh troughs
    { x: 2150, y: 546, count: 4 },
    { x: 2950, y: 546, count: 4 },
  ],
  coins: [
    { x: 250, y: 470 },
    { x: 550, y: 430 },
    { x: 750, y: 410 },
    { x: 1050, y: 440 },
    { x: 1445, y: 340 }, // Above left moving platform
    { x: 1550, y: 390 }, // Directly in between monster jaws
    { x: 1655, y: 340 }, // Above right moving platform
    { x: 1900, y: 360 },
    { x: 2300, y: 370 },
    { x: 2500, y: 460 },
    { x: 2700, y: 350 },
    { x: 3150, y: 370 },
    { x: 3450, y: 390 },
  ],
};
