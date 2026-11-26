import { GAME_WIDTH, GameState } from '../hud';
import { forEachAbility } from '../utils';
import { findEffect, SpaceshipEffectType, STRONGER_ENGINES_MOVEMENT_SPEED_MULTIPLIER } from './effects';
import { Spaceship } from './spaceship';

export function tickSpaceships(state: GameState, deltaTime: number): void {
  for (const player of state.players) {
    tickSpaceship(player, deltaTime);
  }
}

function tickSpaceship(spaceship: Spaceship, deltaTime: number): void {
  if (spaceship.alive) {
    const dir = Number(spaceship.controls.right) - Number(spaceship.controls.left);
    const halfWidth = spaceship.shape.width / 2;

    spaceship.x += dir * calculateSpaceshipSpeed(spaceship) * deltaTime;
    spaceship.x = Math.max(halfWidth, Math.min(GAME_WIDTH - halfWidth, spaceship.x));
  } else {
    const host = spaceship.host!;

    spaceship.x = host.x;
    spaceship.y = host.y;
  }

  let isEndedEffect = false;
  spaceship.effects.forEach(effect => {
    effect.age += deltaTime;

    if (!isEndedEffect && effect.age >= effect.duration) {
      isEndedEffect = true;
    }
  });
  spaceship.effects = spaceship.effects.filter(effect => effect.age < effect.duration);

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

  if (findEffect(spaceship, SpaceshipEffectType.STRONGER_ENGINES)) {
    speed *= STRONGER_ENGINES_MOVEMENT_SPEED_MULTIPLIER;
  }

  return speed;
}
