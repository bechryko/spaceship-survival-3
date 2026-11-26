import { ControlsSettings, PlayerControlsSettings, Settings } from 'spaceship-survival-3/context';
import { loadColor } from 'spaceship-survival-3/localstorage';
import { GAME_HEIGHT, GAME_WIDTH, GameStateConfig } from '../hud';
import { choose } from '../utils';
import { abilities, specialAbilities } from './abilities';
import { AbilityAlmanac, SpecialAbilityAlmanac, SpecialAbilityName, SpeedAlmanac } from './ability-almanac';
import { AbilityClass } from './ability-class';
import { SpaceshipEffect, SpaceshipEffectType } from './effects';
import { spaceshipAbilityClassShipShapeMap } from './hitbox';
import { Spaceship } from './spaceship';
import { SpaceshipAbility } from './spaceship-abilities';

const initialAbilityStats: Omit<SpaceshipAbility, 'key'> = {
  cooldownTimer: 0,
  activeTimer: 0,
  reactivatable: false
};

export function createSpaceships(config: GameStateConfig, settings: Settings): Spaceship[] {
  const spaceships: Spaceship[] = [];

  for (let index = 0; index < config.players; index++) {
    const { abilityClass, specialAbilityId } = getLoadout(index, config);

    const x = (GAME_WIDTH / (config.players + 1)) * (index + 1);
    const color = loadColor(index === 1);
    const almanacEntry = AbilityAlmanac[abilityClass];
    const controls = settings.controls[('player' + (index + 1)) as keyof ControlsSettings] as PlayerControlsSettings;

    spaceships.push({
      index,
      alive: true,
      x,
      y: GAME_HEIGHT - 70,
      speed: SpeedAlmanac[almanacEntry.speedLevel],
      effects: getInitialEffects(specialAbilityId),
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
    });
  }
  return spaceships;
}

function getLoadout(
  index: number,
  config: GameStateConfig
): { abilityClass: AbilityClass; specialAbilityId: SpecialAbilityName } {
  if (config.isQuickPlay) {
    return {
      abilityClass: choose(Object.values(AbilityClass)),
      specialAbilityId: choose(Object.values(SpecialAbilityName))
    };
  }

  return {
    abilityClass: config.abilityClasses[index],
    specialAbilityId: config.specialAbilityNames[index]
  };
}

function getInitialEffects(specialAbility: SpecialAbilityName): SpaceshipEffect[] {
  const effects: SpaceshipEffect[] = [];

  if (specialAbility === SpecialAbilityName.STRONGER_ENGINES) {
    effects.push({
      type: SpaceshipEffectType.STRONGER_ENGINES,
      age: 0,
      duration: Infinity
    });
  }

  return effects;
}
