import { Asteroid, AsteroidBlueprint } from '../asteroids';
import { Star } from '../background';
import { Entity } from '../entities';
import { GlobalEffectsState } from '../global-effects';
import { Spaceship } from '../spaceships';

export interface GameState {
  status: GameStatus;
  speed: number;
  statistics: GameStatistics;
  asteroidBlueprints: {
    level2: AsteroidBlueprint;
  };
  highscore: number;
  player: Spaceship;
  asteroids: Asteroid[];
  entities: Entity[];
  globalEffects: GlobalEffectsState;
  stars: Star[];
  spawnTimer: AsteroidSpawnTimer;
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
  doubleAsteroidSpawn: number;
}
