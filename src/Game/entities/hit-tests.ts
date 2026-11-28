import { Asteroid, getAsteroidPolygon } from '../asteroids';
import { GAME_HEIGHT } from '../hud';
import { Point } from '../models';

/**
 * Swept test along a rocket's or bomb's path this frame, against each asteroid's real outline, so a fast
 * projectile can't skip an asteroid on a long frame. Returns the first asteroid it meets travelling up
 * (not just the first in the list) and the y where they touched, or null.
 */
export function findFirstContact(
  x: number,
  fromY: number,
  toY: number,
  radius: number,
  asteroids: readonly Asteroid[]
): { index: number; y: number } | null {
  if (toY > GAME_HEIGHT) {
    return null;
  }

  let best: { index: number; y: number } | null = null;

  for (let i = 0; i < asteroids.length; i++) {
    if (!asteroids[i].active) {
      continue;
    }

    const y = getSweptCircleContactY(asteroids[i], x, fromY, toY, radius);
    if (y !== null && (best === null || y > best.y)) {
      best = { index: i, y };
    }
  }

  return best;
}

/**
 * Quick rejection before the exact test: the outline always lies inside a circle of about `r` around the
 * asteroid's centre, so anything clearly farther away than that can't touch it.
 */
const BOUNDING_MARGIN = 1.05;

// ---------- Geometry ----------
/** Ray-cast test: is (px, py) inside the polygon? Works for concave shapes. */
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

const orientation = (ax: number, ay: number, bx: number, by: number, cx: number, cy: number): number =>
  Math.sign((bx - ax) * (cy - ay) - (by - ay) * (cx - ax));

/** Do segments a-b and c-d cross each other? */
function segmentsIntersect(a: Point, b: Point, c: Point, d: Point): boolean {
  return (
    orientation(a[0], a[1], b[0], b[1], c[0], c[1]) !== orientation(a[0], a[1], b[0], b[1], d[0], d[1]) &&
    orientation(c[0], c[1], d[0], d[1], a[0], a[1]) !== orientation(c[0], c[1], d[0], d[1], b[0], b[1])
  );
}

function distanceToSegmentSquared(px: number, py: number, a: Point, b: Point): number {
  const ex = b[0] - a[0];
  const ey = b[1] - a[1];
  const lengthSquared = ex * ex + ey * ey;
  const t = lengthSquared === 0 ? 0 : Math.max(0, Math.min(1, ((px - a[0]) * ex + (py - a[1]) * ey) / lengthSquared));
  const dx = px - (a[0] + t * ex);
  const dy = py - (a[1] + t * ey);

  return dx * dx + dy * dy;
}

/** Distance from a point to the polygon: 0 if the point is inside, otherwise the distance to the nearest edge. */
function distanceToPolygon(px: number, py: number, polygon: readonly Point[]): number {
  if (isPointInPolygon(px, py, polygon)) {
    return 0;
  }

  let best = Infinity;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    best = Math.min(best, distanceToSegmentSquared(px, py, polygon[j], polygon[i]));
  }

  return Math.sqrt(best);
}

/** Does the polygon overlap the axis-aligned rectangle? Concave polygons are fine. */
function polygonIntersectsRect(
  polygon: readonly Point[],
  left: number,
  top: number,
  right: number,
  bottom: number
): boolean {
  // 1. A corner of the outline is inside the rectangle
  for (const [x, y] of polygon) {
    if (x >= left && x <= right && y >= top && y <= bottom) {
      return true;
    }
  }

  // 2. An edge of the outline crosses an edge of the rectangle
  const corners: Point[] = [
    [left, top],
    [right, top],
    [right, bottom],
    [left, bottom]
  ];
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    for (let k = 0; k < 4; k++) {
      if (segmentsIntersect(polygon[j], polygon[i], corners[k], corners[(k + 1) % 4])) {
        return true;
      }
    }
  }

  // 3. The rectangle sits entirely inside the outline
  return isPointInPolygon(left, top, polygon);
}

// ---------- Laser ----------
export interface LaserBeam {
  x: number;
  width: number;
  bottomY: number;
}

/** A beam that only just touches the edge of an asteroid doesn't count as a hit. */
const LASER_TOUCH_TOLERANCE = 0.01;

/**
 * True if the asteroid's real outline overlaps the beam: the rectangle as wide as the beam, from `topY`
 * (where an iron asteroid cuts it off, or 0) down to the emitter.
 */
export function isAsteroidHitByLaser(asteroid: Asteroid, beam: LaserBeam, topY: number): boolean {
  const half = beam.width / 2;
  const bound = asteroid.r * BOUNDING_MARGIN;
  if (Math.abs(asteroid.x - beam.x) > bound + half || asteroid.y + bound < topY || asteroid.y - bound > beam.bottomY) {
    return false;
  }

  const top = topY + LASER_TOUCH_TOLERANCE;
  if (top >= beam.bottomY) {
    return false;
  }

  return polygonIntersectsRect(getAsteroidPolygon(asteroid), beam.x - half, top, beam.x + half, beam.bottomY);
}

/**
 * The highest and lowest points (smallest and largest y) of the asteroid's outline inside the beam's column,
 * or null if it doesn't reach into it. The lowest point is where the beam is stopped by an iron asteroid.
 */
export function getAsteroidSpanInBeam(asteroid: Asteroid, beam: LaserBeam): { minY: number; maxY: number } | null {
  const left = beam.x - beam.width / 2;
  const right = beam.x + beam.width / 2;
  const bound = asteroid.r * BOUNDING_MARGIN;
  if (asteroid.x + bound < left || asteroid.x - bound > right) {
    return null;
  }

  const polygon = getAsteroidPolygon(asteroid);
  let minY = Infinity;
  let maxY = -Infinity;
  const include = (y: number) => {
    minY = Math.min(minY, y);
    maxY = Math.max(maxY, y);
  };

  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const [xi, yi] = polygon[i];
    const [xj, yj] = polygon[j];

    // Corners inside the column
    if (xi >= left && xi <= right) {
      include(yi);
    }

    // Where this edge crosses the column's left and right sides
    for (const side of [left, right]) {
      if (xi < side !== xj < side) {
        include(yi + ((side - xi) / (xj - xi)) * (yj - yi));
      }
    }
  }

  return minY <= maxY ? { minY, maxY } : null;
}

// ---------- Rocket and bomb ----------
/**
 * Where a circle of `radius` travelling straight up along `x` (a rocket or a bomb) first touches the
 * asteroid's real outline, as the y of the circle's centre, or null if it doesn't touch it between
 * `fromY` and `toY` (toY < fromY).
 */
export function getSweptCircleContactY(
  asteroid: Asteroid,
  x: number,
  fromY: number,
  toY: number,
  radius: number
): number | null {
  const bound = asteroid.r * BOUNDING_MARGIN + radius;
  if (Math.abs(asteroid.x - x) > bound || asteroid.y + bound < toY || asteroid.y - bound > fromY) {
    return null;
  }

  const polygon = getAsteroidPolygon(asteroid);

  // Already touching where it starts
  if (distanceToPolygon(x, fromY, polygon) <= radius) {
    return fromY;
  }

  // The circle first touches the outline either with one of its corners or flat against the middle of an edge.
  // Both give a candidate position along the path; the first one where it really touches is the contact.
  let best: number | null = null;
  const consider = (y: number) => {
    if (y > fromY || y < toY || (best !== null && y <= best)) {
      return;
    }

    if (distanceToPolygon(x, y, polygon) <= radius + 1e-6) {
      best = y;
    }
  };

  for (const [vx, vy] of polygon) {
    const dx = vx - x;
    if (Math.abs(dx) <= radius) {
      consider(vy + Math.sqrt(radius * radius - dx * dx)); // corner touches the circle from above
    }
  }

  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const [ax, ay] = polygon[j];
    const [bx, by] = polygon[i];
    const length = Math.hypot(bx - ax, by - ay);
    if (length < 1e-9) continue;

    // Unit normal of the edge. The circle's centre is `radius` away from the edge's line on either side.
    const nx = -(by - ay) / length;
    const ny = (bx - ax) / length;
    if (Math.abs(ny) < 1e-9) continue; // an edge running straight up and down is met at its corners instead

    for (const offset of [radius, -radius]) {
      consider(ay + (offset - nx * (x - ax)) / ny);
    }
  }

  return best;
}

/** Distance from (x, y) to the asteroid's real outline, 0 if the point is inside it. */
export function getDistanceToAsteroid(asteroid: Asteroid, x: number, y: number): number {
  return distanceToPolygon(x, y, getAsteroidPolygon(asteroid));
}

const EPS = 1e-9;

/** Checks if an asteroid touches a rectangle. Doesn't take into account if one is inside another. */
export function isAsteroidTouchingRect(
  asteroid: Asteroid,
  left: number,
  top: number,
  right: number,
  bottom: number,
  cornerRadius = 0
): boolean {
  const polygon = getAsteroidPolygon(asteroid);
  const r = Math.max(0, Math.min(cornerRadius, (right - left) / 2, (bottom - top) / 2));

  // Check polygon edges against the four straight portions.
  const straightEdges: [Point, Point][] = [
    [
      [left + r, top],
      [right - r, top]
    ],
    [
      [right, top + r],
      [right, bottom - r]
    ],
    [
      [right - r, bottom],
      [left + r, bottom]
    ],
    [
      [left, bottom - r],
      [left, top + r]
    ]
  ];

  // Rounded corner circle centers.
  const corners: Point[] = [
    [left + r, top + r],
    [right - r, top + r],
    [right - r, bottom - r],
    [left + r, bottom - r]
  ];

  for (let i = 0; i < polygon.length; i++) {
    const a = polygon[i];
    const b = polygon[(i + 1) % polygon.length];

    // Straight rectangle edges.
    for (const [c, d] of straightEdges) {
      if (segmentsIntersect(a, b, c, d)) return true;
    }

    // Rounded corners.
    if (r > 0) {
      for (let j = 0; j < 4; j++) {
        if (segmentIntersectsArc(a, b, corners[j], j, r)) {
          return true;
        }
      }
    }
  }

  return false;
}

/** Check whether a line segment intersects a circle, restricted to the appropriate quarter-circle. */
function segmentIntersectsArc(a: Point, b: Point, center: Point, corner: number, r: number): boolean {
  const dx = b[0] - a[0];
  const dy = b[1] - a[1];

  const fx = a[0] - center[0];
  const fy = a[1] - center[1];

  const A = dx * dx + dy * dy;

  if (A < EPS) return false;

  const B = 2 * (fx * dx + fy * dy);
  const C = fx * fx + fy * fy - r * r;

  const discriminant = B * B - 4 * A * C;

  if (discriminant < -EPS) return false;

  const sqrtD = Math.sqrt(Math.max(0, discriminant));

  const roots = [(-B - sqrtD) / (2 * A), (-B + sqrtD) / (2 * A)];

  for (const t of roots) {
    if (t < -EPS || t > 1 + EPS) continue;

    const x = a[0] + t * dx;
    const y = a[1] + t * dy;

    const inArc = [
      x <= center[0] + EPS && y <= center[1] + EPS, // top-left
      x >= center[0] - EPS && y <= center[1] + EPS, // top-right
      x >= center[0] - EPS && y >= center[1] - EPS, // bottom-right
      x <= center[0] + EPS && y >= center[1] - EPS // bottom-left
    ][corner];

    if (inArc) return true;
  }

  return false;
}
