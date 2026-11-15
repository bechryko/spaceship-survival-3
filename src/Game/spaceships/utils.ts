import { GameState } from '../hud';
import { SpecialAbilityName } from './ability-almanac';
import { Spaceship } from './spaceship';
import { SpaceshipAbility, SpaceshipAbilityProfile } from './spaceship-abilities';

export function isSpaceshipImmune(spaceship: Spaceship): boolean {
  return spaceship.abilities.special === SpecialAbilityName.SHIELD_GENERATOR && spaceship.abilities.r.activeTimer > 0;
}

interface AlmanacEntry {
  cooldown?: number;
  activeTime: number;
}

export function activateAbility(
  state: GameState,
  eventCode: string,
  ability: SpaceshipAbility,
  abilityProfile: SpaceshipAbilityProfile,
  abilityAlmanacEntry: AlmanacEntry
): void {
  if (eventCode !== ability.key || abilityProfile.isDisabled?.(state.player, state)) {
    return;
  }

  const { player } = state;

  // Activation
  if (ability.cooldownTimer === 0 && ability.activeTimer === 0) {
    abilityProfile.callback(player, state);

    ability.activeTimer = abilityAlmanacEntry.activeTime;
    ability.cooldownTimer = abilityAlmanacEntry.cooldown ?? 0;
    ability.reactivatable = false;

    state.statistics.abilitiesUsed++;
  }

  // Reactivation
  if (ability.activeTimer > 0 && ability.reactivatable && abilityProfile.reactivateCallback) {
    abilityProfile.reactivateCallback(player, state);

    ability.activeTimer = 0;
  }
}
