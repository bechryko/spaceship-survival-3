import { GAME_WIDTH, GameState } from '../hud';
import { between, chance, getNumberOrRangeValue } from '../utils';
import { Asteroid } from './asteroid';
import { AsteroidBlueprint, regularAsteroidBlueprint, startingAsteroidDataProvider } from './blueprints';
import { createCraters } from './craters';
import { createAsteroidShape } from './hitbox';

interface SpawnChance {
  threshold: number;
  level2Chance: number;
}

export const ASTEROID_SPAWN_CHANCES: SpawnChance[] = [
  {
    threshold: 25,
    level2Chance: 0.15
  },
  {
    threshold: 75,
    level2Chance: 0.25
  }
];

const MIN_X_DISTANCE_FROM_LAST = GAME_WIDTH / 4;
const MIN_X_DISTANCE_FROM_SECOND_TO_LAST = GAME_WIDTH / 6;

export interface AsteroidCreationModifiers {
  blueprint?: AsteroidBlueprint;
  x?: number;
  y?: number;
  velocity?: number;
  velocityHorizontal?: number;
  notPrimaryAsteroid?: boolean;
}

let lastX: number | null = null;
let secondToLastX: number | null = null;

export function createAsteroid(
  state: GameState,
  creationModifiers: AsteroidCreationModifiers,
  object: Partial<Asteroid> = {}
): Asteroid {
  const { asteroidsSpawned } = state.statistics;
  const blueprint = creationModifiers.blueprint ?? getBlueprint(state, asteroidsSpawned);
  const { minSizeIncrease, maxSizeIncrease } = calculateSizeIncrease(blueprint, asteroidsSpawned);
  const r = between(blueprint.minSize + minSizeIncrease, blueprint.maxSize + maxSizeIncrease);

  let x: number;
  if (creationModifiers.x) {
    x = creationModifiers.x;
  } else {
    x = pickSpawnX(r, lastX, secondToLastX);
  }

  if (!creationModifiers.notPrimaryAsteroid) {
    [lastX, secondToLastX] = [x, lastX];
  }

  const y = creationModifiers.y ?? -r;
  const velocity = creationModifiers.velocity ?? getNumberOrRangeValue(blueprint.velocity);
  const velocityHorizontal = creationModifiers.velocityHorizontal ?? 0;
  const data = { ...(startingAsteroidDataProvider[blueprint.type]?.() ?? {}) };

  Object.assign(object, <Asteroid>{
    type: blueprint.type,
    x,
    y,
    r,
    velocity,
    velocityHorizontal,
    angle: Math.random() * Math.PI * 2,
    color: {
      hue: getNumberOrRangeValue(blueprint.color.hue),
      saturation: getNumberOrRangeValue(blueprint.color.saturation),
      lightness: getNumberOrRangeValue(blueprint.color.lightness)
    },
    active: true,
    data
  });

  object.shape = createAsteroidShape(blueprint);
  object.craters = createCraters(blueprint, object.shape!);

  return object as Asteroid;
}

function getBlueprint(state: GameState, asteroidsSpawned: number): AsteroidBlueprint {
  const spawnChanceObject = ASTEROID_SPAWN_CHANCES.findLast(sco => sco.threshold <= asteroidsSpawned);

  if (!spawnChanceObject) {
    return regularAsteroidBlueprint;
  }

  const spawnNumber = Math.random();
  if (spawnNumber < spawnChanceObject.level2Chance) {
    return state.asteroidBlueprints.level2;
  }

  return regularAsteroidBlueprint;
}

export function calculateSizeIncrease(
  blueprint: AsteroidBlueprint,
  asteroidsSpawned: number
): { minSizeIncrease: number; maxSizeIncrease: number } {
  let minSizeIncrease = 0;
  let maxSizeIncrease = 0;

  blueprint.sizeIncreases.forEach(sizeIncrease => {
    if (asteroidsSpawned <= sizeIncrease.start) {
      return;
    }

    if (sizeIncrease.type === 'min' || sizeIncrease.type === 'both') {
      minSizeIncrease += Math.min(sizeIncrease.max, sizeIncrease.increase * (asteroidsSpawned - sizeIncrease.start));
    }
    if (sizeIncrease.type === 'max' || sizeIncrease.type === 'both') {
      maxSizeIncrease += Math.min(sizeIncrease.max, sizeIncrease.increase * (asteroidsSpawned - sizeIncrease.start));
    }
  });

  return { minSizeIncrease, maxSizeIncrease };
}

function pickSpawnX(r: number, previousX: number | null, beforePreviousX: number | null): number {
  const screenSideOffset = r / 2;
  const lowerBound = -screenSideOffset;
  const upperBound = GAME_WIDTH + screenSideOffset;
  const intervals: [number, number][] = [[lowerBound, upperBound]];

  const exclusions = [
    previousX !== null ? [previousX - MIN_X_DISTANCE_FROM_LAST, previousX + MIN_X_DISTANCE_FROM_LAST] : null,
    beforePreviousX !== null
      ? [beforePreviousX - MIN_X_DISTANCE_FROM_SECOND_TO_LAST, beforePreviousX + MIN_X_DISTANCE_FROM_SECOND_TO_LAST]
      : null
  ].filter((zone): zone is [number, number] => zone !== null);

  for (const [start, end] of exclusions) {
    const nextIntervals: [number, number][] = [];

    for (const [left, right] of intervals) {
      if (end <= left || start >= right) {
        nextIntervals.push([left, right]);
        continue;
      }

      if (start > left) {
        nextIntervals.push([left, start]);
      }
      if (end < right) {
        nextIntervals.push([end, right]);
      }
    }

    intervals.splice(0, intervals.length, ...nextIntervals);
  }

  const totalLength = intervals.reduce((sum, [start, end]) => sum + end - start, 0);

  if (totalLength === 0) {
    return chance() ? lowerBound : upperBound;
  }

  let pick = Math.random() * totalLength;

  for (const [start, end] of intervals) {
    const length = end - start;

    if (pick < length) {
      return start + pick;
    }

    pick -= length;
  }

  console.warn('Using random asteroid position as all valid positions are excluded due to previous spawn positions.');
  return between(lowerBound, upperBound);
}
