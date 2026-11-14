import { GAME_WIDTH } from '../hud';
import { between } from '../utils';
import { Asteroid } from './asteroid';
import { regularAsteroidBlueprint } from './blueprints';
import { createCraters } from './craters';
import { createAsteroidShape } from './hitbox';

const MIN_X_DISTANCE_FROM_LAST = GAME_WIDTH / 4;

let lastX: number | null = null;

export function createAsteroid(asteroidsSpawned: number, object: Partial<Asteroid> = {}): Asteroid {
  const blueprint = regularAsteroidBlueprint;

  const increase = Math.min(
    blueprint.sizeIncreaseMax,
    blueprint.sizeIncrease * (asteroidsSpawned - blueprint.sizeIncreaseStart)
  );
  const r = between(blueprint.minSize, blueprint.maxSize + increase);

  const x = pickSpawnX(lastX);
  lastX = x;

  Object.assign(object, {
    x,
    y: -r,
    r,
    velocity: blueprint.velocity,
    angle: Math.random() * Math.PI * 2,
    hue: between(blueprint.color.minHue, blueprint.color.maxHue, { floor: false }),
    lightness: between(blueprint.color.minLightness, blueprint.color.maxLightness, { floor: false }),
    active: true
  });

  object.shape = createAsteroidShape(blueprint);
  object.craters = createCraters(blueprint, object.shape!);

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
