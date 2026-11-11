import { GAME_HEIGHT, GAME_WIDTH } from '../hud';

const BACKGROUND_COLOR = '#161a38';

export function drawBackground(ctx: CanvasRenderingContext2D): void {
  ctx.fillStyle = BACKGROUND_COLOR;
  ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
}
