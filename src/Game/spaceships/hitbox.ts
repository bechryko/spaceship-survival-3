import type { Point } from '../models';

export const SHIP_SCALE = 1.2;

// Ship outline, centred on (0, 0) with the nose pointing up.
export const SHIP_HULL: readonly Point[] = [
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
].map(([x, y]) => [x * SHIP_SCALE, y * SHIP_SCALE]);

export const SHIP_HALF_WIDTH = 22 * SHIP_SCALE;
