import { Asteroid, AsteroidType } from '../asteroids';
import { GameState } from '../hud';
import { findEffect, SpaceshipEffectType } from './effects';
import { Spaceship } from './spaceship';
import { SpaceshipAbility, SpaceshipAbilityProfile, SpaceshipAbilityType } from './spaceship-abilities';

export const SPACESHIP_SURVIVE_CHANCE_PER_KNOWLEDGE = 0.005;
export const SPACESHIP_MAX_SURVIVE_CHANCE = 0.4;

export function isSpaceshipImmune(spaceship: Spaceship, asteroid: Asteroid): boolean {
  if (asteroid.type === AsteroidType.IRON) {
    return false;
  }

  const hasShieldFromShieldGenerator = Boolean(findEffect(spaceship, SpaceshipEffectType.SHIELD));

  const knowledgeChance = Math.min(
    SPACESHIP_MAX_SURVIVE_CHANCE,
    spaceship.asteroidKnowledge * SPACESHIP_SURVIVE_CHANCE_PER_KNOWLEDGE
  );
  const hasKnowledgeAndSurvive =
    Math.random() < (asteroid.type === AsteroidType.ICE_SHARD ? knowledgeChance * 2 : knowledgeChance);

  return hasShieldFromShieldGenerator || hasKnowledgeAndSurvive;
}

interface AlmanacEntry {
  cooldown?: number;
  activeTime?: number;
}

export function activateAbility(
  player: Spaceship,
  state: GameState,
  eventCode: string,
  ability: SpaceshipAbility,
  abilityProfile: SpaceshipAbilityProfile,
  abilityAlmanacEntry: AlmanacEntry
): void {
  if (
    eventCode !== ability.key ||
    abilityProfile.isDisabled?.(player, state) ||
    (!player.alive && abilityProfile.type === SpaceshipAbilityType.EQUIPMENT)
  ) {
    return;
  }

  // Activation
  if (ability.cooldownTimer === 0 && ability.activeTimer === 0) {
    abilityProfile.callback(player, state);

    ability.activeTimer = abilityAlmanacEntry.activeTime ?? 0;
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
