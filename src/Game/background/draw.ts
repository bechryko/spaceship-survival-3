import { GAME_HEIGHT, GAME_WIDTH, GameState } from '../hud';
import { Point } from '../models';
import {
  between,
  chance,
  choose,
  clamp01,
  gaussian,
  hexToRgb,
  lighten,
  randomAngle,
  smoothstep,
  withAlpha
} from '../utils';
import { SMALL_STAR_MAX_SIZE, Star } from './stars';

const BACKGROUND_FEATURE_OPACITY = 0.9;

export function drawBackground(ctx: CanvasRenderingContext2D, state: GameState): void {
  ctx.fillStyle = state.visual.backgroundColor;
  ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

  ctx.save();
  ctx.globalCompositeOperation = 'screen';
  ctx.globalAlpha = BACKGROUND_FEATURE_OPACITY;
  ctx.drawImage(state.visual.backgroundFeatureImage, 0, 0, GAME_WIDTH, GAME_HEIGHT);
  ctx.restore();

  drawStars(ctx, state.visual.stars);
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

// =====================================================================================
// Background features
// =====================================================================================
type BackgroundFeature = 'galaxy' | 'supernova' | 'pulsar' | 'nebula' | 'cosmic-dust';

const NEBULA_CHANCE = 0.35;
const GALAXY_CHANCE = 0.15;
const SUPERNOVA_CHANCE = 0.025;
const PULSAR_CHANCE = 0.01;
// Default is cosmic dust

function pickFeature(): BackgroundFeature {
  let chance = Math.random();

  if (chance < NEBULA_CHANCE) return 'nebula';
  chance -= NEBULA_CHANCE;

  if (chance < GALAXY_CHANCE) return 'galaxy';
  chance -= GALAXY_CHANCE;

  if (chance < SUPERNOVA_CHANCE) return 'supernova';
  chance -= SUPERNOVA_CHANCE;

  if (chance < PULSAR_CHANCE) return 'pulsar';

  return 'cosmic-dust';
}

const TWIN_GALAXIES_CHANCE = 0.05;
const COSMIC_DUST_MIN_AMOUNT = 2;
const COSMIC_DUST_MAX_AMOUNT = 4;

export function initBackgroundFeatures(
  canvas: HTMLCanvasElement,
  stars: Star[],
  feature: BackgroundFeature = pickFeature()
): void {
  const ctx = canvas.getContext('2d')!;

  switch (feature) {
    case 'galaxy': {
      const pos = drawGalaxy(ctx, stars);
      if (chance(TWIN_GALAXIES_CHANCE)) {
        drawGalaxy(ctx, stars, pos);
      }
      break;
    }
    case 'supernova':
      drawSupernova(ctx);
      break;
    case 'pulsar':
      drawPulsar(ctx);
      break;
    case 'nebula':
      drawNebula(ctx, stars);
      break;
    case 'cosmic-dust':
      for (let i = 0; i < between(COSMIC_DUST_MIN_AMOUNT, COSMIC_DUST_MAX_AMOUNT); i++) {
        drawCosmicDust(ctx);
      }
      break;
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

// =====================================================================================
// Galaxy
// =====================================================================================
const GALAXY_PADDING = 0.25;
const GALAXY_MIN_SIZE = 300;
const GALAXY_MAX_SIZE = 650;
const GALAXY_ARM_COUNT = 3;
const GALAXY_COLOR = '#A0AFFF';
const GALAXY_GLOW_COLOR = '#6278DD';
const GALAXY_CORE_COLOR = '#FFE1B5';
const GALAXY_SPIRAL_ROTATIONS = 0.85;
const GALAXY_HEIGHT_MULTIPLIER = 0.55; // how flattened the disc looks
const GALAXY_RADIUS_MULTIPLIER = 0.5; // the galaxy's radius, relative to its size
const GALAXY_ARM_SPREAD = 0.06; // how far dust and stars stray from the arm's centre line, relative to the radius

const GALAXY_DUST_PER_ARM = 900;
const GALAXY_HAZE_PER_ARM = 22;
const GALAXY_STAR_MIN_SIZE = 0.5;
const GALAXY_STAR_MAX_SIZE = 2.1;
const GALAXY_STAR_MIN_BRIGHTNESS = 0.25;
const GALAXY_STAR_MAX_BRIGHTNESS = 0.75;
const GALAXY_STAR_MIN_TWINKLE_SPEED = 0.6;
const GALAXY_STAR_MAX_TWINKLE_SPEED = 1.2;

const TWIN_GALAXIES_MIN_DISTANCE = 200;
const TWIN_GALAXIES_SPACING_MAX_ATTEMPTS = 50;

/** A point on a spiral arm in the galaxy's own frame (before it is rotated). t runs from the centre (0) to the rim (1). */
function spiralPoint(t: number, armOffset: number, radius: number): [number, number] {
  const angle = t * Math.PI * 2 * GALAXY_SPIRAL_ROTATIONS + armOffset;
  const sigma = radius * GALAXY_ARM_SPREAD * (0.5 + t);

  return [
    Math.cos(angle) * radius * t + gaussian() * sigma,
    (Math.sin(angle) * radius * t + gaussian() * sigma) * GALAXY_HEIGHT_MULTIPLIER
  ];
}

function generateGalaxyPosition(point?: Point): { x: number; y: number } {
  let x: number;
  let y: number;

  let attempts = 0;
  do {
    x = between(GAME_WIDTH * GALAXY_PADDING, GAME_WIDTH * (1 - GALAXY_PADDING));
    y = between(GAME_HEIGHT * GALAXY_PADDING, GAME_HEIGHT * (1 - GALAXY_PADDING));
    attempts++;
  } while (
    point &&
    attempts < TWIN_GALAXIES_SPACING_MAX_ATTEMPTS &&
    Math.hypot(x - point[0], y - point[1]) < TWIN_GALAXIES_MIN_DISTANCE
  );

  return { x, y };
}

function drawGalaxy(ctx: CanvasRenderingContext2D, stars: Star[], otherGalaxy?: Point): Point {
  const { x, y } = generateGalaxyPosition(otherGalaxy);
  const size = between(GALAXY_MIN_SIZE, GALAXY_MAX_SIZE);
  const rotation = randomAngle();
  const arms = GALAXY_ARM_COUNT;
  const color = GALAXY_COLOR;
  const radius = size * GALAXY_RADIUS_MULTIPLIER;

  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rotation);
  ctx.globalCompositeOperation = 'screen';

  // The soft disc the arms sit in
  glow(ctx, 0, 0, radius * 1.15, GALAXY_GLOW_COLOR, 0.2, GALAXY_HEIGHT_MULTIPLIER);

  for (let arm = 0; arm < arms; arm++) {
    const offset = (arm * Math.PI * 2) / arms;

    // Gas along the arm, as soft patches
    for (let i = 0; i < GALAXY_HAZE_PER_ARM; i++) {
      const [px, py] = spiralPoint((i + 0.5) / GALAXY_HAZE_PER_ARM, offset, radius);
      glow(ctx, px, py, radius * between(0.12, 0.22, { floor: false }), color, 0.05, GALAXY_HEIGHT_MULTIPLIER);
    }

    // A fine dust of faint stars that makes the arm visible. Warm near the centre, blue further out.
    for (let i = 0; i < GALAXY_DUST_PER_ARM; i++) {
      const t = Math.random() ** 0.7;
      const [px, py] = spiralPoint(t, offset, radius);

      ctx.fillStyle = withAlpha(
        t < 0.3 ? GALAXY_CORE_COLOR : color,
        between(0.06, 0.3, { floor: false }) * (1 - t * 0.5)
      );
      ctx.beginPath();
      ctx.arc(px, py, between(0.4, 1.2, { floor: false }), 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // The bright bulge in the middle
  glow(ctx, 0, 0, radius * 0.4, GALAXY_CORE_COLOR, 0.5, 0.8);
  glow(ctx, 0, 0, radius * 0.13, '#FFF6E6', 0.85);

  ctx.restore();

  // Some of the stars twinkle like the rest of the sky. They are placed with the same rotation as the drawing above.
  const cos = Math.cos(rotation);
  const sin = Math.sin(rotation);
  const starCount = Math.round(size / 4);

  for (let i = 0; i < starCount; i++) {
    const t = Math.random() ** 0.8;
    const [px, py] = spiralPoint(t, ((i % arms) * Math.PI * 2) / arms, radius);

    stars.push({
      x: x + px * cos - py * sin,
      y: y + px * sin + py * cos,
      size: between(GALAXY_STAR_MIN_SIZE, GALAXY_STAR_MAX_SIZE, { floor: false }),
      brightness: between(GALAXY_STAR_MIN_BRIGHTNESS, GALAXY_STAR_MAX_BRIGHTNESS, { floor: false }),
      speed: between(GALAXY_STAR_MIN_TWINKLE_SPEED, GALAXY_STAR_MAX_TWINKLE_SPEED, { floor: false }),
      phaseChange: 0,
      startingPhase: randomAngle(),
      tint: t < 0.3 ? GALAXY_CORE_COLOR : color
    });
  }

  return [x, y];
}

// =====================================================================================
// Supernova remnant
// =====================================================================================
const SUPERNOVA_PADDING_Y = 0.25;
const SUPERNOVA_PADDING_X = 0.15;
const SUPERNOVA_MIN_SIZE = 75;
const SUPERNOVA_MAX_SIZE = 250;
const SUPERNOVA_COLOR = '#70CFFF';
const SUPERNOVA_CLOUD_VARIATION_COLORS = ['#5100b4', '#be23a6', '#158e00', '#38c0ff', '#fffb29'];
const SUPERNOVA_INNER_COLOR = '#C860B8';
const SUPERNOVA_RAYS = 14;

function drawSupernova(ctx: CanvasRenderingContext2D): void {
  const x = between(GAME_WIDTH * SUPERNOVA_PADDING_X, GAME_WIDTH * (1 - SUPERNOVA_PADDING_X));
  const y = between(GAME_HEIGHT * SUPERNOVA_PADDING_Y, GAME_HEIGHT * (1 - SUPERNOVA_PADDING_Y));
  const size = between(SUPERNOVA_MIN_SIZE, SUPERNOVA_MAX_SIZE);
  const color = SUPERNOVA_COLOR;
  const cloudVariationColor = choose(SUPERNOVA_CLOUD_VARIATION_COLORS);
  const gasCloudDiameter = size * 4.4;

  // The expanding shell: filaments of gas in a ring, thickest at about two thirds of the way out
  drawCloud(ctx, {
    x,
    y,
    width: gasCloudDiameter,
    height: gasCloudDiameter,
    rotation: randomAngle(),
    colors: [color, cloudVariationColor],
    opacity: 0.5,
    detail: 6,
    threshold: 0.3,
    ridged: true,
    shape: (u, v) => {
      const distance = Math.hypot(u, v);
      return Math.exp(-(((distance - 0.62) / 0.17) ** 2)) * smoothstep(1, 0.85, distance);
    }
  });

  // A warmer haze in the middle
  drawCloud(ctx, {
    x,
    y,
    width: gasCloudDiameter * 0.7,
    height: gasCloudDiameter * 0.7,
    rotation: randomAngle(),
    colors: [SUPERNOVA_INNER_COLOR, color],
    opacity: 0.28,
    detail: 4,
    threshold: 0.25
  });

  ctx.save();
  ctx.globalCompositeOperation = 'screen';

  glow(ctx, x, y, size * 2.4, color, 0.2);
  glow(ctx, x, y, size * 0.8, '#FFFFFF', 0.55);

  for (let i = 0; i < 4; i++) {
    const angle = (i * Math.PI) / 2;
    const length = size * 3.6;
    const gradient = ctx.createLinearGradient(x, y, x + length, y);
    gradient.addColorStop(0, withAlpha('#FFFFFF', 0.55));
    gradient.addColorStop(0.35, withAlpha(color, 0.25));
    gradient.addColorStop(1, withAlpha(color, 0));

    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle);
    ctx.translate(-x, -y);
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.moveTo(x, y - 1.6);
    ctx.lineTo(x + length, y);
    ctx.lineTo(x, y + 1.6);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  for (let i = 0; i < SUPERNOVA_RAYS; i++) {
    const angle = randomAngle();
    const length = size * between(1.2, 2.2, { floor: false });
    const gradient = ctx.createLinearGradient(x, y, x + length, y);
    gradient.addColorStop(0, withAlpha(color, between(0.18, 0.4, { floor: false })));
    gradient.addColorStop(1, withAlpha(color, 0));

    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle);
    ctx.translate(-x, -y);
    ctx.fillStyle = gradient;
    ctx.fillRect(x, y - 0.5, length, 1);
    ctx.restore();
  }

  ctx.restore();
}

// =====================================================================================
// Pulsar
// =====================================================================================
const PULSAR_X_PADDING = 0.2;
const PULSAR_Y_PADDING = 0.3;
const PULSAR_MIN_SIZE = 70;
const PULSAR_MAX_SIZE = 125;
const PULSAR_COLORS = ['#55CFFF', '#37fbff', '#3284ff'];
const PULSAR_BEAM_LAYERS = 16;
const PULSAR_ROTATION_OFFSET = Math.PI / 8;

function drawPulsar(ctx: CanvasRenderingContext2D): void {
  const x = between(GAME_WIDTH * PULSAR_X_PADDING, GAME_WIDTH * (1 - PULSAR_X_PADDING));
  const y = between(GAME_HEIGHT * PULSAR_Y_PADDING, GAME_HEIGHT * (1 - PULSAR_Y_PADDING));
  const size = between(PULSAR_MIN_SIZE, PULSAR_MAX_SIZE);
  const rotation = between(-PULSAR_ROTATION_OFFSET, PULSAR_ROTATION_OFFSET, { floor: false });
  const color = choose(PULSAR_COLORS);

  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rotation);
  ctx.globalCompositeOperation = 'screen';

  glow(ctx, 0, 0, size * 2.5, color, 0.3);

  // The two energy beams. Each is several narrower beams on top of each other, which makes the middle bright
  // and the edges soft instead of a hard-edged shape.
  const length = size * 4;
  for (const direction of [-1, 1]) {
    const gradient = ctx.createLinearGradient(0, 0, 0, direction * length);
    gradient.addColorStop(0, withAlpha('#9EE6FF', 0.16));
    gradient.addColorStop(0.5, withAlpha(color, 0.06));
    gradient.addColorStop(1, withAlpha(color, 0));
    ctx.fillStyle = gradient;

    for (let layer = 0; layer < PULSAR_BEAM_LAYERS; layer++) {
      const width = 1 - layer / PULSAR_BEAM_LAYERS; // 1 down to a narrow core

      ctx.beginPath();
      ctx.moveTo(-size * 0.01 * width, 0);
      ctx.lineTo(size * 0.01 * width, 0);
      ctx.lineTo(size * 0.32 * width, direction * length);
      ctx.lineTo(-size * 0.32 * width, direction * length);
      ctx.closePath();
      ctx.fill();
    }
  }

  glow(ctx, 0, 0, size * 0.5, '#CFF3FF', 0.7);
  glow(ctx, 0, 0, size * 0.16, '#FFFFFF', 0.95);

  // Cloud ring around the beams
  const offset = size * 9;
  drawCloud(ctx, {
    x: 0,
    y: 0,
    width: offset,
    height: offset,
    rotation: randomAngle(),
    colors: [color, color],
    opacity: 0.4,
    detail: 8,
    threshold: 0.1,
    ridged: true,
    shape: (u, v) => {
      const distance = Math.hypot(u, v);
      return Math.exp(-(((distance - 0.8) / 0.17) ** 2)) * smoothstep(1, 0.85, distance);
    }
  });

  ctx.restore();
}

// =====================================================================================
// Nebula
// =====================================================================================
interface NebulaPalette {
  name: string;
  cloud: string;
  structure: string;
  highlight: string;
}

const NEBULA_X_PADDING = 0.15;
const NEBULA_Y_PADDING = 0.2;
const NEBULA_MIN_SIZE = 550;
const NEBULA_MAX_SIZE = 700;
const NEBULA_INTENSITY = 1;
const NEBULA_BRIGHT_SPOT_MIN_AMOUNT = 5;
const NEBULA_BRIGHT_SPOT_MAX_AMOUNT = 9;
const NEBULA_STAR_AMOUNT = 24;
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

function drawNebula(ctx: CanvasRenderingContext2D, stars?: Star[]): void {
  const x = between(GAME_WIDTH * NEBULA_X_PADDING, GAME_WIDTH * (1 - NEBULA_X_PADDING));
  const y = between(GAME_HEIGHT * NEBULA_Y_PADDING, GAME_HEIGHT * (1 - NEBULA_Y_PADDING));
  const size = between(NEBULA_MIN_SIZE, NEBULA_MAX_SIZE);
  const intensity = NEBULA_INTENSITY;
  const rotation = randomAngle();
  const brightSpotAmount = between(NEBULA_BRIGHT_SPOT_MIN_AMOUNT, NEBULA_BRIGHT_SPOT_MAX_AMOUNT);

  const palette = choose(NEBULA_PALETTES);
  const color = palette.structure;
  const secondColor = palette.cloud;
  const accentColor = palette.highlight;

  // A wide, faint body in the main color
  drawCloud(ctx, {
    x,
    y,
    width: size * 1.7,
    height: size * 1.1,
    rotation,
    colors: [color, secondColor],
    opacity: 0.4 * intensity,
    detail: 2.6,
    threshold: 0.3
  });

  // A smaller, brighter cloud with a second and a third color mixed in
  drawCloud(ctx, {
    x: x + between(-size * 0.2, size * 0.2, { floor: false }),
    y: y + between(-size * 0.15, size * 0.15, { floor: false }),
    width: size * 1.1,
    height: size * 0.75,
    rotation: rotation + between(-0.4, 0.4, { floor: false }),
    colors: [accentColor, secondColor],
    opacity: 0.32 * intensity,
    detail: 3.6,
    threshold: 0.4
  });

  // Thin bright filaments running through it
  drawCloud(ctx, {
    x,
    y,
    width: size * 1.4,
    height: size * 0.9,
    rotation,
    colors: [lighten(color, 0.5), lighten(secondColor, 0.5)],
    opacity: 0.34 * intensity,
    detail: 5,
    threshold: 0.45,
    ridged: true
  });

  ctx.save();
  ctx.globalCompositeOperation = 'screen';

  // Places where stars are being born
  for (let i = 0; i < brightSpotAmount; i++) {
    glow(
      ctx,
      x + gaussian() * size * 0.22,
      y + gaussian() * size * 0.14,
      between(14, size * 0.1, { floor: false }),
      '#D6B8FF',
      between(0.18, 0.4, { floor: false }) * intensity
    );
  }

  ctx.restore();

  // And a few stars inside it, so it doesn't look like it is in front of them
  for (let i = 0; stars && i < NEBULA_STAR_AMOUNT; i++) {
    stars.push({
      x: x + gaussian() * size * 0.28,
      y: y + gaussian() * size * 0.18,
      size: between(0.6, SMALL_STAR_MAX_SIZE, { floor: false }),
      brightness: between(0.3, 0.8, { floor: false }),
      speed: between(0.5, 1.5, { floor: false }),
      phaseChange: 0,
      startingPhase: randomAngle(),
      tint: '#E3D4FF'
    });
  }
}

// =====================================================================================
// Cosmic dust
// =====================================================================================
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
  const rotation = randomAngle();

  // A faint haze of dust lanes
  drawCloud(ctx, {
    x,
    y,
    width: size * 3,
    height: size * 1.8,
    rotation,
    colors: [color, '#B7C6F5'],
    opacity: 0.3,
    detail: 4,
    threshold: 0.42,
    ridged: true
  });

  ctx.save();
  ctx.globalCompositeOperation = 'screen';
  ctx.translate(x, y);
  ctx.rotate(rotation);

  // Grains, thickest in the middle and thinning out
  for (let i = 0; i < particles; i++) {
    ctx.fillStyle = withAlpha(color, between(0.12, 0.5, { floor: false }));
    ctx.beginPath();
    ctx.arc(gaussian() * size * 0.7, gaussian() * size * 0.4, between(0.4, 1.6, { floor: false }), 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();
}

// =====================================================================================
// Utilities
// =====================================================================================

/**
 * A soft spot of light that fades out like real light does. `squash` flattens it vertically,
 * for the disc of a galaxy seen at an angle.
 */
function glow(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  radius: number,
  color: string,
  intensity: number = 1,
  squash: number = 1
): void {
  const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, radius);

  for (const t of [0, 0.15, 0.35, 0.6, 1]) {
    gradient.addColorStop(t, withAlpha(color, (1 - t) ** 2));
  }

  ctx.save();
  ctx.translate(x, y);
  ctx.scale(1, squash);
  ctx.globalAlpha = intensity;
  ctx.fillStyle = gradient;
  ctx.fillRect(-radius, -radius, radius * 2, radius * 2);
  ctx.restore();
}

/** Smooth random values on a grid: the building block of the cloud textures. */
function createNoise(size = 64): (x: number, y: number) => number {
  const grid = Array.from({ length: size * size }, () => Math.random());
  const at = (x: number, y: number): number => grid[(y & (size - 1)) * size + (x & (size - 1))];

  return (x, y) => {
    const x0 = Math.floor(x);
    const y0 = Math.floor(y);
    const fx = x - x0;
    const fy = y - y0;
    const sx = fx * fx * (3 - 2 * fx);
    const sy = fy * fy * (3 - 2 * fy);
    const top = at(x0, y0) + (at(x0 + 1, y0) - at(x0, y0)) * sx;
    const bottom = at(x0, y0 + 1) + (at(x0 + 1, y0 + 1) - at(x0, y0 + 1)) * sx;
    return top + (bottom - top) * sy;
  };
}

/** Several layers of noise at growing detail added together: gives clouds their wispy, uneven look. */
function fractalNoise(noise: (x: number, y: number) => number, x: number, y: number, octaves: number): number {
  let sum = 0;
  let amplitude = 0.5;
  let frequency = 1;
  let total = 0;

  for (let i = 0; i < octaves; i++) {
    sum += noise(x * frequency, y * frequency) * amplitude;
    total += amplitude;
    amplitude *= 0.5;
    frequency *= 2.03;
  }

  return sum / total;
}

interface CloudOptions {
  /** Centre and size in game units. */
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  /** The cloud shifts between these two colours (hex). */
  colors: readonly [string, string];
  /** Opacity of the thickest parts, 0 to 1. */
  opacity: number;
  /** How many blobs or filaments fit across: higher is finer detail. */
  detail: number;
  /** Raise to leave more of the cloud empty. */
  threshold: number;
  /** Thin filaments instead of puffy blobs. */
  ridged?: boolean;
  /** Where the cloud may be: 1 where it is allowed, 0 where it is not. u and v go from -1 to 1 across the cloud. */
  shape?: (u: number, v: number) => number;
}

/**
 * Paints a cloud made of noise. It is rendered once at a low resolution and stretched, which is what gives it
 * its soft look. Drawn with 'screen' so overlapping clouds add their light.
 */
function drawCloud(ctx: CanvasRenderingContext2D, options: CloudOptions): void {
  const { x, y, width, height, rotation, colors, opacity, detail, threshold, ridged = false } = options;
  const shape = options.shape ?? ((u, v) => smoothstep(1, 0.15, Math.hypot(u, v)));

  const longest = Math.min(280, Math.max(96, Math.round(Math.max(width, height) * 0.6)));
  const spriteWidth = width >= height ? longest : Math.max(32, Math.round((longest * width) / height));
  const spriteHeight = height >= width ? longest : Math.max(32, Math.round((longest * height) / width));
  const aspect = height / width;

  const noise = createNoise();
  const colorNoise = createNoise();
  const offsetX = between(0, 200);
  const offsetY = between(0, 200);
  const [r1, g1, b1] = hexToRgb(colors[0]);
  const [r2, g2, b2] = hexToRgb(colors[1]);

  const sprite = document.createElement('canvas');
  sprite.width = spriteWidth;
  sprite.height = spriteHeight;
  const spriteCtx = sprite.getContext('2d')!;
  const image = spriteCtx.createImageData(spriteWidth, spriteHeight);

  for (let py = 0; py < spriteHeight; py++) {
    for (let px = 0; px < spriteWidth; px++) {
      const u = ((px + 0.5) / spriteWidth) * 2 - 1;
      const v = ((py + 0.5) / spriteHeight) * 2 - 1;
      const mask = shape(u, v);
      if (mask <= 0.002) continue;

      const nx = (px / spriteWidth) * detail + offsetX;
      const ny = (py / spriteHeight) * detail * aspect + offsetY;

      // Warping the noise by more noise twists it into swirls and filaments
      const warp = fractalNoise(noise, nx * 0.7 + 17.1, ny * 0.7 + 3.3, 3);
      let value = fractalNoise(noise, nx + warp * 1.8, ny + warp * 1.8, 5);
      if (ridged) value = 1 - Math.abs(2 * value - 1);

      value = clamp01((value - threshold) / (1 - threshold)) ** 1.5;
      const alpha = value * mask * opacity;
      if (alpha <= 0.002) continue;

      const mix = fractalNoise(colorNoise, nx * 0.6, ny * 0.6, 2);
      const index = (py * spriteWidth + px) * 4;
      image.data[index] = r1 + (r2 - r1) * mix;
      image.data[index + 1] = g1 + (g2 - g1) * mix;
      image.data[index + 2] = b1 + (b2 - b1) * mix;
      image.data[index + 3] = alpha * 255;
    }
  }

  spriteCtx.putImageData(image, 0, 0);

  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rotation);
  ctx.globalCompositeOperation = 'screen';
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(sprite, -width / 2, -height / 2, width, height);
  ctx.restore();
}
