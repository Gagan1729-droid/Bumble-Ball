// src/platform/PlatformManager.ts

// Global declaration for Facebook Instant Games SDK
declare const FBInstant: any;

/**
 * Common platform abstraction interface for multi-platform publishing.
 */
export interface IPlatform {
  /**
   * Initializes the platform SDK (e.g., FBInstant.initializeAsync).
   */
  initialize(): Promise<void>;

  /**
   * Reports asset loading progress to the platform loader (0 to 100).
   */
  setLoadingProgress(percentage: number): void;

  /**
   * Signals that loading is complete and starts the gameplay session.
   */
  startGame(): Promise<void>;
}

/**
 * Facebook Instant Games Platform Implementation
 */
export class FacebookPlatform implements IPlatform {
  public async initialize(): Promise<void> {
    if (typeof FBInstant !== 'undefined' && FBInstant.initializeAsync) {
      try {
        await FBInstant.initializeAsync();
      } catch (err) {
        console.warn('FacebookPlatform.initializeAsync warning:', err);
      }
    } else {
      console.warn('FBInstant SDK not found in global scope');
    }
  }

  public setLoadingProgress(percentage: number): void {
    const clamped = Math.max(0, Math.min(100, Math.floor(percentage)));
    if (typeof FBInstant !== 'undefined' && FBInstant.setLoadingProgress) {
      FBInstant.setLoadingProgress(clamped);
    }
  }

  public async startGame(): Promise<void> {
    if (typeof FBInstant !== 'undefined' && FBInstant.startGameAsync) {
      try {
        await FBInstant.startGameAsync();
      } catch (err) {
        console.warn('FacebookPlatform.startGameAsync warning:', err);
      }
    }
  }
}

/**
 * YouTube Playables Platform Implementation
 */
export class YouTubePlatform implements IPlatform {
  public async initialize(): Promise<void> {
    // YouTube Playables initializes via its loaded script on window.ytgame
    if (typeof window !== 'undefined' && (window as any).ytgame) {
      console.log('YouTube Playables SDK detected');
    }
    return Promise.resolve();
  }

  public setLoadingProgress(percentage: number): void {
    const clamped = Math.max(0, Math.min(100, Math.floor(percentage)));
    // If loading reaches 100%, notify YouTube Playables first frame readiness if available
    if (clamped === 100 && typeof window !== 'undefined' && (window as any).ytgame?.game?.firstFrameReady) {
      (window as any).ytgame.game.firstFrameReady();
    }
  }

  public async startGame(): Promise<void> {
    if (typeof window !== 'undefined' && (window as any).ytgame?.game) {
      const yt = (window as any).ytgame.game;
      if (yt.firstFrameReady) yt.firstFrameReady();
      if (yt.gameReady) yt.gameReady();
    }
    return Promise.resolve();
  }
}

/**
 * Local / Standalone Platform Dummy Implementation
 * Resolves immediately so that local development, preview servers, and testing environments
 * operate smoothly without SDK dependencies.
 */
export class LocalPlatform implements IPlatform {
  public async initialize(): Promise<void> {
    return Promise.resolve();
  }

  public setLoadingProgress(_percentage: number): void {
    // No-op for local development
  }

  public async startGame(): Promise<void> {
    return Promise.resolve();
  }
}

/**
 * Platform Manager Factory & Singleton
 */
export class PlatformManager {
  private static instance: IPlatform | null = null;

  public static getInstance(): IPlatform {
    if (!this.instance) {
      this.instance = this.createPlatform();
    }
    return this.instance;
  }

  public static createPlatform(): IPlatform {
    const platform = (import.meta.env.VITE_PLATFORM || '').toLowerCase().trim();

    switch (platform) {
      case 'facebook':
      case 'fb':
        return new FacebookPlatform();
      case 'youtube':
      case 'yt':
        return new YouTubePlatform();
      default:
        return new LocalPlatform();
    }
  }
}
