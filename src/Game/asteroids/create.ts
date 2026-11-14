import { GAME_WIDTH, GameState } from '../hud';
import { between } from '../utils';
import { Asteroid } from './asteroid';
import { AsteroidBlueprint, regularAsteroidBlueprint, startingAsteroidDataProvider } from './blueprints';
import { createCraters } from './craters';
import { createAsteroidShape } from './hitbox';

const LEVEL_2_ASTEROID_SPAWN_THRESHOLD = 25;
const LEVEL_2_ASTEROID_SPAWN_CHANCE = 0.2;

const MIN_X_DISTANCE_FROM_LAST = GAME_WIDTH / 4;

export interface AsteroidCreationModifiers {
  blueprint?: AsteroidBlueprint;
  x?: number;
  y?: number;
  velocity?: number;
  velocityHorizontal?: number;
  notPrimaryAsteroid?: boolean;
}

let lastX: number | null = null;

export function createAsteroid(
  state: GameState,
  creationModifiers: AsteroidCreationModifiers,
  object: Partial<Asteroid> = {}
): Asteroid {
  const { asteroidsSpawned } = state.statistics;
  const blueprint = creationModifiers.blueprint ?? getBlueprint(state, asteroidsSpawned);

  const increase = Math.min(
    blueprint.sizeIncreaseMax,
    blueprint.sizeIncrease * (asteroidsSpawned - blueprint.sizeIncreaseStart)
  );
  const r = between(blueprint.minSize, blueprint.maxSize + increase);

  let x: number;
  if (creationModifiers.x) {
    x = creationModifiers.x;
  } else {
    x = pickSpawnX(lastX);
  }

  if (!creationModifiers.notPrimaryAsteroid) {
    lastX = x;
  }

  const y = creationModifiers.y ?? -r;
  const velocity = creationModifiers.velocity ?? blueprint.velocity;
  const velocityHorizontal = creationModifiers.velocityHorizontal ?? 0;

  Object.assign(object, <Asteroid>{
    type: blueprint.type,
    x,
    y,
    r,
    velocity,
    velocityHorizontal,
    angle: Math.random() * Math.PI * 2,
    color: {
      hue: between(blueprint.color.minHue, blueprint.color.maxHue, { floor: false }),
      saturation: between(blueprint.color.minSaturation, blueprint.color.maxSaturation, { floor: false }),
      lightness: between(blueprint.color.minLightness, blueprint.color.maxLightness, { floor: false })
    },
    active: true,
    data: {
      ...startingAsteroidDataProvider[blueprint.type]()
    }
  });

  object.shape = createAsteroidShape(blueprint);
  object.craters = createCraters(blueprint, object.shape!);

  return object as Asteroid;
}

function getBlueprint(state: GameState, asteroidsSpawned: number): AsteroidBlueprint {
  if (asteroidsSpawned < LEVEL_2_ASTEROID_SPAWN_THRESHOLD) {
    return regularAsteroidBlueprint;
  }

  if (Math.random() < LEVEL_2_ASTEROID_SPAWN_CHANCE) {
    return state.asteroidBlueprints.level2;
  }

  return regularAsteroidBlueprint;
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
