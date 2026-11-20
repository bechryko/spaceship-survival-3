import { Point } from '../models';
import { between, getNumberOrRangeValue } from '../utils';
import { AsteroidBlueprint } from './blueprints';

const VERTEX_ROTATION_JITTER = 0.3;

export type AsteroidShape = readonly Point[];

const SPECIAL_ASTEROID_SHAPE_REGULAR_CHANCE = 1 / 1000;

export function createAsteroidShape(blueprint: AsteroidBlueprint): AsteroidShape {
  const chance = Math.random();
  if (chance < SPECIAL_ASTEROID_SHAPE_REGULAR_CHANCE) {
    return createSpecialAsteroidShapeRegular(blueprint);
  }

  const vertexCount = getNumberOrRangeValue(blueprint.vertexCount);
  const averageRotation = (Math.PI * 2) / vertexCount;

  const points: Point[] = [];
  points.push([between(1 - blueprint.maxReachIn, 1, { floor: false }), 0]);

  for (let i = 0; i < vertexCount - 1; i++) {
    const angle =
      averageRotation * (i + between(1 - VERTEX_ROTATION_JITTER, 1 + VERTEX_ROTATION_JITTER, { floor: false }));
    const radius = between(1 - blueprint.maxReachIn, 1, { floor: false });

    points.push([Math.cos(angle) * radius, Math.sin(angle) * radius]);
  }

  return points;
}

function createSpecialAsteroidShapeRegular(blueprint: AsteroidBlueprint): AsteroidShape {
  const vertexCount = getNumberOrRangeValue(blueprint.vertexCount);
  const averageRotation = (Math.PI * 2) / vertexCount;
  const radius = between(1 - blueprint.maxReachIn, 1, { floor: false });

  const points: Point[] = [];

  for (let i = 0; i < vertexCount; i++) {
    const angle = averageRotation * i;
    points.push([Math.cos(angle) * radius, Math.sin(angle) * radius]);
  }

  return points;
}
