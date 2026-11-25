import { Asteroid } from '../asteroids';
import {
  Bomb,
  detonateBomb,
  EntityType,
  Laser,
  PlasmaJet,
  Rocket,
  ScienceProbe,
  Shockwave,
  spawnEntity
} from '../entities';
import { GameState } from '../hud';
import { forEachAbility } from '../utils';
import { AbilityAlmanac, SpecialAbilityAlmanac, SpecialAbilityName } from './ability-almanac';
import { AbilityClass } from './ability-class';
import { SpaceshipEffectType, startEffect } from './effects';
import { Spaceship } from './spaceship';
import { SpaceshipAbilitiesProfile, SpaceshipAbilityProfile, SpaceshipAbilityType } from './spaceship-abilities';

export const abilities: Record<AbilityClass, SpaceshipAbilitiesProfile> = {
  [AbilityClass.GUNSHIP]: {
    abilityClass: AbilityClass.GUNSHIP,
    q: {
      type: SpaceshipAbilityType.EQUIPMENT,
      callback: (spaceship: Spaceship, state: GameState) => {
        spawnEntity<Rocket>(
          {
            type: EntityType.ROCKET,
            x: spaceship.x - AbilityAlmanac[AbilityClass.GUNSHIP].q.sideXOffset,
            y: spaceship.y + AbilityAlmanac[AbilityClass.GUNSHIP].q.launchYOffset,
            speed: AbilityAlmanac[AbilityClass.GUNSHIP].q.rocketSpeed
          },
          state
        );
      }
    },
    w: {
      type: SpaceshipAbilityType.EQUIPMENT,
      callback: (spaceship: Spaceship) => {
        spaceship.abilities.q.cooldownTimer = 0;
      },
      isDisabled: (spaceship: Spaceship) => {
        return spaceship.abilities.q.cooldownTimer === 0;
      }
    },
    e: {
      type: SpaceshipAbilityType.EQUIPMENT,
      callback: (spaceship: Spaceship, state: GameState) => {
        spawnEntity<Laser>(
          {
            type: EntityType.LASER,
            topY: 0,
            getX: () => spaceship.x + AbilityAlmanac[AbilityClass.GUNSHIP].e.sideXOffset,
            getBottomY: () => spaceship.y + AbilityAlmanac[AbilityClass.GUNSHIP].e.launchYOffset,
            width: AbilityAlmanac[AbilityClass.GUNSHIP].e.laserWidth,
            totalTime: AbilityAlmanac[AbilityClass.GUNSHIP].e.laserDuration,
            timeLeft: AbilityAlmanac[AbilityClass.GUNSHIP].e.laserDuration
          },
          state
        );
      }
    }
  },
  [AbilityClass.SCIENTIST]: {
    abilityClass: AbilityClass.SCIENTIST,
    q: {
      type: SpaceshipAbilityType.DEVICE,
      callback: (spaceship: Spaceship, state: GameState) => {
        const flySpeed = AbilityAlmanac[AbilityClass.SCIENTIST].q.flySpeed;
        const owner = spaceship.alive ? spaceship : spaceship.host!;

        spawnEntity<ScienceProbe>(
          {
            type: EntityType.SCIENCE_PROBE,
            owner,
            phase: 'flying',
            x: spaceship.x,
            y: spaceship.y - AbilityAlmanac[AbilityClass.SCIENTIST].q.noseOffset,
            currentSpeed: flySpeed,
            targetSpeed: flySpeed,
            flySpeed,
            transferSpeed: AbilityAlmanac[AbilityClass.SCIENTIST].q.transferSpeed,
            direction: [0, -1],
            flightTime: 0,
            attach: [0, 0],
            analysisTime: 0,
            analysisProgress: 0,
            lostTime: 0
          },
          state
        );
      }
    },
    w: {
      type: SpaceshipAbilityType.EQUIPMENT,
      callback: (spaceship: Spaceship, state: GameState) => {
        spawnEntity<Shockwave>(
          {
            type: EntityType.SHOCKWAVE,
            x: spaceship.x,
            y: spaceship.y,
            speed: AbilityAlmanac[AbilityClass.SCIENTIST].w.speed,
            radius: 0,
            maxRadius: AbilityAlmanac[AbilityClass.SCIENTIST].w.maxRadius,
            slowed: new WeakSet(),
            contactCallback: (wave: Shockwave, asteroid: Asteroid) => {
              if (wave.slowed.has(asteroid)) {
                return;
              }

              const { speedMultiplier } = AbilityAlmanac[AbilityClass.SCIENTIST].w;

              wave.slowed.add(asteroid);
              asteroid.velocity *= speedMultiplier;
              if (asteroid.velocityHorizontal !== undefined) {
                asteroid.velocityHorizontal *= speedMultiplier;
              }
            }
          },
          state
        );
      }
    },
    e: {
      type: SpaceshipAbilityType.EQUIPMENT,
      callback: (spaceship: Spaceship, state: GameState) => {
        spawnEntity<PlasmaJet>(
          {
            type: EntityType.PLASMA_JET,
            owner: spaceship,
            isActivated: true,
            usedTime: 0,
            intensity: 0,
            affected: []
          },
          state
        );
      },
      reactivateCallback: (spaceship: Spaceship, state: GameState) => {
        const plasmaJet = state.entities.find(
          e => e.active && e.type === EntityType.PLASMA_JET && e.owner === spaceship
        ) as PlasmaJet;
        if (!plasmaJet) {
          throw new Error('Cannot find PlasmaJet to cancel.');
        }

        plasmaJet.isActivated = false;
        spaceship.abilities.e.cooldownTimer =
          plasmaJet.usedTime * AbilityAlmanac[AbilityClass.SCIENTIST].e.cooldownMultiplier;
      }
    }
  }
};

const BOMB_SPAWN_Y_OFFSET = 16;

export const specialAbilities: Record<SpecialAbilityName, SpaceshipAbilityProfile> = {
  [SpecialAbilityName.STRONGER_ENGINES]: {
    type: SpaceshipAbilityType.EQUIPMENT,
    callback: () => {}
  },
  [SpecialAbilityName.BOMB]: {
    type: SpaceshipAbilityType.DEVICE,
    callback: (spaceship: Spaceship, state: GameState) => {
      spawnEntity<Bomb>(
        {
          type: EntityType.BOMB,
          x: spaceship.x,
          y: spaceship.y - BOMB_SPAWN_Y_OFFSET,
          r: Number(SpecialAbilityAlmanac[SpecialAbilityName.BOMB].radius),
          age: 0,
          explosionTime: Number(SpecialAbilityAlmanac[SpecialAbilityName.BOMB].explosionDelay),
          owner: spaceship
        },
        state
      );
    },
    reactivateCallback: (spaceship: Spaceship, state: GameState) => {
      const existingBomb = state.entities.find(e => e.active && e.type === EntityType.BOMB && e.owner === spaceship);
      if (!existingBomb) {
        throw new Error('Cannot find Bomb to detonate.');
      }

      detonateBomb(state, existingBomb as Bomb);
    }
  },
  [SpecialAbilityName.SHIELD_GENERATOR]: {
    type: SpaceshipAbilityType.DEVICE,
    callback: (spaceship: Spaceship) => {
      const owner = spaceship.alive ? spaceship : spaceship.host!;

      startEffect(
        owner,
        SpaceshipEffectType.SHIELD,
        Number(SpecialAbilityAlmanac[SpecialAbilityName.SHIELD_GENERATOR].duration)
      );
    }
  },
  [SpecialAbilityName.URGENT_ORDERS]: {
    type: SpaceshipAbilityType.DEVICE,
    callback: (spaceship: Spaceship) => {
      const owner = spaceship.alive ? spaceship : spaceship.host!;

      forEachAbility(a => {
        owner.abilities[a].cooldownTimer *= Number(
          SpecialAbilityAlmanac[SpecialAbilityName.URGENT_ORDERS].cooldownMultiplier
        );
      }, owner !== spaceship);
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
