import { GAME_HEIGHT, GAME_WIDTH } from '../hud';
import { between } from '../utils';

const STAR_COUNT = 140;
const STAR_TINTS = ['#ffffff', '#cfe3ff', '#fff1c9']; // white, icy blue, warm yellow

const SMALL_STAR_CHANCE = 0.85;
const SMALL_STAR_MIN_SIZE = 1;
const SMALL_STAR_MAX_SIZE = 1.8;
const LARGE_STAR_MIN_SIZE = 2;
const LARGE_STAR_MAX_SIZE = 4;

const MIN_BRIGHTNESS = 0.4;

const MIN_TWINKLE_SPEED = 1;
const MAX_TWINKLE_SPEED = 1.75;

export interface Star {
  x: number;
  y: number;
  size: number;
  brightness: number;
  speed: number; // flicker rate in radians per second
  phase: number;
  tint: string;
}

export function createStars(): Star[] {
  return Array.from({ length: STAR_COUNT }, () => ({
    x: Math.random() * GAME_WIDTH,
    y: Math.random() * GAME_HEIGHT,
    size:
      Math.random() < SMALL_STAR_CHANCE
        ? between(SMALL_STAR_MIN_SIZE, SMALL_STAR_MAX_SIZE, { floor: false })
        : between(LARGE_STAR_MIN_SIZE, LARGE_STAR_MAX_SIZE, { floor: false }),
    brightness: between(MIN_BRIGHTNESS, 1, { floor: false }),
    speed: between(MIN_TWINKLE_SPEED, MAX_TWINKLE_SPEED, { floor: false }),
    phase: Math.random() * Math.PI * 2,
    tint: STAR_TINTS[Math.floor(Math.random() * STAR_TINTS.length)]
  }));
}
