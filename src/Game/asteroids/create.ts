import { GAME_WIDTH } from '../hud';
import { between } from '../utils';
import { Asteroid } from './asteroid';
import { createAsteroidShape } from './hitbox';

const STARTING_MIN_ASTEROID_SIZE = 50;
const STARTING_MAX_ASTEROID_SIZE = 100;
const ASTEROID_SIZE_INCREASE_PER_POINT = 2;

const ASTEROID_X_SPAWN_SPLIT = 4;

let lastSplit = ASTEROID_X_SPAWN_SPLIT;

export function createAsteroid(score: number): Asteroid {
  const r = between(STARTING_MIN_ASTEROID_SIZE, STARTING_MAX_ASTEROID_SIZE) + ASTEROID_SIZE_INCREASE_PER_POINT * score;
  let split = between(0, ASTEROID_X_SPAWN_SPLIT - 1, { includeMax: false });
  if (split >= lastSplit) {
    split++;
  }
  lastSplit = split;

  const splitStart = (GAME_WIDTH / ASTEROID_X_SPAWN_SPLIT) * split;
  const splitEnd = (GAME_WIDTH / ASTEROID_X_SPAWN_SPLIT) * (split + 1);
  const x = between(splitStart, splitEnd, { includeMax: false });

  return {
    x,
    y: -r,
    r,
    velocity: 140,
    angle: Math.random() * Math.PI * 2,
    shape: createAsteroidShape()
  };
}
