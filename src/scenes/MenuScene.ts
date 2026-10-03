// src/scenes/MenuScene.ts

import Phaser from 'phaser';
import { soundManager } from '../utils/audio';
import { PlatformManager } from '../platform/PlatformManager';

export class MenuScene extends Phaser.Scene {
  private startPromptText!: Phaser.GameObjects.Text;
  private soundButtonText!: Phaser.GameObjects.Text;
  private levelText!: Phaser.GameObjects.Text;
  private scoreBadgeText!: Phaser.GameObjects.Text;

  private selectedLevel: number = 1;
  private highestUnlockedLevel: number = 1;
  private currentScore: number = 0;
  private highestScore: number = 0;

  constructor() {
    super('MenuScene');
  }

  public create(): void {
    soundManager.stopBgMusic();
    const { width, height } = this.scale;

    // Background sky and scenery
    this.add.image(width / 2, height / 2, 'bg-sky').setDisplaySize(width, height);
    this.add.tileSprite(width / 2, height - 120, width, 320, 'bg-mountains').setOrigin(0.5, 1);
    this.add.tileSprite(width / 2, height - 40, width, 260, 'bg-trees').setOrigin(0.5, 1);

    // Drifting clouds
    const cloud1 = this.add.image(140, 90, 'cloud').setAlpha(0.85);
    const cloud2 = this.add.image(580, 140, 'cloud').setAlpha(0.7).setScale(0.8);
    this.tweens.add({
      targets: cloud1,
      x: cloud1.x + 80,
      duration: 12000,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });
    this.tweens.add({
      targets: cloud2,
      x: cloud2.x - 70,
      duration: 15000,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });

    // Decorative ground strip at bottom
    const groundStrip = this.add.tileSprite(width / 2, height - 16, width, 48, 'ground');
    groundStrip.setDepth(1);

    // Vignette / soft dark card backing for title legibility
    const panel = this.add.graphics();
    panel.fillStyle(0x0f172a, 0.65);
    panel.fillRoundedRect(width / 2 - 280, 50, 560, 480, 16);
    panel.lineStyle(1.5, 0x38bdf8, 0.4);
    panel.strokeRoundedRect(width / 2 - 280, 50, 560, 480, 16);

    // Title Section
    const titleText = this.add.text(width / 2, 105, 'BUMBLE BALL', {
      fontFamily: 'system-ui, -apple-system, sans-serif',
      fontSize: '44px',
      fontStyle: 'bold',
      color: '#ffffff',
      stroke: '#991b1b',
      strokeThickness: 8,
      shadow: { offsetX: 0, offsetY: 4, color: 'rgba(0,0,0,0.5)', blur: 6, fill: true },
    }).setOrigin(0.5);

    const subTitleText = this.add.text(width / 2, 145, 'A RED BALL PLATFORMER ODYSSEY', {
      fontFamily: 'system-ui, -apple-system, sans-serif',
      fontSize: '13px',
      letterSpacing: 3,
      color: '#38bdf8',
    }).setOrigin(0.5);

    // Cloud Save Stats Badge (Highest unlocked level & High score)
    this.scoreBadgeText = this.add.text(
      width / 2,
      172,
      '☁ Cloud Save: Loading progress...',
      {
        fontFamily: 'system-ui, -apple-system, sans-serif',
        fontSize: '12px',
        color: '#94a3b8',
      }
    ).setOrigin(0.5);

    // Subtle gentle title float tween
    this.tweens.add({
      targets: [titleText, subTitleText],
      y: '-=6',
      duration: 1800,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });

    // Animated Bouncing Ball Hero Preview
    const shadow = this.add.ellipse(width / 2, 290, 42, 14, 0x000000, 0.45);
    const heroBall = this.add.image(width / 2, 230, 'player').setScale(1.75);

    // Rhythmic bounce animation with squash and stretch
    this.tweens.add({
      targets: heroBall,
      y: 272,
      duration: 520,
      yoyo: true,
      repeat: -1,
      ease: 'Quad.easeIn',
      onYoyo: () => {
        this.tweens.add({
          targets: heroBall,
          scaleX: 2.1,
          scaleY: 1.35,
          duration: 100,
          yoyo: true,
          ease: 'Quad.easeOut',
        });
      },
    });

    // Shadow pulse in sync with ball
    this.tweens.add({
      targets: shadow,
      scaleX: 1.3,
      scaleY: 1.3,
      alpha: 0.7,
      duration: 520,
      yoyo: true,
      repeat: -1,
      ease: 'Quad.easeIn',
    });

    // Interactive Start Button
    const startBtn = this.add.container(width / 2, 355);
    const btnBg = this.add.graphics();
    btnBg.fillStyle(0xe11d48, 1);
    btnBg.fillRoundedRect(-140, -25, 280, 50, 12);
    btnBg.lineStyle(2, 0xffffff, 0.7);
    btnBg.strokeRoundedRect(-140, -25, 280, 50, 12);

    this.startPromptText = this.add.text(0, 0, 'CLICK / TAP TO START', {
      fontFamily: 'system-ui, -apple-system, sans-serif',
      fontSize: '18px',
      fontStyle: 'bold',
      color: '#ffffff',
    }).setOrigin(0.5);

    startBtn.add([btnBg, this.startPromptText]);
    startBtn.setSize(280, 50);
    startBtn.setInteractive({ useHandCursor: true });

    // Pulse animation for start prompt
    this.tweens.add({
      targets: startBtn,
      scaleX: 1.04,
      scaleY: 1.04,
      duration: 750,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });

    startBtn.on('pointerover', () => {
      btnBg.clear();
      btnBg.fillStyle(0xf43f5e, 1);
      btnBg.fillRoundedRect(-140, -25, 280, 50, 12);
      btnBg.lineStyle(2, 0xffffff, 1);
      btnBg.strokeRoundedRect(-140, -25, 280, 50, 12);
    });

    startBtn.on('pointerout', () => {
      btnBg.clear();
      btnBg.fillStyle(0xe11d48, 1);
      btnBg.fillRoundedRect(-140, -25, 280, 50, 12);
      btnBg.lineStyle(2, 0xffffff, 0.7);
      btnBg.strokeRoundedRect(-140, -25, 280, 50, 12);
    });

    startBtn.on('pointerdown', () => this.handleStartClick());

    // Interactive Level Selector (Levels 1 - 12)
    const levelSelectorContainer = this.add.container(width / 2, 420);
    const levelSelectorBg = this.add.graphics();
    levelSelectorBg.fillStyle(0x0f172a, 0.7);
    levelSelectorBg.fillRoundedRect(-135, -16, 270, 32, 8);
    levelSelectorBg.lineStyle(1, 0x334155, 0.8);
    levelSelectorBg.strokeRoundedRect(-135, -16, 270, 32, 8);

    this.levelText = this.add.text(0, 0, `SELECT LEVEL: ${this.selectedLevel} / 12`, {
      fontFamily: 'system-ui, -apple-system, sans-serif',
      fontSize: '13px',
      fontStyle: 'bold',
      color: '#38bdf8',
    }).setOrigin(0.5);

    const prevBtn = this.add.text(-110, 0, '◀', {
      fontFamily: 'system-ui, -apple-system, sans-serif',
      fontSize: '16px',
      color: '#ffffff',
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    const nextBtn = this.add.text(110, 0, '▶', {
      fontFamily: 'system-ui, -apple-system, sans-serif',
      fontSize: '16px',
      color: '#ffffff',
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    prevBtn.on('pointerdown', (p: Phaser.Input.Pointer) => {
      p.event.stopPropagation();
      this.selectedLevel = this.selectedLevel > 1 ? this.selectedLevel - 1 : 12;
      this.updateLevelDisplay();
      soundManager.playBounce(0.4);
    });

    nextBtn.on('pointerdown', (p: Phaser.Input.Pointer) => {
      p.event.stopPropagation();
      this.selectedLevel = this.selectedLevel < 12 ? this.selectedLevel + 1 : 1;
      this.updateLevelDisplay();
      soundManager.playBounce(0.4);
    });

    levelSelectorContainer.add([levelSelectorBg, prevBtn, nextBtn, this.levelText]);

    // Controls Info Guide
    const controlsGuide = this.add.text(
      width / 2,
      475,
      'Controls: [A][D] or [←][→] Roll  ·  [W] or [↑] or [Space] Jump / Swim\nMobile: On-Screen Touch Buttons',
      {
        fontFamily: 'system-ui, -apple-system, sans-serif',
        fontSize: '12px',
        color: '#94a3b8',
        align: 'center',
        lineSpacing: 4,
      }
    ).setOrigin(0.5);
    controlsGuide.setDepth(2);

    // Audio Mute/Unmute Toggle in top right
    const soundContainer = this.add.container(width - 70, 30);
    const soundBg = this.add.graphics();
    soundBg.fillStyle(0x1e293b, 0.8);
    soundBg.fillRoundedRect(-50, -16, 100, 32, 8);
    soundBg.lineStyle(1, 0x475569, 0.8);
    soundBg.strokeRoundedRect(-50, -16, 100, 32, 8);

    this.soundButtonText = this.add.text(0, 0, soundManager.isMuted() ? '🔇 Muted' : '🔊 Sound', {
      fontFamily: 'system-ui, -apple-system, sans-serif',
      fontSize: '12px',
      color: '#e2e8f0',
    }).setOrigin(0.5);

    soundContainer.add([soundBg, this.soundButtonText]);
    soundContainer.setSize(100, 32);
    soundContainer.setInteractive({ useHandCursor: true });
    soundContainer.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      pointer.event.stopPropagation();
      const isMuted = soundManager.toggleMute();
      this.soundButtonText.setText(isMuted ? '🔇 Muted' : '🔊 Sound');
      if (!isMuted) {
        soundManager.playBounce(0.6);
      }
    });

    // Global Key Listener to start with Space / Enter
    this.input.keyboard?.on('keydown-SPACE', () => this.handleStartClick());
    this.input.keyboard?.on('keydown-ENTER', () => this.handleStartClick());
    this.input.keyboard?.on('keydown-UP', () => this.handleStartClick());

    // Load cloud storage save data
    this.loadCloudSaveData();
  }

  /**
   * Loads highest unlocked level and current/high score from Cloud Storage
   */
  private async loadCloudSaveData(): Promise<void> {
    const platform = PlatformManager.getInstance();
    try {
      const [savedLevel, savedCurrentScore, savedHighestScore] = await Promise.all([
        platform.loadData('highestUnlockedLevel'),
        platform.loadData('currentScore'),
        platform.loadData('highestScore'),
      ]);

      if (savedLevel && typeof savedLevel === 'number') {
        this.highestUnlockedLevel = Math.max(1, Math.min(12, savedLevel));
        this.selectedLevel = this.highestUnlockedLevel;
      }

      if (savedHighestScore !== null && savedHighestScore !== undefined) {
        this.highestScore = Number(savedHighestScore) || 0;
      }

      if (savedCurrentScore !== null && savedCurrentScore !== undefined) {
        this.currentScore = Number(savedCurrentScore) || 0;
      }

      this.updateScoreBadge();
      this.updateLevelDisplay();
    } catch (err) {
      console.warn('Failed to load cloud save data:', err);
      this.updateScoreBadge();
      this.updateLevelDisplay();
    }
  }

  private updateScoreBadge(): void {
    if (!this.scoreBadgeText) return;
    this.scoreBadgeText.setText(
      `🏆 Best: ${this.highestScore}  ·  Score: ${this.currentScore}  ·  Unlocked: Lvl ${this.highestUnlockedLevel}/12`
    );
    this.scoreBadgeText.setColor('#38bdf8');
  }

  private updateLevelDisplay(): void {
    if (!this.levelText || !this.startPromptText) return;

    const isLocked = this.selectedLevel > this.highestUnlockedLevel;
    if (isLocked) {
      this.levelText.setText(`LEVEL ${this.selectedLevel} / 12  🔒 LOCKED`);
      this.levelText.setColor('#ef4444');
      this.startPromptText.setText(`BEAT LEVEL ${this.selectedLevel - 1} FIRST`);
    } else {
      this.levelText.setText(`SELECT LEVEL: ${this.selectedLevel} / 12`);
      this.levelText.setColor('#38bdf8');
      this.startPromptText.setText(`PLAY LEVEL ${this.selectedLevel}`);
    }
  }

  private handleStartClick(): void {
    if (this.selectedLevel > this.highestUnlockedLevel) {
      soundManager.playHurt();
      this.cameras.main.shake(120, 0.008);
      return;
    }
    this.startGame(this.selectedLevel);
  }

  private startGame(levelNumber: number = 1): void {
    soundManager.startBgMusic();
    this.cameras.main.fade(220, 15, 23, 42);
    this.cameras.main.once('camerafadeoutcomplete', () => {
      this.scene.start('GameScene', { levelNumber });
      this.scene.start('UIScene', { levelNumber });
    });
  }
}
