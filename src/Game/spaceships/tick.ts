import { GAME_WIDTH, GameState } from '../hud';
import { forEachAbility } from '../utils';
import { SHIP_HALF_WIDTH } from './hitbox';
import { Spaceship } from './spaceship';

export function tickSpaceships(state: GameState, deltaTime: number): void {
  tickSpaceship(state.player, deltaTime);
}

function tickSpaceship(spaceship: Spaceship, deltaTime: number): void {
  const dir = Number(spaceship.controls.right) - Number(spaceship.controls.left);
  spaceship.x += dir * spaceship.speed * deltaTime;
  spaceship.x = Math.max(SHIP_HALF_WIDTH, Math.min(GAME_WIDTH - SHIP_HALF_WIDTH, spaceship.x));

  forEachAbility(abilityIdx => {
    const ability = spaceship.abilities[abilityIdx];

    ability.activeTimer = Math.max(0, ability.activeTimer - deltaTime);
    ability.cooldownTimer = Math.max(0, ability.cooldownTimer - deltaTime);
  });
}
