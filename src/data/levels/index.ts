// src/data/levels/index.ts

export * from './types';
export * from './validator';

import { ILevelConfig } from './types';
import { level1 } from './level1';
import { level2 } from './level2';
import { level3 } from './level3';
import { level4 } from './level4';
import { level5 } from './level5';
import { level6 } from './level6';
import { level7 } from './level7';
import { level8 } from './level8';
import { level9 } from './level9';
import { level10 } from './level10';
import { level11 } from './level11';
import { level12 } from './level12';

export {
  level1,
  level2,
  level3,
  level4,
  level5,
  level6,
  level7,
  level8,
  level9,
  level10,
  level11,
  level12,
};

export const LEVELS: ILevelConfig[] = [
  level1,
  level2,
  level3,
  level4,
  level5,
  level6,
  level7,
  level8,
  level9,
  level10,
  level11,
  level12,
];

export function getLevelConfig(levelNumber: number): ILevelConfig {
  const found = LEVELS.find((l) => l.levelNumber === levelNumber);
  return found || LEVELS[0];
}

export function getTotalLevels(): number {
  return LEVELS.length;
}

export function hasNextLevel(currentLevelNumber: number): boolean {
  return currentLevelNumber < LEVELS.length;
}
