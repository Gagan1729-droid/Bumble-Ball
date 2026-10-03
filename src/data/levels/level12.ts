// src/data/levels/level12.ts
import { ILevelConfig } from './types';

export const level12: ILevelConfig = {
  levelNumber: 12,
  title: 'The Final Ascent',
  subtitle: 'The Grand Climax of Bounce Tales',
  worldWidth: 4600,
  worldHeight: 1200,
  spawnPoint: { x: 140, y: 1040 },
  portal: { x: 4320, y: 190 }, // At the absolute stratospheric apex of the volcanic wind blast!
  checkpoints: [
    { triggerX: 1600, spawn: { x: 1700, y: 980 } },
    { triggerX: 3000, spawn: { x: 3100, y: 920 } },
  ],
  backgroundTheme: { skyTint: 0x450a0a, mountainTint: 0x991b1b, treesTint: 0x7f1d1d },
  groundSpans: [
    // Phase 1: Wavy speed-run meadow launch base
    { startX: 0, endX: 350, surfaceY: 1100 },
    // Phase 2: Beast's gullet landing shelf
    { startX: 1650, endX: 2000, surfaceY: 1060 },
    // Phase 3: Volcanic seabed beneath subterranean lake
    { startX: 2000, endX: 3200, surfaceY: 1160 },
    // Phase 4: Volcanic eruption launch pedestal
    { startX: 3200, endX: 3600, surfaceY: 960 },
    // Phase 5: Sky summit clouds around the Golden Portal
    { startX: 4200, endX: 4440, surfaceY: 260 },
  ],
  // 1. Wavy speed-run roller hills leading into the Monster Mouth
  curvedTerrains: [
    {
      startX: 300,
      startY: 1060,
      length: 1200,
      amplitude: 65,
      frequency: 0.013,
      theme: { grassColor: 0x15803d, dirtColor: 0x78350f, bottomY: 1300 },
    },
  ],
  // 2. Giant Monster Maw swallowing Bumble into the deep subterranean lake
  monsterMouths: [
    { x: 1550, y: 980, triggerWidth: 200, triggerHeight: 220 },
  ],
  // Bouncer before monster mouth to rocket Bumble into the jaws
  bouncers: [
    { x: 1400, y: 1056, powerMultiplier: 2.4 },
  ],
  // 3. Subterranean Volcanic Lake WaterZone
  waterZones: [
    {
      x: 2600,
      y: 980,
      width: 1200,
      height: 380,
      title: 'Volcanic Sunken Lake',
    },
  ],
  // Submerged valve puzzle: Switch underwater opens the Volcanic Chimney Gate!
  switches: [
    { id: 'volcanoValve', x: 2550, y: 1150 },
  ],
  gates: [
    { id: 'volcanoValve', x: 3450, y: 880, height: 160 },
  ],
  // Underwater platforms and volcanic rock formations
  platforms: [
    { x: 2200, y: 960, widthTiles: 2 },
    { x: 2800, y: 980, widthTiles: 2 },
    { x: 3150, y: 1060, widthTiles: 2 }, // Stepped rock to ascend out of volcanic lake
    // Volcanic chimney vertical containment walls
    { x: 3750, y: 850, widthTiles: 1 },
    { x: 3750, y: 650, widthTiles: 1 },
    { x: 3750, y: 450, widthTiles: 1 },
    { x: 4050, y: 850, widthTiles: 1 },
    { x: 4050, y: 650, widthTiles: 1 },
    { x: 4050, y: 450, widthTiles: 1 },
  ],
  // 4. Massive high-power Volcanic Eruption WindZone blasting Bumble straight into the clouds!
  windZones: [
    {
      x: 3900,
      y: 650,
      width: 260,
      height: 750,
      forceY: -2100, // Supercharged geothermal blast!
    },
  ],
  spikes: [
    // Speed run valley hazard
    { x: 780, y: 1125, count: 2 },
    // Volcanic lake seabed hazards
    { x: 2350, y: 1160, count: 3 },
    { x: 2900, y: 1160, count: 3 },
    // Volcanic chimney internal spike hazards (weave through during blast)
    { x: 3800, y: 650, count: 2 },
    { x: 4000, y: 450, count: 2 },
  ],
  coins: [
    { x: 240, y: 1040 },
    { x: 550, y: 980 },
    { x: 900, y: 980 },
    { x: 1250, y: 980 },
    { x: 1550, y: 920 }, // Inside jaws
    { x: 1850, y: 1000 },
    { x: 2200, y: 900 },
    { x: 2550, y: 1080 }, // Above underwater switch
    { x: 2800, y: 920 },
    { x: 3300, y: 900 },
    { x: 3600, y: 900 },
    // Volcanic ascension trail into the stratosphere
    { x: 3900, y: 800 },
    { x: 3900, y: 600 },
    { x: 3900, y: 400 },
    { x: 3900, y: 220 },
    // Golden portal pedestal
    { x: 4120, y: 180 },
    { x: 4320, y: 150 },
  ],
};
