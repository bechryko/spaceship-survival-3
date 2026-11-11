import { Circle, Point } from '../models';
import { between, boundingRadius } from '../utils';
import { ASTEROID_MAX_REACH_IN, AsteroidShape } from './hitbox';

const CRATER_MIN_COUNT = 2;
const CRATER_MAX_COUNT = 5;
const CRATER_MIN_SIZE = 0.05;
const CRATER_MAX_SIZE = 0.2;

export function createCraters(asteroidPoints: AsteroidShape): readonly Circle[] {
  const asteroidBoundingRadius = boundingRadius(asteroidPoints);
  const craterCount = between(CRATER_MIN_COUNT, CRATER_MAX_COUNT);

  const craters: Circle[] = [];
  for (let idx = 0; idx < craterCount; idx++) {
    let coords: Circle;

    do {
      coords = getCraterCoords(craterCount, idx, asteroidBoundingRadius);
    } while (areCoordsOccupied(coords, craters, asteroidPoints));
    craters.push(coords);
  }

  return craters;
}

function getCraterCoords(craterCount: number, idx: number, asteroidBoundingRadius: number): Circle {
  const a = ((Math.PI * 2) / craterCount) * idx;
  const r = between(CRATER_MIN_SIZE, CRATER_MAX_SIZE, { floor: false });
  const dist = between(r * 2, Math.random() * (asteroidBoundingRadius - ASTEROID_MAX_REACH_IN / 2 - r), {
    squaredDistribution: true,
    floor: false
  });

  return {
    x: Math.cos(a) * dist,
    y: Math.sin(a) * dist,
    r
  };
}

const CRATER_COLLISION_MARGIN_MULTIPLIER = 1.5;
const CRATER_VERTEX_MARGIN_MULTIPLIER = 2;

function areCoordsOccupied(coords: Circle, otherCoords: Circle[], otherPoints: readonly Point[]): boolean {
  return (
    otherCoords.some(
      otherC =>
        (coords.x - otherC.x) ** 2 + (coords.y - otherC.y) ** 2 <=
        ((coords.r + otherC.r) * CRATER_COLLISION_MARGIN_MULTIPLIER) ** 2
    ) ||
    otherPoints.some(
      otherP =>
        (coords.x - otherP[0]) ** 2 + (coords.y - otherP[1]) ** 2 <= (coords.r * CRATER_VERTEX_MARGIN_MULTIPLIER) ** 2
    )
  );
}
