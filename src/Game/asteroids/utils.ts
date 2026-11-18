import { Point } from '../models';
import { Asteroid } from './asteroid';

/** The asteroid's outline in game coordinates: scaled, rotated (same convention as ctx.rotate) and moved. */
export function getAsteroidPolygon(asteroid: Asteroid): Point[] {
  const cos = Math.cos(asteroid.angle);
  const sin = Math.sin(asteroid.angle);

  return asteroid.shape.map(
    ([x, y]) => [(x * cos - y * sin) * asteroid.r + asteroid.x, (x * sin + y * cos) * asteroid.r + asteroid.y] as Point
  );
}
