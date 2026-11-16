import { Circle, Point } from '../models';
import { between, boundingRadius, getNumberOrRangeValue } from '../utils';
import { AsteroidBlueprint } from './blueprints';
import { AsteroidShape } from './hitbox';

const CRATER_EDGE_PADDING = 0.05;

const CRATER_MAX_PLACEMENT_ATTEMPTS = 40;

export function createCraters(blueprint: AsteroidBlueprint, asteroidPoints: AsteroidShape): readonly Circle[] {
  const asteroidBoundingRadius = boundingRadius(asteroidPoints);
  const craterCount = getNumberOrRangeValue(blueprint.craters.count);

  const craters: Circle[] = [];
  for (let idx = 0; idx < craterCount; idx++) {
    for (let attempt = 0; attempt < CRATER_MAX_PLACEMENT_ATTEMPTS; attempt++) {
      const coords = getCraterCoords(blueprint, craterCount, idx, asteroidBoundingRadius);

      if (isInsideAsteroid(coords, asteroidPoints) && !areCoordsOccupied(coords, craters, asteroidPoints)) {
        craters.push(coords);
        break;
      }
    }
  }

  return craters;
}

function getCraterCoords(
  blueprint: AsteroidBlueprint,
  craterCount: number,
  idx: number,
  asteroidBoundingRadius: number
): Circle {
  const a = ((Math.PI * 2) / craterCount) * idx;
  const r = getNumberOrRangeValue(blueprint.craters.size, false);
  const dist = between(0, asteroidBoundingRadius - r, { squaredDistribution: true, floor: false });

  return {
    x: Math.cos(a) * dist,
    y: Math.sin(a) * dist,
    r
  };
}

function isInsideAsteroid(crater: Circle, polygon: readonly Point[]): boolean {
  if (!isPointInPolygon(crater.x, crater.y, polygon)) {
    return false;
  }

  const clearance = crater.r + CRATER_EDGE_PADDING;

  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    if (distanceToSegmentSquared(crater.x, crater.y, polygon[j], polygon[i]) < clearance ** 2) {
      return false;
    }
  }

  return true;
}

function isPointInPolygon(px: number, py: number, polygon: readonly Point[]): boolean {
  let inside = false;

  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const [xi, yi] = polygon[i];
    const [xj, yj] = polygon[j];

    if (yi > py !== yj > py && px < ((xj - xi) * (py - yi)) / (yj - yi) + xi) {
      inside = !inside;
    }
  }

  return inside;
}

function distanceToSegmentSquared(px: number, py: number, a: Point, b: Point): number {
  const ex = b[0] - a[0];
  const ey = b[1] - a[1];
  const t = Math.max(0, Math.min(1, ((px - a[0]) * ex + (py - a[1]) * ey) / (ex * ex + ey * ey)));
  const dx = px - (a[0] + t * ex);
  const dy = py - (a[1] + t * ey);

  return dx * dx + dy * dy;
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
