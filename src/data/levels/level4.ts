// src/data/levels/level4.ts
import { ILevelConfig } from './types';

export const level4: ILevelConfig = {
  levelNumber: 4,
  title: 'The Moving Caverns',
  subtitle: 'Elevator Shafts & Ceiling Spikes',
  worldWidth: 3600,
  worldHeight: 700,
  spawnPoint: { x: 140, y: 520 },
  portal: { x: 3450, y: 220 },
  checkpoints: [
    { triggerX: 1800, spawn: { x: 1840, y: 480 } },
  ],
  backgroundTheme: { skyTint: 0x1e1b4b, mountainTint: 0x4338ca, treesTint: 0x312e81 },
  groundSpans: [
    { startX: 0, endX: 450, surfaceY: 580 },
    { startX: 1100, endX: 1650, surfaceY: 580 },
    { startX: 2300, endX: 2850, surfaceY: 540 },
    { startX: 3300, endX: 3600, surfaceY: 280 },
  ],
  // Wavy cavern floors
  curvedTerrains: [
    {
      startX: 1150,
      startY: 550,
      length: 480,
      amplitude: 35,
      frequency: 0.015,
      theme: { grassColor: 0x4338ca, dirtColor: 0x1e1b4b },
    },
    {
      startX: 2350,
      startY: 510,
      length: 480,
      amplitude: 30,
      frequency: 0.015,
      theme: { grassColor: 0x4338ca, dirtColor: 0x1e1b4b },
    },
  ],
  // Vertical elevator platforms ascending into spike-topped cavern shafts
  movingPlatforms: [
    // Elevator 1: Ascends from y: 550 up to y: 290
    { x: 650, y: 550, widthTiles: 2, distanceX: 0, distanceY: -260, duration: 3200 },
    // Elevator 2: Ascends from y: 550 up to y: 280
    { x: 1850, y: 550, widthTiles: 2, distanceX: 0, distanceY: -270, duration: 3000 },
    // Elevator 3: Final ascent from y: 510 up to portal height y: 250
    { x: 3050, y: 510, widthTiles: 2, distanceX: 0, distanceY: -260, duration: 2800 },
  ],
  // Safe side-alcove platforms where player must step off before reaching ceiling spikes
  platforms: [
    // Alcove 1 (Side ledge at y: 400 where player ducks off elevator)
    { x: 800, y: 410, widthTiles: 2 },
    { x: 950, y: 410, widthTiles: 2 },
    // Ceilings directly above Elevator 1 with spikes
    { x: 620, y: 230, widthTiles: 3 },

    // Alcove 2 (Side ledge at y: 390)
    { x: 2000, y: 390, widthTiles: 2 },
    { x: 2150, y: 390, widthTiles: 2 },
    // Ceilings directly above Elevator 2 with spikes
    { x: 1820, y: 220, widthTiles: 3 },

    // Alcove 3 (Final safe transition shelf)
    { x: 3180, y: 350, widthTiles: 2 },
    // Ceilings directly above Elevator 3 with spikes
    { x: 3020, y: 190, widthTiles: 3 },
  ],
  // Ceiling Spikes mounted right above the moving elevators!
  spikes: [
    // Ceiling spikes above Elevator 1 (under ceiling platform at y: 240)
    { x: 630, y: 270, count: 3 },
    // Ceiling spikes above Elevator 2
    { x: 1830, y: 260, count: 3 },
    // Ceiling spikes above Elevator 3
    { x: 3030, y: 230, count: 3 },
    // Pit spikes below elevator shafts
    { x: 500, y: 680, count: 7 },
    { x: 1700, y: 680, count: 7 },
    { x: 2900, y: 680, count: 7 },
  ],
  coins: [
    { x: 260, y: 520 },
    { x: 650, y: 430 },
    { x: 830, y: 360 },
    { x: 980, y: 360 },
    { x: 1300, y: 490 },
    { x: 1500, y: 490 },
    { x: 1850, y: 430 },
    { x: 2030, y: 340 },
    { x: 2180, y: 340 },
    { x: 2500, y: 460 },
    { x: 2700, y: 460 },
    { x: 3050, y: 390 },
    { x: 3210, y: 300 },
    { x: 3450, y: 230 },
  ],
};
