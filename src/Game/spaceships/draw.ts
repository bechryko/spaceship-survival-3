import { between, boundingRadius, clamp01, easeOutBack, hash, withAlpha } from '../utils';
import { SpecialAbilityAlmanac, SpecialAbilityName } from './ability-almanac';
import { Spaceship } from './spaceship';

export function drawSpaceships(ctx: CanvasRenderingContext2D, spaceships: Spaceship[], time: number): void {
  for (const spaceship of spaceships) {
    if (!spaceship.alive) {
      continue;
    }

    ctx.save();
    ctx.translate(spaceship.x, spaceship.y);

    drawFlame(ctx, spaceship, time);

    const { hull, spine, cockpit, panels, lights } = spaceship.shape;

    // Hull
    ctx.beginPath();
    hull.forEach(([px, py], i) => (i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py)));
    ctx.closePath();
    ctx.fillStyle = spaceship.color;
    ctx.fill();
    ctx.lineJoin = 'round';
    ctx.lineWidth = 1.5;
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.4)';
    ctx.stroke();

    // Panels
    ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
    for (const panel of panels ?? []) {
      ctx.beginPath();
      panel.forEach(([x, y], i) => (i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y)));
      ctx.closePath();
      ctx.fill();
    }

    // Spine
    if (spine) {
      ctx.beginPath();
      spine.forEach(([px, py], i) => (i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py)));
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
      ctx.stroke();
    }

    // Sensor lights
    ctx.fillStyle = '#7fe8ff';
    for (const [x, y] of lights ?? []) {
      ctx.beginPath();
      ctx.arc(x, y, 1.6, 0, Math.PI * 2);
      ctx.fill();
    }

    // Cockpit
    ctx.fillStyle = '#bde0fe';
    ctx.beginPath();
    ctx.ellipse(cockpit.cx, cockpit.cy, cockpit.rx, cockpit.ry, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(
      cockpit.cx - cockpit.rx * 0.3,
      cockpit.cy - cockpit.ry * 0.35,
      cockpit.rx * 0.35,
      cockpit.ry * 0.3,
      0,
      0,
      Math.PI * 2
    );
    ctx.fillStyle = 'rgba(255, 255, 255, 0.55)';
    ctx.fill();

    ctx.restore();

    if (spaceship.abilities.special === SpecialAbilityName.SHIELD_GENERATOR && spaceship.abilities.r.activeTimer > 0) {
      drawShield(ctx, spaceship);
    }
  }
}

const NORMAL_FLAME_COLOR = '#ffb703';
const NORMAL_FLAME_WIDTH = 10;

function drawFlame(ctx: CanvasRenderingContext2D, spaceship: Spaceship, time: number): void {
  const isStrongerFlame = spaceship.abilities.special === SpecialAbilityName.STRONGER_ENGINES;
  const { engines } = spaceship.shape;

  engines.forEach(engine => {
    const [x, y] = engine;

    if (!isStrongerFlame) {
      const flameSize = between(12, 20, { floor: false, seed: time });

      // Glow behind the flame
      const glow = ctx.createRadialGradient(x, y + 4, 0, x, y + 4, flameSize);
      glow.addColorStop(0, withAlpha(NORMAL_FLAME_COLOR, 0.35));
      glow.addColorStop(1, 'rgba(60, 140, 255, 0)');
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(x, y + 4, flameSize, 0, Math.PI * 2);
      ctx.fill();

      // Flickering flame
      ctx.fillStyle = NORMAL_FLAME_COLOR;
      ctx.beginPath();
      ctx.moveTo(x - NORMAL_FLAME_WIDTH / 2, y);
      ctx.lineTo(x, y + flameSize);
      ctx.lineTo(x + NORMAL_FLAME_WIDTH / 2, y);
      ctx.closePath();
      ctx.fill();
    } else {
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';

      const phase = hash(time);
      const thrust = between(0.55, 1, { floor: false, seed: time });

      // Glow behind the flame
      const glowRadius = 14 + 12 * thrust;
      const glow = ctx.createRadialGradient(x, y + 4, 0, x, y + 4, glowRadius);
      glow.addColorStop(0, `rgba(140, 215, 255, ${0.35 + 0.25 * thrust})`);
      glow.addColorStop(1, 'rgba(60, 140, 255, 0)');
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(x, y + 4, glowRadius, 0, Math.PI * 2);
      ctx.fill();

      // Flame
      const flicker = 0.85 + 0.15 * Math.sin(phase * 45) + 0.08 * Math.sin(phase * 93);
      const length = (16 + 16 * thrust) * flicker;
      const halfWidth = NORMAL_FLAME_WIDTH / 2 + 1.5 * thrust;
      const body = ctx.createLinearGradient(x, y, x, y + length);
      body.addColorStop(0, 'rgba(235, 250, 255, 0.95)');
      body.addColorStop(0.5, 'rgba(120, 200, 255, 0.7)');
      body.addColorStop(1, 'rgba(60, 120, 255, 0)');
      ctx.fillStyle = body;
      teardropPath(ctx, x, y, halfWidth, length);
      ctx.fill();

      // Sparks drifting backwards and fading out
      const sparkCount = 5;
      const trail = 40 + 30 * thrust;
      for (let k = 0; k < sparkCount; k++) {
        const t = (((phase * 1.8 + k / sparkCount) % 1) + 1) % 1;
        const sx = x + (Math.random() - 0.5) * 10 * t;
        const sy = y + length * 0.5 + t * trail;

        ctx.fillStyle = `rgba(190, 235, 255, ${(1 - t) * 0.75 * thrust})`;
        ctx.beginPath();
        ctx.arc(sx, sy, 0.5 + 1.4 * (1 - t), 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();
    }
  });
}

function teardropPath(ctx: CanvasRenderingContext2D, x: number, y: number, halfWidth: number, length: number): void {
  ctx.beginPath();
  ctx.moveTo(x - halfWidth, y);
  ctx.quadraticCurveTo(x - halfWidth * 0.6, y + length * 0.55, x, y + length);
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
  const radius = boundingRadius(spaceship.shape.hull) * appear;
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
      if (cx ** 2 + cy ** 2 > (radius + size) ** 2) {
        continue;
      }

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
