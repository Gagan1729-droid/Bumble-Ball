// src/scenes/UIScene.ts

import Phaser from 'phaser';
import { soundManager } from '../utils/audio';

export interface ScoreUpdatePayload {
  score: number;
  coinsCollected: number;
  totalCoins: number;
}

export interface HealthUpdatePayload {
  health: number;
  maxHealth: number;
}

export interface ProgressUpdatePayload {
  progress: number;
}

export class UIScene extends Phaser.Scene {
  private hearts: Phaser.GameObjects.Image[] = [];
  private scoreText!: Phaser.GameObjects.Text;
  private coinCountText!: Phaser.GameObjects.Text;
  private progressBarFill!: Phaser.GameObjects.Graphics;
  private soundButtonText!: Phaser.GameObjects.Text;

  private touchControlsContainer!: Phaser.GameObjects.Container;
  private leftPressed: boolean = false;
  private rightPressed: boolean = false;
  private jumpPressed: boolean = false;

  private gameOverContainer?: Phaser.GameObjects.Container;
  private victoryContainer?: Phaser.GameObjects.Container;

  constructor() {
    super('UIScene');
  }

  public create(): void {
    const { width, height } = this.scale;

    // Reset modals
    this.closeModals();

    const hudBar = this.add.graphics();
    hudBar.fillStyle(0x0f172a, 0.7);
    hudBar.fillRoundedRect(16, 12, width - 32, 48, 12);
    hudBar.lineStyle(1, 0x334155, 0.8);
    hudBar.strokeRoundedRect(16, 12, width - 32, 48, 12);

    this.createHearts(3, 3);
    this.createProgressBar(width);
    this.createScoreAndCoins(width);
    this.createSoundButton(width);
    this.createTouchControls(width, height);
    this.setupEventListeners();

    // Cleanup listeners on shutdown
    this.events.once('shutdown', () => {
      this.cleanupEventListeners();
    });
  }

  private closeModals(): void {
    if (this.gameOverContainer) {
      this.gameOverContainer.destroy();
      this.gameOverContainer = undefined;
    }
    if (this.victoryContainer) {
      this.victoryContainer.destroy();
      this.victoryContainer = undefined;
    }
  }

  private createHearts(currentHealth: number, maxHealth: number): void {
    this.hearts.forEach((h) => h.destroy());
    this.hearts = [];

    const startX = 36;
    const startY = 36;
    const spacing = 28;

    for (let i = 0; i < maxHealth; i++) {
      const heartKey = i < currentHealth ? 'heart-full' : 'heart-empty';
      const heart = this.add.image(startX + i * spacing, startY, heartKey);
      heart.setScale(1.1);
      this.hearts.push(heart);
    }
  }

  private createProgressBar(screenWidth: number): void {
    const barWidth = 140;
    const barHeight = 8;
    const barX = screenWidth / 2 - barWidth / 2;
    const barY = 32;

    const barBg = this.add.graphics();
    barBg.fillStyle(0x1e293b, 0.9);
    barBg.fillRoundedRect(barX, barY, barWidth, barHeight, 4);

    this.progressBarFill = this.add.graphics();
    this.updateProgress(0);

    const flagIcon = this.add.text(barX + barWidth + 6, barY - 6, '🏁', { fontSize: '13px' });
    flagIcon.setAlpha(0.9);
  }

  private updateProgress(progress: number): void {
    const screenWidth = this.scale.width;
    const barWidth = 140;
    const barHeight = 8;
    const barX = screenWidth / 2 - barWidth / 2;
    const barY = 32;

    this.progressBarFill.clear();
    const clamped = Phaser.Math.Clamp(progress, 0, 1);
    if (clamped > 0) {
      this.progressBarFill.fillStyle(0x38bdf8, 1);
      this.progressBarFill.fillRoundedRect(barX, barY, Math.max(barWidth * clamped, 6), barHeight, 4);
    }
  }

  private createScoreAndCoins(screenWidth: number): void {
    const rightMargin = screenWidth - 140;

    const coinIcon = this.add.image(rightMargin - 100, 36, 'coin').setScale(0.85);
    this.tweens.add({
      targets: coinIcon,
      angle: 360,
      duration: 6000,
      repeat: -1,
    });

    this.coinCountText = this.add.text(rightMargin - 84, 36, '0 / 0', {
      fontFamily: 'system-ui, -apple-system, sans-serif',
      fontSize: '13px',
      color: '#fbbf24',
      fontStyle: 'bold',
    }).setOrigin(0, 0.5);

    this.scoreText = this.add.text(rightMargin, 36, '0000', {
      fontFamily: 'monospace',
      fontSize: '16px',
      color: '#f8fafc',
      fontStyle: 'bold',
    }).setOrigin(0, 0.5);
  }

  private createSoundButton(screenWidth: number): void {
    const btnX = screenWidth - 52;
    const btnY = 36;

    const btnContainer = this.add.container(btnX, btnY);
    const bg = this.add.graphics();
    bg.fillStyle(0x334155, 0.7);
    bg.fillCircle(0, 0, 16);

    this.soundButtonText = this.add.text(0, 0, soundManager.isMuted() ? '🔇' : '🔊', {
      fontSize: '15px',
    }).setOrigin(0.5);

    btnContainer.add([bg, this.soundButtonText]);
    btnContainer.setSize(32, 32);
    btnContainer.setInteractive({ useHandCursor: true });

    btnContainer.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      pointer.event.stopPropagation();
      const isMuted = soundManager.toggleMute();
      this.soundButtonText.setText(isMuted ? '🔇' : '🔊');
    });
  }

  private createTouchControls(screenWidth: number, screenHeight: number): void {
    this.touchControlsContainer = this.add.container(0, 0);

    const leftBtn = this.createTouchButton(56, screenHeight - 64, '◀', () => {
      this.leftPressed = true;
      this.emitMobileControls();
    }, () => {
      this.leftPressed = false;
      this.emitMobileControls();
    });

    const rightBtn = this.createTouchButton(140, screenHeight - 64, '▶', () => {
      this.rightPressed = true;
      this.emitMobileControls();
    }, () => {
      this.rightPressed = false;
      this.emitMobileControls();
    });

    const jumpBtn = this.createTouchButton(screenWidth - 70, screenHeight - 70, '▲ JUMP', () => {
      this.jumpPressed = true;
      this.emitMobileControls();
    }, () => {
      this.jumpPressed = false;
      this.emitMobileControls();
    }, 40);

    this.touchControlsContainer.add([leftBtn, rightBtn, jumpBtn]);

    const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    this.touchControlsContainer.setAlpha(isTouchDevice ? 0.8 : 0.4);
  }

  private createTouchButton(
    x: number,
    y: number,
    label: string,
    onDown: () => void,
    onUp: () => void,
    radius: number = 30
  ): Phaser.GameObjects.Container {
    const container = this.add.container(x, y);

    const circle = this.add.graphics();
    circle.fillStyle(0x0f172a, 0.6);
    circle.fillCircle(0, 0, radius);
    circle.lineStyle(2, 0x38bdf8, 0.7);
    circle.strokeCircle(0, 0, radius);

    const text = this.add.text(0, 0, label, {
      fontFamily: 'system-ui, -apple-system, sans-serif',
      fontSize: radius > 30 ? '14px' : '18px',
      fontStyle: 'bold',
      color: '#ffffff',
    }).setOrigin(0.5);

    container.add([circle, text]);
    container.setSize(radius * 2, radius * 2);
    container.setInteractive({ useHandCursor: true });

    container.on('pointerdown', () => {
      circle.clear();
      circle.fillStyle(0x0284c7, 0.8);
      circle.fillCircle(0, 0, radius);
      circle.lineStyle(2, 0xffffff, 1);
      circle.strokeCircle(0, 0, radius);
      onDown();
    });

    const release = () => {
      circle.clear();
      circle.fillStyle(0x0f172a, 0.6);
      circle.fillCircle(0, 0, radius);
      circle.lineStyle(2, 0x38bdf8, 0.7);
      circle.strokeCircle(0, 0, radius);
      onUp();
    };

    container.on('pointerup', release);
    container.on('pointerout', release);

    return container;
  }

  private emitMobileControls(): void {
    const gameScene = this.scene.get('GameScene');
    if (gameScene) {
      gameScene.events.emit('mobileControlsUpdate', {
        left: this.leftPressed,
        right: this.rightPressed,
        jump: this.jumpPressed,
      });
    }
  }

  private cleanupEventListeners(): void {
    const gameScene = this.scene.get('GameScene');
    if (!gameScene) return;

    gameScene.events.off('updateScore');
    gameScene.events.off('updateHealth');
    gameScene.events.off('updateProgress');
    gameScene.events.off('gameOver');
    gameScene.events.off('levelComplete');
  }

  private setupEventListeners(): void {
    this.cleanupEventListeners();
    const gameScene = this.scene.get('GameScene');
    if (!gameScene) return;

    gameScene.events.on('updateScore', (data: ScoreUpdatePayload) => {
      if (!this.scoreText) return;
      this.scoreText.setText(data.score.toString().padStart(4, '0'));
      this.coinCountText.setText(`${data.coinsCollected} / ${data.totalCoins}`);

      this.tweens.add({
        targets: this.scoreText,
        scaleX: 1.3,
        scaleY: 1.3,
        duration: 100,
        yoyo: true,
      });
    });

    gameScene.events.on('updateHealth', (data: HealthUpdatePayload) => {
      this.createHearts(data.health, data.maxHealth);

      this.hearts.forEach((h) => {
        this.tweens.add({
          targets: h,
          x: h.x + Phaser.Math.Between(-3, 3),
          duration: 60,
          yoyo: true,
          repeat: 2,
        });
      });
    });

    gameScene.events.on('updateProgress', (data: ProgressUpdatePayload) => {
      this.updateProgress(data.progress);
    });

    gameScene.events.on('gameOver', (data: { score: number }) => {
      this.showGameOver(data.score);
    });

    gameScene.events.on('levelComplete', (data: { score: number; coins: number; totalCoins: number; timeSec: number }) => {
      this.showVictory(data);
    });
  }

  /**
   * Restarts the gameplay cleanly without breaking scene lifecycles.
   */
  private restartGameplay(): void {
    soundManager.playJump();
    soundManager.startBgMusic();
    this.closeModals();

    // Reset touch controls
    this.leftPressed = false;
    this.rightPressed = false;
    this.jumpPressed = false;

    // Reset score and health visuals
    this.createHearts(3, 3);
    this.updateProgress(0);
    if (this.scoreText) this.scoreText.setText('0000');

    // Restart GameScene
    const gameScene = this.scene.get('GameScene');
    if (gameScene) {
      gameScene.scene.restart();
      // Reconnect event listeners once GameScene creates
      gameScene.events.once('create', () => {
        this.setupEventListeners();
      });
    }
  }

  private showGameOver(finalScore: number): void {
    const { width, height } = this.scale;
    this.closeModals();

    this.gameOverContainer = this.add.container(width / 2, height / 2);

    const backdrop = this.add.graphics();
    backdrop.fillStyle(0x020617, 0.85);
    backdrop.fillRect(-width / 2, -height / 2, width, height);

    const modal = this.add.graphics();
    modal.fillStyle(0x0f172a, 0.95);
    modal.fillRoundedRect(-180, -130, 360, 260, 16);
    modal.lineStyle(2, 0xe11d48, 0.8);
    modal.strokeRoundedRect(-180, -130, 360, 260, 16);

    const title = this.add.text(0, -85, 'GAME OVER', {
      fontFamily: 'system-ui, -apple-system, sans-serif',
      fontSize: '28px',
      fontStyle: 'bold',
      color: '#f43f5e',
    }).setOrigin(0.5);

    const subtitle = this.add.text(0, -45, 'Bumble got pricked!', {
      fontFamily: 'system-ui, -apple-system, sans-serif',
      fontSize: '14px',
      color: '#94a3b8',
    }).setOrigin(0.5);

    const score = this.add.text(0, -10, `Final Score: ${finalScore}`, {
      fontFamily: 'system-ui, -apple-system, sans-serif',
      fontSize: '20px',
      fontStyle: 'bold',
      color: '#f8fafc',
    }).setOrigin(0.5);

    // Restart Button
    const restartBtn = this.add.container(0, 55);
    const btnBg = this.add.graphics();
    btnBg.fillStyle(0xe11d48, 1);
    btnBg.fillRoundedRect(-100, -22, 200, 44, 8);
    const btnText = this.add.text(0, 0, 'TRY AGAIN', {
      fontFamily: 'system-ui, -apple-system, sans-serif',
      fontSize: '15px',
      fontStyle: 'bold',
      color: '#ffffff',
    }).setOrigin(0.5);

    restartBtn.add([btnBg, btnText]);
    restartBtn.setSize(200, 44);
    restartBtn.setInteractive({ useHandCursor: true });

    restartBtn.on('pointerdown', () => {
      this.restartGameplay();
    });

    this.gameOverContainer.add([backdrop, modal, title, subtitle, score, restartBtn]);
    this.gameOverContainer.setAlpha(0);
    this.tweens.add({ targets: this.gameOverContainer, alpha: 1, duration: 250 });
  }

  private showVictory(data: { score: number; coins: number; totalCoins: number; timeSec: number }): void {
    const { width, height } = this.scale;
    this.closeModals();

    this.victoryContainer = this.add.container(width / 2, height / 2);

    const backdrop = this.add.graphics();
    backdrop.fillStyle(0x020617, 0.85);
    backdrop.fillRect(-width / 2, -height / 2, width, height);

    const modal = this.add.graphics();
    modal.fillStyle(0x0f172a, 0.95);
    modal.fillRoundedRect(-200, -150, 400, 300, 16);
    modal.lineStyle(2, 0x10b981, 0.8);
    modal.strokeRoundedRect(-200, -150, 400, 300, 16);

    const title = this.add.text(0, -110, 'LEVEL COMPLETE!', {
      fontFamily: 'system-ui, -apple-system, sans-serif',
      fontSize: '26px',
      fontStyle: 'bold',
      color: '#10b981',
    }).setOrigin(0.5);

    const ratio = data.totalCoins > 0 ? data.coins / data.totalCoins : 1;
    const stars = ratio >= 0.85 ? '⭐⭐⭐' : ratio >= 0.5 ? '⭐⭐' : '⭐';

    const starsText = this.add.text(0, -70, stars, { fontSize: '28px' }).setOrigin(0.5);

    const statsText = this.add.text(
      0,
      -15,
      `Score: ${data.score}\nCoins: ${data.coins} / ${data.totalCoins}\nTime: ${data.timeSec}s`,
      {
        fontFamily: 'system-ui, -apple-system, sans-serif',
        fontSize: '15px',
        color: '#f8fafc',
        align: 'center',
        lineSpacing: 6,
      }
    ).setOrigin(0.5);

    const playAgainBtn = this.add.container(0, 75);
    const btnBg = this.add.graphics();
    btnBg.fillStyle(0x059669, 1);
    btnBg.fillRoundedRect(-110, -22, 220, 44, 8);
    const btnText = this.add.text(0, 0, 'PLAY AGAIN', {
      fontFamily: 'system-ui, -apple-system, sans-serif',
      fontSize: '15px',
      fontStyle: 'bold',
      color: '#ffffff',
    }).setOrigin(0.5);

    playAgainBtn.add([btnBg, btnText]);
    playAgainBtn.setSize(220, 44);
    playAgainBtn.setInteractive({ useHandCursor: true });

    playAgainBtn.on('pointerdown', () => {
      this.restartGameplay();
    });

    this.victoryContainer.add([backdrop, modal, title, starsText, statsText, playAgainBtn]);
    this.victoryContainer.setAlpha(0);
    this.tweens.add({ targets: this.victoryContainer, alpha: 1, duration: 300 });
  }
}
