import { Spaceship } from '../spaceships';
import { fillMultilineText, getAlmanacForAbilities } from '../utils';
import { EXIT_KEY_CODE, GAME_HEIGHT, GAME_WIDTH, START_PAUSE_KEY_CODE } from './constants';
import { GameState, GameStatus } from './game-state';

const HUD_TEXT_COLOR = '#e8f1f2';
const HUD_MARGIN_X = 16;
const HUD_MARGIN_Y = 28;
const HUD_FONT_SIZE = 18;
const HUD_FONT_FAMILY = 'system-ui, sans-serif';

export function drawHUD(ctx: CanvasRenderingContext2D, state: GameState, highscore: number): void {
  ctx.textAlign = 'left';
  drawText(ctx, `Score: ${state.score}`, HUD_MARGIN_X, HUD_MARGIN_Y, 600, HUD_FONT_SIZE);
  ctx.textAlign = 'right';
  drawText(ctx, `Best: ${highscore}`, GAME_WIDTH - HUD_MARGIN_X, HUD_MARGIN_Y, 600, HUD_FONT_SIZE);

  drawAbilityHud(ctx, state.player);

  drawOverlays(ctx, state);
}

const ABILITY_HUD_TOP_MARGIN = 5;
const ABILITY_HUD_X_MARGIN = 125;
const ABILITY_HUD_PLAYER_INDICATOR_OFFSET = 7;
const ABILITY_HUD_SLOT_SIZE = 44;
const ABILITY_HUD_SLOT_GAP = 15;
const ABILITY_HUD_SLOT_BORDER_RADIUS = 10;
const ABILITY_HUD_SLOT_DEFAULT_BACKGROUND_COLOR = 'rgba(255, 255, 255, 0.1)';
const ABILITY_HUD_SLOT_ACTIVE_BACKGROUND_COLOR = 'rgba(255, 77, 109, 0.35)';
const ABILITY_HUD_SLOT_COOLDOWN_OVERLAY_COLOR = 'rgba(8, 12, 32, 0.72)';
const ABILITY_HUD_SLOT_READY_BORDER_COLOR = 'rgba(207, 227, 255, 0.8)';
const ABILITY_HUD_SLOT_COOLDOWN_BORDER_COLOR = 'rgba(255, 255, 255, 0.18)';
const ABILITY_HUD_SLOT_ACTIVE_BORDER_COLOR = '#ff4d6d';
const ABILITY_HUD_SLOT_READY_TEXT_COLOR = '#e8f1f2';
const ABILITY_HUD_SLOT_COOLDOWN_TEXT_COLOR = 'rgba(232, 241, 242, 0.85)';
const ABILITY_HUD_SLOT_ACTIVE_TEXT_COLOR = '#ffd6de';
const ABILITY_HUD_SLOT_TEXT_SIZE = 20;
const ABILITY_HUD_SLOT_TEXT_WEIGHT = 700;
const ABILITY_HUD_SLOT_NAME_TEXT_Y_MARGIN = 12;
const ABILITY_HUD_SLOT_NAME_TEXT_COLOR = 'rgba(232, 241, 242, 0.7)';
const ABILITY_HUD_SLOT_NAME_TEXT_SIZE = 11;
const ABILITY_HUD_SLOT_NAME_LINE_HEIGHT = 12;
const ABILITY_HUD_SLOT_NAME_TEXT_WEIGHT = 500;

function drawAbilityHud(ctx: CanvasRenderingContext2D, player: Spaceship): void {
  const { abilities } = player;
  const almanac = getAlmanacForAbilities(player);
  const slots = [
    {
      key: 'Q',
      label: almanac.q.name.replaceAll(' ', '\n'),
      remaining: abilities.q.cooldownTimer,
      total: almanac.q.cooldown,
      active: abilities.q.activeTimer
    },
    {
      key: 'W',
      label: almanac.w.name.replaceAll(' ', '\n'),
      remaining: abilities.w.cooldownTimer,
      total: almanac.w.cooldown,
      active: abilities.w.activeTimer
    },
    {
      key: 'E',
      label: almanac.e.name.replaceAll(' ', '\n'),
      remaining: abilities.e.cooldownTimer,
      total: almanac.e.cooldown,
      active: abilities.e.activeTimer
    }
  ];

  const totalWidth = slots.length * ABILITY_HUD_SLOT_SIZE + (slots.length - 1) * ABILITY_HUD_SLOT_GAP;

  ctx.save();

  // Player indicator: a thin bar above the slots with the player color
  ctx.fillStyle = player.color;
  ctx.beginPath();
  ctx.roundRect(ABILITY_HUD_X_MARGIN, ABILITY_HUD_TOP_MARGIN, totalWidth, 3, 1.5);
  ctx.fill();

  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  const totalTopMargin = ABILITY_HUD_TOP_MARGIN + ABILITY_HUD_PLAYER_INDICATOR_OFFSET;

  slots.forEach((slot, i) => {
    const x = ABILITY_HUD_X_MARGIN + i * (ABILITY_HUD_SLOT_SIZE + ABILITY_HUD_SLOT_GAP);
    const cx = x + ABILITY_HUD_SLOT_SIZE / 2;
    const cy = totalTopMargin + ABILITY_HUD_SLOT_SIZE / 2;
    const isActive = slot.active > 0;
    const isCoolingDown = slot.remaining > 0 && !isActive;

    // Glass background
    ctx.beginPath();
    ctx.roundRect(x, totalTopMargin, ABILITY_HUD_SLOT_SIZE, ABILITY_HUD_SLOT_SIZE, ABILITY_HUD_SLOT_BORDER_RADIUS);
    ctx.fillStyle = isActive ? ABILITY_HUD_SLOT_ACTIVE_BACKGROUND_COLOR : ABILITY_HUD_SLOT_DEFAULT_BACKGROUND_COLOR;
    ctx.fill();

    // Cooldown sweep
    if (isCoolingDown) {
      ctx.save();
      ctx.clip();
      const start = -Math.PI / 2;
      ctx.fillStyle = ABILITY_HUD_SLOT_COOLDOWN_OVERLAY_COLOR;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, ABILITY_HUD_SLOT_SIZE, start, start + Math.PI * 2 * (slot.remaining / slot.total));
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    }

    // Border: bright when ready or active, faint while cooling down
    ctx.beginPath();
    ctx.roundRect(x, totalTopMargin, ABILITY_HUD_SLOT_SIZE, ABILITY_HUD_SLOT_SIZE, ABILITY_HUD_SLOT_BORDER_RADIUS);
    ctx.lineWidth = 1.5;
    ctx.strokeStyle = isActive
      ? ABILITY_HUD_SLOT_ACTIVE_BORDER_COLOR
      : isCoolingDown
        ? ABILITY_HUD_SLOT_COOLDOWN_BORDER_COLOR
        : ABILITY_HUD_SLOT_READY_BORDER_COLOR;
    ctx.stroke();

    // Centre text: key when ready, seconds left while cooling down or active
    ctx.fillStyle = isActive
      ? ABILITY_HUD_SLOT_ACTIVE_TEXT_COLOR
      : isCoolingDown
        ? ABILITY_HUD_SLOT_COOLDOWN_TEXT_COLOR
        : ABILITY_HUD_SLOT_READY_TEXT_COLOR;
    ctx.font = `${ABILITY_HUD_SLOT_TEXT_WEIGHT} ${ABILITY_HUD_SLOT_TEXT_SIZE}px ${HUD_FONT_FAMILY}`;
    ctx.fillText(
      isActive ? slot.active.toFixed(1) : isCoolingDown ? String(Math.ceil(slot.remaining)) : slot.key,
      cx,
      cy + 1
    );

    // Small ability name under the slot
    ctx.fillStyle = ABILITY_HUD_SLOT_NAME_TEXT_COLOR;
    ctx.font = `${ABILITY_HUD_SLOT_NAME_TEXT_WEIGHT} ${ABILITY_HUD_SLOT_NAME_TEXT_SIZE}px ${HUD_FONT_FAMILY}`;
    fillMultilineText(
      ctx,
      slot.label,
      cx,
      totalTopMargin + ABILITY_HUD_SLOT_SIZE + ABILITY_HUD_SLOT_NAME_TEXT_Y_MARGIN,
      { lineHeight: ABILITY_HUD_SLOT_NAME_LINE_HEIGHT }
    );
  });

  ctx.restore();
}

const HUD_OVERLAY_COLOR = 'rgba(18, 27, 45, 0.71)';
const HUD_OVERLAY_STATUS_TEXT_FONT_SIZE = HUD_FONT_SIZE * 2;

function drawOverlays(ctx: CanvasRenderingContext2D, state: GameState): void {
  if (state.status !== GameStatus.PLAYING) {
    ctx.fillStyle = HUD_OVERLAY_COLOR;
    ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

    ctx.textAlign = 'center';
    drawText(
      ctx,
      state.status === GameStatus.OVER ? 'Game Over!' : 'Paused!',
      GAME_WIDTH / 2,
      GAME_HEIGHT / 2 - 12,
      700,
      HUD_OVERLAY_STATUS_TEXT_FONT_SIZE
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
