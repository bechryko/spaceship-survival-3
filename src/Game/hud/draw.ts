import { EXIT_KEY_CODE, GAME_HEIGHT, GAME_WIDTH, START_PAUSE_KEY_CODE } from './constants';
import { GameState, GameStatus } from './game-state';

const HUD_GAME_OVER_OVERLAY_COLOR = 'rgba(20, 33, 61, 0.78)';

const HUD_TEXT_COLOR = '#e8f1f2';
const HUD_MARGIN_X = 16;
const HUD_MARGIN_Y = 28;
const HUD_FONT_SIZE = 18;
const HUD_FONT_FAMILY = 'system-ui, sans-serif';

function drawOverlays(ctx: CanvasRenderingContext2D, state: GameState): void {
  if (state.status !== GameStatus.PLAYING) {
    ctx.fillStyle = HUD_GAME_OVER_OVERLAY_COLOR;
    ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

    ctx.textAlign = 'center';
    drawText(
      ctx,
      state.status === GameStatus.OVER ? 'Game Over!' : 'Paused!',
      GAME_WIDTH / 2,
      GAME_HEIGHT / 2 - 12,
      700,
      HUD_FONT_SIZE * 2
    );

    drawText(
      ctx,
      state.status === GameStatus.OVER
        ? `Your score: ${state.score}. Press ${START_PAUSE_KEY_CODE} to restart or ${EXIT_KEY_CODE} to exit to the menu!`
        : `Press ${EXIT_KEY_CODE} to exit to the menu!`,
      GAME_WIDTH / 2,
      GAME_HEIGHT / 2 + 20,
      400,
      HUD_FONT_SIZE
    );
  }
}

export function drawHUD(ctx: CanvasRenderingContext2D, state: GameState, highscore: number): void {
  ctx.textAlign = 'left';
  drawText(ctx, `Score: ${state.score}`, HUD_MARGIN_X, HUD_MARGIN_Y, 600, HUD_FONT_SIZE);
  ctx.textAlign = 'right';
  drawText(ctx, `Best: ${highscore}`, GAME_WIDTH - HUD_MARGIN_X, HUD_MARGIN_Y, 600, HUD_FONT_SIZE);

  drawOverlays(ctx, state);
}

function drawText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  fontWeight: number,
  fontSize: number
): void {
  ctx.fillStyle = HUD_TEXT_COLOR;
  ctx.font = `${fontWeight} ${fontSize}px ${HUD_FONT_FAMILY}`;
  ctx.fillText(text, x, y);
}
