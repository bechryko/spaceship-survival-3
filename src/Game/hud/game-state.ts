import { Asteroid } from '../asteroids';
import { Star } from '../background';
import { Entity } from '../entities';
import { Spaceship } from '../spaceships';

export interface GameState {
  status: GameStatus;
  statistics: GameStatistics;
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
