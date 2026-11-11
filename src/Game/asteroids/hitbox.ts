import { Point } from '../models';
import { between } from '../utils';

export type AsteroidShape = readonly Point[];

const ASTEROID_MIN_VERTEX_COUNT = 9;
const ASTEROID_MAX_VERTEX_COUNT = 13;

export const ASTEROID_MAX_REACH_IN = 0.25;

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

  return points;
}
