// src/config/gameConstants.ts

/**
 * Global game constants and configuration parameters for Bumble Ball.
 * Adjust values here to rebalance player physics, hearts/health, scoring, and level mechanics.
 */
export const GAME_CONFIG = {
  // Player Stats & Health
  PLAYER: {
    MAX_HEALTH: 100,                // Maximum hearts / lives
    INITIAL_HEALTH: 100,            // Starting health count
    MOVE_SPEED: 240,              // Base movement velocity (px/s)
    ACCELERATION: 900,            // Horizontal roll acceleration (px/s^2)
    MAX_VELOCITY_X: 260,          // Max horizontal speed cap
    MAX_VELOCITY_Y: 800,          // Max downward fall velocity
    JUMP_FORCE: -460,             // Normal jump impulse
    GRAVITY_Y: 1000,              // Downward gravity acceleration
    DRAG_X: 350,                  // Ground & air deceleration drag
    INVULNERABILITY_MS: 1500,     // Grace period after respawn with visual blinking (ms)
    COYOTE_TIME_MS: 120,          // Jump window after rolling off a ledge (ms)
    JUMP_BUFFER_MS: 140,          // Buffered jump input window before landing (ms)
    RESPAWN_DELAY_MS: 850,        // Hurt pause delay before respawning at checkpoint (ms)
  },

  // Environmental Physics & World Elements
  PHYSICS: {
    TILE_SIZE: 48,                // Base world grid tile size (px)
    SPRING_LAUNCH_FORCE: -760,    // Vertical launch velocity for springs
    BOUNCER_MULTIPLIER: 2.5,      // Trampoline multiplier relative to jump force
    MUD_ACCELERATION_FACTOR: 0.5, // Acceleration multiplier when rolling in mud
    MUD_DRAG_X: 850,              // High friction drag in mud
    MUD_JUMP_FACTOR: 0.6,         // Reduced jump height when jumping out of mud
  },

  // Scoring & Reward Values
  SCORING: {
    COIN_POINTS: 100,             // Score rewarded per collected coin
    LEVEL_CLEAR_POINTS: 500,      // Bonus score for reaching level portal
    PRICK_PENALTY: 50,            // Score deducted on hazard collision (optional)
  },

  // Camera Tuning
  CAMERA: {
    DEADZONE_WIDTH: 80,
    DEADZONE_HEIGHT: 60,
    LERP_X: 0.08,
    LERP_Y: 0.08,
  },
} as const;

export type GameConfig = typeof GAME_CONFIG;
