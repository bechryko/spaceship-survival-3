import { Asteroid } from './asteroid';

const ASTEROID_OUTLINE_WIDTH = 5;

const CRATER_RIM_WIDTH = 3;

export function drawAsteroid(ctx: CanvasRenderingContext2D, asteroid: Asteroid) {
  const { x, y, r, angle, hue, lightness, shape, craters } = asteroid;

  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angle);

  // Body, with a soft highlight toward the upper left
  const asteroidBodyGradient = ctx.createRadialGradient(-r * 0.35, -r * 0.35, r * 0.1, 0, 0, r);
  asteroidBodyGradient.addColorStop(0, `hsl(${hue} 14% ${lightness + 14}%)`);
  asteroidBodyGradient.addColorStop(1, `hsl(${hue} 14% ${lightness - 6}%)`);

  ctx.beginPath();
  shape.forEach(([px, py], i) => (i === 0 ? ctx.moveTo(px * r, py * r) : ctx.lineTo(px * r, py * r)));
  ctx.closePath();
  ctx.fillStyle = asteroidBodyGradient;
  ctx.fill();
  ctx.lineJoin = 'round';
  ctx.lineWidth = ASTEROID_OUTLINE_WIDTH;
  ctx.strokeStyle = `hsl(${hue} 14% ${lightness - 16}%)`;
  ctx.stroke();

  // Craters
  for (const crater of craters) {
    ctx.beginPath();
    ctx.arc(crater.x * r, crater.y * r, crater.r * r, 0, Math.PI * 2);
    ctx.fillStyle = `hsl(${hue} 14% ${lightness - 12}%)`;
    ctx.fill();

    // Lit rim on the lower-right edge of each crater
    ctx.beginPath();
    ctx.arc(crater.x * r, crater.y * r, crater.r * r, -angle, 2.2 - angle);
    ctx.lineWidth = CRATER_RIM_WIDTH;
    ctx.strokeStyle = `hsl(${hue} 14% ${lightness + 18}%)`;
    ctx.stroke();
  }

  ctx.restore();
}
