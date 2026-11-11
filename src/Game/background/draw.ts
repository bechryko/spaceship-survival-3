import { GAME_HEIGHT, GAME_WIDTH } from '../hud';
import { Star } from './stars';

const BACKGROUND_COLOR = '#161a38';

const LARGE_STAR_HALO_RADIUS_MULTIPLIER = 3;
const LARGE_STAR_SPIKE_MIN_MULTIPLIER = 2.5;
const LARGE_STAR_SPIKE_MAX_MULTIPLIER = 6.5;
const LARGE_STAR_SPIKE_MIN_WIDTH = 0.7;
const LARGE_STAR_SPIKE_SIZE_SCALE = 0.12;

export function drawBackground(
  ctx: CanvasRenderingContext2D,
  stars: readonly Star[],
  backgroundColor = BACKGROUND_COLOR,
  width = GAME_WIDTH,
  height = GAME_HEIGHT
): void {
  ctx.fillStyle = backgroundColor;
  ctx.fillRect(0, 0, width, height);

  for (const star of stars) {
    /* Two sine waves at different speeds give an irregular twinkle instead of a
    steady pulse. The result stays between roughly 0.1 and 1. */
    const pulse = 0.55 + 0.3 * Math.sin(star.phase) + 0.15 * Math.sin(star.phase * 3.7);

    ctx.globalAlpha = star.brightness * pulse;
    ctx.fillStyle = star.tint;

    if (star.size > 1.8) {
      drawLargeStar(ctx, star, pulse);
    } else {
      ctx.fillRect(star.x, star.y, star.size, star.size);
    }
  }

  ctx.globalAlpha = 1;
}

function drawLargeStar(ctx: CanvasRenderingContext2D, star: Star, pulse: number): void {
  const { x, y, size } = star;

  // Soft halo
  const haloRadius = size * LARGE_STAR_HALO_RADIUS_MULTIPLIER;
  const halo = ctx.createRadialGradient(x, y, 0, x, y, haloRadius);
  halo.addColorStop(0, withAlpha(star.tint, 0.45));
  halo.addColorStop(0.4, withAlpha(star.tint, 0.15));
  halo.addColorStop(1, withAlpha(star.tint, 0));
  ctx.save();
  ctx.fillStyle = halo;
  ctx.beginPath();
  ctx.arc(x, y, haloRadius, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // Core
  ctx.beginPath();
  ctx.arc(x, y, size / 2, 0, Math.PI * 2);
  ctx.fill();

  // Orthogonal spikes
  const len =
    size *
    (LARGE_STAR_SPIKE_MIN_MULTIPLIER + (LARGE_STAR_SPIKE_MAX_MULTIPLIER - LARGE_STAR_SPIKE_MIN_MULTIPLIER) * pulse);
  const width = Math.max(LARGE_STAR_SPIKE_MIN_WIDTH, size * LARGE_STAR_SPIKE_SIZE_SCALE);
  const halfWidth = width / 2;
  ctx.beginPath();
  ctx.moveTo(x - len, y);
  ctx.lineTo(x, y - halfWidth);
  ctx.lineTo(x + len, y);
  ctx.lineTo(x, y + halfWidth);
  ctx.closePath();
  ctx.moveTo(x, y - len);
  ctx.lineTo(x + halfWidth, y);
  ctx.lineTo(x, y + len);
  ctx.lineTo(x - halfWidth, y);
  ctx.closePath();
  ctx.fill();
}

/** '#rrggbb' to 'rgba(r, g, b, alpha)' */
function withAlpha(hex: string, alpha: number): string {
  const n = parseInt(hex.slice(1), 16);
  return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${alpha})`;
}
