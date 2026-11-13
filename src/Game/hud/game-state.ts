import { Asteroid } from '../asteroids';
import { Star } from '../background';
import { Entity } from '../entities';
import { Spaceship } from '../spaceships';

export enum GameStatus {
  PLAYING = 'playing',
  PAUSED = 'paused',
  OVER = 'over'
}

export interface GameState {
  status: GameStatus;
  player: Spaceship;
  asteroids: Asteroid[];
  entities: Entity[];
  stars: Star[];
  score: number;
  spawnTimer: number;
}
