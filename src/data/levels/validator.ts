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

      // Check if there is an escape spring or low stepping stone in this mud zone
      const hasSpring = config.springs?.some(
        (sp) => sp.x >= mzLeft - 30 && sp.x <= mzRight + 30
      );
      const hasBouncer = config.bouncers?.some(
        (bc) => bc.x >= mzLeft - 30 && bc.x <= mzRight + 30
      );
      const hasLowPlatform = config.platforms?.some(
        (p) => p.x >= mzLeft && p.x <= mzRight && p.y >= mz.y - 45
      );

      if (!hasSpring && !hasBouncer && !hasLowPlatform) {
        warnings.push(
          `Mud zone ${idx + 1} at x:${mz.x} lacks an emergency escape spring or low stepping stone.`
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
        // Needs a stepping platform or spring in front of the ledge
        const hasBridgingPlatform = config.platforms?.some(
          (p) => Math.abs(p.x - next.startX) <= 120 && p.y > next.surfaceY && p.y < cur.surfaceY
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

        if (!hasBridgingPlatform && !hasSpring && !hasBouncer && !hasWindZone) {
          warnings.push(
            `High vertical ledge (${stepUp}px) between x:${cur.endX} and x:${next.startX} without intermediate stepping platform, spring, bouncer, or updraft.`
          );
        }
      }
    }
  }

  // 3. Portal Reachability
  const finalGround = config.groundSpans[config.groundSpans.length - 1];
  const portalDistY = Math.abs(finalGround.surfaceY - config.portal.y);
  const portalReachable = portalDistY <= 120 || (config.platforms?.some((p) => Math.abs(p.x - config.portal.x) <= 180 && Math.abs(p.y - config.portal.y) <= 80) ?? false);

  if (!portalReachable) {
    warnings.push(`Portal at x:${config.portal.x}, y:${config.portal.y} is too high above ground.`);
  }

  const totalEntities =
    (config.platforms?.length || 0) +
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
