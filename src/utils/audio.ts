// src/utils/audio.ts

/**
 * Audio Manager for Bounce Tales Web.
 * Features continuous background soundtrack playback from original Bounce Tales gamerip
 * combined with procedural Web Audio synthesis for responsive sound effects and expressive vocal cues.
 */

import { ytPlayables } from './ytPlayables';

class SoundManager {
  private ctx: AudioContext | null = null;
  private muted: boolean = false;
  private bgMusic: HTMLAudioElement | null = null;
  private deathAudio: HTMLAudioElement | null = null;
  private isMusicPlaying: boolean = false;

  constructor() {
    this.initAudioElements();
    this.initYTPlayablesAudio();
    this.setupUserGestureUnlock();
  }

  private initYTPlayablesAudio(): void {
    // Only mute if YouTube explicitly and strictly returns false
    if (ytPlayables.isAudioEnabled() === false) {
      this.muted = true;
    }
    ytPlayables.onAudioEnabledChange((enabled) => {
      if (typeof enabled === 'boolean') {
        this.setMuted(!enabled);
      }
    });
  }

  private setupUserGestureUnlock(): void {
    if (typeof window === 'undefined') return;

    const unlock = () => {
      if (this.ctx && this.ctx.state === 'suspended') {
        this.ctx.resume().catch(() => {});
      } else if (!this.ctx) {
        this.getContext();
      }

      if (this.isMusicPlaying && this.bgMusic && this.bgMusic.paused && !this.muted) {
        this.bgMusic.play().then(() => {
          window.removeEventListener('pointerdown', unlock);
          window.removeEventListener('keydown', unlock);
          window.removeEventListener('touchstart', unlock);
        }).catch(() => {});
      }
    };

    window.addEventListener('pointerdown', unlock, { passive: true });
    window.addEventListener('keydown', unlock, { passive: true });
    window.addEventListener('touchstart', unlock, { passive: true });
  }

  private initAudioElements(): void {
    if (typeof window !== 'undefined') {
      try {
        const baseUrl = import.meta.env.BASE_URL || './';
        const cleanBase = baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`;

        this.bgMusic = new Audio(`${cleanBase}audio/bounce-tales-theme.mp3`);
        this.bgMusic.loop = true;
        this.bgMusic.volume = 0.45;

        // Auto retry with relative path if base URL fails in certain iframe hosts
        this.bgMusic.addEventListener('error', () => {
          if (this.bgMusic && !this.bgMusic.src.endsWith('/audio/bounce-tales-theme.mp3')) {
            this.bgMusic.src = 'audio/bounce-tales-theme.mp3';
            this.bgMusic.load();
          }
        });

        this.deathAudio = new Audio(`${cleanBase}audio/bounce-death.mp3`);
        this.deathAudio.volume = 0.6;
      } catch {
        // Fallback to procedural synth if Audio element fails
      }
    }
  }

  private getContext(): AudioContext | null {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx;
  }

  public isMuted(): boolean {
    return this.muted;
  }

  public setMuted(muted: boolean): void {
    this.muted = muted;
    if (this.bgMusic) {
      if (muted) {
        this.bgMusic.pause();
      } else if (this.isMusicPlaying) {
        this.bgMusic.play().catch(() => {});
      }
    }
  }

  public toggleMute(): boolean {
    this.setMuted(!this.muted);
    return this.muted;
  }

  /**
   * Starts playing the continuous Bounce Tales background theme soundtrack.
   */
  public startBgMusic(): void {
    this.isMusicPlaying = true;
    if (this.muted) return;

    if (this.bgMusic) {
      if (this.bgMusic.paused) {
        this.bgMusic.play().catch(() => {
          // Autoplay policy: will resume on next user interaction
        });
      }
    }
  }

  /**
   * Pauses continuous background music.
   */
  public stopBgMusic(): void {
    this.isMusicPlaying = false;
    if (this.bgMusic) {
      this.bgMusic.pause();
      this.bgMusic.currentTime = 0;
    }
  }

  /**
   * Plays the death jingle / cry of disappointment upon losing the game.
   */
  public playDeathSound(): void {
    if (this.muted) return;

    // 1. Play death track
    if (this.deathAudio) {
      this.deathAudio.currentTime = 0;
      this.deathAudio.play().catch(() => {});
    }

    // 2. Play cartoon creature cry of disappointment ("waaah-waaah")
    this.playDisappointmentCry();
  }

  /**
   * Synthesized cartoon cry of disappointment (descending sliding pitch with quivering vibrato).
   */
  public playDisappointmentCry(): void {
    if (this.muted) return;
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;

      // Cry Part 1 (Short high whimper)
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = 'sawtooth';
      osc1.frequency.setValueAtTime(460, now);
      osc1.frequency.linearRampToValueAtTime(320, now + 0.22);
      gain1.gain.setValueAtTime(0.2, now);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.start(now);
      osc1.stop(now + 0.25);

      // Cry Part 2 (Longer quivering disappointment wail)
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      const lfo = ctx.createOscillator();
      const lfoGain = ctx.createGain();

      // 6Hz wobble/quiver in the voice
      lfo.frequency.setValueAtTime(6.5, now + 0.25);
      lfoGain.gain.setValueAtTime(25, now + 0.25);
      lfo.connect(osc2.frequency);

      osc2.type = 'triangle';
      osc2.frequency.setValueAtTime(340, now + 0.25);
      osc2.frequency.exponentialRampToValueAtTime(140, now + 1.1);

      gain2.gain.setValueAtTime(0.001, now);
      gain2.gain.setValueAtTime(0.28, now + 0.26);
      gain2.gain.exponentialRampToValueAtTime(0.001, now + 1.15);

      osc2.connect(gain2);
      gain2.connect(ctx.destination);

      lfo.start(now + 0.25);
      osc2.start(now + 0.25);
      lfo.stop(now + 1.15);
      osc2.stop(now + 1.15);
    } catch {
      // Audio failsafe
    }
  }

  public playBounce(intensity: number = 0.5): void {
    if (this.muted) return;
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      const baseFreq = 160 + Math.min(intensity, 1) * 80;
      osc.type = 'sine';
      osc.frequency.setValueAtTime(baseFreq, now);
      osc.frequency.exponentialRampToValueAtTime(baseFreq * 1.8, now + 0.06);
      osc.frequency.exponentialRampToValueAtTime(baseFreq * 0.9, now + 0.16);

      const vol = Math.min(Math.max(intensity * 0.25, 0.08), 0.35);
      gain.gain.setValueAtTime(vol, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.2);
    } catch {}
  }

  public playJump(): void {
    if (this.muted) return;
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(220, now);
      osc.frequency.exponentialRampToValueAtTime(540, now + 0.14);

      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.18);
    } catch {}
  }

  public playSpring(): void {
    if (this.muted) return;
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(280, now);
      osc.frequency.exponentialRampToValueAtTime(820, now + 0.18);
      osc.frequency.exponentialRampToValueAtTime(600, now + 0.32);

      gain.gain.setValueAtTime(0.25, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.35);
    } catch {}
  }

  public playCoin(): void {
    if (this.muted) return;
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(987.77, now);
      gain1.gain.setValueAtTime(0.2, now);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.start(now);
      osc1.stop(now + 0.15);

      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(1318.51, now + 0.06);
      gain2.gain.setValueAtTime(0.001, now);
      gain2.gain.setValueAtTime(0.25, now + 0.06);
      gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.28);
      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.start(now + 0.06);
      osc2.stop(now + 0.28);
    } catch {}
  }

  public playHurt(): void {
    if (this.muted) return;
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(200, now);
      osc.frequency.exponentialRampToValueAtTime(80, now + 0.2);

      gain.gain.setValueAtTime(0.26, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.25);
    } catch {}
  }

  public playVictory(): void {
    if (this.muted) return;
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6

      notes.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const startTime = now + i * 0.12;

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, startTime);

        gain.gain.setValueAtTime(0.001, startTime);
        gain.gain.linearRampToValueAtTime(0.22, startTime + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.35);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(startTime);
        osc.stop(startTime + 0.36);
      });
    } catch {}
  }

  public playSwitch(): void {
    if (this.muted) return;
    const ctx = this.getContext();
    if (!ctx) return;
    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, now);
      osc.frequency.exponentialRampToValueAtTime(1320, now + 0.12);
      gain.gain.setValueAtTime(0.3, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.2);
    } catch {}
  }

  public playBreak(): void {
    if (this.muted) return;
    const ctx = this.getContext();
    if (!ctx) return;
    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'square';
      osc.frequency.setValueAtTime(140, now);
      osc.frequency.exponentialRampToValueAtTime(40, now + 0.18);
      gain.gain.setValueAtTime(0.25, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.22);
    } catch {}
  }

  public playSuperBounce(): void {
    if (this.muted) return;
    const ctx = this.getContext();
    if (!ctx) return;
    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(320, now);
      osc.frequency.exponentialRampToValueAtTime(960, now + 0.22);
      gain.gain.setValueAtTime(0.35, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.28);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.28);
    } catch {}
  }

  /**
   * Heavy mechanical stone/iron crusher impact thud.
   * Uses low-frequency sine sub-bass and filtered dampening instead of a harsh sawtooth buzz,
   * with spatial distance volume attenuation.
   */
  public playCrusherSlam(volumeScale: number = 1.0): void {
    if (this.muted || volumeScale <= 0.02) return;
    const ctx = this.getContext();
    if (!ctx) return;
    try {
      const now = ctx.currentTime;
      const vol = Math.min(Math.max(volumeScale, 0), 1) * 0.35;

      // 1. Deep sub-bass impact thump (sine drop 85Hz -> 25Hz)
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(85, now);
      osc.frequency.exponentialRampToValueAtTime(25, now + 0.18);

      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(vol, now + 0.008);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.22);

      // 2. Heavy mechanical stone/iron clamp tap (filtered click, not a buzz)
      const clickOsc = ctx.createOscillator();
      const clickGain = ctx.createGain();
      clickOsc.type = 'triangle';
      clickOsc.frequency.setValueAtTime(140, now);
      clickOsc.frequency.exponentialRampToValueAtTime(45, now + 0.06);

      clickGain.gain.setValueAtTime(0.001, now);
      clickGain.gain.linearRampToValueAtTime(vol * 0.6, now + 0.004);
      clickGain.gain.exponentialRampToValueAtTime(0.001, now + 0.07);

      clickOsc.connect(clickGain);
      clickGain.connect(ctx.destination);
      clickOsc.start(now);
      clickOsc.stop(now + 0.07);
    } catch {}
  }

  /**
   * Fluid stroke upward swim impulse sound (gentle bubbling water ripple).
   */
  public playSwim(): void {
    if (this.muted) return;
    const ctx = this.getContext();
    if (!ctx) return;
    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(380, now);
      osc.frequency.exponentialRampToValueAtTime(560, now + 0.08);
      osc.frequency.exponentialRampToValueAtTime(320, now + 0.16);

      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.18, now + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.18);
    } catch {}
  }

  /**
   * Water entry/exit splash sound.
   */
  public playWaterSplash(): void {
    if (this.muted) return;
    const ctx = this.getContext();
    if (!ctx) return;
    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(260, now);
      osc.frequency.exponentialRampToValueAtTime(110, now + 0.22);

      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.24, now + 0.015);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.24);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.24);
    } catch {}
  }

  /**
   * Visceral cartoon creature gulp / swallow sound when entering the monster mouth.
   */
  public playSwallow(): void {
    if (this.muted) return;
    const ctx = this.getContext();
    if (!ctx) return;
    try {
      const now = ctx.currentTime;
      // 1. Resonant squishy descending throat glide
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(340, now);
      osc.frequency.exponentialRampToValueAtTime(110, now + 0.35);

      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.35, now + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.4);

      // 2. Wet throat gulp click
      const click = ctx.createOscillator();
      const clickGain = ctx.createGain();
      click.type = 'sine';
      click.frequency.setValueAtTime(180, now + 0.12);
      click.frequency.exponentialRampToValueAtTime(80, now + 0.28);

      clickGain.gain.setValueAtTime(0.001, now);
      clickGain.gain.setValueAtTime(0.28, now + 0.13);
      clickGain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);

      click.connect(clickGain);
      clickGain.connect(ctx.destination);
      click.start(now + 0.12);
      click.stop(now + 0.3);
    } catch {}
  }

  /**
   * Snapping monster jaws violent tooth clamp / chomp impact sound.
   */
  public playChomp(): void {
    if (this.muted) return;
    const ctx = this.getContext();
    if (!ctx) return;
    try {
      const now = ctx.currentTime;
      // 1. Heavy bone thud impact
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(180, now);
      osc.frequency.exponentialRampToValueAtTime(32, now + 0.16);
      gain.gain.setValueAtTime(0.45, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.18);

      // 2. Sharp ivory teeth snap click
      const click = ctx.createOscillator();
      const clickGain = ctx.createGain();
      click.type = 'square';
      click.frequency.setValueAtTime(520, now);
      click.frequency.exponentialRampToValueAtTime(90, now + 0.05);
      clickGain.gain.setValueAtTime(0.3, now);
      clickGain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);
      click.connect(clickGain);
      clickGain.connect(ctx.destination);
      click.start(now);
      click.stop(now + 0.06);
    } catch {}
  }
}

export const soundManager = new SoundManager();
