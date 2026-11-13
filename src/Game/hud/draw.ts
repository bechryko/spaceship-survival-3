import { Spaceship } from '../spaceships';
import { calculateScore, fillMultilineText, getAlmanacForAbilities } from '../utils';
import { EXIT_KEY_CODE, GAME_HEIGHT, GAME_WIDTH, START_PAUSE_KEY_CODE } from './constants';
import { GameState, GameStatus } from './game-state';

const HUD_TEXT_COLOR = '#e8f1f2';
const HUD_MARGIN_X = 16;
const HUD_MARGIN_Y = 28;
const HUD_FONT_SIZE = 18;
const HUD_FONT_FAMILY = 'system-ui, sans-serif';

export function drawHUD(ctx: CanvasRenderingContext2D, state: GameState, highscore: number): void {
  ctx.textAlign = 'left';
  drawText(ctx, `Asteroids: ${state.statistics.asteroidsSpawned}`, HUD_MARGIN_X, HUD_MARGIN_Y, 600, HUD_FONT_SIZE);
  ctx.textAlign = 'right';
  drawText(ctx, `Best: ${highscore}`, GAME_WIDTH - HUD_MARGIN_X, HUD_MARGIN_Y, 600, HUD_FONT_SIZE);

  drawAbilityHud(ctx, state.player);

  drawOverlays(ctx, state);
}

const ABILITY_HUD_TOP_MARGIN = 5;
const ABILITY_HUD_X_MARGIN = 140;
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
    setFont(ctx, ABILITY_HUD_SLOT_TEXT_WEIGHT, ABILITY_HUD_SLOT_TEXT_SIZE);
    ctx.fillText(
      isActive ? slot.active.toFixed(1) : isCoolingDown ? String(Math.ceil(slot.remaining)) : slot.key,
      cx,
      cy + 1
    );

    // Small ability name under the slot
    ctx.fillStyle = ABILITY_HUD_SLOT_NAME_TEXT_COLOR;
    setFont(ctx, ABILITY_HUD_SLOT_NAME_TEXT_WEIGHT, ABILITY_HUD_SLOT_NAME_TEXT_SIZE);
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

const HUD_OVERLAY_COLOR = 'rgba(18, 27, 45, 0.5)';
const HUD_OVERLAY_STATUS_TEXT_FONT_SIZE = HUD_FONT_SIZE * 2;

const OVERLAY_PANEL_PADDING_X = 48;
const OVERLAY_PANEL_PADDING_Y = 32;
const OVERLAY_PANEL_MIN_CONTENT_WIDTH = 340;
const OVERLAY_PANEL_BORDER_RADIUS = 20;
const OVERLAY_PANEL_BLUR = 8;
const OVERLAY_PANEL_FILL_TOP_COLOR = 'rgba(255, 255, 255, 0.16)';
const OVERLAY_PANEL_FILL_BOTTOM_COLOR = 'rgba(255, 255, 255, 0.05)';
const OVERLAY_PANEL_BORDER_TOP_COLOR = 'rgba(255, 255, 255, 0.4)';
const OVERLAY_PANEL_BORDER_BOTTOM_COLOR = 'rgba(255, 255, 255, 0.1)';

const OVERLAY_SECTION_GAP = 30;
const OVERLAY_DIVIDER_COLOR = 'rgba(255, 255, 255, 0.22)';
const OVERLAY_MUTED_TEXT_COLOR = 'rgba(232, 241, 242, 0.7)';
const OVERLAY_SCORE_COLOR = '#cfe3ff';

const OVERLAY_TITLE_HEIGHT = 44;
const OVERLAY_STAT_ROW_HEIGHT = 28;
const OVERLAY_STAT_LABEL_VALUE_MIN_GAP = 48;
const OVERLAY_SCORE_LABEL_SIZE = 14;
const OVERLAY_SCORE_LABEL_HEIGHT = 18;
const OVERLAY_SCORE_VALUE_SIZE = 56;
const OVERLAY_SCORE_LABEL_VALUE_GAP = 4;
const OVERLAY_HINT_FONT_SIZE = 16;
const OVERLAY_HINT_HEIGHT = 22;

interface OverlaySection {
  minWidth: number;
  height: number;
  draw: (x: number, y: number, width: number) => void;
}

function buildOverlaySections(ctx: CanvasRenderingContext2D, state: GameState): OverlaySection[] {
  ctx.save();
  const title = buildTextSection(
    ctx,
    state.status === GameStatus.OVER ? 'Game Over!' : 'Paused!',
    700,
    HUD_OVERLAY_STATUS_TEXT_FONT_SIZE,
    OVERLAY_TITLE_HEIGHT,
    HUD_TEXT_COLOR
  );

  let sections: OverlaySection[];
  if (state.status === GameStatus.OVER) {
    const { statistics } = state;
    sections = [
      title,
      buildStatsSection(ctx, [
        ['Time survived', `${statistics.time.toFixed(1)}s`],
        ['Total asteroids', `${statistics.asteroidsSpawned}`],
        ['Asteroids destroyed', `${statistics.asteroidsDestroyed}`]
      ]),
      buildScoreSection(ctx, 'Total score', `${calculateScore(statistics)}`),
      buildTextSection(
        ctx,
        `Press ${START_PAUSE_KEY_CODE} to restart or ${EXIT_KEY_CODE} to exit to the menu!`,
        400,
        OVERLAY_HINT_FONT_SIZE,
        OVERLAY_HINT_HEIGHT,
        OVERLAY_MUTED_TEXT_COLOR
      )
    ];
  } else {
    sections = [
      title,
      buildTextSection(
        ctx,
        `Press ${EXIT_KEY_CODE} to exit to the menu!`,
        400,
        OVERLAY_HINT_FONT_SIZE,
        OVERLAY_HINT_HEIGHT,
        OVERLAY_MUTED_TEXT_COLOR
      )
    ];
  }

  ctx.restore();
  return sections;
}

function buildTextSection(
  ctx: CanvasRenderingContext2D,
  text: string,
  weight: number,
  size: number,
  height: number,
  color: string
): OverlaySection {
  setFont(ctx, weight, size);

  return {
    minWidth: ctx.measureText(text).width,
    height,
    draw: (x, y, width) => {
      setFont(ctx, weight, size);
      ctx.fillStyle = color;
      ctx.textAlign = 'center';
      ctx.fillText(text, x + width / 2, y + height / 2);
    }
  };
}

function buildStatsSection(
  ctx: CanvasRenderingContext2D,
  rows: readonly (readonly [string, string])[]
): OverlaySection {
  setFont(ctx, 400, HUD_FONT_SIZE);
  const labelWidth = Math.max(...rows.map(([label]) => ctx.measureText(label).width));
  setFont(ctx, 700, HUD_FONT_SIZE);
  const valueWidth = Math.max(...rows.map(([, value]) => ctx.measureText(value).width));

  return {
    minWidth: labelWidth + OVERLAY_STAT_LABEL_VALUE_MIN_GAP + valueWidth,
    height: rows.length * OVERLAY_STAT_ROW_HEIGHT,
    draw: (x, y, width) => {
      rows.forEach(([label, value], i) => {
        const centerY = y + i * OVERLAY_STAT_ROW_HEIGHT + OVERLAY_STAT_ROW_HEIGHT / 2;

        ctx.textAlign = 'left';
        setFont(ctx, 400, HUD_FONT_SIZE);
        ctx.fillStyle = OVERLAY_MUTED_TEXT_COLOR;
        ctx.fillText(label, x, centerY);

        ctx.textAlign = 'right';
        setFont(ctx, 700, HUD_FONT_SIZE);
        ctx.fillStyle = HUD_TEXT_COLOR;
        ctx.fillText(value, x + width, centerY);
      });
    }
  };
}

function buildScoreSection(ctx: CanvasRenderingContext2D, label: string, value: string): OverlaySection {
  const labelText = label.toUpperCase();
  setFont(ctx, 500, OVERLAY_SCORE_LABEL_SIZE);
  const labelWidth = ctx.measureText(labelText).width;
  setFont(ctx, 700, OVERLAY_SCORE_VALUE_SIZE);
  const valueWidth = ctx.measureText(value).width;

  return {
    minWidth: Math.max(labelWidth, valueWidth),
    height: OVERLAY_SCORE_LABEL_HEIGHT + OVERLAY_SCORE_LABEL_VALUE_GAP + OVERLAY_SCORE_VALUE_SIZE,
    draw: (x, y, width) => {
      ctx.textAlign = 'center';

      setFont(ctx, 500, OVERLAY_SCORE_LABEL_SIZE);
      ctx.fillStyle = OVERLAY_MUTED_TEXT_COLOR;
      ctx.fillText(labelText, x + width / 2, y + OVERLAY_SCORE_LABEL_HEIGHT / 2);

      setFont(ctx, 700, OVERLAY_SCORE_VALUE_SIZE);
      ctx.fillStyle = OVERLAY_SCORE_COLOR;
      ctx.fillText(
        value,
        x + width / 2,
        y + OVERLAY_SCORE_LABEL_HEIGHT + OVERLAY_SCORE_LABEL_VALUE_GAP + OVERLAY_SCORE_VALUE_SIZE / 2
      );
    }
  };
}

function drawOverlays(ctx: CanvasRenderingContext2D, state: GameState): void {
  if (state.status === GameStatus.PLAYING) {
    return;
  }

  ctx.fillStyle = HUD_OVERLAY_COLOR;
  ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

  const sections = buildOverlaySections(ctx, state);
  const contentWidth = Math.max(OVERLAY_PANEL_MIN_CONTENT_WIDTH, ...sections.map(section => section.minWidth));
  const contentHeight =
    sections.reduce((sum, section) => sum + section.height, 0) + (sections.length - 1) * OVERLAY_SECTION_GAP;
  const width = contentWidth + OVERLAY_PANEL_PADDING_X * 2;
  const height = contentHeight + OVERLAY_PANEL_PADDING_Y * 2;
  const x = (GAME_WIDTH - width) / 2;
  const y = (GAME_HEIGHT - height) / 2;

  drawGlassPanel(ctx, x, y, width, height);

  ctx.save();
  ctx.textBaseline = 'middle';
  const left = x + OVERLAY_PANEL_PADDING_X;
  let cursorY = y + OVERLAY_PANEL_PADDING_Y;

  sections.forEach((section, i) => {
    if (i > 0) {
      drawDivider(ctx, left, cursorY + OVERLAY_SECTION_GAP / 2, contentWidth);
      cursorY += OVERLAY_SECTION_GAP;
    }

    section.draw(left, cursorY, contentWidth);
    cursorY += section.height;
  });
  ctx.restore();
}

function drawDivider(ctx: CanvasRenderingContext2D, x: number, y: number, width: number): void {
  const gradient = ctx.createLinearGradient(x, 0, x + width, 0);
  gradient.addColorStop(0, 'rgba(255, 255, 255, 0)');
  gradient.addColorStop(0.5, OVERLAY_DIVIDER_COLOR);
  gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
  ctx.fillStyle = gradient;
  ctx.fillRect(x, y, width, 1);
}

function drawGlassPanel(ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number): void {
  drawBlurredBackdrop(ctx, x, y, width, height);

  // Translucent fill
  const fill = ctx.createLinearGradient(x, y, x + width, y + height);
  fill.addColorStop(0, OVERLAY_PANEL_FILL_TOP_COLOR);
  fill.addColorStop(1, OVERLAY_PANEL_FILL_BOTTOM_COLOR);
  ctx.beginPath();
  ctx.roundRect(x, y, width, height, OVERLAY_PANEL_BORDER_RADIUS);
  ctx.fillStyle = fill;
  ctx.fill();

  // Border
  const border = ctx.createLinearGradient(0, y, 0, y + height);
  border.addColorStop(0, OVERLAY_PANEL_BORDER_TOP_COLOR);
  border.addColorStop(1, OVERLAY_PANEL_BORDER_BOTTOM_COLOR);
  ctx.beginPath();
  ctx.roundRect(x + 0.5, y + 0.5, width - 1, height - 1, OVERLAY_PANEL_BORDER_RADIUS);
  ctx.lineWidth = 1.5;
  ctx.strokeStyle = border;
  ctx.stroke();
}

function drawBlurredBackdrop(ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number): void {
  if (!('filter' in ctx)) {
    return;
  }

  const scale = ctx.getTransform().a;

  const pad = OVERLAY_PANEL_BLUR * 2;
  const sx = Math.max(0, x - pad);
  const sy = Math.max(0, y - pad);
  const sw = Math.min(GAME_WIDTH, x + width + pad) - sx;
  const sh = Math.min(GAME_HEIGHT, y + height + pad) - sy;

  ctx.save();
  ctx.beginPath();
  ctx.roundRect(x, y, width, height, OVERLAY_PANEL_BORDER_RADIUS);
  ctx.clip();
  ctx.filter = `blur(${OVERLAY_PANEL_BLUR * scale}px)`;
  ctx.drawImage(ctx.canvas, sx * scale, sy * scale, sw * scale, sh * scale, sx, sy, sw, sh);
  ctx.restore();
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
  setFont(ctx, fontWeight, fontSize);
  ctx.fillText(text, x, y);
}

function setFont(ctx: CanvasRenderingContext2D, weight: number, size: number): void {
  const font = `${weight} ${size}px ${HUD_FONT_FAMILY}`;

  if (ctx.font !== font) {
    ctx.font = `${weight} ${size}px ${HUD_FONT_FAMILY}`;
  }
}
