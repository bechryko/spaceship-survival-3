import { Point } from '../models';
import { between } from '../utils';
import { AsteroidBlueprint } from './blueprints';

export type AsteroidShape = readonly Point[];

export function createAsteroidShape(blueprint: AsteroidBlueprint): AsteroidShape {
  const vertexCount = between(blueprint.minVertexCount, blueprint.maxVertexCount);
  const averageRotation = (Math.PI * 2) / vertexCount;

  const points: Point[] = [];
  points.push([between(1 - blueprint.maxReachIn, 1, { floor: false }), 0]);

  for (let i = 0; i < vertexCount - 1; i++) {
    const a = averageRotation * (i + between(0.75, 1.25, { floor: false }));
    const radius = between(1 - blueprint.maxReachIn, 1, { floor: false });

    points.push([Math.cos(a) * radius, Math.sin(a) * radius]);
  }

  return points;
}
