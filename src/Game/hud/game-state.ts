import { Asteroid, AsteroidBlueprint } from '../asteroids';
import { Star } from '../background';
import { Entity } from '../entities';
import { Spaceship } from '../spaceships';

export interface GameState {
  status: GameStatus;
  statistics: GameStatistics;
  asteroidBlueprints: {
    level2: AsteroidBlueprint;
  };
  highscore: number;
  player: Spaceship;
  asteroids: Asteroid[];
  entities: Entity[];
  stars: Star[];
  spawnTimer: number;
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
