import { explode } from '../entities';
import { GameState } from '../hud';
import { Asteroid } from './asteroid';

export function destroyAsteroid(asteroid: Asteroid, state: GameState, explosionRadiusMultiplier: number): void {
  explode(state, asteroid.x, asteroid.y, asteroid.r * explosionRadiusMultiplier);

  const { asteroids } = state;
  asteroids.splice(
    asteroids.findIndex(a => a === asteroid),
    1
  );

  state.statistics.asteroidsDestroyed++;
}
