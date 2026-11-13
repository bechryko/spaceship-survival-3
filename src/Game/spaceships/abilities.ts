import { EntityType } from '../entities';
import { GameState } from '../hud';
import { AbilityAlmanac } from './ability-almanac';
import { AbilityClass } from './ability-class';
import { Spaceship } from './spaceship';
import { SpaceshipAbilitiesProfile } from './spaceship-abilities';

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
      }
    },
    e: {
      callback: (spaceship: Spaceship, state: GameState) => {
        state.entities.push({
          type: EntityType.LASER,
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
