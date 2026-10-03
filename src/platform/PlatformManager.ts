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

  /**
   * Saves game data to cloud storage across devices.
   */
  saveData(key: string, value: any): Promise<void>;

  /**
   * Loads game data from cloud storage. Returns null if key does not exist.
   */
  loadData(key: string): Promise<any>;
}

/**
 * Facebook Instant Games Platform Implementation
 * Uses FBInstant.player.setDataAsync() and FBInstant.player.getDataAsync()
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

  /**
   * Saves data to Facebook Instant Games cloud storage via FBInstant.player.setDataAsync
   */
  public async saveData(key: string, value: any): Promise<void> {
    // Save to local storage as fallback cache
    this.saveLocalFallback(key, value);

    if (typeof FBInstant !== 'undefined' && FBInstant.player?.setDataAsync) {
      try {
        await FBInstant.player.setDataAsync({ [key]: value });
        if (FBInstant.player.flushDataAsync) {
          await FBInstant.player.flushDataAsync();
        }
      } catch (err) {
        console.warn(`FacebookPlatform.saveData error for key "${key}":`, err);
      }
    }
  }

  /**
   * Loads data from Facebook Instant Games cloud storage via FBInstant.player.getDataAsync
   */
  public async loadData(key: string): Promise<any> {
    if (typeof FBInstant !== 'undefined' && FBInstant.player?.getDataAsync) {
      try {
        const data = await FBInstant.player.getDataAsync([key]);
        if (data && data[key] !== undefined && data[key] !== null) {
          return data[key];
        }
      } catch (err) {
        console.warn(`FacebookPlatform.loadData error for key "${key}":`, err);
      }
    }
    return this.loadLocalFallback(key);
  }

  private saveLocalFallback(key: string, value: any): void {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem(`bumble_fb_${key}`, JSON.stringify(value));
      }
    } catch (e) {
      // Ignore quota errors in restricted environments
    }
  }

  private loadLocalFallback(key: string): any {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const item = window.localStorage.getItem(`bumble_fb_${key}`);
        if (item !== null) {
          return JSON.parse(item);
        }
      }
    } catch (e) {
      // Ignore
    }
    return null;
  }
}

/**
 * YouTube Playables Platform Implementation
 * Uses Google's provided state saving API: window.ytgame.game.saveData / loadData
 */
export class YouTubePlatform implements IPlatform {
  private cache: Record<string, any> = {};
  private cacheLoaded: boolean = false;

  public async initialize(): Promise<void> {
    if (typeof window !== 'undefined' && (window as any).ytgame) {
      console.log('YouTube Playables SDK detected');
    }
    await this.ensureCacheLoaded();
  }

  public setLoadingProgress(percentage: number): void {
    const clamped = Math.max(0, Math.min(100, Math.floor(percentage)));
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
  }

  private async ensureCacheLoaded(): Promise<void> {
    if (this.cacheLoaded) return;
    try {
      if (typeof window !== 'undefined' && (window as any).ytgame?.game?.loadData) {
        const jsonStr = await (window as any).ytgame.game.loadData();
        if (jsonStr && typeof jsonStr === 'string') {
          this.cache = JSON.parse(jsonStr) || {};
        }
      }
    } catch (err) {
      console.warn('YouTubePlatform loadData error during initial cache fill:', err);
    }
    this.cacheLoaded = true;
  }

  /**
   * Saves data to YouTube Playables state cloud storage via ytgame.game.saveData
   */
  public async saveData(key: string, value: any): Promise<void> {
    await this.ensureCacheLoaded();
    this.cache[key] = value;
    this.saveLocalFallback(key, value);

    if (typeof window !== 'undefined' && (window as any).ytgame?.game?.saveData) {
      try {
        const jsonStr = JSON.stringify(this.cache);
        await (window as any).ytgame.game.saveData(jsonStr);
      } catch (err) {
        console.warn(`YouTubePlatform.saveData error for key "${key}":`, err);
      }
    }
  }

  /**
   * Loads data from YouTube Playables state cloud storage via ytgame.game.loadData
   */
  public async loadData(key: string): Promise<any> {
    await this.ensureCacheLoaded();
    if (this.cache[key] !== undefined && this.cache[key] !== null) {
      return this.cache[key];
    }
    return this.loadLocalFallback(key);
  }

  private saveLocalFallback(key: string, value: any): void {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem(`bumble_yt_${key}`, JSON.stringify(value));
      }
    } catch (e) {
      // Ignore
    }
  }

  private loadLocalFallback(key: string): any {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const item = window.localStorage.getItem(`bumble_yt_${key}`);
        if (item !== null) {
          return JSON.parse(item);
        }
      }
    } catch (e) {
      // Ignore
    }
    return null;
  }
}

/**
 * Local / Standalone Platform Dummy Implementation
 * Uses browser localStorage for persistent state saving during development.
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

  public async saveData(key: string, value: any): Promise<void> {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem(`bumble_ball_${key}`, JSON.stringify(value));
      }
    } catch (e) {
      console.warn('LocalPlatform saveData warning:', e);
    }
    return Promise.resolve();
  }

  public async loadData(key: string): Promise<any> {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const item = window.localStorage.getItem(`bumble_ball_${key}`);
        if (item !== null) {
          return JSON.parse(item);
        }
      }
    } catch (e) {
      console.warn('LocalPlatform loadData warning:', e);
    }
    return Promise.resolve(null);
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
