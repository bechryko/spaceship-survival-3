import { GAME_HEIGHT, GAME_WIDTH, GameState } from '../hud';
import { between, choose, randomAngle, withAlpha } from '../utils';
import { SMALL_STAR_MAX_SIZE, Star } from './stars';

export function drawBackground(ctx: CanvasRenderingContext2D, state: GameState): void {
  ctx.fillStyle = state.visual.backgroundColor;
  ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

  drawStars(ctx, state.visual.stars);

  ctx.save();
  ctx.globalCompositeOperation = 'source-over';
  ctx.globalAlpha = 1;

  ctx.drawImage(state.visual.backgroundFeatureImage, 0, 0, GAME_WIDTH, GAME_HEIGHT);

  ctx.restore();
}

export function drawStars(ctx: CanvasRenderingContext2D, stars: readonly Star[]): void {
  for (const star of stars) {
    /* Two sine waves at different speeds give an irregular twinkle instead of a
    steady pulse. The result stays between roughly 0.1 and 1. */
    const phase = star.startingPhase + star.phaseChange;
    const pulse = 0.55 + 0.3 * Math.sin(phase) + 0.15 * Math.sin(phase * 3.7);

    ctx.globalAlpha = star.brightness * pulse;
    ctx.fillStyle = star.tint;

    if (star.size > SMALL_STAR_MAX_SIZE) {
      drawLargeStar(ctx, star, pulse);
    } else {
      ctx.fillRect(star.x, star.y, star.size, star.size);
    }
  }

  ctx.globalAlpha = 1;
}

const GALAXY_CHANCE = 0.1;
const SUPERNOVA_CHANCE = 0.1;
const PULSAR_CHANCE = 0.025;

export function initBackgroundFeatures(canvas: HTMLCanvasElement, stars: Star[]): void {
  const ctx = canvas.getContext('2d')!;
  let chance = Math.random();

  if (chance < GALAXY_CHANCE) {
    drawGalaxy(ctx, stars);
    return;
  }
  chance -= GALAXY_CHANCE;

  if (chance < SUPERNOVA_CHANCE) {
    drawSupernova(ctx);
    return;
  }
  chance -= SUPERNOVA_CHANCE;

  if (chance < PULSAR_CHANCE) {
    drawPulsar(ctx);
    return;
  }

  if (Math.random() < 0.5) {
    drawNebula(ctx);
  } else {
    drawCosmicDust(ctx);
  }
}

const LARGE_STAR_HALO_RADIUS_MULTIPLIER = 3;
const LARGE_STAR_SPIKE_MIN_MULTIPLIER = 2.5;
const LARGE_STAR_SPIKE_MAX_MULTIPLIER = 6.5;
const LARGE_STAR_SPIKE_MIN_WIDTH = 0.7;
const LARGE_STAR_SPIKE_SIZE_SCALE = 0.12;

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

const GALAXY_PADDING = 0.25;
const GALAXY_MIN_SIZE = 200;
const GALAXY_MAX_SIZE = 650;
const GALAXY_ARM_COUNT = 3;
const GALAXY_COLOR = '#A0AFFF';
const GALAXY_GLOW_COLOR = '#6278DD';
const GALAXY_SPIRAL_ROTATIONS = 0.85;
const GALAXY_ARM_SPREAD = 8;
const GALAXY_HEIGHT_MULTIPLIER = 0.55;

const GALAXY_STAR_MIN_SIZE = 0.5;
const GALAXY_STAR_MAX_SIZE = 2.25;
const GALAXY_STAR_MIN_BRIGHTNESS = 0.25;
const GALAXY_STAR_MAX_BRIGHTNESS = 0.75;
const GALAXY_STAR_MIN_TWINKLE_SPEED = 0.4;
const GALAXY_STAR_MAX_TWINKLE_SPEED = 0.8;

function drawGalaxy(ctx: CanvasRenderingContext2D, stars: Star[]): void {
  const x = between(GAME_WIDTH * GALAXY_PADDING, GAME_WIDTH * (1 - GALAXY_PADDING));
  const y = between(GAME_HEIGHT * GALAXY_PADDING, GAME_HEIGHT * (1 - GALAXY_PADDING));
  const size = between(GALAXY_MIN_SIZE, GALAXY_MAX_SIZE);
  const rotation = randomAngle();
  const arms = GALAXY_ARM_COUNT;
  const starsPerArm = size / 3;
  const color = GALAXY_COLOR;

  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rotation);
  ctx.globalCompositeOperation = 'lighter';

  glow(ctx, 0, 0, size, GALAXY_GLOW_COLOR, 0.1);

  for (let arm = 0; arm < arms; arm++) {
    const offset = (arm * Math.PI * 2) / arms;

    for (let i = 0; i < starsPerArm; i++) {
      const t = i / 100;
      const angle = t * Math.PI * 2 * GALAXY_SPIRAL_ROTATIONS + offset + rotation;

      const radius = t * size * 0.8;

      const px = Math.cos(angle) * radius + between(-GALAXY_ARM_SPREAD, GALAXY_ARM_SPREAD, { floor: false });
      const py =
        Math.sin(angle) * radius * GALAXY_HEIGHT_MULTIPLIER +
        between(-GALAXY_ARM_SPREAD, GALAXY_ARM_SPREAD, { floor: false });

      stars.push({
        x: x + px,
        y: y + py,
        size: between(GALAXY_STAR_MIN_SIZE, GALAXY_STAR_MAX_SIZE, { floor: false }),
        brightness: between(GALAXY_STAR_MIN_BRIGHTNESS, GALAXY_STAR_MAX_BRIGHTNESS, { floor: false }),
        speed: between(GALAXY_STAR_MIN_TWINKLE_SPEED, GALAXY_STAR_MAX_TWINKLE_SPEED, { floor: false }),
        phaseChange: 0,
        startingPhase: randomAngle(),
        tint: color
      });
    }
  }

  glow(ctx, 0, 0, size * 0.2, '#FFE1B5', 0.7);

  ctx.restore();
}

const SUPERNOVA_PADDING = 0.1;
const SUPERNOVA_MIN_SIZE = 50;
const SUPERNOVA_MAX_SIZE = 150;
const SUPERNOVA_COLOR = '#70CFFF';
const SUPERNOVA_RAYS = 28;

function drawSupernova(ctx: CanvasRenderingContext2D): void {
  const x = between(GAME_WIDTH * SUPERNOVA_PADDING, GAME_WIDTH * (1 - SUPERNOVA_PADDING));
  const y = between(GAME_HEIGHT * SUPERNOVA_PADDING, GAME_HEIGHT * (1 - SUPERNOVA_PADDING));
  const size = between(SUPERNOVA_MIN_SIZE, SUPERNOVA_MAX_SIZE);
  const color = SUPERNOVA_COLOR;
  const rays = SUPERNOVA_RAYS;

  ctx.save();
  ctx.globalCompositeOperation = 'lighter';

  glow(ctx, x, y, size * 2.5, color, 0.25);
  glow(ctx, x, y, size * 0.8, '#FFFFFF', 0.5);

  for (let i = 0; i < rays; i++) {
    const angle = (i / rays) * Math.PI * 2;
    const length = between(size * 0.7, size * 1.8, { floor: false });

    ctx.strokeStyle = color;
    ctx.globalAlpha = between(0.08, 0.3, { floor: false });
    ctx.lineWidth = between(1, 3, { floor: false });

    ctx.beginPath();
    ctx.moveTo(x + Math.cos(angle) * size * 0.15, y + Math.sin(angle) * size * 0.15);

    ctx.lineTo(x + Math.cos(angle) * length, y + Math.sin(angle) * length);

    ctx.stroke();
  }

  ctx.restore();
}

const PULSAR_X_PADDING = 0.4;
const PULSAR_Y_PADDING = 0.45;
const PULSAR_MIN_SIZE = 60;
const PULSAR_MAX_SIZE = 110;
const PULSAR_COLOR = '#55CFFF';

function drawPulsar(ctx: CanvasRenderingContext2D): void {
  const x = between(GAME_WIDTH * PULSAR_X_PADDING, GAME_WIDTH * (1 - PULSAR_X_PADDING));
  const y = between(GAME_HEIGHT * PULSAR_Y_PADDING, GAME_HEIGHT * (1 - PULSAR_Y_PADDING));
  const size = between(PULSAR_MIN_SIZE, PULSAR_MAX_SIZE);
  const color = PULSAR_COLOR;

  ctx.save();
  ctx.translate(x, y);
  ctx.globalCompositeOperation = 'lighter';

  glow(ctx, 0, 0, size * 2, color, 0.25);

  // Energy beams
  for (const direction of [-1, 1]) {
    const beam = ctx.createLinearGradient(0, 0, 0, direction * size * 4);

    beam.addColorStop(0, 'rgba(130,220,255,0.5)');
    beam.addColorStop(1, 'rgba(130,220,255,0)');

    ctx.fillStyle = beam;

    ctx.beginPath();
    ctx.moveTo(-size * 0.12, 0);
    ctx.lineTo(size * 0.12, 0);
    ctx.lineTo(size * 0.3, direction * size * 4);
    ctx.lineTo(-size * 0.3, direction * size * 4);
    ctx.fill();
  }

  glow(ctx, 0, 0, size * 0.4, '#FFFFFF', 0.9);

  ctx.restore();
}

interface NebulaPalette {
  name: string;
  cloud: string;
  structure: string;
  highlight: string;
}

const NEBULA_MIN_SIZE = 350;
const NEBULA_MAX_SIZE = 450;
const NEBULA_INTENSITY = 1;
const NEBULA_CLOUD_AMOUNT = 14;
const NEBULA_INTERNAL_STRUCTURE_AMOUNT = 35;
const NEBULA_PALETTES: NebulaPalette[] = [
  {
    name: 'crimson',
    cloud: '#B8324A',
    structure: '#D65B83',
    highlight: '#F0A0B5'
  },
  {
    name: 'rose',
    cloud: '#A64D83',
    structure: '#D65B83',
    highlight: '#E9A0C5'
  },
  {
    name: 'violet',
    cloud: '#7849C8',
    structure: '#987ACB',
    highlight: '#C0A7E8'
  },
  {
    name: 'blue',
    cloud: '#285A87',
    structure: '#428EBB',
    highlight: '#A2C9E8'
  },
  {
    name: 'teal',
    cloud: '#347E88',
    structure: '#55B9C2',
    highlight: '#A2DAD8'
  },
  {
    name: 'amber',
    cloud: '#A94F32',
    structure: '#C47B45',
    highlight: '#E6B17A'
  },
  {
    name: 'dusty',
    cloud: '#713B58',
    structure: '#A64D83',
    highlight: '#C47B45'
  }
];

function drawNebula(ctx: CanvasRenderingContext2D): void {
  const x = between(0, GAME_WIDTH);
  const y = between(0, GAME_HEIGHT);
  const size = between(NEBULA_MIN_SIZE, NEBULA_MAX_SIZE);
  const palette = choose(NEBULA_PALETTES);
  const intensity = NEBULA_INTENSITY;

  ctx.save();
  ctx.globalCompositeOperation = 'lighter';

  for (let i = 0; i < NEBULA_CLOUD_AMOUNT; i++) {
    const px = x + between(-size * 0.6, size * 0.6, { floor: false });
    const py = y + between(-size * 0.4, size * 0.4, { floor: false });
    const radius = between(size * 0.15, size * 0.55, { floor: false });

    glow(ctx, px, py, radius, palette.cloud, between(0.025, 0.075, { floor: false }) * NEBULA_INTENSITY);
  }

  for (let i = 0; i < NEBULA_INTERNAL_STRUCTURE_AMOUNT; i++) {
    const angle = between(0, Math.PI * 2, { floor: false });
    const distance = between(0, size * 0.6, { floor: false });

    const px = x + Math.cos(angle) * distance;
    const py = y + Math.sin(angle) * distance * 0.65;

    const roll = Math.random();

    const color = roll > 0.94 ? palette.highlight : roll > 0.55 ? palette.structure : palette.cloud;

    glow(
      ctx,
      px,
      py,
      between(8, size * 0.12, { floor: false }),
      color,
      between(0.025, 0.12, { floor: false }) * intensity
    );
  }

  ctx.restore();
}

const COSMIC_DUST_MIN_SIZE = 100;
const COSMIC_DUST_MAX_SIZE = 250;
const COSMIC_DUST_COLOR = '#8B9EDC';
const COSMIC_DUST_MIN_PARTICLES = 80;
const COSMIC_DUST_MAX_PARTICLES = 150;

function drawCosmicDust(ctx: CanvasRenderingContext2D): void {
  const x = between(0, GAME_WIDTH);
  const y = between(0, GAME_HEIGHT);
  const size = between(COSMIC_DUST_MIN_SIZE, COSMIC_DUST_MAX_SIZE);
  const color = COSMIC_DUST_COLOR;
  const particles = between(COSMIC_DUST_MIN_PARTICLES, COSMIC_DUST_MAX_PARTICLES);

  ctx.save();
  ctx.globalCompositeOperation = 'lighter';

  for (let i = 0; i < particles; i++) {
    const angle = randomAngle();
    const distance = Math.sqrt(Math.random()) * size;

    const px = x + Math.cos(angle) * distance;
    const py = y + Math.sin(angle) * distance * 0.7;
    const radius = between(0.5, 2.2, { floor: false });

    ctx.globalAlpha = between(0.08, 0.35, { floor: false });
    ctx.fillStyle = color;

    ctx.beginPath();
    ctx.arc(px, py, radius, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();
}

function glow(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  radius: number,
  color: string,
  intensity: number = 1
): void {
  const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);

  gradient.addColorStop(0, color);
  gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');

  ctx.save();
  ctx.globalAlpha = intensity;
  ctx.fillStyle = gradient;
  ctx.fillRect(x - radius, y - radius, radius * 2, radius * 2);
  ctx.restore();
}
