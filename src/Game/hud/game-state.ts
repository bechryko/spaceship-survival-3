import { Asteroid } from '../asteroids';
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
  score: number;
  spawnTimer: number;
}
