import { GAME_WIDTH, GameState, HUD_FONT_FAMILY } from '../hud';
import { clamp01, easeOutCubic } from '../utils';
import { DifficultyNoticeState } from './create';
import { DIFFICULTY_NOTICE_DURATION } from './tick';

export function drawGlobalEffects(ctx: CanvasRenderingContext2D, state: GameState): void {
  const { globalEffects } = state;

  if (globalEffects.difficultyNotice.current) {
    drawDifficultyNotice(ctx, globalEffects.difficultyNotice);
  }
}

const DIFFICULTY_NOTICE_POP_IN_TIME = 0.25;
const DIFFICULTY_NOTICE_FADE_OUT_TIME = 0.45;
const DIFFICULTY_NOTICE_MIN_FLASH_ALPHA = 0.3;
const DIFFICULTY_NOTICE_FLASHES_PER_SECOND = 2;
const DIFFICULTY_NOTICE_FONT_SIZE = 22;
const DIFFICULTY_NOTICE_PADDING_X = 26;
const DIFFICULTY_NOTICE_PADDING_Y = 12;
const DIFFICULTY_NOTICE_EDGE_MARGIN = 20;
const DIFFICULTY_NOTICE_Y = 56;
const DIFFICULTY_NOTICE_BACKGROUND_COLOR = 'rgba(18, 27, 45, 0.6)';
const DIFFICULTY_NOTICE_BORDER_COLOR = 'rgba(255, 209, 102, 0.45)';
const DIFFICULTY_NOTICE_TEXT_COLOR = '#ffd166';
const DIFFICULTY_NOTICE_GLOW_COLOR = 'rgba(255, 209, 102, 0.9)';

function drawDifficultyNotice(ctx: CanvasRenderingContext2D, state: DifficultyNoticeState): void {
  const notice = state.current!;

  const { text, age } = notice;
  const appear = clamp01(age / DIFFICULTY_NOTICE_POP_IN_TIME);
  const fade = Math.min(appear, clamp01((DIFFICULTY_NOTICE_DURATION - age) / DIFFICULTY_NOTICE_FADE_OUT_TIME));
  const scale = 1 + 0.35 * (1 - easeOutCubic(appear));

  const flash =
    age < DIFFICULTY_NOTICE_POP_IN_TIME
      ? 1
      : DIFFICULTY_NOTICE_MIN_FLASH_ALPHA +
        (1 - DIFFICULTY_NOTICE_MIN_FLASH_ALPHA) *
          (0.5 + 0.5 * Math.sin(age * Math.PI * 2 * DIFFICULTY_NOTICE_FLASHES_PER_SECOND));

  ctx.save();
  ctx.font = `700 ${DIFFICULTY_NOTICE_FONT_SIZE}px ${HUD_FONT_FAMILY}`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  const pillWidth = ctx.measureText(text).width + DIFFICULTY_NOTICE_PADDING_X * 2;
  const pillHeight = DIFFICULTY_NOTICE_FONT_SIZE + DIFFICULTY_NOTICE_PADDING_Y * 2;
  const fit = Math.min(1, (GAME_WIDTH - DIFFICULTY_NOTICE_EDGE_MARGIN * 2) / (pillWidth * scale)); // long messages shrink instead of running off

  ctx.translate(GAME_WIDTH / 2, DIFFICULTY_NOTICE_Y);
  ctx.scale(scale * fit, scale * fit);
  ctx.globalAlpha = fade;

  // Pill
  ctx.beginPath();
  ctx.roundRect(-pillWidth / 2, -pillHeight / 2, pillWidth, pillHeight, pillHeight / 2);
  ctx.fillStyle = DIFFICULTY_NOTICE_BACKGROUND_COLOR;
  ctx.fill();
  ctx.lineWidth = 1.5;
  ctx.strokeStyle = DIFFICULTY_NOTICE_BORDER_COLOR;
  ctx.stroke();

  // Flashing text with a glow
  ctx.globalAlpha = fade * flash;
  ctx.shadowColor = DIFFICULTY_NOTICE_GLOW_COLOR;
  ctx.shadowBlur = 14;
  ctx.fillStyle = DIFFICULTY_NOTICE_TEXT_COLOR;
  ctx.fillText(text, 0, 1);

  ctx.restore();
}
