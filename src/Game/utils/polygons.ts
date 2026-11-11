import { Point } from '../models';

/** Ray-cast test: is (px, py) inside the polygon? */
function pointInPolygon(px: number, py: number, poly: readonly Point[]): boolean {
  let inside = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const [xi, yi] = poly[i];
    const [xj, yj] = poly[j];
    if (yi > py !== yj > py && px < ((xj - xi) * (py - yi)) / (yj - yi) + xi) {
      inside = !inside;
    }
  }
  return inside;
}

/** Which side of the line a->b the point c lies on (sign of the cross product). */
function orientation(ax: number, ay: number, bx: number, by: number, cx: number, cy: number): number {
  return Math.sign((bx - ax) * (cy - ay) - (by - ay) * (cx - ax));
}

/** Do segments a-b and c-d properly cross each other? */
function segmentsIntersect(
  ax: number,
  ay: number,
  bx: number,
  by: number,
  cx: number,
  cy: number,
  dx: number,
  dy: number
): boolean {
  return (
    orientation(ax, ay, bx, by, cx, cy) !== orientation(ax, ay, bx, by, dx, dy) &&
    orientation(cx, cy, dx, dy, ax, ay) !== orientation(cx, cy, dx, dy, bx, by)
  );
}

/**
 * True if the two polygons overlap. Both must be in the same coordinate space.
 *
 * 1. If any edge of A crosses any edge of B, they overlap.
 * 2. Otherwise they either don't touch at all, or one is completely inside the
 *    other. Testing one vertex of each against the other polygon tells those apart.
 */
export function polygonsCollide(a: readonly Point[], b: readonly Point[]): boolean {
  for (let i = 0, j = a.length - 1; i < a.length; j = i++) {
    const [ax, ay] = a[j];
    const [bx, by] = a[i];

    for (let k = 0, l = b.length - 1; k < b.length; l = k++) {
      const [cx, cy] = b[l];
      const [dx, dy] = b[k];
      if (segmentsIntersect(ax, ay, bx, by, cx, cy, dx, dy)) {
        return true;
      }
    }
  }

  return pointInPolygon(a[0][0], a[0][1], b) || pointInPolygon(b[0][0], b[0][1], a);
}

/**
 * Scale, then rotate (same convention as ctx.rotate), then translate a polygon.
 * Use it to put a unit-space outline into the same space as another polygon.
 */
export function transformPolygon(
  points: readonly Point[],
  scale: number,
  angle: number,
  tx: number,
  ty: number
): Point[] {
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);
  return points.map<Point>(([x, y]) => [(x * cos - y * sin) * scale + tx, (x * sin + y * cos) * scale + ty]);
}

/** Distance from the origin to the farthest vertex: a bounding-circle radius for quick rejection. */
export function boundingRadius(points: readonly Point[]): number {
  return Math.max(...points.map(([x, y]) => Math.hypot(x, y)));
}
