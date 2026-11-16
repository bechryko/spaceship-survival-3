import { GAME_HEIGHT, GAME_WIDTH } from '../hud';
import { between, choose } from '../utils';

const STAR_COUNT = 160;
const STAR_TINTS = ['#ffffff', '#cfe3ff', '#fff1c9', '#ffecf6'];
const SMALL_STAR_CHANCE = 0.875;
const SMALL_STAR_MIN_SIZE = 1;
const SMALL_STAR_MAX_SIZE = 1.8;
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
  phase: number;
  tint: string;
}

export function createStars(width = GAME_WIDTH, height = GAME_HEIGHT, starCount = STAR_COUNT): Star[] {
  return Array.from({ length: starCount }, () => ({
    x: Math.random() * width,
    y: Math.random() * height,
    size:
      Math.random() < SMALL_STAR_CHANCE
        ? between(SMALL_STAR_MIN_SIZE, SMALL_STAR_MAX_SIZE, { floor: false })
        : between(LARGE_STAR_MIN_SIZE, LARGE_STAR_MAX_SIZE, { floor: false }),
    brightness: between(MIN_BRIGHTNESS, 1, { floor: false }),
    speed: between(MIN_TWINKLE_SPEED, MAX_TWINKLE_SPEED, { floor: false }),
    phase: Math.random() * Math.PI * 2,
    tint: choose(STAR_TINTS)
  }));
}
