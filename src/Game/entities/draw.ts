import { Entity, EntityType, Explosion, Laser, Rocket } from './entities';
import { EXPLOSION_DURATION } from './tick';

export function drawEntities(ctx: CanvasRenderingContext2D, entities: Entity[]): void {
  for (const entity of entities) {
    switch (entity.type) {
      case EntityType.ROCKET:
        drawRocket(ctx, entity);
        break;
      case EntityType.LASER:
        drawLaser(ctx, entity);
        break;
    }
  }

  drawExplosions(
    ctx,
    entities.filter(entity => entity.type === EntityType.EXPLOSION)
  );
}

const ROCKET_FLAME_HEIGHT = 30;
const ROCKET_FLAME_WIDTH = 6;
const ROCKET_FLAME_Y_OFFSET = 6;
const ROCKET_FLAME_TOP_COLOR = 'rgba(255, 220, 120, 0.95)';
const ROCKET_FLAME_BOTTOM_COLOR = 'rgba(255, 90, 30, 0)';
const ROCKET_FIN_COLOR = '#9db4c0';
const ROCKET_BODY_COLOR = '#e8f1f2';
const ROCKET_NOSE_COLOR = '#ff5d5d';

function drawRocket(ctx: CanvasRenderingContext2D, rocket: Rocket): void {
  ctx.save();
  ctx.translate(rocket.x, rocket.y);

  // Flame
  const flameGradient = ctx.createLinearGradient(
    0,
    ROCKET_FLAME_Y_OFFSET,
    0,
    ROCKET_FLAME_Y_OFFSET + ROCKET_FLAME_HEIGHT
  );
  flameGradient.addColorStop(0, ROCKET_FLAME_TOP_COLOR);
  flameGradient.addColorStop(1, ROCKET_FLAME_BOTTOM_COLOR);
  ctx.fillStyle = flameGradient;
  ctx.beginPath();
  ctx.moveTo(-ROCKET_FLAME_WIDTH / 2, ROCKET_FLAME_Y_OFFSET);
  ctx.lineTo(0, ROCKET_FLAME_Y_OFFSET + ROCKET_FLAME_HEIGHT);
  ctx.lineTo(ROCKET_FLAME_WIDTH / 2, ROCKET_FLAME_Y_OFFSET);
  ctx.closePath();
  ctx.fill();

  // Fins
  ctx.fillStyle = ROCKET_FIN_COLOR;
  ctx.beginPath();
  ctx.moveTo(-2.5, 1);
  ctx.lineTo(-6, 8);
  ctx.lineTo(-2.5, 6);
  ctx.moveTo(2.5, 1);
  ctx.lineTo(6, 8);
  ctx.lineTo(2.5, 6);
  ctx.fill();

  // Body and nose
  ctx.fillStyle = ROCKET_BODY_COLOR;
  ctx.fillRect(-2.5, -8, 5, 14);
  ctx.fillStyle = ROCKET_NOSE_COLOR;
  ctx.beginPath();
  ctx.moveTo(0, -15);
  ctx.lineTo(-2.5, -8);
  ctx.lineTo(2.5, -8);
  ctx.closePath();
  ctx.fill();

  ctx.restore();
}

const LASER_GLOW_COLOR = 'rgba(255, 60, 110, 0.55)';
const LASER_GLOW_FADE_COLOR = 'rgba(255, 60, 110, 0)';
const LASER_CORE_COLOR = 'rgba(255, 230, 235, 0.95)';
const LASER_EMITTER_GLOW_COLOR = 'rgba(255, 220, 230, 0.9)';
const LASER_EMITTER_GLOW_RADIUS_MULTIPLIER = 20;

function drawLaser(ctx: CanvasRenderingContext2D, laser: Laser): void {
  const { timeLeft, totalTime } = laser;
  if (timeLeft <= 0) {
    return;
  }

  // Quick fade-in at the start, short fade-out at the end
  const intensity = Math.max(0, Math.min(1, (totalTime - timeLeft) / 0.12, timeLeft / 0.25));
  const x = laser.getX();
  const bottomY = laser.getBottomY();
  const pulse = 1 + 0.12 * Math.sin(timeLeft * 70);

  ctx.save();
  ctx.globalCompositeOperation = 'lighter';

  // Soft glow
  const glowRadius = (laser.width * 3 * pulse * intensity) / 2;
  if (glowRadius > 0.25) {
    const capY = Math.max(0, bottomY - glowRadius);

    // Straight section: fades sideways
    const glow = ctx.createLinearGradient(x - glowRadius, 0, x + glowRadius, 0);
    glow.addColorStop(0, LASER_GLOW_FADE_COLOR);
    glow.addColorStop(0.5, LASER_GLOW_COLOR);
    glow.addColorStop(1, LASER_GLOW_FADE_COLOR);
    ctx.fillStyle = glow;
    ctx.fillRect(x - glowRadius, 0, glowRadius * 2, capY);

    // Cap: the same fade, but radially, so it matches the straight section exactly at the join
    const cap = ctx.createRadialGradient(x, capY, 0, x, capY, glowRadius);
    cap.addColorStop(0, LASER_GLOW_COLOR);
    cap.addColorStop(1, LASER_GLOW_FADE_COLOR);
    ctx.fillStyle = cap;
    ctx.fillRect(x - glowRadius, capY, glowRadius * 2, glowRadius);
  }

  // Bright core
  const coreRadius = (laser.width * 0.5 * intensity) / 2;
  if (coreRadius > 0.1) {
    const coreCapY = Math.max(0, bottomY - coreRadius);
    ctx.fillStyle = LASER_CORE_COLOR;
    ctx.beginPath();
    ctx.moveTo(x - coreRadius, 0);
    ctx.lineTo(x + coreRadius, 0);
    ctx.lineTo(x + coreRadius, coreCapY);
    ctx.arc(x, coreCapY, coreRadius, 0, Math.PI);
    ctx.closePath();
    ctx.fill();
  }

  // Glow at the emitter
  const emitterRadius = LASER_EMITTER_GLOW_RADIUS_MULTIPLIER * intensity;
  const emitter = ctx.createRadialGradient(x, bottomY, 0, x, bottomY, emitterRadius);
  emitter.addColorStop(0, LASER_EMITTER_GLOW_COLOR);
  emitter.addColorStop(1, LASER_GLOW_FADE_COLOR);
  ctx.fillStyle = emitter;
  ctx.beginPath();
  ctx.arc(x, bottomY, emitterRadius, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

function drawExplosions(ctx: CanvasRenderingContext2D, explosions: Explosion[]) {
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';

  for (const explosion of explosions) {
    const t = explosion.age / EXPLOSION_DURATION;
    const ease = 1 - (1 - t) ** 3;
    const fade = 1 - t;

    // Fireball flash
    const flashRadius = explosion.r * (0.6 + 0.9 * ease);
    const flash = ctx.createRadialGradient(explosion.x, explosion.y, 0, explosion.x, explosion.y, flashRadius);
    flash.addColorStop(0, `rgba(255, 245, 200, ${fade})`);
    flash.addColorStop(0.4, `rgba(255, 150, 50, ${fade * 0.7})`);
    flash.addColorStop(1, 'rgba(255, 80, 20, 0)');
    ctx.fillStyle = flash;
    ctx.beginPath();
    ctx.arc(explosion.x, explosion.y, flashRadius, 0, Math.PI * 2);
    ctx.fill();

    // Shockwave ring
    ctx.beginPath();
    ctx.arc(explosion.x, explosion.y, explosion.r * (0.5 + 1.6 * ease), 0, Math.PI * 2);
    ctx.lineWidth = 0.5 + 3 * fade;
    ctx.strokeStyle = `rgba(255, 200, 120, ${fade * 0.8})`;
    ctx.stroke();

    // Sparks flying outwards
    ctx.fillStyle = `rgba(255, 210, 140, ${fade})`;
    for (const spark of explosion.sparks) {
      const d = spark.distance * ease;
      ctx.beginPath();
      ctx.arc(
        explosion.x + Math.cos(spark.angle) * d,
        explosion.y + Math.sin(spark.angle) * d,
        spark.size * fade,
        0,
        Math.PI * 2
      );
      ctx.fill();
    }
  }

  ctx.restore();
}
