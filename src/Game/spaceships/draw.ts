import { SHIP_HULL, SHIP_SCALE } from './hitbox';
import { Spaceship } from './spaceship';

export function drawSpaceship(ctx: CanvasRenderingContext2D, spaceship: Spaceship): void {
  ctx.save();
  ctx.translate(spaceship.x, spaceship.y);

  // Engine flame (flickers every frame)
  const flame = (10 + Math.random() * 8) * SHIP_SCALE;
  ctx.fillStyle = '#ffb703';
  ctx.beginPath();
  ctx.moveTo(-4 * SHIP_SCALE, 24 * SHIP_SCALE);
  ctx.lineTo(0, 24 * SHIP_SCALE + flame);
  ctx.lineTo(4 * SHIP_SCALE, 24 * SHIP_SCALE);
  ctx.closePath();
  ctx.fill();

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
}
