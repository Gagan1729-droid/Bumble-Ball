// src/data/levels/types.ts

export interface GroundSpan {
  startX: number;
  endX: number;
  surfaceY: number;
}

export interface PlatformConfig {
  x: number;
  y: number;
  widthTiles?: number;
}

export interface SpikeConfig {
  x: number;
  y: number;
  count?: number;
}

export interface CoinConfig {
  x: number;
  y: number;
}

export interface SpringConfig {
  x: number;
  y: number;
}

export interface MovingPlatformConfig {
  x: number;
  y: number;
  widthTiles?: number;
  distanceX?: number;
  distanceY?: number;
  duration?: number;
}

export interface BreakableBlockConfig {
  x: number;
  y: number;
  widthTiles?: number;
}

export interface BouncerConfig {
  x: number;
  y: number;
  powerMultiplier?: number;
}

export interface MudZoneConfig {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface SwitchConfig {
  id: string;
  x: number;
  y: number;
  color?: number;
}

export interface GateConfig {
  id: string;
  x: number;
  y: number;
  width?: number;
  height?: number;
  color?: number;
}

export interface PatrolEnemyConfig {
  x: number;
  y: number;
  patrolDistance: number;
  speed?: number;
}

export interface CrusherConfig {
  x: number;
  y: number;
  dropDistance: number;
  upWait?: number;
  dropDuration?: number;
  downWait?: number;
  riseDuration?: number;
}

export interface WindZoneConfig {
  x: number;
  y: number;
  width: number;
  height: number;
  forceY?: number;
}

export interface CurvedTerrainConfig {
  startX: number;
  startY: number;
  length: number;
  amplitude: number;
  frequency: number;
  theme?: {
    grassColor?: number;
    grassHighlight?: number;
    dirtColor?: number;
    innerDirtColor?: number;
    bottomY?: number;
  };
}

export interface WaterZoneConfig {
  x: number;
  y: number;
  width: number;
  height: number;
  title?: string;
}

export interface MonsterMouthConfig {
  x: number;
  y: number;
  triggerWidth?: number;
  triggerHeight?: number;
}

export interface CheckpointConfig {
  triggerX?: number;
  triggerY?: number;
  spawn: { x: number; y: number };
}

export interface ILevelConfig {
  levelNumber: number;
  title: string;
  subtitle: string;
  worldWidth: number;
  worldHeight: number;
  spawnPoint: { x: number; y: number };
  portal: { x: number; y: number };
  checkpoints?: CheckpointConfig[];
  backgroundTheme?: {
    skyTint?: number;
    mountainTint?: number;
    treesTint?: number;
  };
  groundSpans: GroundSpan[];
  curvedTerrains?: CurvedTerrainConfig[];
  waterZones?: WaterZoneConfig[];
  monsterMouths?: MonsterMouthConfig[];
  platforms?: PlatformConfig[];
  spikes?: SpikeConfig[];
  coins?: CoinConfig[];
  springs?: SpringConfig[];
  movingPlatforms?: MovingPlatformConfig[];
  breakableBlocks?: BreakableBlockConfig[];
  bouncers?: BouncerConfig[];
  mudZones?: MudZoneConfig[];
  switches?: SwitchConfig[];
  gates?: GateConfig[];
  patrolEnemies?: PatrolEnemyConfig[];
  crushers?: CrusherConfig[];
  windZones?: WindZoneConfig[];
}
