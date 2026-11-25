import { Settings } from 'spaceship-survival-3/context';
import { loadHighscore } from 'spaceship-survival-3/localstorage';
import { level2AsteroidBlueprints } from '../asteroids';
import { createStars, initBackgroundFeatures, Star } from '../background';
import { createGlobalEffectsState } from '../global-effects';
import { AbilityClass, createSpaceships, SpecialAbilityName } from '../spaceships';
import { choose, initCanvas } from '../utils';
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
    highscore: loadHighscore(),
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

function getRandomBackgroundColor(): string {
  return choose(BACKGROUND_COLORS);
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
