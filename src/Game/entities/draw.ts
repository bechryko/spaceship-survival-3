import { getAsteroidPolygon } from '../asteroids';
import { GAME_HEIGHT } from '../hud';
import { Point } from '../models';
import { AbilityAlmanac, AbilityClass, Spaceship } from '../spaceships';
import { clamp01, darken, easeOutBack, easeOutCubic, hash, lighten, withAlpha } from '../utils';
import {
  Bomb,
  Entity,
  EntityType,
  Explosion,
  Laser,
  PlasmaJet,
  Rocket,
  ScienceProbe,
  ShieldTunnel,
  Shockwave
} from './entities';
import {
  EXPLOSION_DURATION,
  SHIELD_TUNNEL_CORNER_RADIUS,
  SHIELD_TUNNEL_HEIGHT,
  SHIELD_TUNNEL_SHATTER_DURATION,
  SHIELD_TUNNEL_Y_MARGIN
} from './tick';

const ENTITY_LAYER_LOOKUP: Record<EntityType, number> = {
  // Layer 0: Projectiles
  [EntityType.ROCKET]: 0,
  [EntityType.LASER]: 0,
  [EntityType.BOMB]: 0,
  [EntityType.SCIENCE_PROBE]: 0,

  // Layer 1: Large player-effects
  [EntityType.PLASMA_JET]: 1,

  // Layer 2: Large global effects
  [EntityType.SHOCKWAVE]: 2,
  [EntityType.SHIELD_TUNNEL]: 2,

  // Layer 3: Explosions
  [EntityType.EXPLOSION]: 3
};
const LAYER_COUNT = Math.max(...Object.values(ENTITY_LAYER_LOOKUP)) + 1;

export function drawEntities(ctx: CanvasRenderingContext2D, entities: Entity[], time: number): void {
  for (let layer = 0; layer < LAYER_COUNT; layer++) {
    for (const entity of entities) {
      if (!entity.active || ENTITY_LAYER_LOOKUP[entity.type] !== layer) {
        continue;
      }

      switch (entity.type) {
        case EntityType.ROCKET:
          drawRocket(ctx, entity);
          break;
        case EntityType.LASER:
          drawLaser(ctx, entity);
          break;
        case EntityType.EXPLOSION:
          drawExplosion(ctx, entity);
          break;
        case EntityType.BOMB:
          drawBomb(ctx, entity);
          break;
        case EntityType.SCIENCE_PROBE:
          drawScienceProbe(ctx, entity, time);
          break;
        case EntityType.SHOCKWAVE:
          drawShockwave(ctx, entity);
          break;
        case EntityType.PLASMA_JET:
          drawPlasmaJet(ctx, entity, time);
          break;
        case EntityType.SHIELD_TUNNEL:
          drawShieldTunnel(ctx, entity);
          break;
      }
    }
  }
}

const ROCKET_FLAME_HEIGHT = 30;
const ROCKET_FLAME_WIDTH = 6;
const ROCKET_FLAME_Y_OFFSET = 6;
const ROCKET_FLAME_TOP_COLOR = 'rgba(255, 220, 120, 0.95)';
const ROCKET_FLAME_BOTTOM_COLOR = 'rgba(255, 90, 30, 0)';
const ROCKET_FIN_COLOR = '#9db4c0';
const ROCKET_BODY_COLOR = '#e8f1f2';
const ROCKET_NOSE_COLOR = '#ff5d5d';
const ROCKET_POWERFUL_FLAME_TOP_COLOR = 'rgba(36, 255, 160, 0.9)';
const ROCKET_POWERFUL_FLAME_BOTTOM_COLOR = 'rgba(138, 255, 204, 0)';
const ROCKET_POWERFUL_NOSE_COLOR = '#303eff';

function drawRocket(ctx: CanvasRenderingContext2D, rocket: Rocket): void {
  const flameTopColor = rocket.isPowerful ? ROCKET_POWERFUL_FLAME_TOP_COLOR : ROCKET_FLAME_TOP_COLOR;
  const flameBottomColor = rocket.isPowerful ? ROCKET_POWERFUL_FLAME_BOTTOM_COLOR : ROCKET_FLAME_BOTTOM_COLOR;
  const noseColor = rocket.isPowerful ? ROCKET_POWERFUL_NOSE_COLOR : ROCKET_NOSE_COLOR;

  ctx.save();
  ctx.translate(rocket.x, rocket.y);

  // Flame
  const flameGradient = ctx.createLinearGradient(
    0,
    ROCKET_FLAME_Y_OFFSET,
    0,
    ROCKET_FLAME_Y_OFFSET + ROCKET_FLAME_HEIGHT
  );
  flameGradient.addColorStop(0, flameTopColor);
  flameGradient.addColorStop(1, flameBottomColor);
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
  ctx.fillStyle = noseColor;
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
const LASER_FLARE_GLOW_COLOR = 'rgba(255, 240, 245, 0.95)';
const LASER_FLARE_WIDTH_MULTIPLIER = 1.5;

function drawLaser(ctx: CanvasRenderingContext2D, laser: Laser): void {
  const { timeLeft, totalTime } = laser;
  if (timeLeft <= 0) {
    return;
  }

  const laserStats = AbilityAlmanac[AbilityClass.GUNSHIP].e;

  // Quick fade-in at the start, short fade-out at the end
  const intensity = Math.max(0, Math.min(1, (totalTime - timeLeft) / 0.12, timeLeft / 0.25));
  const x = laser.owner.x + laserStats.sideXOffset;
  const bottomY = laser.owner.y + laserStats.launchYOffset;
  const topY = Math.min(laser.topY, bottomY);
  const pulse = 1 + 0.12 * Math.sin(timeLeft * 70);

  ctx.save();
  ctx.globalCompositeOperation = 'lighter';

  // Soft glow
  const glowRadius = (laser.width * 3 * pulse * intensity) / 2;
  if (glowRadius > 0.25) {
    const capY = Math.max(topY, bottomY - glowRadius);

    // Straight section: fades sideways
    const glow = ctx.createLinearGradient(x - glowRadius, 0, x + glowRadius, 0);
    glow.addColorStop(0, LASER_GLOW_FADE_COLOR);
    glow.addColorStop(0.5, LASER_GLOW_COLOR);
    glow.addColorStop(1, LASER_GLOW_FADE_COLOR);
    ctx.fillStyle = glow;
    ctx.fillRect(x - glowRadius, topY, glowRadius * 2, capY - topY);

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
    const coreCapY = Math.max(topY, bottomY - coreRadius);
    ctx.fillStyle = LASER_CORE_COLOR;
    ctx.beginPath();
    ctx.moveTo(x - coreRadius, topY);
    ctx.lineTo(x + coreRadius, topY);
    ctx.lineTo(x + coreRadius, coreCapY);
    ctx.arc(x, coreCapY, coreRadius, 0, Math.PI);
    ctx.closePath();
    ctx.fill();
  }

  // Where the beam hits an iron asteroid: a flattened glow, as if the light spreads along its surface
  if (topY > 0) {
    const flareRadius = 24 * intensity * pulse;
    if (flareRadius > 0.5) {
      ctx.save();
      ctx.translate(x, topY);
      ctx.scale(LASER_FLARE_WIDTH_MULTIPLIER, 0.6);
      const flare = ctx.createRadialGradient(0, 0, 0, 0, 0, flareRadius);
      flare.addColorStop(0, LASER_FLARE_GLOW_COLOR);
      flare.addColorStop(1, LASER_GLOW_FADE_COLOR);
      ctx.fillStyle = flare;
      ctx.beginPath();
      ctx.arc(0, 0, flareRadius, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
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

const EXPLOSION_DEFAULT_COLOR = '#ff9632';
const EXPLOSION_DEFAULT_EDGE_COLOR = '#ff5014';
const EXPLOSION_EDGE_COLOR_DARKEN = 0.5;
const EXPLOSION_DEFAULT_RING_COLOR = '#ffc878';
const EXPLOSION_RING_COLOR_LIGHTEN = 0.6;
const EXPLOSION_DEFAULT_SPARK_COLOR = '#ffd28c';
const EXPLOSION_SPARK_COLOR_LIGHTEN = 0.75;

function drawExplosion(ctx: CanvasRenderingContext2D, explosion: Explosion) {
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';

  const t = explosion.age / EXPLOSION_DURATION;
  const ease = 1 - (1 - t) ** 3;
  const fade = 1 - t;

  const color = explosion.color ?? EXPLOSION_DEFAULT_COLOR;
  const edgeColor = explosion.color
    ? darken(explosion.color, EXPLOSION_EDGE_COLOR_DARKEN)
    : EXPLOSION_DEFAULT_EDGE_COLOR;
  const ringColor = explosion.color
    ? lighten(explosion.color, EXPLOSION_RING_COLOR_LIGHTEN)
    : EXPLOSION_DEFAULT_RING_COLOR;
  const sparkColor = explosion.color
    ? lighten(explosion.color, EXPLOSION_SPARK_COLOR_LIGHTEN)
    : EXPLOSION_DEFAULT_SPARK_COLOR;

  // Fireball flash
  const flashRadius = explosion.r * (0.6 + 0.9 * ease);
  const flash = ctx.createRadialGradient(explosion.x, explosion.y, 0, explosion.x, explosion.y, flashRadius);
  flash.addColorStop(0, withAlpha('#ffffff', fade));
  flash.addColorStop(0.4, withAlpha(color, fade * 0.7));
  flash.addColorStop(1, withAlpha(edgeColor, 0));
  ctx.fillStyle = flash;
  ctx.beginPath();
  ctx.arc(explosion.x, explosion.y, flashRadius, 0, Math.PI * 2);
  ctx.fill();

  // Shockwave ring
  ctx.beginPath();
  ctx.arc(explosion.x, explosion.y, explosion.r * (0.5 + 1.6 * ease), 0, Math.PI * 2);
  ctx.lineWidth = 0.5 + 3 * fade;
  ctx.strokeStyle = withAlpha(ringColor, fade * 0.8);
  ctx.stroke();

  // Sparks flying outwards
  ctx.fillStyle = withAlpha(sparkColor, fade);
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

  ctx.restore();
}

function drawBomb(ctx: CanvasRenderingContext2D, bomb: Bomb): void {
  const urgency = Math.min(1, bomb.age / bomb.explosionTime);
  const phase = Math.PI * 2 * (3 * bomb.age + (6 * bomb.age * bomb.age) / bomb.explosionTime);
  const pulse = 0.5 + 0.5 * Math.sin(phase);
  const { r } = bomb;

  ctx.save();
  ctx.translate(bomb.x, bomb.y);

  // Warning glow
  ctx.globalCompositeOperation = 'lighter';
  const glowRadius = r * (2.2 + 1.4 * urgency * pulse);
  const glow = ctx.createRadialGradient(0, 0, 0, 0, 0, glowRadius);
  glow.addColorStop(0, `rgba(255, 120, 60, ${0.15 + 0.4 * urgency * pulse})`);
  glow.addColorStop(1, 'rgba(255, 120, 60, 0)');
  ctx.fillStyle = glow;
  ctx.beginPath();
  ctx.arc(0, 0, glowRadius, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalCompositeOperation = 'source-over';

  // Small thruster flame behind it
  const flame = 11 + 4 * Math.sin(bomb.age * 60);
  const flameGradient = ctx.createLinearGradient(0, r * 0.7, 0, r * 0.7 + flame);
  flameGradient.addColorStop(0, 'rgba(255, 220, 120, 0.95)');
  flameGradient.addColorStop(1, 'rgba(255, 90, 30, 0)');
  ctx.fillStyle = flameGradient;
  ctx.beginPath();
  ctx.moveTo(-3.5, r * 0.7);
  ctx.lineTo(0, r * 0.7 + flame);
  ctx.lineTo(3.5, r * 0.7);
  ctx.closePath();
  ctx.fill();

  // Metal body
  const body = ctx.createRadialGradient(-r * 0.35, -r * 0.35, r * 0.1, 0, 0, r);
  body.addColorStop(0, '#5a6488');
  body.addColorStop(0.6, '#1b2038');
  body.addColorStop(1, '#0b0e1c');
  ctx.fillStyle = body;
  ctx.beginPath();
  ctx.arc(0, 0, r, 0, Math.PI * 2);
  ctx.fill();
  ctx.lineWidth = 1;
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
  ctx.stroke();

  // Core light: yellow at first, turning red and blinking faster as it nears detonation
  const green = Math.round(214 - 144 * urgency);
  const blue = Math.round(102 - 32 * urgency);
  ctx.fillStyle = `rgba(255, ${green}, ${blue}, ${0.55 + 0.45 * pulse})`;
  ctx.beginPath();
  ctx.arc(0, -r * 0.1, r * (0.3 + 0.12 * pulse), 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

function drawScienceProbe(ctx: CanvasRenderingContext2D, probe: ScienceProbe, time: number): void {
  const probeStats = AbilityAlmanac[AbilityClass.SCIENTIST].q;

  if (probe.phase === 'analyzing' && probe.target) {
    drawScienceProbeScan(ctx, probe, time);
  }

  const alpha = probe.phase === 'lost' ? 1 - clamp01(probe.lostTime / probeStats.lostFadeTime) : 1;
  const r = probeStats.radius;

  ctx.save();
  ctx.globalAlpha = alpha;

  // Trail while it travels
  if (probe.phase === 'flying' || probe.phase === 'transfer') {
    const tailX = probe.x - probe.direction[0] * 26;
    const tailY = probe.y - probe.direction[1] * 26;
    const trail = ctx.createLinearGradient(probe.x, probe.y, tailX, tailY);
    trail.addColorStop(0, 'rgba(127, 232, 255, 0.7)');
    trail.addColorStop(1, 'rgba(127, 232, 255, 0)');
    ctx.strokeStyle = trail;
    ctx.lineWidth = 4;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(probe.x, probe.y);
    ctx.lineTo(tailX, tailY);
    ctx.stroke();
  }

  ctx.translate(probe.x, probe.y);

  // Sitting on an asteroid it faces away from it; otherwise it faces where it is going
  if (probe.phase === 'analyzing' && probe.target) {
    ctx.rotate(Math.atan2(probe.x - probe.target.x, -(probe.y - probe.target.y)));
  } else {
    ctx.rotate(Math.atan2(probe.direction[0], -probe.direction[1]));
  }

  // Antenna
  ctx.strokeStyle = 'rgba(207, 227, 255, 0.9)';
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.moveTo(0, -r);
  ctx.lineTo(0, -r - 6);
  ctx.stroke();
  ctx.fillStyle = `rgba(255, 120, 120, ${0.4 + 0.6 * (0.5 + 0.5 * Math.sin(time * 12))})`;
  ctx.beginPath();
  ctx.arc(0, -r - 6, 1.6, 0, Math.PI * 2);
  ctx.fill();

  // Body
  ctx.beginPath();
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2 + Math.PI / 8;
    if (i === 0) ctx.moveTo(Math.cos(a) * r, Math.sin(a) * r);
    else ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r);
  }
  ctx.closePath();
  const body = ctx.createRadialGradient(-r * 0.3, -r * 0.3, 0.5, 0, 0, r);
  body.addColorStop(0, '#e8f1f2');
  body.addColorStop(1, '#5a6e96');
  ctx.fillStyle = body;
  ctx.fill();
  ctx.lineWidth = 1;
  ctx.strokeStyle = 'rgba(0, 0, 0, 0.45)';
  ctx.stroke();

  // Lens
  ctx.fillStyle = '#7fe8ff';
  ctx.beginPath();
  ctx.arc(0, 0, r * 0.35, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

function drawScienceProbeScan(ctx: CanvasRenderingContext2D, probe: ScienceProbe, time: number): void {
  const target = probe.target!;
  const polygon = getAsteroidPolygon(target);
  const fraction = clamp01(probe.analysisProgress / probe.analysisTime);

  ctx.save();
  ctx.globalCompositeOperation = 'lighter';

  // Outline
  ctx.beginPath();
  polygon.forEach(([x, y], i) => (i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y)));
  ctx.closePath();
  ctx.lineJoin = 'round';
  ctx.lineWidth = 2;
  ctx.strokeStyle = `rgba(127, 232, 255, ${0.5 + 0.3 * Math.sin(time * 14)})`;
  ctx.stroke();

  // A horizontal line passing over the asteroid twice during the analysis, clipped to its outline
  ctx.save();
  ctx.clip();
  const top = target.y - target.r;
  const sweep = (probe.analysisProgress / (probe.analysisTime / 2)) % 1;
  const lineY = top + sweep * target.r * 2;
  const glow = ctx.createLinearGradient(0, lineY - 14, 0, lineY + 2);
  glow.addColorStop(0, 'rgba(127, 232, 255, 0)');
  glow.addColorStop(1, 'rgba(127, 232, 255, 0.45)');
  ctx.fillStyle = glow;
  ctx.fillRect(target.x - target.r, lineY - 14, target.r * 2, 16);
  ctx.fillStyle = 'rgba(220, 250, 255, 0.95)';
  ctx.fillRect(target.x - target.r, lineY, target.r * 2, 2);
  ctx.restore();

  // Progress ring
  const ringRadius = target.r * 1.15;
  ctx.beginPath();
  ctx.arc(target.x, target.y, ringRadius, 0, Math.PI * 2);
  ctx.lineWidth = 2;
  ctx.strokeStyle = 'rgba(127, 232, 255, 0.2)';
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(target.x, target.y, ringRadius, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * fraction);
  ctx.lineWidth = 3.5;
  ctx.lineCap = 'round';
  ctx.strokeStyle = 'rgba(160, 245, 255, 0.95)';
  ctx.stroke();

  ctx.restore();
}

function drawShockwave(ctx: CanvasRenderingContext2D, wave: Shockwave): void {
  if (wave.radius < 1) {
    return;
  }

  ctx.save();
  ctx.globalCompositeOperation = 'lighter';

  const t = clamp01(wave.radius / wave.maxRadius);
  const fade = 1 - t * t;

  // A soft band just inside the leading edge
  const inner = Math.max(0, wave.radius * 0.8);
  const band = ctx.createRadialGradient(wave.x, wave.y, inner, wave.x, wave.y, wave.radius);
  band.addColorStop(0, 'rgba(120, 200, 255, 0)');
  band.addColorStop(1, `rgba(120, 200, 255, ${0.16 * fade})`);
  ctx.fillStyle = band;
  ctx.beginPath();
  ctx.arc(wave.x, wave.y, wave.radius, 0, Math.PI * 2);
  ctx.fill();

  // Leading ring and a thinner one trailing it
  for (const [scale, width, strength] of [
    [1, 6 * (1 - t) + 2, 0.85],
    [0.93, 2, 0.4]
  ] as const) {
    ctx.beginPath();
    ctx.arc(wave.x, wave.y, wave.radius * scale, 0, Math.PI * 2);
    ctx.lineWidth = width;
    ctx.strokeStyle = `rgba(170, 230, 255, ${strength * fade})`;
    ctx.stroke();
  }

  ctx.restore();
}

const PLASMA_JET_EDGE_SEGMENTS = 18;
const PLASMA_JET_STREAK_COUNT = 22;

/** Draw after the asteroids and before the ship, so the jet comes out from in front of the nose. */
function drawPlasmaJet(ctx: CanvasRenderingContext2D, plasmaJet: PlasmaJet, time: number): void {
  const plasmaJetStats = AbilityAlmanac[AbilityClass.SCIENTIST].e;

  const spaceship = plasmaJet.owner;
  const k = plasmaJet.intensity;
  const range = plasmaJetStats.range * easeOutCubic(plasmaJet.intensity);
  if (k <= 0 || range < 2) {
    return;
  }

  const nozzleY = spaceship.y - plasmaJetStats.noseOffset;

  ctx.save();
  ctx.globalCompositeOperation = 'lighter';

  // Three layers, from a wide violet haze to a thin white-hot core. Each fades out toward the far end.
  const layers = [
    { width: 1, color: '150, 90, 255', alpha: 0.5, seed: 0 },
    { width: 0.6, color: '100, 170, 255', alpha: 0.55, seed: 3 },
    { width: 0.22, color: '225, 250, 255', alpha: 0.85, seed: 6 }
  ];

  for (const layer of layers) {
    const gradient = ctx.createLinearGradient(0, nozzleY, 0, nozzleY - range);
    gradient.addColorStop(0, `rgba(${layer.color}, ${layer.alpha * k})`);
    gradient.addColorStop(0.55, `rgba(${layer.color}, ${layer.alpha * 0.4 * k})`);
    gradient.addColorStop(1, `rgba(${layer.color}, 0)`);
    ctx.fillStyle = gradient;
    tracePlasma(ctx, spaceship, range, layer.width, time, layer.seed);
    ctx.fill();
  }

  // Streaks of plasma running outward along the jet
  ctx.lineWidth = 1.5;
  ctx.lineCap = 'round';
  for (let i = 0; i < PLASMA_JET_STREAK_COUNT; i++) {
    const u = (((time * 0.9 + hash(i) + i / PLASMA_JET_STREAK_COUNT) % 1) + 1) % 1;
    const distance = u * range;
    const lateral =
      (hash(i + 50) - 0.5) *
      2 *
      (plasmaJetStats.nozzleHalfWidth + distance * Math.tan(plasmaJetStats.halfAngle)) *
      0.85;
    const x = spaceship.x + lateral;
    const y = nozzleY - distance;

    ctx.strokeStyle = `rgba(200, 235, 255, ${(1 - u) * 0.8 * k})`;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x - lateral * 0.04, y + 10 + 14 * u);
    ctx.stroke();
  }

  // Bright flare at the nozzle
  const flareRadius = (16 + 5 * Math.sin(time * 30)) * k;
  if (flareRadius > 0.5) {
    const flare = ctx.createRadialGradient(spaceship.x, nozzleY, 0, spaceship.x, nozzleY, flareRadius);
    flare.addColorStop(0, `rgba(255, 255, 255, ${0.9 * k})`);
    flare.addColorStop(0.4, `rgba(140, 190, 255, ${0.6 * k})`);
    flare.addColorStop(1, 'rgba(120, 90, 255, 0)');
    ctx.fillStyle = flare;
    ctx.beginPath();
    ctx.arc(spaceship.x, nozzleY, flareRadius, 0, Math.PI * 2);
    ctx.fill();
  }

  // A flickering glow on every asteroid the plasma is hitting
  for (const asteroid of plasmaJet.affected) {
    const radius = asteroid.r * 1.25;
    const glow = ctx.createRadialGradient(asteroid.x, asteroid.y, 0, asteroid.x, asteroid.y, radius);
    glow.addColorStop(0, `rgba(170, 130, 255, ${(0.18 + 0.1 * Math.sin(time * 20 + asteroid.x * 0.1)) * k})`);
    glow.addColorStop(1, 'rgba(120, 90, 255, 0)');
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(asteroid.x, asteroid.y, radius, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();
}

/**
 * The jet's outline with edges that ripple like a flame. `width` scales its width, so the same
 * outline can be used for the narrower inner layers.
 */
function tracePlasma(
  ctx: CanvasRenderingContext2D,
  spaceship: Spaceship,
  range: number,
  width: number,
  time: number,
  seed: number
) {
  const plasmaJetStats = AbilityAlmanac[AbilityClass.SCIENTIST].e;

  const nozzleY = spaceship.y - plasmaJetStats.noseOffset;
  const edge = (side: -1 | 1) =>
    Array.from({ length: PLASMA_JET_EDGE_SEGMENTS + 1 }, (_, k) => {
      const t = k / PLASMA_JET_EDGE_SEGMENTS;
      const ripple =
        Math.sin(time * 14 + k * 0.8 + seed + (side === 1 ? 2 : 0)) * 3 + Math.sin(time * 23 + k * 1.7 + seed) * 2;
      return [
        spaceship.x +
          side *
            ((plasmaJetStats.nozzleHalfWidth + range * t * Math.tan(plasmaJetStats.halfAngle)) * width +
              ripple * t * width),
        nozzleY - range * t
      ] as Point;
    });

  const left = edge(-1);
  const right = edge(1).reverse();

  ctx.beginPath();
  [...left, ...right].forEach(([x, y], i) => (i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y)));
  ctx.closePath();
}

interface ShieldTunnelBounds {
  left: number;
  top: number;
  right: number;
  bottom: number;
}

function getShieldTunnelBounds(tunnel: ShieldTunnel): ShieldTunnelBounds {
  const bottom = GAME_HEIGHT - SHIELD_TUNNEL_Y_MARGIN;

  return { left: tunnel.x1, right: tunnel.x2, top: bottom - SHIELD_TUNNEL_HEIGHT, bottom };
}

const SHIELD_TUNNEL_FADE_IN_TIME = 0.2;
const SHIELD_TUNNEL_FADE_OUT_TIME = 0.5;
const SHIELD_TUNNEL_WARNING_TIME = 0.6;
const SHIELD_TUNNEL_HEX_COUNT_ACROSS_HEIGHT = 3;
const SHIELD_TUNNEL_SWEEP_SPEED = 480;
const SHIELD_TUNNEL_SWEEP_WIDTH = 60;
const SHIELD_TUNNEL_SWEEP_SLANT = 0.7; // how far the stripe leans over its height. 1 is 45 degrees.

function drawShieldTunnel(ctx: CanvasRenderingContext2D, shieldTunnel: ShieldTunnel): void {
  const bounds = getShieldTunnelBounds(shieldTunnel);

  if (shieldTunnel.shatter) {
    drawShatter(ctx, shieldTunnel, bounds);
    return;
  }

  const { left, top, right, bottom } = bounds;
  const width = right - left;
  const height = bottom - top;
  const timeLeft = shieldTunnel.duration - shieldTunnel.age;
  const flicker = timeLeft < SHIELD_TUNNEL_WARNING_TIME && Math.sin(timeLeft * 45) < 0 ? 0.5 : 1;
  const alpha =
    Math.min(clamp01(shieldTunnel.age / SHIELD_TUNNEL_FADE_IN_TIME), clamp01(timeLeft / SHIELD_TUNNEL_FADE_OUT_TIME)) *
    flicker;
  if (alpha <= 0 || width <= 0) {
    return;
  }

  const appear = easeOutBack(clamp01(shieldTunnel.age / SHIELD_TUNNEL_FADE_IN_TIME));
  const middle = (top + bottom) / 2;

  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  ctx.translate(0, middle);
  ctx.scale(1, Math.max(0.05, appear));
  ctx.translate(0, -middle);

  const tube = () => ctx.roundRect(left, top, width, height, Math.min(SHIELD_TUNNEL_CORNER_RADIUS, height / 2));

  // Body
  const body = ctx.createLinearGradient(0, top, 0, bottom);
  body.addColorStop(0, `rgba(200, 245, 255, ${0.34 * alpha})`);
  body.addColorStop(0.2, `rgba(120, 220, 255, ${0.12 * alpha})`);
  body.addColorStop(0.5, `rgba(90, 200, 255, ${0.04 * alpha})`);
  body.addColorStop(0.8, `rgba(120, 220, 255, ${0.12 * alpha})`);
  body.addColorStop(1, `rgba(200, 245, 255, ${0.34 * alpha})`);
  ctx.beginPath();
  tube();
  ctx.fillStyle = body;
  ctx.fill();

  ctx.save();
  ctx.beginPath();
  tube();
  ctx.clip();

  // Sweep
  const slantedWidth = height * SHIELD_TUNNEL_SWEEP_SLANT;
  const travel = width + slantedWidth + SHIELD_TUNNEL_SWEEP_WIDTH * 4;
  const sweepX = left - SHIELD_TUNNEL_SWEEP_WIDTH * 2 + ((shieldTunnel.age * SHIELD_TUNNEL_SWEEP_SPEED) % travel);

  // Honeycomb
  ctx.lineWidth = 1;
  forEachHexagon(bounds, (cx, cy, size) => {
    const distance = cx - (cy - top) * SHIELD_TUNNEL_SWEEP_SLANT - sweepX; // sideways distance from the stripe
    const glow = Math.exp(-((distance / SHIELD_TUNNEL_SWEEP_WIDTH) ** 2));

    ctx.strokeStyle = `rgba(170, 235, 255, ${(0.08 + 0.45 * glow) * alpha})`;
    hexagonPath(ctx, cx, cy, size);
    ctx.stroke();
  });

  ctx.save();
  ctx.transform(1, 0, SHIELD_TUNNEL_SWEEP_SLANT, 1, -SHIELD_TUNNEL_SWEEP_SLANT * top, 0);
  const shine = ctx.createLinearGradient(sweepX - SHIELD_TUNNEL_SWEEP_WIDTH, 0, sweepX + SHIELD_TUNNEL_SWEEP_WIDTH, 0);
  shine.addColorStop(0, 'rgba(255, 255, 255, 0)');
  shine.addColorStop(0.5, `rgba(235, 252, 255, ${0.34 * alpha})`);
  shine.addColorStop(1, 'rgba(255, 255, 255, 0)');
  ctx.fillStyle = shine;
  ctx.fillRect(sweepX - SHIELD_TUNNEL_SWEEP_WIDTH, top, SHIELD_TUNNEL_SWEEP_WIDTH * 2, height);
  ctx.restore();

  ctx.restore(); // the clip

  // Rim, and a highlight just inside the top edge
  ctx.beginPath();
  tube();
  ctx.lineWidth = 2;
  ctx.strokeStyle = `rgba(190, 240, 255, ${0.85 * alpha})`;
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(left + SHIELD_TUNNEL_CORNER_RADIUS, top + 4);
  ctx.lineTo(right - SHIELD_TUNNEL_CORNER_RADIUS, top + 4);
  ctx.lineWidth = 2;
  ctx.lineCap = 'round';
  ctx.strokeStyle = `rgba(255, 255, 255, ${0.4 * alpha})`;
  ctx.stroke();

  ctx.restore();
}

function forEachHexagon(
  { left, top, right, bottom }: ShieldTunnelBounds,
  callback: (cx: number, cy: number, size: number, index: number) => void
): void {
  const size = (bottom - top) / SHIELD_TUNNEL_HEX_COUNT_ACROSS_HEIGHT;
  const columnWidth = size * Math.sqrt(3);
  const rowHeight = size * 1.5;
  const rows = Math.ceil((bottom - top) / rowHeight) + 1;
  let index = 0;

  for (let row = -1; row <= rows; row++) {
    const offset = row & 1 ? columnWidth / 2 : 0;

    for (let cx = left - columnWidth + offset; cx <= right + columnWidth; cx += columnWidth) {
      callback(cx, top + row * rowHeight, size, index++);
    }
  }
}

function hexagonPath(ctx: CanvasRenderingContext2D, cx: number, cy: number, radius: number): void {
  ctx.beginPath();
  for (let i = 0; i < 6; i++) {
    const angle = Math.PI / 6 + (i * Math.PI) / 3;
    const px = cx + Math.cos(angle) * radius;
    const py = cy + Math.sin(angle) * radius;
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.closePath();
}

/** The pieces of glass flying apart from where the iron asteroid hit, each one a hexagon of the grid. */
function drawShatter(ctx: CanvasRenderingContext2D, tunnel: ShieldTunnel, bounds: ShieldTunnelBounds): void {
  const shatter = tunnel.shatter!;
  const t = clamp01(shatter.age / SHIELD_TUNNEL_SHATTER_DURATION);
  const fly = 1 - (1 - t) ** 2; // fast at first, slowing down
  const fade = (1 - t) ** 1.4;

  ctx.save();
  ctx.globalCompositeOperation = 'lighter';

  // A flash where it was hit
  const flashRadius = 40 + 60 * t;
  const flash = ctx.createRadialGradient(shatter.x, shatter.y, 0, shatter.x, shatter.y, flashRadius);
  flash.addColorStop(0, `rgba(230, 250, 255, ${0.9 * clamp01(1 - t * 2.5)})`);
  flash.addColorStop(1, 'rgba(120, 220, 255, 0)');
  ctx.fillStyle = flash;
  ctx.beginPath();
  ctx.arc(shatter.x, shatter.y, flashRadius, 0, Math.PI * 2);
  ctx.fill();

  forEachHexagon(bounds, (cx, cy, size, index) => {
    if (cx < bounds.left - size || cx > bounds.right + size || cy < bounds.top - size || cy > bounds.bottom + size) {
      return;
    }

    const direction = Math.atan2(cy - shatter.y, cx - shatter.x) + (hash(index) - 0.5) * 1.4;
    const distance = (50 + 240 * hash(index + 7)) * fly;
    const x = cx + Math.cos(direction) * distance;
    const y = cy + Math.sin(direction) * distance + 140 * t * t * hash(index + 3); // some of them start to fall

    ctx.save();
    ctx.translate(x, y);
    ctx.rotate((hash(index + 13) - 0.5) * 7 * t);
    ctx.scale(1 - 0.4 * t, 1 - 0.4 * t);
    hexagonPath(ctx, 0, 0, size * 0.92);
    ctx.fillStyle = `rgba(120, 220, 255, ${0.14 * fade})`;
    ctx.fill();
    ctx.lineWidth = 1.3;
    ctx.strokeStyle = `rgba(190, 240, 255, ${0.85 * fade})`;
    ctx.stroke();
    ctx.restore();
  });

  ctx.restore();
}
