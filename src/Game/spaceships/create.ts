import { Settings } from '../../context';
import { GAME_HEIGHT, GAME_WIDTH } from '../hud';
import { abilities, specialAbilities } from './abilities';
import { AbilityAlmanac, SpecialAbilityAlmanac, SpecialAbilityName, SpeedAlmanac } from './ability-almanac';
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
  specialAbilityId: SpecialAbilityName,
  settings: Settings
): Spaceship {
  const almanacEntry = AbilityAlmanac[abilityClass];
  const controls = settings.controls.player1;

  return {
    x: GAME_WIDTH / 2,
    y: GAME_HEIGHT - 70,
    speed: SpeedAlmanac[almanacEntry.speedLevel],
    abilities: {
      profile: abilities[abilityClass],
      special: specialAbilityId,
      specialProfile: specialAbilities[specialAbilityId],
      q: {
        ...initialAbilityStats,
        key: controls.ability1
      },
      w: {
        ...initialAbilityStats,
        key: controls.ability2
      },
      e: {
        ...initialAbilityStats,
        key: controls.ability3,
        cooldownTimer: almanacEntry.e.cooldown
      },
      r: {
        ...initialAbilityStats,
        key: controls.specialAbility,
        activeTimer: SpecialAbilityAlmanac[specialAbilityId].cooldown ? 0 : Infinity
      }
    },
    controls: {
      left: false,
      right: false,
      leftKeyCode: controls.moveLeft,
      rightKeyCode: controls.moveRight
    },
    color,
    shape: spaceshipAbilityClassShipShapeMap[abilityClass],
    asteroidKnowledge: 0
  };
}
