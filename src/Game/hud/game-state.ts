import { Asteroid, AsteroidBlueprint } from '../asteroids';
import { Star } from '../background';
import { Entity } from '../entities';
import { GlobalEffectsState } from '../global-effects';
import { Spaceship } from '../spaceships';

export interface GameState {
  status: GameStatus;
  highscore: number;
  speed: number;
  statistics: GameStatistics;
  asteroidBlueprints: {
    level2: AsteroidBlueprint;
  };
  asteroids: Asteroid[];
  spawnTimer: AsteroidSpawnTimer;
  player: Spaceship;
  entities: Entity[];
  globalEffects: GlobalEffectsState;
  visual: {
    backgroundColor: string;
    backgroundFeatureImage: HTMLCanvasElement;
    stars: Star[];
  };
}

export enum GameStatus {
  PLAYING = 'playing',
  PAUSED = 'paused',
  OVER = 'over'
}

export interface GameStatistics {
  time: number;
  asteroidsSpawned: number;
  asteroidsDestroyed: number;
  abilitiesUsed: number;
}

export interface AsteroidSpawnTimer {
  spawnTime: number;
  timer: number;
  asteroidWaveSpawn: number;
}
