// src/scenes/BootScene.ts

import Phaser from 'phaser';
import { PlatformManager } from '../platform/PlatformManager';

export class BootScene extends Phaser.Scene {
  constructor() {
    super('BootScene');
  }

  public preload(): void {
    const platform = PlatformManager.getInstance();

    // Hook into Phaser's internal asset loader progress event to sync with the platform loader
    this.load.on('progress', (value: number) => {
      const percentage = Math.floor(value * 100);
      platform.setLoadingProgress(percentage);
    });

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
    this.createMechanicTextures();
    this.createSnappingMonsterTextures();

    platform.setLoadingProgress(100);
  }

  public create(): void {
    this.dismissLoadingOverlay();

    // Multi-Platform Lifecycle: Transition to MenuScene only after platform gives ready signal
    PlatformManager.getInstance()
      .startGame()
      .then(() => {
        this.scene.start('MenuScene');
      })
      .catch((error: any) => {
        console.warn('Platform.startGame error, launching MenuScene fallback:', error);
        this.scene.start('MenuScene');
      });
  }

  private dismissLoadingOverlay(): void {
    if (typeof document !== 'undefined') {
      const overlay = document.getElementById('loading-overlay');
      if (overlay) {
        overlay.classList.add('fade-out');
        setTimeout(() => {
          overlay.remove();
        }, 380);
      }
    }
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

    // 3. Floating Wooden/Stone Platform (Generate native widths 1 to 6 tiles)
    for (let w = 1; w <= 6; w++) {
      const widthPx = w * 48;
      const gPlat = this.make.graphics({ x: 0, y: 0 });
      gPlat.fillStyle(0x1e293b, 1);
      gPlat.fillRoundedRect(0, 0, widthPx, 20, 4);
      gPlat.fillStyle(0x334155, 1);
      gPlat.fillRoundedRect(1, 1, widthPx - 2, 18, 4);
      gPlat.fillStyle(0x475569, 1);
      gPlat.fillRect(2, 2, widthPx - 4, 3);
      // Rivets along the bar
      gPlat.fillStyle(0x94a3b8, 1);
      for (let rx = 6; rx < widthPx; rx += 48) {
        gPlat.fillCircle(rx, 10, 2);
        if (rx + 36 < widthPx) gPlat.fillCircle(rx + 36, 10, 2);
      }
      gPlat.generateTexture(`platform-${w}`, widthPx, 20);
      if (w === 1) gPlat.generateTexture('platform', widthPx, 20);
      gPlat.destroy();
    }
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

  /**
   * Generates programmatic textures for all progressive mechanics (Levels 2 - 10).
   */
  private createMechanicTextures(): void {
    // 1. Moving Platforms (Generate native widths 1 to 6 tiles)
    for (let w = 1; w <= 6; w++) {
      const widthPx = w * 48;
      const ph = 20;
      const gMove = this.make.graphics({ x: 0, y: 0 });
      gMove.fillStyle(0x0f172a, 1);
      gMove.fillRoundedRect(0, 0, widthPx, ph, 4);
      gMove.fillStyle(0x1e3a8a, 1);
      gMove.fillRoundedRect(2, 2, widthPx - 4, ph - 4, 3);
      // Cyan top glow
      gMove.fillStyle(0x38bdf8, 1);
      gMove.fillRect(3, 2, widthPx - 6, 3);
      // Direction arrows on ends
      gMove.fillStyle(0x93c5fd, 0.9);
      gMove.fillTriangle(10, ph / 2, 16, ph / 2 - 4, 16, ph / 2 + 4);
      gMove.fillTriangle(widthPx - 10, ph / 2, widthPx - 16, ph / 2 - 4, widthPx - 16, ph / 2 + 4);
      gMove.generateTexture(`moving-platform-${w}`, widthPx, ph);
      if (w === 1) gMove.generateTexture('moving-platform', widthPx, ph);
      gMove.destroy();

      // 2. Breakable Block (Generate native widths 1 to 6 tiles)
      const bh = 24;
      const gBreak = this.make.graphics({ x: 0, y: 0 });
      gBreak.fillStyle(0x44403c, 1);
      gBreak.fillRoundedRect(0, 0, widthPx, bh, 3);
      gBreak.fillStyle(0x78716c, 1);
      gBreak.fillRoundedRect(2, 2, widthPx - 4, bh - 4, 2);
      gBreak.lineStyle(1.5, 0x292524, 0.95);
      gBreak.beginPath();
      for (let bx = 0; bx < widthPx; bx += 48) {
        gBreak.moveTo(bx + 8, 2);
        gBreak.lineTo(bx + 16, 12);
        gBreak.lineTo(bx + 24, 8);
        gBreak.lineTo(bx + 34, 18);
        gBreak.lineTo(bx + 42, 14);
        gBreak.moveTo(bx + 16, 12);
        gBreak.lineTo(bx + 14, 22);
      }
      gBreak.strokePath();
      gBreak.generateTexture(`breakable-block-${w}`, widthPx, bh);
      if (w === 1) gBreak.generateTexture('breakable-block', widthPx, bh);
      gBreak.destroy();
    }

    // 3. Bouncer Trampoline (High-power lime green launcher)
    const tw = 40;
    const th = 24;
    const gBounce = this.make.graphics({ x: 0, y: 0 });
    // Base plate
    gBounce.fillStyle(0x14532d, 1);
    gBounce.fillRoundedRect(2, th - 6, tw - 4, 6, 2);
    // Green high-power springs
    gBounce.lineStyle(3, 0x22c55e, 1);
    gBounce.beginPath();
    gBounce.moveTo(10, th - 6);
    gBounce.lineTo(20, th - 11);
    gBounce.lineTo(10, th - 16);
    gBounce.lineTo(30, th - 11);
    gBounce.lineTo(20, th - 16);
    gBounce.strokePath();
    // Top bouncy rubber launch plate
    gBounce.fillStyle(0x16a34a, 1);
    gBounce.fillRoundedRect(2, 1, tw - 4, 8, 3);
    gBounce.fillStyle(0x4ade80, 1);
    gBounce.fillRect(4, 2, tw - 8, 2);
    // Upward launch chevron
    gBounce.fillStyle(0xffffff, 0.9);
    gBounce.fillTriangle(tw / 2, 2, tw / 2 - 5, 7, tw / 2 + 5, 7);
    gBounce.generateTexture('bouncer', tw, th);
    gBounce.destroy();

    // 4. Mud Bubble Particle
    const gMud = this.make.graphics({ x: 0, y: 0 });
    gMud.fillStyle(0x78350f, 0.85);
    gMud.fillCircle(4, 4, 4);
    gMud.fillStyle(0xa16207, 0.6);
    gMud.fillCircle(3, 3, 2);
    gMud.generateTexture('mud-bubble', 8, 8);
    gMud.destroy();

    // 5. Switch (Unpressed: Red dome button)
    const sw = 32;
    const sh = 16;
    const gSwUp = this.make.graphics({ x: 0, y: 0 });
    gSwUp.fillStyle(0x334155, 1);
    gSwUp.fillRoundedRect(0, sh - 5, sw, 5, 2);
    gSwUp.fillStyle(0xef4444, 1);
    gSwUp.fillRoundedRect(6, 2, sw - 12, 10, 4);
    gSwUp.fillStyle(0xfca5a5, 0.9);
    gSwUp.fillCircle(sw / 2 - 2, 6, 2);
    gSwUp.generateTexture('switch-unpressed', sw, sh);
    gSwUp.destroy();

    // Switch (Pressed: Flattened green button)
    const gSwDown = this.make.graphics({ x: 0, y: 0 });
    gSwDown.fillStyle(0x334155, 1);
    gSwDown.fillRoundedRect(0, sh - 5, sw, 5, 2);
    gSwDown.fillStyle(0x10b981, 1);
    gSwDown.fillRoundedRect(5, sh - 7, sw - 10, 4, 2);
    gSwDown.fillStyle(0x6ee7b7, 1);
    gSwDown.fillRect(7, sh - 6, sw - 14, 2);
    gSwDown.generateTexture('switch-pressed', sw, sh);
    gSwDown.destroy();

    // 6. Security Gate (Heavy steel barrier with hazard bars)
    const gw = 32;
    const gh = 96;
    const gGate = this.make.graphics({ x: 0, y: 0 });
    gGate.fillStyle(0x1e293b, 1);
    gGate.fillRoundedRect(0, 0, gw, gh, 4);
    gGate.fillStyle(0x334155, 1);
    gGate.fillRoundedRect(2, 2, gw - 4, gh - 4, 3);
    // Vertical security bars
    gGate.fillStyle(0x64748b, 1);
    gGate.fillRect(6, 6, 4, gh - 12);
    gGate.fillRect(14, 6, 4, gh - 12);
    gGate.fillRect(22, 6, 4, gh - 12);
    // Central lock core
    gGate.fillStyle(0xef4444, 1);
    gGate.fillCircle(gw / 2, gh / 2, 7);
    gGate.fillStyle(0xffffff, 0.95);
    gGate.fillRect(gw / 2 - 2, gh / 2 - 4, 4, 4);
    gGate.fillRect(gw / 2 - 3, gh / 2, 6, 5);
    gGate.generateTexture('gate', gw, gh);
    gGate.destroy();

    // 7. Patrol Enemy (Spiked iron drone with glowing eye)
    const ew = 32;
    const eh = 32;
    const ecx = ew / 2;
    const ecy = eh / 2;
    const gPatrol = this.make.graphics({ x: 0, y: 0 });
    // 8 Razor spikes
    gPatrol.fillStyle(0x991b1b, 1);
    for (let a = 0; a < 8; a++) {
      const angle = (a * Math.PI) / 4;
      const sx = ecx + Math.cos(angle) * 14;
      const sy = ecy + Math.sin(angle) * 14;
      const tipX = ecx + Math.cos(angle) * 17;
      const tipY = ecy + Math.sin(angle) * 17;
      const perpX = -Math.sin(angle) * 4;
      const perpY = Math.cos(angle) * 4;
      gPatrol.fillTriangle(tipX, tipY, sx + perpX, sy + perpY, sx - perpX, sy - perpY);
    }
    // Main iron sphere
    gPatrol.fillStyle(0x1e293b, 1);
    gPatrol.fillCircle(ecx, ecy, 12);
    gPatrol.fillStyle(0x334155, 1);
    gPatrol.fillCircle(ecx - 1, ecy - 1, 10);
    // Glowing red robotic pupil
    gPatrol.fillStyle(0xef4444, 1);
    gPatrol.fillCircle(ecx, ecy, 4.5);
    gPatrol.fillStyle(0xffffff, 0.95);
    gPatrol.fillCircle(ecx - 1, ecy - 1, 1.5);
    gPatrol.generateTexture('patrol-enemy', ew, eh);
    gPatrol.destroy();

    // 8. Crusher Hazard (Industrial steel crusher with hazard warning stripes)
    const cw = 64;
    const ch = 48;
    const gCrush = this.make.graphics({ x: 0, y: 0 });
    gCrush.fillStyle(0x0f172a, 1);
    gCrush.fillRoundedRect(0, 0, cw, ch, 4);
    gCrush.fillStyle(0x334155, 1);
    gCrush.fillRect(3, 3, cw - 6, ch - 12);
    // Yellow/Black diagonal hazard stripes
    gCrush.fillStyle(0xeab308, 1);
    for (let x = 6; x < cw - 6; x += 14) {
      gCrush.fillTriangle(x, 6, x + 8, 6, x, 24);
      gCrush.fillTriangle(x + 8, 6, x + 8, 24, x, 24);
    }
    // Heavy teeth along bottom
    gCrush.fillStyle(0x94a3b8, 1);
    for (let tx = 4; tx < cw - 4; tx += 11) {
      gCrush.fillTriangle(tx + 5.5, ch, tx, ch - 8, tx + 11, ch - 8);
    }
    gCrush.generateTexture('crusher', cw, ch);
    gCrush.destroy();

    // 9. Wind Stream Particle (Elongated cyan air gust)
    const gWind = this.make.graphics({ x: 0, y: 0 });
    gWind.fillStyle(0x38bdf8, 0.7);
    gWind.fillRoundedRect(1, 0, 6, 16, 3);
    gWind.fillStyle(0xffffff, 0.85);
    gWind.fillRoundedRect(2, 2, 4, 10, 2);
    gWind.generateTexture('wind-particle', 8, 16);
    gWind.destroy();
  }

  /**
   * Generates procedural monster face assets:
   * - Upper head covering mouth to forehead with horns, brow, two menacing predator eyes, snout, and upper fangs.
   * - Lower jaw with upward fangs, gum plate, and armored spiky chin.
   */
  private createSnappingMonsterTextures(): void {
    const w = 120;
    const hUpper = 96;

    // 1. Upper Head & Face (Forehead, Horns, 2 Eyes, Snout, Upper Jaws)
    const gUpper = this.make.graphics({ x: 0, y: 0 });

    // Horns curving out and up
    gUpper.fillStyle(0x18181b, 1);
    // Left horn
    gUpper.fillTriangle(24, 44, 4, 10, 38, 30);
    gUpper.fillTriangle(4, 10, 0, 4, 12, 18);
    // Right horn
    gUpper.fillTriangle(96, 44, 116, 10, 82, 30);
    gUpper.fillTriangle(116, 10, 120, 4, 108, 18);
    // Horn highlights
    gUpper.fillStyle(0x3f3f46, 0.8);
    gUpper.fillRect(8, 14, 12, 4);
    gUpper.fillRect(100, 14, 12, 4);

    // Armored Monster Forehead & Skull Plate
    gUpper.fillStyle(0x450a0a, 1);
    gUpper.beginPath();
    gUpper.moveTo(22, 50);
    gUpper.lineTo(26, 26);
    gUpper.lineTo(46, 14);
    gUpper.lineTo(74, 14);
    gUpper.lineTo(94, 26);
    gUpper.lineTo(98, 50);
    gUpper.lineTo(108, 70);
    gUpper.lineTo(12, 70);
    gUpper.closePath();
    gUpper.fillPath();

    // Cranial ridges / bone plates
    gUpper.fillStyle(0x7f1d1d, 1);
    gUpper.fillRoundedRect(32, 18, 56, 16, 4);
    gUpper.fillStyle(0x991b1b, 0.7);
    gUpper.fillRoundedRect(38, 22, 44, 8, 3);

    // Deep Furrowed Brow Ridges (Angry V-shape glare)
    gUpper.fillStyle(0x2a040d, 1);
    gUpper.beginPath();
    gUpper.moveTo(20, 40);
    gUpper.lineTo(56, 48);
    gUpper.lineTo(56, 52);
    gUpper.lineTo(20, 46);
    gUpper.closePath();
    gUpper.fillPath();

    gUpper.beginPath();
    gUpper.moveTo(100, 40);
    gUpper.lineTo(64, 48);
    gUpper.lineTo(64, 52);
    gUpper.lineTo(100, 46);
    gUpper.closePath();
    gUpper.fillPath();

    // TWO MENACING PREDATOR EYES ON THE FOREHEAD
    const eyeY = 48;
    // Left Eye
    gUpper.fillStyle(0x1a0205, 1);
    gUpper.fillEllipse(38, eyeY, 20, 14); // Dark sunken socket
    gUpper.fillStyle(0xf59e0b, 1);
    gUpper.fillEllipse(38, eyeY, 15, 10); // Glowing amber sclera
    gUpper.fillStyle(0xfef08a, 0.9);
    gUpper.fillCircle(38, eyeY, 4); // Bright center glow
    gUpper.fillStyle(0x09090b, 1);
    gUpper.fillEllipse(38, eyeY, 3.5, 9); // Slit pupil
    gUpper.fillStyle(0xffffff, 0.95);
    gUpper.fillCircle(36, eyeY - 2, 1.8); // Specular gleam

    // Right Eye
    gUpper.fillStyle(0x1a0205, 1);
    gUpper.fillEllipse(82, eyeY, 20, 14); // Dark sunken socket
    gUpper.fillStyle(0xf59e0b, 1);
    gUpper.fillEllipse(82, eyeY, 15, 10); // Glowing amber sclera
    gUpper.fillStyle(0xfef08a, 0.9);
    gUpper.fillCircle(82, eyeY, 4); // Bright center glow
    gUpper.fillStyle(0x09090b, 1);
    gUpper.fillEllipse(82, eyeY, 3.5, 9); // Slit pupil
    gUpper.fillStyle(0xffffff, 0.95);
    gUpper.fillCircle(80, eyeY - 2, 1.8); // Specular gleam

    // Snout Bridge & Nostrils
    gUpper.fillStyle(0x7f1d1d, 1);
    gUpper.fillRoundedRect(48, 50, 24, 20, 4);
    // Two flared black nostrils
    gUpper.fillStyle(0x180507, 1);
    gUpper.fillEllipse(54, 64, 4.5, 3.5);
    gUpper.fillEllipse(66, 64, 4.5, 3.5);

    // Upper Jaw Gum Plate
    gUpper.fillStyle(0x991b1b, 1);
    gUpper.fillRoundedRect(14, 68, 92, 12, 4);
    gUpper.fillStyle(0x5b0612, 1);
    gUpper.fillRect(16, 68, 88, 3);

    // Upper Fangs (5 sharp ivory teeth pointing DOWNWARD, tips at Y = 96)
    const upperToothPositions = [22, 38, 60, 82, 98];
    const toothHalfW = 8;
    upperToothPositions.forEach((tx) => {
      // Fang shadow root
      gUpper.fillStyle(0xb45309, 0.6);
      gUpper.fillRect(tx - toothHalfW + 2, 74, (toothHalfW - 2) * 2, 6);

      // Sharp ivory tooth body
      gUpper.fillStyle(0xfef08a, 1);
      gUpper.fillTriangle(tx - toothHalfW, 76, tx, 96, tx + toothHalfW, 76);

      // Glistening white tip
      gUpper.fillStyle(0xffffff, 0.95);
      gUpper.fillTriangle(tx - 2.5, 88, tx, 96, tx + 2.5, 88);
    });

    gUpper.generateTexture('monster-head-upper', w, hUpper);
    gUpper.destroy();

    // 2. Lower Jaw & Armored Chin (Tips start at Y = 0)
    const hLower = 56;
    const gLower = this.make.graphics({ x: 0, y: 0 });

    // Lower Fangs (4 sharp ivory teeth pointing UPWARD from Y = 20 to Y = 0)
    const lowerToothPositions = [30, 50, 70, 90];
    lowerToothPositions.forEach((tx) => {
      // Fang shadow root
      gLower.fillStyle(0xb45309, 0.6);
      gLower.fillRect(tx - toothHalfW + 2, 14, (toothHalfW - 2) * 2, 6);

      // Sharp ivory tooth body
      gLower.fillStyle(0xfef08a, 1);
      gLower.fillTriangle(tx - toothHalfW, 20, tx, 0, tx + toothHalfW, 20);

      // Glistening white tip
      gLower.fillStyle(0xffffff, 0.95);
      gLower.fillTriangle(tx - 2.5, 8, tx, 0, tx + 2.5, 8);
    });

    // Lower Jaw Gum Plate
    gLower.fillStyle(0x991b1b, 1);
    gLower.fillRoundedRect(14, 16, 92, 12, 4);

    // Heavy Armored Chin Plate
    gLower.fillStyle(0x450a0a, 1);
    gLower.beginPath();
    gLower.moveTo(16, 26);
    gLower.lineTo(26, 48);
    gLower.lineTo(60, 56);
    gLower.lineTo(94, 48);
    gLower.lineTo(104, 26);
    gLower.closePath();
    gLower.fillPath();

    // Chin bone spikes / barbels
    gLower.fillStyle(0x18181b, 1);
    gLower.fillTriangle(34, 46, 38, 56, 44, 46);
    gLower.fillTriangle(56, 48, 60, 56, 64, 48);
    gLower.fillTriangle(76, 46, 82, 56, 86, 46);

    gLower.generateTexture('monster-jaw-lower', w, hLower);
    gLower.destroy();
  }
}

