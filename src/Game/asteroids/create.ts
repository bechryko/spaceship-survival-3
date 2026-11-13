import { GAME_WIDTH } from '../hud';
import { between } from '../utils';
import { Asteroid } from './asteroid';
import { createCraters } from './craters';
import { createAsteroidShape } from './hitbox';

const STARTING_MIN_ASTEROID_SIZE = 75;
const STARTING_MAX_ASTEROID_SIZE = 125;
const ASTEROID_SIZE_INCREASE_PER_POINT = 1.5;
const MAX_ASTEROID_SIZE_INCREASE = 75;

const MIN_X_DISTANCE_FROM_LAST = GAME_WIDTH / 4;

let lastX: number | null = null;

export function createAsteroid(score: number, object: Partial<Asteroid> = {}): Asteroid {
  const increase = Math.min(MAX_ASTEROID_SIZE_INCREASE, ASTEROID_SIZE_INCREASE_PER_POINT * score);
  const r = between(STARTING_MIN_ASTEROID_SIZE, STARTING_MAX_ASTEROID_SIZE + increase);

  const x = pickSpawnX(lastX);
  lastX = x;

  Object.assign(object, {
    x,
    y: -r,
    r,
    velocity: 140,
    angle: Math.random() * Math.PI * 2,
    hue: 15 + Math.random() * 25,
    lightness: 34 + Math.random() * 12,
    active: true
  });

  object.shape = createAsteroidShape();
  object.craters = createCraters(object.shape!);

  return object as Asteroid;
}

function pickSpawnX(previousX: number | null): number {
  if (previousX === null) {
    return Math.random() * GAME_WIDTH;
  }

  const rightStart = previousX + MIN_X_DISTANCE_FROM_LAST;
  const leftLength = Math.max(0, previousX - MIN_X_DISTANCE_FROM_LAST);
  const rightLength = Math.max(0, GAME_WIDTH - rightStart);
  const totalLength = leftLength + rightLength;

  if (totalLength === 0) {
    return previousX < GAME_WIDTH / 2 ? GAME_WIDTH : 0;
  }

  const pick = Math.random() * totalLength;
  return pick < leftLength ? pick : rightStart + (pick - leftLength);
}
