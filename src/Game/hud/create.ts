import { Settings } from 'spaceship-survival-3/context';
import { loadHighscores } from 'spaceship-survival-3/localstorage';
import { level2AsteroidBlueprints } from '../asteroids';
import { createStars, initBackgroundFeatures, Star } from '../background';
import { createGlobalEffectsState } from '../global-effects';
import { AbilityClass, createSpaceships, SpecialAbilityName } from '../spaceships';
import { between, choose, darken, initCanvas } from '../utils';
import { GameState, GameStatus } from './game-state';

export type GameStateConfig =
  | {
      players: number;
      isQuickPlay: true;
    }
  | {
      players: number;
      isQuickPlay: false;
      abilityClasses: AbilityClass[];
      specialAbilityNames: SpecialAbilityName[];
    };

export function createGameState(config: GameStateConfig, settings: Settings, status = GameStatus.PLAYING): GameState {
  const stars = createStars();
  const highscores = loadHighscores();

  return {
    status,
    speed: 1,
    statistics: {
      time: 0,
      asteroidsSpawned: 0,
      asteroidsDestroyed: 0,
      abilitiesUsed: 0
    },
    asteroidBlueprints: {
      level2: choose(level2AsteroidBlueprints)
    },
    highscore: config.players === 1 ? highscores.single : highscores.multi,
    players: createSpaceships(config, settings),
    asteroids: [],
    entities: [],
    globalEffects: createGlobalEffectsState(settings),
    visual: {
      backgroundColor: getRandomBackgroundColor(),
      backgroundFeatureImage: createUtilityCanvas(settings, stars),
      stars
    },
    spawnTimer: {
      spawnTime: 0,
      timer: 0,
      asteroidWaveSpawn: -1
    }
  };
}

const BACKGROUND_COLORS = ['#0C1230', '#1d1a37', '#1B2042', '#131934', '#171038', '#071a2a', '#19152B'];
const BACKGROUND_COLOR_MAX_DARKEN_RATE = 0.5;

function getRandomBackgroundColor(): string {
  const baseColor = choose(BACKGROUND_COLORS);
  const darkenRate = between(0, BACKGROUND_COLOR_MAX_DARKEN_RATE, { floor: false });
  const color = darken(baseColor, darkenRate);
  return color;
}

function createUtilityCanvas(settings: Settings, stars: Star[]): HTMLCanvasElement {
  const canvas = document.createElement('canvas');

  initCanvas(canvas, settings);
  initBackgroundFeatures(canvas, stars);

  return canvas;
}

export interface FpsCounter {
  fps: number;
  frames: number;
  elapsed: number;
}

export function createFpsCounter(): FpsCounter {
  return { fps: 0, frames: 0, elapsed: 0 };
}
