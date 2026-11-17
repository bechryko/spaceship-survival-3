import { GAME_HEIGHT, GAME_WIDTH } from '../hud';
import { abilities, specialAbilities } from './abilities';
import { AbilityAlmanac, SpecialAbilityAlmanac, SpecialAbilityName } from './ability-almanac';
import { AbilityClass } from './ability-class';
import { spaceshipAbilityClassShipShapeMap } from './hitbox';
import { Spaceship } from './spaceship';
import { SpaceshipAbility } from './spaceship-abilities';

const initialAbilityStats: Omit<SpaceshipAbility, 'key'> = {
  cooldownTimer: 0,
  activeTimer: 0,
  reactivatable: false
};

export function createSpaceship(
  abilityClass: AbilityClass,
  color: string,
  specialAbilityId: SpecialAbilityName
): Spaceship {
  return {
    x: GAME_WIDTH / 2,
    y: GAME_HEIGHT - 70,
    speed: 200,
    abilities: {
      profile: abilities[abilityClass],
      special: specialAbilityId,
      specialProfile: specialAbilities[specialAbilityId],
      q: {
        ...initialAbilityStats,
        key: 'KeyQ'
      },
      w: {
        ...initialAbilityStats,
        key: 'KeyW'
      },
      e: {
        ...initialAbilityStats,
        key: 'KeyE',
        cooldownTimer: AbilityAlmanac[abilityClass].e.cooldown
      },
      r: {
        ...initialAbilityStats,
        key: 'KeyR',
        activeTimer: SpecialAbilityAlmanac[specialAbilityId].cooldown ? 0 : Infinity
      }
    },
    controls: {
      left: false,
      right: false,
      leftKeyCode: 'KeyA',
      rightKeyCode: 'KeyD'
    },
    color,
    shape: spaceshipAbilityClassShipShapeMap[abilityClass]
  };
}
