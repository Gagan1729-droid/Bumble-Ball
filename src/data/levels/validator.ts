// src/data/levels/validator.ts

import { ILevelConfig } from './types';
import { GAME_CONFIG } from '../../config/gameConstants';

export interface LevelValidationReport {
  levelNumber: number;
  title: string;
  isValid: boolean;
  warnings: string[];
  metrics: {
    totalEntities: number;
    hasCheckpoints: boolean;
    portalReachable: boolean;
    mudPitsEscapable: boolean;
  };
}

/**
 * Validates level design geometry against player physics limits:
 * - Normal max jump height: ~105px (safe threshold: 80px)
 * - Mud max jump height: ~38px
 * - Normal flat jump horizontal reach: ~200px
 */
export function validateLevel(config: ILevelConfig): LevelValidationReport {
  const warnings: string[] = [];

  // 1. Verify Mud Basin Escapability
  let mudPitsEscapable = true;
  if (config.mudZones && config.mudZones.length > 0) {
    config.mudZones.forEach((mz, idx) => {
      const mzLeft = mz.x - mz.width / 2;
      const mzRight = mz.x + mz.width / 2;

      // Check if there is an escape spring, low stepping stone, or natural low bank to hop out
      const hasSpring = config.springs?.some(
        (sp) => sp.x >= mzLeft - 30 && sp.x <= mzRight + 30
      );
      const hasBouncer = config.bouncers?.some(
        (bc) => bc.x >= mzLeft - 30 && bc.x <= mzRight + 30
      );
      const hasLowPlatform = config.platforms?.some(
        (p) => p.x >= mzLeft && p.x <= mzRight && p.y >= mz.y - 45
      );
      const mudTop = mz.y - mz.height / 2;
      const hasLowBank = config.groundSpans.some(
        (span) =>
          (Math.abs(span.endX - mzLeft) <= 100 || Math.abs(span.startX - mzRight) <= 100) &&
          Math.abs(span.surfaceY - mudTop) <= 35 // Max jump in mud is ~38px, so <=35px is hop-able
      );

      if (!hasSpring && !hasBouncer && !hasLowPlatform && !hasLowBank) {
        warnings.push(
          `Mud zone ${idx + 1} at x:${mz.x} lacks an escape spring, low stepping stone, or low bank.`
        );
        mudPitsEscapable = false;
      }
    });
  }

  // 2. Check Ground Span Cliff Steps
  for (let i = 0; i < config.groundSpans.length - 1; i++) {
    const cur = config.groundSpans[i];
    const next = config.groundSpans[i + 1];

    if (Math.abs(cur.endX - next.startX) <= 48) {
      const stepUp = cur.surfaceY - next.surfaceY; // Positive = going up
      if (stepUp > 80) {
        // Needs a stepping platform, spring, bouncer, updraft, or water zone to ascend
        const hasBridgingPlatform = config.platforms?.some(
          (p) => Math.abs(p.x - next.startX) <= 160 && p.y > next.surfaceY && p.y < cur.surfaceY
        );
        const hasSpring = config.springs?.some(
          (s) => Math.abs(s.x - next.startX) <= 120
        );
        const hasBouncer = config.bouncers?.some(
          (b) => Math.abs(b.x - next.startX) <= 240
        );
        const hasWindZone = config.windZones?.some(
          (w) => Math.abs(w.x - next.startX) <= 200 && (w.forceY ?? 0) < -500
        );
        const hasWaterZone = config.waterZones?.some(
          (wz) => Math.abs(wz.x - next.startX) <= wz.width / 2 + 100
        );

        if (!hasBridgingPlatform && !hasSpring && !hasBouncer && !hasWindZone && !hasWaterZone) {
          warnings.push(
            `High vertical ledge (${stepUp}px) between x:${cur.endX} and x:${next.startX} without intermediate stepping platform, spring, bouncer, or updraft.`
          );
        }
      }
    }
  }

  // 3. Portal Reachability
  const finalGround = config.groundSpans[config.groundSpans.length - 1];
  const portalDistY = finalGround ? Math.abs(finalGround.surfaceY - config.portal.y) : 0;
  const portalReachable =
    portalDistY <= 120 ||
    (config.platforms?.some((p) => Math.abs(p.x - config.portal.x) <= 220 && Math.abs(p.y - config.portal.y) <= 120) ?? false) ||
    (config.bouncers?.some((b) => Math.abs(b.x - config.portal.x) <= 300) ?? false) ||
    (config.windZones?.some((w) => Math.abs(w.x - config.portal.x) <= 450) ?? false) ||
    (config.waterZones?.some((wz) => Math.abs(wz.x - config.portal.x) <= wz.width / 2 + 100) ?? false);

  if (!portalReachable) {
    warnings.push(`Portal at x:${config.portal.x}, y:${config.portal.y} is too high above ground.`);
  }

  const totalEntities =
    (config.platforms?.length || 0) +
    (config.curvedTerrains?.length || 0) +
    (config.waterZones?.length || 0) +
    (config.monsterMouths?.length || 0) +
    (config.movingPlatforms?.length || 0) +
    (config.breakableBlocks?.length || 0) +
    (config.bouncers?.length || 0) +
    (config.springs?.length || 0) +
    (config.coins?.length || 0) +
    (config.spikes?.length || 0);

  return {
    levelNumber: config.levelNumber,
    title: config.title,
    isValid: warnings.length === 0,
    warnings,
    metrics: {
      totalEntities,
      hasCheckpoints: (config.checkpoints?.length || 0) > 0,
      portalReachable,
      mudPitsEscapable,
    },
  };
}

/**
 * Runs validation over all levels and returns a summary report.
 */
export function validateAllLevels(levels: ILevelConfig[]): LevelValidationReport[] {
  return levels.map(validateLevel);
}
