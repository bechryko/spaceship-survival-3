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
  spine?: readonly Point[];
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

const SCIENTIST_SCALE = 1.2;

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
  },
  [AbilityClass.SCIENTIST]: {
    hull: scaleUp(
      [
        [0, -24], // nose
        [7, -14],
        [10, -6],
        [20, -8], // right pod
        [24, -2],
        [24, 12],
        [18, 16],
        [10, 12],
        [8, 22], // right engine
        [-8, 22], // left engine
        [-10, 12],
        [-18, 16],
        [-24, 12], // left pod
        [-24, -2],
        [-20, -8],
        [-10, -6],
        [-7, -14]
      ],
      SCIENTIST_SCALE
    ),
    hitbox: scaleUp(
      [
        [0, -22.5],
        [6, -13.5],
        [9.5, -5],
        [19.5, -7],
        [23, -1.5],
        [23, 11.5],
        [18, 15],
        [9.5, 10.5],
        [7.5, 21],
        [-7.5, 21],
        [-9.5, 10.5],
        [-18, 15],
        [-23, 11.5],
        [-23, -1.5],
        [-19.5, -7],
        [-9.5, -5],
        [-6, -13.5]
      ],
      SCIENTIST_SCALE
    ),
    engines: scaleUp([[0, 22]], SCIENTIST_SCALE),
    cockpit: { cx: 0, cy: -8 * SCIENTIST_SCALE, rx: 4.5 * SCIENTIST_SCALE, ry: 6 * SCIENTIST_SCALE },
    spine: scaleUp(
      [
        [0, -19],
        [0, 17]
      ],
      SCIENTIST_SCALE
    ),
    panels: [
      scaleUp(
        [
          [12, -5],
          [22, -3],
          [22, 11],
          [12, 10]
        ],
        SCIENTIST_SCALE
      ),
      scaleUp(
        [
          [-12, -5],
          [-22, -3],
          [-22, 11],
          [-12, 10]
        ],
        SCIENTIST_SCALE
      )
    ],
    lights: scaleUp(
      [
        [21, 2],
        [-21, 2]
      ],
      SCIENTIST_SCALE
    ),
    width: 24 * SCIENTIST_SCALE
  }
};
