// src/scenes/BootScene.ts

import Phaser from 'phaser';

export class BootScene extends Phaser.Scene {
  constructor() {
    super('BootScene');
  }

  public preload(): void {
    // Generate all game placeholder assets programmatically via Phaser.GameObjects.Graphics
    this.createPlayerTexture();
    this.createTerrainTextures();
    this.createSpikeTexture();
    this.createCoinTexture();
    this.createPortalTexture();
    this.createSpringTexture();
    this.createParticleTextures();
    this.createUIHeartTextures();
    this.createParallaxTextures();
  }

  public create(): void {
    // Transition smoothly to the main menu screen
    this.scene.start('MenuScene');
  }

  /**
   * Generates the iconic 3D glossy red ball with specular highlights.
   */
  private createPlayerTexture(): void {
    const g = this.make.graphics({ x: 0, y: 0 });
    const size = 32;
    const r = size / 2;

    // Darker shadow base
    g.fillStyle(0x881337, 1);
    g.fillCircle(r, r, r);

    // Primary rich red body
    g.fillStyle(0xe11d48, 1);
    g.fillCircle(r - 1, r - 1, r - 2);

    // Midtone warm orange-red highlight
    g.fillStyle(0xf43f5e, 1);
    g.fillCircle(r - 3, r - 3, r - 6);

    // Soft glow
    g.fillStyle(0xfb7185, 0.7);
    g.fillCircle(r - 5, r - 5, 5);

    // Bright specular glint
    g.fillStyle(0xffffff, 0.95);
    g.fillCircle(r - 6, r - 6, 2.5);

    g.generateTexture('player', size, size);
    g.destroy();
  }

  /**
   * Generates grass-topped ground and underground soil blocks.
   */
  private createTerrainTextures(): void {
    const size = 48;

    // 1. Surface Grass Block
    const g = this.make.graphics({ x: 0, y: 0 });
    
    // Rich soil body
    g.fillStyle(0x78350f, 1);
    g.fillRect(0, 0, size, size);

    // Soil texture specks
    g.fillStyle(0x451a03, 0.6);
    g.fillRect(8, 22, 6, 6);
    g.fillRect(26, 32, 8, 5);
    g.fillRect(14, 38, 5, 5);
    g.fillRect(36, 18, 5, 6);

    // Soil highlights (little pebbles)
    g.fillStyle(0xa16207, 0.5);
    g.fillRect(18, 26, 4, 3);
    g.fillRect(32, 28, 5, 4);

    // Grass turf layer
    g.fillStyle(0x15803d, 1);
    g.fillRect(0, 0, size, 14);

    // Bright emerald grass blades
    g.fillStyle(0x22c55e, 1);
    for (let x = 0; x < size; x += 6) {
      g.fillTriangle(x, 14, x + 3, 4, x + 6, 14);
    }
    // Top highlight rim
    g.fillStyle(0x4ade80, 0.9);
    g.fillRect(0, 0, size, 3);

    g.generateTexture('ground', size, size);
    g.clear();

    // 2. Underground Deep Soil Block
    g.fillStyle(0x542306, 1);
    g.fillRect(0, 0, size, size);
    g.fillStyle(0x381704, 0.7);
    g.fillRect(10, 10, 8, 8);
    g.fillRect(28, 24, 10, 8);
    g.fillRect(6, 30, 8, 8);
    g.fillStyle(0x78350f, 0.4);
    g.fillRect(22, 8, 6, 5);
    g.fillRect(16, 22, 6, 5);
    g.fillRect(36, 36, 7, 5);

    g.generateTexture('ground-inner', size, size);
    g.clear();

    // 3. Floating Wooden/Stone Platform
    const pw = 48;
    const ph = 20;
    g.fillStyle(0x1e293b, 1);
    g.fillRoundedRect(0, 0, pw, ph, 4);
    g.fillStyle(0x334155, 1);
    g.fillRoundedRect(1, 1, pw - 2, ph - 2, 4);
    g.fillStyle(0x475569, 1);
    g.fillRect(2, 2, pw - 4, 3);
    // Rivets
    g.fillStyle(0x94a3b8, 1);
    g.fillCircle(6, ph / 2, 2);
    g.fillCircle(pw - 6, ph / 2, 2);

    g.generateTexture('platform', pw, ph);
    g.destroy();
  }

  /**
   * Generates razor-sharp metallic spikes with warning hazard tips.
   */
  private createSpikeTexture(): void {
    const size = 36;
    const g = this.make.graphics({ x: 0, y: 0 });

    // Baseplate
    g.fillStyle(0x334155, 1);
    g.fillRect(0, size - 4, size, 4);

    // 3 Razor Spikes
    const spikeWidth = size / 3;
    for (let i = 0; i < 3; i++) {
      const sx = i * spikeWidth;
      // Main steel blade
      g.fillStyle(0x94a3b8, 1);
      g.fillTriangle(sx, size - 4, sx + spikeWidth / 2, 2, sx + spikeWidth, size - 4);

      // Dark shadow side
      g.fillStyle(0x475569, 0.7);
      g.fillTriangle(sx + spikeWidth / 2, 2, sx + spikeWidth, size - 4, sx + spikeWidth / 2, size - 4);

      // Shiny highlight line
      g.fillStyle(0xf8fafc, 0.9);
      g.lineStyle(1, 0xffffff, 0.8);
      g.lineBetween(sx + spikeWidth / 2, 2, sx, size - 4);

      // Crimson warning tip
      g.fillStyle(0xe11d48, 1);
      g.fillTriangle(sx + spikeWidth * 0.3, 10, sx + spikeWidth / 2, 2, sx + spikeWidth * 0.7, 10);
    }

    g.generateTexture('spike', size, size);
    g.destroy();
  }

  /**
   * Generates gleaming golden coin with an embossed star.
   */
  private createCoinTexture(): void {
    const size = 28;
    const r = size / 2;
    const g = this.make.graphics({ x: 0, y: 0 });

    // Outer gold border
    g.fillStyle(0xd97706, 1);
    g.fillCircle(r, r, r);

    // Inner bright yellow face
    g.fillStyle(0xfbbf24, 1);
    g.fillCircle(r, r, r - 2);

    // Inner ring
    g.lineStyle(1, 0xf59e0b, 0.8);
    g.strokeCircle(r, r, r - 4);

    // Center star glint
    g.fillStyle(0xfffbeb, 1);
    g.fillTriangle(r, r - 6, r + 2, r, r, r + 6);
    g.fillTriangle(r, r - 6, r - 2, r, r, r + 6);
    g.fillTriangle(r - 6, r, r, r - 2, r + 6, r);
    g.fillTriangle(r - 6, r, r, r + 2, r + 6, r);

    // Specular highlight spot
    g.fillStyle(0xffffff, 0.9);
    g.fillCircle(r - 3, r - 3, 2);

    g.generateTexture('coin', size, size);
    g.destroy();
  }

  /**
   * Generates swirling vortex goal portal.
   */
  private createPortalTexture(): void {
    const w = 56;
    const h = 76;
    const cx = w / 2;
    const cy = h / 2;
    const g = this.make.graphics({ x: 0, y: 0 });

    // Outer mystical aura
    g.fillStyle(0x3b82f6, 0.25);
    g.fillEllipse(cx, cy, w, h);

    // Purple swirl ring
    g.fillStyle(0x8b5cf6, 0.65);
    g.fillEllipse(cx, cy, w - 8, h - 10);

    // Cyan energy stream
    g.fillStyle(0x06b6d4, 0.85);
    g.fillEllipse(cx, cy, w - 18, h - 22);

    // Brilliant white energetic core
    g.fillStyle(0xffffff, 1);
    g.fillEllipse(cx, cy, 12, 20);

    // Core star
    g.fillStyle(0xec4899, 0.9);
    g.fillCircle(cx, cy, 5);

    g.generateTexture('portal', w, h);
    g.destroy();
  }

  /**
   * Generates bouncy spring launcher pad.
   */
  private createSpringTexture(): void {
    const w = 36;
    const h = 24;
    const g = this.make.graphics({ x: 0, y: 0 });

    // Base plate
    g.fillStyle(0x334155, 1);
    g.fillRoundedRect(2, h - 6, w - 4, 6, 2);

    // Metallic zigzag spring coils
    g.lineStyle(3, 0xf59e0b, 1);
    g.beginPath();
    g.moveTo(8, h - 6);
    g.lineTo(28, h - 10);
    g.lineTo(8, h - 14);
    g.lineTo(28, h - 17);
    g.strokePath();

    // Top rubber bouncy launch plate
    g.fillStyle(0xe11d48, 1);
    g.fillRoundedRect(3, 1, w - 6, 7, 3);
    g.fillStyle(0xfb7185, 1);
    g.fillRect(5, 2, w - 10, 2);

    g.generateTexture('spring', w, h);
    g.destroy();
  }

  /**
   * Generates dust and sparkle particles.
   */
  private createParticleTextures(): void {
    // 1. Dust particle
    const g = this.make.graphics({ x: 0, y: 0 });
    g.fillStyle(0xe2e8f0, 1);
    g.fillCircle(4, 4, 4);
    g.generateTexture('dust', 8, 8);
    g.clear();

    // 2. Sparkle particle
    const s = 10;
    const hs = s / 2;
    g.fillStyle(0xfde047, 1);
    g.fillTriangle(hs, 0, hs + 2, hs, hs, s);
    g.fillTriangle(hs, 0, hs - 2, hs, hs, s);
    g.fillTriangle(0, hs, hs, hs - 2, s, hs);
    g.fillTriangle(0, hs, hs, hs + 2, s, hs);
    g.fillStyle(0xffffff, 1);
    g.fillCircle(hs, hs, 1.5);
    g.generateTexture('sparkle', s, s);
    g.destroy();
  }

  /**
   * Generates HUD heart icons for health display.
   */
  private createUIHeartTextures(): void {
    const size = 24;

    // Full Red Heart
    const g = this.make.graphics({ x: 0, y: 0 });
    g.fillStyle(0xe11d48, 1);
    this.drawHeartShape(g, 12, 12, 10);
    g.fillStyle(0xffffff, 0.7);
    g.fillCircle(7, 8, 2);
    g.generateTexture('heart-full', size, size);
    g.clear();

    // Empty Heart (Damaged)
    g.fillStyle(0x334155, 0.6);
    this.drawHeartShape(g, 12, 12, 10);
    g.lineStyle(1.5, 0x64748b, 0.8);
    this.strokeHeartShape(g, 12, 12, 10);
    g.generateTexture('heart-empty', size, size);
    g.destroy();
  }

  private drawHeartShape(g: Phaser.GameObjects.Graphics, x: number, y: number, r: number): void {
    g.fillCircle(x - r / 2, y - r / 3, r / 2);
    g.fillCircle(x + r / 2, y - r / 3, r / 2);
    g.fillTriangle(x - r, y - r / 5, x + r, y - r / 5, x, y + r);
  }

  private strokeHeartShape(g: Phaser.GameObjects.Graphics, x: number, y: number, r: number): void {
    g.strokeCircle(x - r / 2, y - r / 3, r / 2);
    g.strokeCircle(x + r / 2, y - r / 3, r / 2);
  }

  /**
   * Generates rich gradient sky and parallax background layers.
   */
  private createParallaxTextures(): void {
    const w = 800;

    // 1. Sky Gradient Backdrop
    const hSky = 600;
    const gSky = this.make.graphics({ x: 0, y: 0 });
    for (let y = 0; y < hSky; y += 4) {
      const ratio = y / hSky;
      // Sky blue to gentle warm cyan
      const r = Math.round(14 + ratio * 20);
      const gr = Math.round(116 + ratio * 80);
      const b = Math.round(214 + ratio * 35);
      const color = (r << 16) | (gr << 8) | b;
      gSky.fillStyle(color, 1);
      gSky.fillRect(0, y, w, 4);
    }
    gSky.generateTexture('bg-sky', w, hSky);
    gSky.destroy();

    // 2. Distant Mountains (Parallax Layer 1)
    const hMountains = 320;
    const gMtn = this.make.graphics({ x: 0, y: 0 });
    gMtn.fillStyle(0x1e3a8a, 0.45); // Deep hazy blue mountain
    gMtn.beginPath();
    gMtn.moveTo(0, hMountains);
    gMtn.lineTo(0, 160);
    gMtn.lineTo(120, 90);
    gMtn.lineTo(260, 190);
    gMtn.lineTo(390, 70);
    gMtn.lineTo(540, 180);
    gMtn.lineTo(680, 80);
    gMtn.lineTo(800, 150);
    gMtn.lineTo(800, hMountains);
    gMtn.closePath();
    gMtn.fillPath();

    // Secondary softer ridge
    gMtn.fillStyle(0x2563eb, 0.35);
    gMtn.beginPath();
    gMtn.moveTo(0, hMountains);
    gMtn.lineTo(0, 200);
    gMtn.lineTo(180, 130);
    gMtn.lineTo(320, 210);
    gMtn.lineTo(480, 140);
    gMtn.lineTo(620, 220);
    gMtn.lineTo(800, 160);
    gMtn.lineTo(800, hMountains);
    gMtn.closePath();
    gMtn.fillPath();

    gMtn.generateTexture('bg-mountains', w, hMountains);
    gMtn.destroy();

    // 3. Middleground Forest & Rolling Hills (Parallax Layer 2)
    const hTrees = 260;
    const gTree = this.make.graphics({ x: 0, y: 0 });
    gTree.fillStyle(0x065f46, 0.65); // Forest green
    gTree.beginPath();
    gTree.moveTo(0, hTrees);
    gTree.lineTo(0, 120);
    gTree.lineTo(100, 80);
    gTree.lineTo(220, 130);
    gTree.lineTo(360, 90);
    gTree.lineTo(500, 140);
    gTree.lineTo(640, 70);
    gTree.lineTo(760, 110);
    gTree.lineTo(800, 80);
    gTree.lineTo(800, hTrees);
    gTree.closePath();
    gTree.fillPath();

    // Stylized pine tree silhouettes along the ridge
    gTree.fillStyle(0x047857, 0.85);
    const treeX = [40, 110, 170, 280, 340, 420, 530, 610, 700, 760];
    treeX.forEach((tx) => {
      const ty = 80 + Math.sin(tx) * 20;
      gTree.fillTriangle(tx, ty, tx - 14, ty + 40, tx + 14, ty + 40);
      gTree.fillTriangle(tx, ty + 15, tx - 18, ty + 65, tx + 18, ty + 65);
    });

    gTree.generateTexture('bg-trees', w, hTrees);
    gTree.destroy();

    // 4. Stylized Fluffy Cloud
    const gCloud = this.make.graphics({ x: 0, y: 0 });
    gCloud.fillStyle(0xffffff, 0.85);
    gCloud.fillCircle(30, 30, 20);
    gCloud.fillCircle(55, 20, 24);
    gCloud.fillCircle(85, 24, 20);
    gCloud.fillCircle(105, 30, 16);
    gCloud.fillRect(25, 30, 80, 15);
    gCloud.generateTexture('cloud', 130, 55);
    gCloud.destroy();
  }
}
