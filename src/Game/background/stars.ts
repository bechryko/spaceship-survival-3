import { GAME_HEIGHT, GAME_WIDTH } from '../hud';
import { between, choose } from '../utils';

const STAR_COUNT = 180;
const STAR_TINTS = ['#ffffff', '#cfe3ff', '#fff1c9', '#ffecf6'];
const SMALL_STAR_CHANCE = 0.875;
const SMALL_STAR_MIN_SIZE = 1;
export const SMALL_STAR_MAX_SIZE = 1.8;
const LARGE_STAR_MIN_SIZE = 2;
const LARGE_STAR_MAX_SIZE = 4.5;

const MIN_BRIGHTNESS = 0.4;

const MIN_TWINKLE_SPEED = 1;
const MAX_TWINKLE_SPEED = 1.75;

export interface Star {
  x: number;
  y: number;
  size: number;
  brightness: number;
  speed: number; // flicker rate in radians per second
  phaseChange: number;
  startingPhase: number;
  tint: string;
}

export function createStars(width = GAME_WIDTH, height = GAME_HEIGHT, starCount = STAR_COUNT, seed?: number): Star[] {
  return Array.from({ length: starCount }, () => {
    if (seed) {
      seed += 5;
    }

    return {
      x: between(0, width, { floor: false, seed: seed ? seed + 1 : undefined }),
      y: between(0, height, { floor: false, seed: seed ? seed + 2 : undefined }),
      size:
        between(0, 1, { floor: false, seed }) < SMALL_STAR_CHANCE
          ? between(SMALL_STAR_MIN_SIZE, SMALL_STAR_MAX_SIZE, { floor: false, seed })
          : between(LARGE_STAR_MIN_SIZE, LARGE_STAR_MAX_SIZE, { floor: false, seed }),
      brightness: between(MIN_BRIGHTNESS, 1, { floor: false, seed }),
      speed: between(MIN_TWINKLE_SPEED, MAX_TWINKLE_SPEED, { floor: false, seed: seed ? seed + 3 : undefined }),
      phaseChange: 0,
      startingPhase: between(0, Math.PI * 2, { floor: false, seed: seed ? seed + 4 : undefined }),
      tint: choose(STAR_TINTS, seed)
    };
  });
}
