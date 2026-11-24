import { Settings } from 'spaceship-survival-3/context';
import { displayKeyCode } from 'spaceship-survival-3/utility';
import { ASTEROID_SPAWN_CHANCES, calculateSizeIncrease, regularAsteroidBlueprint } from '../asteroids';
import { SMALL_STAR_MAX_SIZE } from '../background';
import { Spaceship, SpecialAbilityAlmanac } from '../spaceships';
import { calculateScore, countIf, fillMultilineText, getAlmanacForAbilities } from '../utils';
import { EXIT_KEY_CODE, GAME_HEIGHT, GAME_WIDTH } from './constants';
import { FpsCounter } from './create';
import { GameState, GameStatus } from './game-state';

const HUD_TEXT_COLOR = '#e8f1f2';
const HUD_FONT_SIZE = 18;
export const HUD_FONT_FAMILY = 'system-ui, sans-serif';

const ASTEROID_COUNTER_MARGIN_Y = 22;

export function drawHUD(
  ctx: CanvasRenderingContext2D,
  state: GameState,
  settings: Settings,
  isQuickPlay: boolean,
  fpsCounter: FpsCounter | null
): void {
  ctx.textAlign = 'center';
  drawText(
    ctx,
    `Asteroids: ${state.statistics.asteroidsSpawned}`,
    GAME_WIDTH / 2,
    ASTEROID_COUNTER_MARGIN_Y,
    600,
    HUD_FONT_SIZE
  );

  drawAbilityHud(ctx, state.player, state);

  drawOverlays(ctx, state, settings, isQuickPlay);

  if (fpsCounter) {
    drawFps(ctx, fpsCounter, state.speed !== 1);
  }
  if (settings.debugStatistics) {
    drawDebugStatistics(ctx, state);
  }
}

const ABILITY_HUD_TOP_MARGIN = 5;
const ABILITY_HUD_X_MARGIN = 10;
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
const ABILITY_HUD_SLOT_DISABLED_BACKGROUND_COLOR = 'rgba(255, 255, 255, 0.04)';
const ABILITY_HUD_SLOT_DISABLED_BORDER_COLOR = 'rgba(255, 255, 255, 0.18)';
const ABILITY_HUD_SLOT_DISABLED_TEXT_COLOR = 'rgba(232, 241, 242, 0.3)';
const ABILITY_HUD_SLOT_DISABLED_NAME_TEXT_COLOR = 'rgba(232, 241, 242, 0.3)';

const ABILITY_HUD_KNOWLEDGE_TOP_MARGIN = 8;
const ABILITY_HUD_KNOWLEDGE_ICON_WIDTH = 24;
const ABILITY_HUD_KNOWLEDGE_ICON_HEIGHT = 17;
const ABILITY_HUD_KNOWLEDGE_ICON_TEXT_GAP = 6;
const ABILITY_HUD_KNOWLEDGE_TEXT_WEIGHT = 700;
const ABILITY_HUD_KNOWLEDGE_TEXT_SIZE = 15;
const ABILITY_HUD_KNOWLEDGE_OUTLINE_COLOR = 'rgba(0, 0, 0, 0.4)';
const ABILITY_HUD_KNOWLEDGE_DETAIL_COLOR = 'rgba(255, 255, 255, 0.4)';

function drawAbilityHud(ctx: CanvasRenderingContext2D, player: Spaceship, state: GameState): void {
  const { abilities } = player;
  const almanac = getAlmanacForAbilities(player);
  const specialAlmanac = SpecialAbilityAlmanac[player.abilities.special];
  const slots = [
    {
      key: displayKeyCode(abilities.q.key),
      label: almanac.q.name,
      remaining: abilities.q.cooldownTimer,
      total: almanac.q.cooldown,
      active: abilities.q.activeTimer,
      disabled: player.abilities.profile.q.isDisabled?.(player, state)
    },
    {
      key: displayKeyCode(abilities.w.key),
      label: almanac.w.name,
      remaining: abilities.w.cooldownTimer,
      total: almanac.w.cooldown,
      active: abilities.w.activeTimer,
      disabled: player.abilities.profile.w.isDisabled?.(player, state)
    },
    {
      key: displayKeyCode(abilities.e.key),
      label: almanac.e.name,
      remaining: abilities.e.cooldownTimer,
      total: almanac.e.cooldown,
      active: abilities.e.activeTimer,
      disabled: player.abilities.profile.e.isDisabled?.(player, state)
    },
    {
      key: displayKeyCode(abilities.r.key),
      label: player.abilities.special,
      remaining: abilities.r.cooldownTimer,
      total: specialAlmanac.cooldown,
      active: abilities.r.activeTimer,
      disabled: player.abilities.specialProfile.isDisabled?.(player, state)
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
    const isDisabled = slot.disabled && !isCoolingDown;

    // Glass background
    ctx.beginPath();
    ctx.roundRect(x, totalTopMargin, ABILITY_HUD_SLOT_SIZE, ABILITY_HUD_SLOT_SIZE, ABILITY_HUD_SLOT_BORDER_RADIUS);
    ctx.fillStyle = isDisabled
      ? ABILITY_HUD_SLOT_DISABLED_BACKGROUND_COLOR
      : isActive
        ? ABILITY_HUD_SLOT_ACTIVE_BACKGROUND_COLOR
        : ABILITY_HUD_SLOT_DEFAULT_BACKGROUND_COLOR;
    ctx.fill();

    // Cooldown sweep
    if (isCoolingDown && slot.total) {
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

    // Border: bright when ready or active, faint while cooling down, dashed and faint when disabled
    ctx.beginPath();
    ctx.roundRect(x, totalTopMargin, ABILITY_HUD_SLOT_SIZE, ABILITY_HUD_SLOT_SIZE, ABILITY_HUD_SLOT_BORDER_RADIUS);
    ctx.lineWidth = 1.5;
    ctx.strokeStyle = isDisabled
      ? ABILITY_HUD_SLOT_DISABLED_BORDER_COLOR
      : isActive
        ? ABILITY_HUD_SLOT_ACTIVE_BORDER_COLOR
        : isCoolingDown
          ? ABILITY_HUD_SLOT_COOLDOWN_BORDER_COLOR
          : ABILITY_HUD_SLOT_READY_BORDER_COLOR;
    ctx.stroke();

    // Centre text: key when ready, seconds left while cooling down or active
    ctx.fillStyle = isDisabled
      ? ABILITY_HUD_SLOT_DISABLED_TEXT_COLOR
      : isActive
        ? ABILITY_HUD_SLOT_ACTIVE_TEXT_COLOR
        : isCoolingDown
          ? ABILITY_HUD_SLOT_COOLDOWN_TEXT_COLOR
          : ABILITY_HUD_SLOT_READY_TEXT_COLOR;
    setFont(ctx, ABILITY_HUD_SLOT_TEXT_WEIGHT, ABILITY_HUD_SLOT_TEXT_SIZE);
    const timeText = isActive ? slot.active.toFixed(1) : isCoolingDown ? String(Math.ceil(slot.remaining)) : slot.key;
    ctx.fillText(timeText.replaceAll(String(Infinity), '∞'), cx, cy + 1);

    // Small ability name under the slot
    ctx.fillStyle = isDisabled ? ABILITY_HUD_SLOT_DISABLED_NAME_TEXT_COLOR : ABILITY_HUD_SLOT_NAME_TEXT_COLOR;
    setFont(ctx, ABILITY_HUD_SLOT_NAME_TEXT_WEIGHT, ABILITY_HUD_SLOT_NAME_TEXT_SIZE);
    fillMultilineText(
      ctx,
      slot.label.replaceAll(' ', '\n'),
      cx,
      totalTopMargin + ABILITY_HUD_SLOT_SIZE + ABILITY_HUD_SLOT_NAME_TEXT_Y_MARGIN,
      { lineHeight: ABILITY_HUD_SLOT_NAME_LINE_HEIGHT }
    );
  });

  // Knowledge: a book in the player colour and how many points there are, centred under the slots.
  // Only drawn once there is some.
  if (player.asteroidKnowledge > 0) {
    // Below the ability names, which take as many lines as the longest name has words
    const nameLines = Math.max(...slots.map(slot => slot.label.split(' ').length));
    const namesBottom =
      totalTopMargin +
      ABILITY_HUD_SLOT_SIZE +
      ABILITY_HUD_SLOT_NAME_TEXT_Y_MARGIN +
      (nameLines - 1) * ABILITY_HUD_SLOT_NAME_LINE_HEIGHT +
      ABILITY_HUD_SLOT_NAME_TEXT_SIZE / 2;
    const bookCy = namesBottom + ABILITY_HUD_KNOWLEDGE_TOP_MARGIN + ABILITY_HUD_KNOWLEDGE_ICON_HEIGHT / 2;

    const countText = String(player.asteroidKnowledge);
    setFont(ctx, ABILITY_HUD_KNOWLEDGE_TEXT_WEIGHT, ABILITY_HUD_KNOWLEDGE_TEXT_SIZE);
    const groupWidth =
      ABILITY_HUD_KNOWLEDGE_ICON_WIDTH + ABILITY_HUD_KNOWLEDGE_ICON_TEXT_GAP + ctx.measureText(countText).width;
    const groupLeft = ABILITY_HUD_X_MARGIN + totalWidth / 2 - groupWidth / 2;

    drawKnowledgeBook(ctx, groupLeft + ABILITY_HUD_KNOWLEDGE_ICON_WIDTH / 2, bookCy, player.color);

    ctx.textAlign = 'left';
    ctx.fillStyle = ABILITY_HUD_SLOT_READY_TEXT_COLOR;
    ctx.fillText(
      countText,
      groupLeft + ABILITY_HUD_KNOWLEDGE_ICON_WIDTH + ABILITY_HUD_KNOWLEDGE_ICON_TEXT_GAP,
      bookCy + 1
    );
  }

  ctx.restore();
}

const DEBUG_HUD_MARGIN = 10;
const DEBUG_HUD_FONT_WEIGHT = 500;
const DEBUG_HUD_TEXT_COLOR = 'rgba(232, 241, 242, 0.6)';

const FPS_BOTTOM_MARGIN = DEBUG_HUD_MARGIN;
const FPS_LOW_COLOR = '#ff8f8f';
const FPS_FONT_SIZE = 14;
const FPS_LOW_THRESHOLD = 30;

function drawFps(ctx: CanvasRenderingContext2D, counter: FpsCounter, isGameSlowed: boolean): void {
  if (counter.fps === 0) {
    return;
  }

  const additionalText = isGameSlowed ? ' (actual)' : '';

  ctx.save();
  setFont(ctx, DEBUG_HUD_FONT_WEIGHT, FPS_FONT_SIZE);
  ctx.fillStyle = counter.fps < FPS_LOW_THRESHOLD ? FPS_LOW_COLOR : DEBUG_HUD_TEXT_COLOR;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'bottom';
  ctx.fillText(`${Math.round(counter.fps)} FPS` + additionalText, DEBUG_HUD_MARGIN, GAME_HEIGHT - FPS_BOTTOM_MARGIN);
  ctx.restore();
}

const DEBUG_STATISTICS_TOP_MARGIN = GAME_HEIGHT / 3;
const DEBUG_STATISTICS_GAP = 5;
const DEBUG_STATISTICS_FONT_SIZE = 12;

function drawDebugStatistics(ctx: CanvasRenderingContext2D, state: GameState): void {
  const spawnChanceObject = ASTEROID_SPAWN_CHANCES.findLast(sco => sco.threshold <= state.statistics.asteroidsSpawned);
  const level2AsteroidChance = spawnChanceObject?.level2Chance ?? 0;
  const { asteroidWaveSpawn } = state.spawnTimer;
  const level1AsteroidSizeIncrease = calculateSizeIncrease(regularAsteroidBlueprint, state.statistics.asteroidsSpawned);
  const level2AsteroidSizeIncrease = calculateSizeIncrease(
    state.asteroidBlueprints.level2,
    state.statistics.asteroidsSpawned
  );
  const smallStarCount = countIf(state.stars, s => s.size <= SMALL_STAR_MAX_SIZE);

  const debugStatisticsLines = [
    `Asteroids: ${state.asteroids.length} (${countIf(state.asteroids, a => a.active)} active)`,
    `Asteroid spawn timer: ${state.spawnTimer.timer.toFixed(1)}s / ${state.spawnTimer.spawnTime.toFixed(3)}s`,
    `Level 1 asteroid size: ${regularAsteroidBlueprint.minSize + level1AsteroidSizeIncrease.minSizeIncrease} - ${regularAsteroidBlueprint.maxSize + level1AsteroidSizeIncrease.maxSizeIncrease}`,
    `Level 2 asteroid: ${state.asteroidBlueprints.level2.type} (${level2AsteroidChance * 100}% chance)`,
    `Level 2 asteroid size: ${state.asteroidBlueprints.level2.minSize + level2AsteroidSizeIncrease.minSizeIncrease} - ${state.asteroidBlueprints.level2.maxSize + level2AsteroidSizeIncrease.maxSizeIncrease}`,
    `Asteroid wave countdown: ${asteroidWaveSpawn < 0 ? 'off' : asteroidWaveSpawn}`,
    `Entities: ${state.entities.length} (${countIf(state.entities, e => e.active)} active)`,
    `Stars: ${state.stars.length} (${smallStarCount} small, ${state.stars.length - smallStarCount} big)`,
    `Game status: ${state.status}`,
    `Game speed: ${state.speed * 100}%`
  ];

  ctx.save();
  setFont(ctx, DEBUG_HUD_FONT_WEIGHT, DEBUG_STATISTICS_FONT_SIZE);
  ctx.fillStyle = DEBUG_HUD_TEXT_COLOR;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';

  debugStatisticsLines.forEach((line, idx) =>
    ctx.fillText(
      line,
      DEBUG_HUD_MARGIN,
      DEBUG_STATISTICS_TOP_MARGIN + (DEBUG_STATISTICS_FONT_SIZE + DEBUG_STATISTICS_GAP) * idx
    )
  );

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

function drawOverlays(ctx: CanvasRenderingContext2D, state: GameState, settings: Settings, isQuickPlay: boolean): void {
  if (state.status === GameStatus.PLAYING) {
    return;
  }

  ctx.fillStyle = HUD_OVERLAY_COLOR;
  ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

  const sections = buildOverlaySections(ctx, state, settings, isQuickPlay);
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

interface OverlaySection {
  minWidth: number;
  height: number;
  draw: (x: number, y: number, width: number) => void;
}

function buildOverlaySections(
  ctx: CanvasRenderingContext2D,
  state: GameState,
  settings: Settings,
  isQuickPlay: boolean
): OverlaySection[] {
  ctx.save();
  const title = buildTextSection(
    ctx,
    state.status === GameStatus.OVER ? 'Game Over!' : 'Paused!',
    700,
    HUD_OVERLAY_STATUS_TEXT_FONT_SIZE,
    OVERLAY_TITLE_HEIGHT,
    null,
    HUD_TEXT_COLOR
  );

  let sections: OverlaySection[];
  if (state.status === GameStatus.OVER) {
    const { statistics } = state;

    const controlTextSection = isQuickPlay
      ? buildTextSection(
          ctx,
          `Press ${settings.controls.restart} to restart!`,
          400,
          OVERLAY_HINT_FONT_SIZE,
          OVERLAY_HINT_HEIGHT,
          null,
          OVERLAY_MUTED_TEXT_COLOR
        )
      : buildTextSection(
          ctx,
          `Press ${settings.controls.restart} to restart, ${settings.controls.menuBack} to go back to\nspaceship selection or ${EXIT_KEY_CODE} to exit to the menu!`,
          400,
          OVERLAY_HINT_FONT_SIZE,
          OVERLAY_HINT_HEIGHT,
          400,
          OVERLAY_MUTED_TEXT_COLOR
        );

    const time = Number(statistics.time.toFixed(1));
    const minutes = Math.floor(time / 60);
    const seconds = time - minutes * 60;
    const timeText = time >= 120 ? `${minutes}m ${Math.round(seconds)}s` : `${seconds.toFixed(1)}s`;

    sections = [
      title,
      buildStatsSection(ctx, [
        ['Time survived', timeText],
        ['Total asteroids', `${statistics.asteroidsSpawned}`],
        ['Asteroids destroyed', `${statistics.asteroidsDestroyed}`]
      ]),
      buildScoreSection(ctx, 'Total score', calculateScore(state), state.highscore),
      controlTextSection
    ];
  } else {
    const controlTextSection = isQuickPlay
      ? buildTextSection(
          ctx,
          `Press ${EXIT_KEY_CODE} to exit to the menu!`,
          400,
          OVERLAY_HINT_FONT_SIZE,
          OVERLAY_HINT_HEIGHT,
          null,
          OVERLAY_MUTED_TEXT_COLOR
        )
      : buildTextSection(
          ctx,
          `Press ${EXIT_KEY_CODE} to exit to the menu or\n${settings.controls.menuBack} to go back to spaceship selection!`,
          400,
          OVERLAY_HINT_FONT_SIZE,
          OVERLAY_HINT_HEIGHT,
          300,
          OVERLAY_MUTED_TEXT_COLOR
        );

    sections = [title, controlTextSection];
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
  width: number | null,
  color: string
): OverlaySection {
  setFont(ctx, weight, size);

  return {
    minWidth: width ?? ctx.measureText(text).width,
    height,
    draw: (x, y, width) => {
      setFont(ctx, weight, size);
      ctx.fillStyle = color;
      ctx.textAlign = 'center';
      fillMultilineText(ctx, text, x + width / 2, y + height / 2);
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

const OVERLAY_NEW_HIGHSCORE_COLOR = '#ffd166';
const OVERLAY_SCORE_NOTE_GAP = 4;
const OVERLAY_SCORE_NOTE_HEIGHT = 24;

function buildScoreSection(
  ctx: CanvasRenderingContext2D,
  label: string,
  score: number,
  highscore: number
): OverlaySection {
  const labelText = label.toUpperCase();
  const isHighscore = score > highscore;
  const noteWeight = isHighscore ? 700 : 400;
  const noteText = isHighscore ? 'New highscore!' : `Highscore: ${highscore}`;

  setFont(ctx, 500, OVERLAY_SCORE_LABEL_SIZE);
  const labelWidth = ctx.measureText(labelText).width;
  setFont(ctx, 700, OVERLAY_SCORE_VALUE_SIZE);
  const valueWidth = ctx.measureText(String(score)).width;
  setFont(ctx, noteWeight, HUD_FONT_SIZE);
  const noteWidth = ctx.measureText(noteText).width;

  return {
    minWidth: Math.max(labelWidth, valueWidth, noteWidth),
    height:
      OVERLAY_SCORE_LABEL_HEIGHT +
      OVERLAY_SCORE_LABEL_VALUE_GAP +
      OVERLAY_SCORE_VALUE_SIZE +
      OVERLAY_SCORE_NOTE_GAP +
      OVERLAY_SCORE_NOTE_HEIGHT,
    draw: (x, y, width) => {
      const centerX = x + width / 2;
      ctx.textAlign = 'center';

      setFont(ctx, 500, OVERLAY_SCORE_LABEL_SIZE);
      ctx.fillStyle = OVERLAY_MUTED_TEXT_COLOR;
      ctx.fillText(labelText, centerX, y + OVERLAY_SCORE_LABEL_HEIGHT / 2);

      const valueTop = y + OVERLAY_SCORE_LABEL_HEIGHT + OVERLAY_SCORE_LABEL_VALUE_GAP;
      setFont(ctx, 700, OVERLAY_SCORE_VALUE_SIZE);
      ctx.fillStyle = OVERLAY_SCORE_COLOR;
      ctx.fillText(String(score), centerX, valueTop + OVERLAY_SCORE_VALUE_SIZE / 2);

      const noteTop = valueTop + OVERLAY_SCORE_VALUE_SIZE + OVERLAY_SCORE_NOTE_GAP;
      setFont(ctx, noteWeight, HUD_FONT_SIZE);
      ctx.fillStyle = isHighscore ? OVERLAY_NEW_HIGHSCORE_COLOR : OVERLAY_MUTED_TEXT_COLOR;
      ctx.fillText(noteText, centerX, noteTop + OVERLAY_SCORE_NOTE_HEIGHT / 2);
    }
  };
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

function drawKnowledgeBook(ctx: CanvasRenderingContext2D, cx: number, cy: number, color: string): void {
  const width = ABILITY_HUD_KNOWLEDGE_ICON_WIDTH;
  const top = cy - ABILITY_HUD_KNOWLEDGE_ICON_HEIGHT / 2;
  const bottom = cy + ABILITY_HUD_KNOWLEDGE_ICON_HEIGHT / 2;

  ctx.save();
  ctx.lineJoin = 'round';
  ctx.lineWidth = 1;

  // The two pages, mirrored around the spine. The outer edges curve a little, like a book lying open.
  for (const side of [-1, 1]) {
    ctx.beginPath();
    ctx.moveTo(cx, top + 2);
    ctx.quadraticCurveTo(cx + side * width * 0.28, top - 1, cx + side * (width / 2), top + 1.5);
    ctx.lineTo(cx + side * (width / 2), bottom - 2);
    ctx.quadraticCurveTo(cx + side * width * 0.28, bottom - 5, cx, bottom - 1);
    ctx.closePath();
    ctx.fillStyle = color;
    ctx.fill();
    ctx.strokeStyle = ABILITY_HUD_KNOWLEDGE_OUTLINE_COLOR;
    ctx.stroke();

    // Two short lines of text on the page
    ctx.beginPath();
    for (const y of [top + 4.5, top + 8]) {
      ctx.moveTo(cx + side * 3, y);
      ctx.lineTo(cx + side * (width / 2 - 2.5), y);
    }
    ctx.strokeStyle = ABILITY_HUD_KNOWLEDGE_DETAIL_COLOR;
    ctx.stroke();
  }

  // Spine
  ctx.beginPath();
  ctx.moveTo(cx, top + 2);
  ctx.lineTo(cx, bottom - 1);
  ctx.strokeStyle = ABILITY_HUD_KNOWLEDGE_OUTLINE_COLOR;
  ctx.stroke();

  ctx.restore();
}
