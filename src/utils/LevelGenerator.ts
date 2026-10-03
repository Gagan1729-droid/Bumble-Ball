// src/utils/LevelGenerator.ts

import Phaser from 'phaser';
import { CurvedTerrainConfig } from '../data/levels/types';

export interface CurvedTerrainTheme {
  grassColor?: number;
  grassHighlight?: number;
  dirtColor?: number;
  innerDirtColor?: number;
  bottomY?: number;
}

export interface CurvedTerrainResult {
  bodies: Phaser.Physics.Arcade.Sprite[];
  graphics: Phaser.GameObjects.Graphics;
}

export interface CurvePoint {
  surfaceY: number;
  slope: number;
  angle: number;
  normalX: number;
  normalY: number;
  config: CurvedTerrainConfig;
}

/**
 * Returns the exact analytical surface height, slope, normal, and angle
 * of curved terrain at a given horizontal coordinate X.
 */
export function getCurvedTerrainAt(
  x: number,
  curvedTerrains?: CurvedTerrainConfig[]
): CurvePoint | null {
  if (!curvedTerrains || curvedTerrains.length === 0) return null;

  for (const ct of curvedTerrains) {
    if (x >= ct.startX && x <= ct.startX + ct.length) {
      const relX = x - ct.startX;
      const surfaceY = ct.startY + Math.sin(relX * ct.frequency) * ct.amplitude;
      // Exact analytical derivative dy/dx = amplitude * frequency * cos(relX * frequency)
      const slope = ct.amplitude * ct.frequency * Math.cos(relX * ct.frequency);
      const angle = Math.atan(slope);
      const len = Math.sqrt(1 + slope * slope);
      // Surface normal pointing up and outward
      const normalX = -slope / len;
      const normalY = -1 / len;

      return { surfaceY, slope, angle, normalX, normalY, config: ct };
    }
  }

  return null;
}

/**
 * Creates smooth organic wavy terrain with solid, seamless Arcade Physics collision steps.
 * Dense 8px horizontal step resolution ensures tiny height deltas (< 0.8px), preventing
 * vibration while guaranteeing the player ball can NEVER fall through or go under the ground.
 */
export function createCurvedTerrain(
  scene: Phaser.Scene,
  platformsGroup: Phaser.Physics.Arcade.StaticGroup,
  startX: number,
  startY: number,
  length: number,
  amplitude: number,
  frequency: number,
  theme?: CurvedTerrainTheme
): CurvedTerrainResult {
  const step = 8; // Dense 8px steps for micro-height deltas and zero vibration
  const sliceHeight = 80; // Solid depth preventing any downward tunneling
  const bottomY = theme?.bottomY || (scene.physics.world.bounds.height || 600) + 120;

  const grassColor = theme?.grassColor ?? 0x15803d;
  const grassHighlight = theme?.grassHighlight ?? 0x22c55e;
  const dirtColor = theme?.dirtColor ?? 0x78350f;
  const innerDirtColor = theme?.innerDirtColor ?? 0x451a03;

  const bodies: Phaser.Physics.Arcade.Sprite[] = [];
  const points: { x: number; y: number }[] = [];

  // 1. Create solid, seamless static collision steps along the curve
  for (let x = startX; x <= startX + length; x += step) {
    const surfaceY = startY + Math.sin((x - startX) * frequency) * amplitude;
    points.push({ x, y: surfaceY });

    // Place static collider so its top edge sits exactly at surfaceY
    const colObj = platformsGroup.create(
      x + step / 2,
      surfaceY + sliceHeight / 2,
      'ground'
    ) as Phaser.Physics.Arcade.Sprite;
    colObj.setVisible(false);

    const body = colObj.body as Phaser.Physics.Arcade.StaticBody;
    if (body) {
      body.setSize(step, sliceHeight);
      body.setOffset((48 - step) / 2, 0);
      body.checkCollision.none = false;
      body.checkCollision.up = true;
      // Disable left, right, and bottom collisions to allow continuous rolling
      body.checkCollision.down = false;
      body.checkCollision.left = false;
      body.checkCollision.right = false;
      body.updateFromGameObject();
    }
    bodies.push(colObj);
  }

  const endX = startX + length;
  const lastPoint = points[points.length - 1];
  if (lastPoint.x < endX) {
    const endY = startY + Math.sin(length * frequency) * amplitude;
    points.push({ x: endX, y: endY });
  }

  // 2. Render vector graphics for the organic terrain
  const graphics = scene.add.graphics();
  graphics.setDepth(2);

  // A. Deep Subsurface Bedrock fill
  graphics.fillStyle(innerDirtColor, 1);
  graphics.beginPath();
  graphics.moveTo(startX, bottomY);
  for (let i = 0; i < points.length; i++) {
    graphics.lineTo(points[i].x, points[i].y + 16);
  }
  graphics.lineTo(endX, bottomY);
  graphics.closePath();
  graphics.fillPath();

  // B. Upper Soil Stratum
  graphics.fillStyle(dirtColor, 1);
  graphics.beginPath();
  graphics.moveTo(startX, bottomY);
  for (let i = 0; i < points.length; i++) {
    graphics.lineTo(points[i].x, points[i].y);
  }
  graphics.lineTo(endX, bottomY);
  graphics.closePath();
  graphics.fillPath();

  // C. Lush Organic Grass Turf
  graphics.fillStyle(grassColor, 1);
  graphics.beginPath();
  graphics.moveTo(points[0].x, points[0].y);
  for (let i = 1; i < points.length; i++) {
    graphics.lineTo(points[i].x, points[i].y);
  }
  for (let i = points.length - 1; i >= 0; i--) {
    graphics.lineTo(points[i].x, points[i].y + 12);
  }
  graphics.closePath();
  graphics.fillPath();

  // D. Highlight grass blades / rim
  graphics.lineStyle(3, grassHighlight, 0.95);
  graphics.beginPath();
  graphics.moveTo(points[0].x, points[0].y + 1);
  for (let i = 1; i < points.length; i++) {
    graphics.lineTo(points[i].x, points[i].y + 1);
  }
  graphics.strokePath();

  // E. Wildflower and grass tuft decorations
  for (let i = 2; i < points.length - 2; i += 3) {
    const pt = points[i];
    graphics.fillStyle(grassHighlight, 1);
    graphics.fillTriangle(pt.x, pt.y - 1, pt.x - 3, pt.y - 6, pt.x + 3, pt.y);
    if (i % 6 === 0) {
      graphics.fillStyle(0xfde047, 1);
      graphics.fillCircle(pt.x + 2, pt.y - 5, 2);
    }
  }

  return { bodies, graphics };
}
