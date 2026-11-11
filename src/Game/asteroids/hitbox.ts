import { Circle, Point } from '../models';
import { between, boundingRadius } from '../utils';

export interface AsteroidShape {
  points: readonly Point[];
  craters: readonly Circle[];
  hue: number;
  lightness: number;
}

const ASTEROID_MIN_VERTEX_COUNT = 9;
const ASTEROID_MAX_VERTEX_COUNT = 13;

const ASTEROID_MAX_REACH_IN = 0.25;

function getAsteroidVertexRadius(): number {
  return between(1 - ASTEROID_MAX_REACH_IN, 1, { floor: false });
}

export function createAsteroidShape(): AsteroidShape {
  const vertexCount = between(ASTEROID_MIN_VERTEX_COUNT, ASTEROID_MAX_VERTEX_COUNT);
  const points: Point[] = [];
  const averageRotation = (Math.PI * 2) / vertexCount;
  points.push([getAsteroidVertexRadius(), 0]);
  for (let i = 0; i < vertexCount - 1; i++) {
    const a = averageRotation * (i + between(0.75, 1.25, { floor: false }));
    const radius = getAsteroidVertexRadius();
    points.push([Math.cos(a) * radius, Math.sin(a) * radius]);
  }

  const craters = createCraters(points);
  return {
    points,
    craters,
    hue: 15 + Math.random() * 25,
    lightness: 34 + Math.random() * 12
  };
}

const CRATER_MIN_COUNT = 2;
const CRATER_MAX_COUNT = 5;
const CRATER_MIN_SIZE = 0.1;
const CRATER_MAX_SIZE = 0.175;

function createCraters(asteroidPoints: Point[]): readonly Circle[] {
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

function areCoordsOccupied(coords: Circle, otherCoords: Circle[], otherPoints: Point[]): boolean {
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
