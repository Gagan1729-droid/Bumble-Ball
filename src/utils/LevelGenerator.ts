// src/utils/LevelGenerator.ts

import Phaser from 'phaser';
import { CurvedTerrainConfig } from '../data/levels/types';
import { WaterZone } from '../objects/WaterZone';

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

export interface WaterPoolResult {
  waterZone: WaterZone;
  graphics: Phaser.GameObjects.Graphics;
  bodies: Phaser.Physics.Arcade.Sprite[];
}

/**
 * Builds an enclosed sunken water pool with airtight "U"-shaped surrounding terrain
 * (Left Wall, Right Wall, and Floor) and a perfectly aligned WaterZone.
 *
 * Math & Architecture:
 * - Left Wall: Drops down from surfaceY to surfaceY + poolDepth at [startX - wallThickness, startX].
 * - Right Wall: Drops down from surfaceY to surfaceY + poolDepth at [startX + poolWidth, startX + poolWidth + wallThickness].
 * - Floor: Connects the bottom of both walls at surfaceY + poolDepth, spanning from startX - wallThickness to startX + poolWidth + wallThickness.
 * - WaterZone: Placed inside [startX, startX + poolWidth] x [surfaceY, surfaceY + poolDepth].
 */
export function buildWaterPool(
  scene: Phaser.Scene,
  platformsGroup: Phaser.Physics.Arcade.StaticGroup,
  startX: number,
  surfaceY: number,
  poolWidth: number,
  poolDepth: number,
  title?: string
): WaterPoolResult {
  const wallThickness = 48; // 1 tile thickness for solid physical containment
  const floorThickness = 48;
  const bottomWorldY = (scene.physics.world.bounds.height || 700) + 120;
  const bodies: Phaser.Physics.Arcade.Sprite[] = [];

  // 1. LEFT WALL (Solid Static Arcade Physics Body)
  // Drops down from surfaceY to surfaceY + poolDepth
  const leftWall = platformsGroup.create(
    startX - wallThickness / 2,
    surfaceY + poolDepth / 2,
    'ground'
  ) as Phaser.Physics.Arcade.Sprite;
  leftWall.setVisible(false);
  const lwBody = leftWall.body as Phaser.Physics.Arcade.StaticBody;
  if (lwBody) {
    lwBody.setSize(wallThickness, poolDepth);
    lwBody.updateFromGameObject();
  }
  bodies.push(leftWall);

  // 2. RIGHT WALL (Solid Static Arcade Physics Body)
  // Placed at startX + poolWidth, dropping down identically
  const rightWall = platformsGroup.create(
    startX + poolWidth + wallThickness / 2,
    surfaceY + poolDepth / 2,
    'ground'
  ) as Phaser.Physics.Arcade.Sprite;
  rightWall.setVisible(false);
  const rwBody = rightWall.body as Phaser.Physics.Arcade.StaticBody;
  if (rwBody) {
    rwBody.setSize(wallThickness, poolDepth);
    rwBody.updateFromGameObject();
  }
  bodies.push(rightWall);

  // 3. BASIN FLOOR (Solid Static Arcade Physics Body)
  // Flat static platform connecting the bottom of both walls at surfaceY + poolDepth
  const totalFloorWidth = poolWidth + wallThickness * 2;
  const floor = platformsGroup.create(
    startX + poolWidth / 2,
    surfaceY + poolDepth + floorThickness / 2,
    'ground'
  ) as Phaser.Physics.Arcade.Sprite;
  floor.setVisible(false);
  const flBody = floor.body as Phaser.Physics.Arcade.StaticBody;
  if (flBody) {
    flBody.setSize(totalFloorWidth, floorThickness);
    flBody.updateFromGameObject();
  }
  bodies.push(floor);

  // 4. TERRAIN GRAPHICS (Subsurface slate rock, damp stone masonry, grass/stone lips)
  const g = scene.add.graphics();
  g.setDepth(2); // Render behind water (6) and player (10)

  const stoneColor = 0x334155; // Slate rock
  const darkStoneColor = 0x1e293b;
  const grassRimColor = 0x15803d;
  const grassHighlight = 0x22c55e;

  // Outer Bedrock Fill down to bottomWorldY
  g.fillStyle(darkStoneColor, 1);
  g.fillRect(startX - wallThickness, surfaceY, wallThickness, bottomWorldY - surfaceY);
  g.fillRect(startX + poolWidth, surfaceY, wallThickness, bottomWorldY - surfaceY);
  g.fillRect(startX - wallThickness, surfaceY + poolDepth, totalFloorWidth, bottomWorldY - (surfaceY + poolDepth));

  // Stone masonry / brick detailing along inner walls
  g.fillStyle(stoneColor, 1);
  g.fillRect(startX - wallThickness + 4, surfaceY, wallThickness - 4, poolDepth);
  g.fillRect(startX + poolWidth, surfaceY, wallThickness - 4, poolDepth);
  g.fillRect(startX, surfaceY + poolDepth, poolWidth, floorThickness);

  // Inner damp stone mortar lines
  g.lineStyle(2, 0x0f172a, 0.75);
  for (let y = surfaceY + 24; y < surfaceY + poolDepth; y += 32) {
    g.beginPath();
    g.moveTo(startX - wallThickness, y);
    g.lineTo(startX, y);
    g.moveTo(startX + poolWidth, y);
    g.lineTo(startX + poolWidth + wallThickness, y);
    g.strokePath();
  }

  // Ancient mossy submerged floor slabs
  g.fillStyle(0x047857, 0.4);
  for (let x = startX + 16; x < startX + poolWidth - 16; x += 64) {
    g.fillRect(x, surfaceY + poolDepth, 48, 6);
  }

  // Top Grass / Stone Lip on left ground edge (at surfaceY)
  g.fillStyle(grassRimColor, 1);
  g.fillRect(startX - wallThickness, surfaceY, wallThickness, 8);
  g.lineStyle(2, grassHighlight, 0.9);
  g.beginPath();
  g.moveTo(startX - wallThickness, surfaceY + 1);
  g.lineTo(startX, surfaceY + 1);
  g.strokePath();

  // Top Grass / Stone Lip on right ground edge (at surfaceY)
  g.fillStyle(grassRimColor, 1);
  g.fillRect(startX + poolWidth, surfaceY, wallThickness, 8);
  g.lineStyle(2, grassHighlight, 0.9);
  g.beginPath();
  g.moveTo(startX + poolWidth, surfaceY + 1);
  g.lineTo(startX + poolWidth + wallThickness, surfaceY + 1);
  g.strokePath();

  // 5. THE WATER ZONE (Instantiated precisely within [startX, surfaceY] x [poolWidth, poolDepth])
  const waterZone = new WaterZone(
    scene,
    startX,
    surfaceY,
    poolWidth,
    poolDepth,
    title
  );

  return { waterZone, graphics: g, bodies };
}
