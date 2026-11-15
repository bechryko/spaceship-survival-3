import { Bomb, detonateBomb, EntityType } from '../entities';
import { GameState } from '../hud';
import { forEachAbility } from '../utils';
import { AbilityAlmanac, SpecialAbilityAlmanac, SpecialAbilityName } from './ability-almanac';
import { AbilityClass } from './ability-class';
import { Spaceship } from './spaceship';
import { SpaceshipAbilitiesProfile, SpaceshipAbilityProfile } from './spaceship-abilities';

export const abilities: Record<AbilityClass, SpaceshipAbilitiesProfile> = {
  [AbilityClass.GUNSHIP]: {
    abilityClass: AbilityClass.GUNSHIP,
    q: {
      callback: (spaceship: Spaceship, state: GameState) => {
        state.entities.push({
          type: EntityType.ROCKET,
          x: spaceship.x - AbilityAlmanac[AbilityClass.GUNSHIP].q.sideXOffset,
          y: spaceship.y + AbilityAlmanac[AbilityClass.GUNSHIP].q.launchYOffset,
          speed: AbilityAlmanac[AbilityClass.GUNSHIP].q.rocketSpeed
        });
      }
    },
    w: {
      callback: (spaceship: Spaceship) => {
        spaceship.abilities.q.cooldownTimer = 0;
      },
      isDisabled: (spaceship: Spaceship) => {
        return spaceship.abilities.q.cooldownTimer === 0;
      }
    },
    e: {
      callback: (spaceship: Spaceship, state: GameState) => {
        state.entities.push({
          type: EntityType.LASER,
          topY: 0,
          getX: () => spaceship.x + AbilityAlmanac[AbilityClass.GUNSHIP].e.sideXOffset,
          getBottomY: () => spaceship.y + AbilityAlmanac[AbilityClass.GUNSHIP].e.launchYOffset,
          width: AbilityAlmanac[AbilityClass.GUNSHIP].e.laserWidth,
          totalTime: AbilityAlmanac[AbilityClass.GUNSHIP].e.laserDuration,
          timeLeft: AbilityAlmanac[AbilityClass.GUNSHIP].e.laserDuration
        });
      }
    }
  }
};

export const specialAbilities: Record<SpecialAbilityName, SpaceshipAbilityProfile> = {
  [SpecialAbilityName.STRONGER_ENGINES]: {
    callback: () => {}
  },
  [SpecialAbilityName.BOMB]: {
    callback: (spaceship: Spaceship, state: GameState) => {
      state.entities.push({
        type: EntityType.BOMB,
        x: spaceship.x,
        y: spaceship.y,
        r: Number(SpecialAbilityAlmanac[SpecialAbilityName.BOMB].radius),
        age: 0,
        explosionTime: Number(SpecialAbilityAlmanac[SpecialAbilityName.BOMB].explosionDelay),
        owner: spaceship
      });
    },
    reactivateCallback: (spaceship: Spaceship, state: GameState) => {
      const existingBomb = state.entities.find(e => e.type === EntityType.BOMB && e.owner === spaceship);
      detonateBomb(state, existingBomb as Bomb);
    }
  },
  [SpecialAbilityName.SHIELD_GENERATOR]: {
    callback: () => {}
  },
  [SpecialAbilityName.URGENT_ORDERS]: {
    callback: (spaceship: Spaceship) => {
      forEachAbility(a => {
        spaceship.abilities[a].cooldownTimer *= Number(
          SpecialAbilityAlmanac[SpecialAbilityName.URGENT_ORDERS].cooldownMultiplier
        );
      });
    },
    isDisabled: (spaceship: Spaceship) => {
      let isDisabled = true;

      forEachAbility(a => {
        if (spaceship.abilities[a].cooldownTimer > 0) {
          isDisabled = false;
        }
      });

      return isDisabled;
    }
  }
};
