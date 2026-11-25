import { explode } from '../entities';
import { GameState } from '../hud';
import { Spaceship } from './spaceship';

const SPACESHIP_EXPLOSION_RADIUS = 150;

export function destroySpaceship(spaceship: Spaceship, state: GameState): void {
  spaceship.alive = false;

  explode(state, spaceship.x, spaceship.y, SPACESHIP_EXPLOSION_RADIUS, spaceship.color);
}
