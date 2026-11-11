import { GAME_WIDTH } from '../hud';
import { between } from '../utils';
import { Asteroid } from './asteroid';
import { createCraters } from './craters';
import { createAsteroidShape } from './hitbox';

const STARTING_MIN_ASTEROID_SIZE = 75;
const STARTING_MAX_ASTEROID_SIZE = 125;
const ASTEROID_SIZE_INCREASE_PER_POINT = 1;

const ASTEROID_X_SPAWN_SPLIT = 4;

let lastSplit = ASTEROID_X_SPAWN_SPLIT;

export function createAsteroid(score: number, object: Partial<Asteroid> = {}): Asteroid {
  const r = between(STARTING_MIN_ASTEROID_SIZE, STARTING_MAX_ASTEROID_SIZE) + ASTEROID_SIZE_INCREASE_PER_POINT * score;
  let split = between(0, ASTEROID_X_SPAWN_SPLIT - 1, { includeMax: false });
  if (split >= lastSplit) {
    split++;
  }
  lastSplit = split;

  const splitStart = (GAME_WIDTH / ASTEROID_X_SPAWN_SPLIT) * split;
  const splitEnd = (GAME_WIDTH / ASTEROID_X_SPAWN_SPLIT) * (split + 1);
  const x = between(splitStart, splitEnd, { includeMax: false });

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
