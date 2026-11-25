import { GAME_WIDTH, GameState } from '../hud';
import { forEachAbility } from '../utils';
import { SpecialAbilityAlmanac, SpecialAbilityName } from './ability-almanac';
import { Spaceship } from './spaceship';

export function tickSpaceships(state: GameState, deltaTime: number): void {
  for (const player of state.players) {
    tickSpaceship(player, deltaTime);
  }
}

function tickSpaceship(spaceship: Spaceship, deltaTime: number): void {
  const dir = Number(spaceship.controls.right) - Number(spaceship.controls.left);
  const halfWidth = spaceship.shape.width / 2;

  spaceship.x += dir * calculateSpaceshipSpeed(spaceship) * deltaTime;
  spaceship.x = Math.max(halfWidth, Math.min(GAME_WIDTH - halfWidth, spaceship.x));

  forEachAbility(abilityIdx => {
    const ability = spaceship.abilities[abilityIdx];

    const isActive = ability.activeTimer > 0;
    ability.activeTimer = Math.max(0, ability.activeTimer - deltaTime);
    if (!isActive) {
      ability.cooldownTimer = Math.max(0, ability.cooldownTimer - deltaTime);
    }
  }, true);
}

function calculateSpaceshipSpeed(spaceship: Spaceship): number {
  let speed = spaceship.speed;

  if (spaceship.abilities.special === SpecialAbilityName.STRONGER_ENGINES) {
    speed *= Number(SpecialAbilityAlmanac[SpecialAbilityName.STRONGER_ENGINES].movementSpeedMultiplier);
  }

  return speed;
}
