import { explode } from '../entities';
import { GameState } from '../hud';
import { forEachAbility } from '../utils';
import { Spaceship } from './spaceship';

const SPACESHIP_EXPLOSION_RADIUS = 150;

export function destroySpaceship(spaceship: Spaceship, state: GameState): void {
  spaceship.alive = false;
  const aliveSpaceship = state.players.find(spaceship => spaceship.alive)!;
  spaceship.host = aliveSpaceship;

  spaceship.effects = spaceship.effects.filter(effect => !isFinite(effect.duration));
  forEachAbility(ability => {
    spaceship.abilities[ability].activeTimer = 0;
  }, true);

  explode(state, spaceship.x, spaceship.y, SPACESHIP_EXPLOSION_RADIUS, spaceship.color);
}
