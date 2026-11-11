import { Asteroid } from '../asteroids';
import { Star } from '../background';
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
  stars: Star[];
  score: number;
  spawnTimer: number;
}
