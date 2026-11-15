import { between, boundingRadius, clamp01, easeOutBack, withAlpha } from '../utils';
import { SpecialAbilityAlmanac, SpecialAbilityName } from './ability-almanac';
import { SHIP_HULL, SHIP_SCALE } from './hitbox';
import { Spaceship } from './spaceship';

export function drawSpaceship(ctx: CanvasRenderingContext2D, spaceship: Spaceship): void {
  ctx.save();
  ctx.translate(spaceship.x, spaceship.y);

  drawFlame(ctx, spaceship);

  // Hull
  ctx.beginPath();
  SHIP_HULL.forEach(([px, py], i) => (i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py)));
  ctx.closePath();
  ctx.fillStyle = spaceship.color;
  ctx.fill();
  ctx.lineJoin = 'round';
  ctx.lineWidth = 1.5;
  ctx.strokeStyle = 'rgba(0, 0, 0, 0.4)';
  ctx.stroke();

  // Centre spine
  ctx.beginPath();
  ctx.moveTo(0, -22 * SHIP_SCALE);
  ctx.lineTo(0, 20 * SHIP_SCALE);
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
  ctx.stroke();

  // Cockpit
  ctx.fillStyle = '#bde0fe';
  ctx.beginPath();
  ctx.ellipse(0, -6 * SHIP_SCALE, 3.5 * SHIP_SCALE, 7 * SHIP_SCALE, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();

  if (spaceship.abilities.special === SpecialAbilityName.SHIELD_GENERATOR && spaceship.abilities.r.activeTimer > 0) {
    drawShield(ctx, spaceship);
  }
}

const NORMAL_FLAME_COLOR = '#ffb703';

function drawFlame(ctx: CanvasRenderingContext2D, spaceship: Spaceship): void {
  const isStrongerFlame = spaceship.abilities.special === SpecialAbilityName.STRONGER_ENGINES;

  if (!isStrongerFlame) {
    const flameSize = between(10, 18, { floor: false }) * SHIP_SCALE;
    const y = 24 * SHIP_SCALE;

    // Glow behind the flame
    const glow = ctx.createRadialGradient(0, y + 4, 0, 0, y + 4, flameSize);
    glow.addColorStop(0, withAlpha(NORMAL_FLAME_COLOR, 0.35));
    glow.addColorStop(1, 'rgba(60, 140, 255, 0)');
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(0, y + 4, flameSize, 0, Math.PI * 2);
    ctx.fill();

    // Flickering flame
    ctx.fillStyle = NORMAL_FLAME_COLOR;
    ctx.beginPath();
    ctx.moveTo(-4 * SHIP_SCALE, y);
    ctx.lineTo(0, y + flameSize);
    ctx.lineTo(4 * SHIP_SCALE, y);
    ctx.closePath();
    ctx.fill();
  } else {
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';

    const phase = Math.random();
    const thrust = between(0.55, 1, { floor: false });
    const y = 24 * SHIP_SCALE;

    // Glow behind the flame
    const glowRadius = 14 + 12 * thrust;
    const glow = ctx.createRadialGradient(0, y + 4, 0, 0, y + 4, glowRadius);
    glow.addColorStop(0, `rgba(140, 215, 255, ${0.35 + 0.25 * thrust})`);
    glow.addColorStop(1, 'rgba(60, 140, 255, 0)');
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(0, y + 4, glowRadius, 0, Math.PI * 2);
    ctx.fill();

    // Flame
    const flicker = 0.85 + 0.15 * Math.sin(phase * 45) + 0.08 * Math.sin(phase * 93);
    const length = (16 + 16 * thrust) * flicker;
    const halfWidth = 5 + 1.5 * thrust;
    const body = ctx.createLinearGradient(0, y, 0, y + length);
    body.addColorStop(0, 'rgba(235, 250, 255, 0.95)');
    body.addColorStop(0.5, 'rgba(120, 200, 255, 0.7)');
    body.addColorStop(1, 'rgba(60, 120, 255, 0)');
    ctx.fillStyle = body;
    teardropPath(ctx, 0, y, halfWidth, length, 0);
    ctx.fill();

    // Sparks drifting backwards and fading out
    const sparkCount = 5;
    const trail = 40 + 30 * thrust;
    for (let k = 0; k < sparkCount; k++) {
      const t = (((phase * 1.8 + k / sparkCount) % 1) + 1) % 1;
      const sx = (Math.random() - 0.5) * 10 * t;
      const sy = y + length * 0.5 + t * trail;

      ctx.fillStyle = `rgba(190, 235, 255, ${(1 - t) * 0.75 * thrust})`;
      ctx.beginPath();
      ctx.arc(sx, sy, 0.5 + 1.4 * (1 - t), 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  }
}

function teardropPath(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  halfWidth: number,
  length: number,
  sway: number
): void {
  ctx.beginPath();
  ctx.moveTo(x - halfWidth, y);
  ctx.quadraticCurveTo(x - halfWidth * 0.6, y + length * 0.55, x + sway, y + length);
  ctx.quadraticCurveTo(x + halfWidth * 0.6, y + length * 0.55, x + halfWidth, y);
  ctx.closePath();
}

const SHIELD_APPEAR_TIME = 0.25;
const SHIELD_FADE_TIME = 0.5;
const SHIELD_WARNING_TIME = 0.6;

function drawShield(ctx: CanvasRenderingContext2D, spaceship: Spaceship): void {
  const shieldTimeLeft = spaceship.abilities.r.activeTimer;
  const shieldTimeTotal = SpecialAbilityAlmanac[spaceship.abilities.special].activeTime;
  const elapsed = shieldTimeTotal - shieldTimeLeft;
  const appear = easeOutBack(clamp01(elapsed / SHIELD_APPEAR_TIME));
  const fade = clamp01(shieldTimeLeft / SHIELD_FADE_TIME);
  const flicker = shieldTimeLeft < SHIELD_WARNING_TIME && Math.sin(shieldTimeLeft * 45) < 0 ? 0.5 : 1;
  const alpha = fade * flicker;
  const radius = boundingRadius(SHIP_HULL) * appear;
  if (radius < 1) {
    return;
  }

  ctx.save();
  ctx.translate(spaceship.x, spaceship.y);
  ctx.globalCompositeOperation = 'lighter';

  // Body
  const body = ctx.createRadialGradient(0, 0, radius * 0.2, 0, 0, radius);
  body.addColorStop(0, 'rgba(90, 200, 255, 0)');
  body.addColorStop(0.7, `rgba(90, 200, 255, ${0.05 * alpha})`);
  body.addColorStop(0.92, `rgba(120, 220, 255, ${0.25 * alpha})`);
  body.addColorStop(1, `rgba(200, 245, 255, ${0.5 * alpha})`);
  ctx.fillStyle = body;
  ctx.beginPath();
  ctx.arc(0, 0, radius, 0, Math.PI * 2);
  ctx.fill();

  const size = radius / 3; // hexagon corner distance
  const spin = elapsed * 0.35;
  const sweep = elapsed * 2.4;

  ctx.save();
  ctx.beginPath();
  ctx.arc(0, 0, radius, 0, Math.PI * 2);
  ctx.clip();
  ctx.rotate(spin);
  ctx.lineWidth = 1;

  for (let q = -4; q <= 4; q++) {
    for (let r = -4; r <= 4; r++) {
      const cx = size * Math.sqrt(3) * (q + r / 2);
      const cy = size * 1.5 * r;
      if (Math.hypot(cx, cy) > radius + size) continue;

      // Hexagons the sweep is passing over light up
      const glow = Math.max(0, Math.cos(Math.atan2(cy, cx) + spin - sweep)) ** 6;
      ctx.strokeStyle = `rgba(170, 235, 255, ${(0.07 + 0.4 * glow) * alpha})`;

      ctx.beginPath();
      for (let i = 0; i < 6; i++) {
        const a = Math.PI / 6 + (i * Math.PI) / 3;
        const px = cx + Math.cos(a) * size;
        const py = cy + Math.sin(a) * size;
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.closePath();
      ctx.stroke();
    }
  }

  ctx.restore();

  // Rim
  ctx.beginPath();
  ctx.arc(0, 0, radius, 0, Math.PI * 2);
  ctx.lineWidth = 2;
  ctx.strokeStyle = `rgba(190, 240, 255, ${0.85 * alpha})`;
  ctx.stroke();

  // Highlight on the upper left of the bubble
  ctx.beginPath();
  ctx.arc(0, 0, radius * 0.88, -2.5, -1.8);
  ctx.lineWidth = 3;
  ctx.lineCap = 'round';
  ctx.strokeStyle = `rgba(255, 255, 255, ${0.55 * alpha})`;
  ctx.stroke();

  ctx.restore();
}
