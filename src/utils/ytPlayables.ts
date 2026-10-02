// src/utils/ytPlayables.ts

/**
 * YouTube Playables SDK Bridge & Fallback Adapter.
 * 
 * Provides official YouTube Playables integration when running inside the YouTube environment,
 * while automatically falling back to standard HTML5 Web APIs (localStorage, window focus/blur)
 * when running locally (npm run dev) or on GitHub Pages.
 */

// Types matching the official YouTube Playables SDK
interface YTGameAudio {
  isAudioEnabled?: () => boolean;
  onAudioEnabledChange?: (callback: (isAudioEnabled: boolean) => void) => void;
}

interface YTGameSystem {
  isAudioEnabled?: () => boolean;
  onAudioEnabledChange?: (callback: (isAudioEnabled: boolean) => void) => void;
  onPause?: (callback: () => void) => void;
  onResume?: (callback: () => void) => void;
}

interface YTGameGame {
  firstFrameReady?: () => void;
  gameReady?: () => void;
  saveData?: (data: string) => Promise<void>;
  loadData?: () => Promise<string>;
  sendScore?: (score: { value: number }) => Promise<void>;
}

interface YTGameSDK {
  system?: YTGameSystem;
  game?: YTGameGame;
}

declare global {
  interface Window {
    ytgame?: YTGameSDK;
  }
}

class YouTubePlayablesManager {
  private hasReportedFirstFrame = false;
  private hasReportedGameReady = false;
  private pauseCallbacks: Array<() => void> = [];
  private resumeCallbacks: Array<() => void> = [];
  private audioCallbacks: Array<(enabled: boolean) => void> = [];

  constructor() {
    this.setupListeners();
  }

  public isAvailable(): boolean {
    return typeof window !== 'undefined' && typeof window.ytgame !== 'undefined';
  }

  private setupListeners(): void {
    if (typeof window === 'undefined') return;

    if (this.isAvailable()) {
      const yt = window.ytgame!;
      // Register with YouTube system hooks
      yt.system?.onPause?.(() => {
        this.pauseCallbacks.forEach((cb) => cb());
      });

      yt.system?.onResume?.(() => {
        this.resumeCallbacks.forEach((cb) => cb());
      });

      yt.system?.onAudioEnabledChange?.((enabled) => {
        this.audioCallbacks.forEach((cb) => cb(enabled));
      });
    } else {
      // Local development / web fallback: listen to window blur/focus
      window.addEventListener('blur', () => {
        this.pauseCallbacks.forEach((cb) => cb());
      });

      window.addEventListener('focus', () => {
        this.resumeCallbacks.forEach((cb) => cb());
      });

      document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
          this.pauseCallbacks.forEach((cb) => cb());
        } else {
          this.resumeCallbacks.forEach((cb) => cb());
        }
      });
    }
  }

  /**
   * Called as soon as the first graphics/canvas frame begins rendering.
   */
  public firstFrameReady(): void {
    if (this.hasReportedFirstFrame) return;
    this.hasReportedFirstFrame = true;

    if (this.isAvailable() && window.ytgame?.game?.firstFrameReady) {
      try {
        window.ytgame.game.firstFrameReady();
      } catch (err) {
        console.warn('[YTPlayables] firstFrameReady error:', err);
      }
    }
  }

  /**
   * Called when loading finishes and the user can actively interact with menus or gameplay.
   */
  public gameReady(): void {
    if (this.hasReportedGameReady) return;
    this.hasReportedGameReady = true;

    if (this.isAvailable() && window.ytgame?.game?.gameReady) {
      try {
        window.ytgame.game.gameReady();
      } catch (err) {
        console.warn('[YTPlayables] gameReady error:', err);
      }
    }
  }

  /**
   * Register a callback triggered when YouTube pauses the game.
   */
  public onPause(callback: () => void): () => void {
    this.pauseCallbacks.push(callback);
    return () => {
      this.pauseCallbacks = this.pauseCallbacks.filter((cb) => cb !== callback);
    };
  }

  /**
   * Register a callback triggered when YouTube resumes the game.
   */
  public onResume(callback: () => void): () => void {
    this.resumeCallbacks.push(callback);
    return () => {
      this.resumeCallbacks = this.resumeCallbacks.filter((cb) => cb !== callback);
    };
  }

  /**
   * Check if sound is currently enabled by YouTube.
   */
  public isAudioEnabled(): boolean {
    if (this.isAvailable() && window.ytgame?.system?.isAudioEnabled) {
      try {
        return window.ytgame.system.isAudioEnabled();
      } catch {
        return true;
      }
    }
    return true;
  }

  /**
   * Listen for audio enable/disable events from YouTube UI.
   */
  public onAudioEnabledChange(callback: (enabled: boolean) => void): () => void {
    this.audioCallbacks.push(callback);
    return () => {
      this.audioCallbacks = this.audioCallbacks.filter((cb) => cb !== callback);
    };
  }

  /**
   * Save game progress. Uses YouTube Playables cloud save in production, localStorage locally.
   */
  public async saveData(key: string, data: Record<string, unknown> | string): Promise<void> {
    const stringData = typeof data === 'string' ? data : JSON.stringify(data);

    if (this.isAvailable() && window.ytgame?.game?.saveData) {
      try {
        await window.ytgame.game.saveData(stringData);
        return;
      } catch (err) {
        console.warn('[YTPlayables] Save failed on YT SDK, falling back to local storage:', err);
      }
    }

    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem(`bumble_ball_${key}`, stringData);
      }
    } catch {
      // Storage unavailable / private mode
    }
  }

  /**
   * Load saved game progress. Uses YouTube Playables cloud load in production, localStorage locally.
   */
  public async loadData(key: string): Promise<string | null> {
    if (this.isAvailable() && window.ytgame?.game?.loadData) {
      try {
        const data = await window.ytgame.game.loadData();
        if (data) return data;
      } catch (err) {
        console.warn('[YTPlayables] Load failed on YT SDK, falling back to local storage:', err);
      }
    }

    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        return window.localStorage.getItem(`bumble_ball_${key}`);
      }
    } catch {
      // Storage unavailable / private mode
    }

    return null;
  }

  /**
   * Optionally report player high score to YouTube Playables leaderboards.
   */
  public async sendScore(score: number): Promise<void> {
    if (this.isAvailable() && window.ytgame?.game?.sendScore) {
      try {
        await window.ytgame.game.sendScore({ value: score });
      } catch (err) {
        console.warn('[YTPlayables] sendScore error:', err);
      }
    }
  }
}

export const ytPlayables = new YouTubePlayablesManager();
