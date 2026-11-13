import { GAME_HEIGHT, GAME_WIDTH } from '../hud';
import { abilities } from './abilities';
import { AbilityAlmanac } from './ability-almanac';
import { AbilityClass } from './ability-class';
import { Spaceship } from './spaceship';
import { SpaceshipAbility } from './spaceship-abilities';

const initialAbilityStats: Omit<SpaceshipAbility, 'key'> = {
  cooldownTimer: 0,
  activeTimer: 0
};

export function createSpaceship(): Spaceship {
  return {
    x: GAME_WIDTH / 2,
    y: GAME_HEIGHT - 70,
    speed: 200,
    abilities: {
      profile: abilities[AbilityClass.GUNSHIP],
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
        cooldownTimer: AbilityAlmanac[AbilityClass.GUNSHIP].e.cooldown
      }
    },
    controls: {
      left: false,
      right: false,
      leftKeyCode: 'KeyA',
      rightKeyCode: 'KeyD'
    },
    color: 'forestgreen'
  };
}
