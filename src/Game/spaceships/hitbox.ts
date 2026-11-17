import { Point } from '../models';
import { AbilityClass } from './ability-class';

function scaleUp(points: Point[], scale: number): Point[] {
  return points.map(([x, y]) => [x * scale, y * scale]);
}

/**
 * Everything that makes up a spaceship's look and hitbox, in unit coordinates centred on the ship with
 * the nose pointing up. The selection menu draws icons from this, and the game scales it up (see analyst.ts).
 */
export interface SpaceshipShape {
  /** The outline that is drawn. */
  hull: readonly Point[];
  /** The outline asteroids collide with. It can differ from the hull, e.g. be a little more forgiving. */
  hitbox: readonly Point[];
  /** Where the exhaust flames come out. */
  engines: readonly Point[];
  cockpit: { cx: number; cy: number; rx: number; ry: number };
  /** A centre line down the hull. */
  spine: readonly Point[];
  /** Darker panels drawn on top of the hull. */
  panels?: readonly (readonly Point[])[];
  /** Small glowing lights. */
  lights?: readonly Point[];
  width: number;
}

const GUNSHIP_SCALE = 1.2;
// Ship outline, centred on (0, 0) with the nose pointing up.
const GUNSHIP_HULL: readonly Point[] = scaleUp(
  [
    [0, -26], // nose
    [6, -12],
    [8, 2],
    [22, 14], // right wing
    [22, 22],
    [9, 16],
    [6, 24], // right engine
    [-6, 24], // left engine
    [-9, 16],
    [-22, 22], // left wing
    [-22, 14],
    [-8, 2],
    [-6, -12]
  ],
  GUNSHIP_SCALE
);

export const spaceshipAbilityClassShipShapeMap: Record<AbilityClass, SpaceshipShape> = {
  [AbilityClass.GUNSHIP]: {
    hull: GUNSHIP_HULL,
    hitbox: GUNSHIP_HULL,
    engines: scaleUp([[0, 24]], GUNSHIP_SCALE),
    cockpit: { cx: 0, cy: -6 * GUNSHIP_SCALE, rx: 3.5 * GUNSHIP_SCALE, ry: 7 * GUNSHIP_SCALE },
    spine: scaleUp(
      [
        [0, -22],
        [0, 20]
      ],
      GUNSHIP_SCALE
    ),
    width: 22 * GUNSHIP_SCALE
  }
};
