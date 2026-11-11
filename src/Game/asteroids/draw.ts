import { Asteroid } from './asteroid';

export function drawAsteroid(ctx: CanvasRenderingContext2D, asteroid: Asteroid) {
  const { x, y, r, angle, shape } = asteroid;

  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angle);

  // Body, with a soft highlight toward the upper left
  const asteroidBodyGradient = ctx.createRadialGradient(-r * 0.35, -r * 0.35, r * 0.1, 0, 0, r);
  asteroidBodyGradient.addColorStop(0, `hsl(${shape.hue} 14% ${shape.lightness + 14}%)`);
  asteroidBodyGradient.addColorStop(1, `hsl(${shape.hue} 14% ${shape.lightness - 6}%)`);

  ctx.beginPath();
  shape.points.forEach(([px, py], i) => (i === 0 ? ctx.moveTo(px * r, py * r) : ctx.lineTo(px * r, py * r)));
  ctx.closePath();
  ctx.fillStyle = asteroidBodyGradient;
  ctx.fill();
  ctx.lineJoin = 'round';
  ctx.lineWidth = Math.max(1, r * 0.06);
  ctx.strokeStyle = `hsl(${shape.hue} 14% ${shape.lightness - 16}%)`;
  ctx.stroke();

  // Craters
  for (const c of shape.craters) {
    ctx.beginPath();
    ctx.arc(c.x * r, c.y * r, c.r * r, 0, Math.PI * 2);
    ctx.fillStyle = `hsl(${shape.hue} 14% ${shape.lightness - 12}%)`;
    ctx.fill();

    // Lit rim on the lower-right edge of each crater
    ctx.beginPath();
    ctx.arc(c.x * r, c.y * r, c.r * r, 0.2, Math.PI * 0.8);
    ctx.lineWidth = Math.max(1, r * 0.03);
    ctx.strokeStyle = `hsl(${shape.hue} 14% ${shape.lightness + 18}%)`;
    ctx.stroke();
  }

  ctx.restore();
}
