import { Settings } from '../../context';
import { loadColor, loadHighscore } from '../../localstorage';
import { level2AsteroidBlueprints } from '../asteroids';
import { createStars } from '../background';
import { createGlobalEffectsState } from '../global-effects';
import { AbilityClass, SpecialAbilityName, createSpaceship } from '../spaceships';
import { choose } from '../utils';
import { GameState, GameStatus } from './game-state';

export type GameStateConfig =
  | {
      isQuickPlay: true;
    }
  | {
      isQuickPlay: false;
      abilityClass: AbilityClass;
      specialAbilityName: SpecialAbilityName;
    };

export function createGameState(config: GameStateConfig, settings: Settings, status = GameStatus.PLAYING): GameState {
  const spaceshipAbilityClass: AbilityClass = config.isQuickPlay
    ? choose(Object.values(AbilityClass))
    : config.abilityClass;
  const specialAbilityId: SpecialAbilityName = config.isQuickPlay
    ? choose(Object.values(SpecialAbilityName))
    : config.specialAbilityName;

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
    player: createSpaceship(spaceshipAbilityClass, loadColor(), specialAbilityId),
    asteroids: [],
    entities: [],
    globalEffects: createGlobalEffectsState(settings),
    stars: createStars(),
    spawnTimer: {
      spawnTime: 0,
      timer: 0,
      asteroidWaveSpawn: -1
    }
  };
}

export interface FpsCounter {
  fps: number;
  frames: number;
  elapsed: number;
}

export function createFpsCounter(): FpsCounter {
  return { fps: 0, frames: 0, elapsed: 0 };
}
