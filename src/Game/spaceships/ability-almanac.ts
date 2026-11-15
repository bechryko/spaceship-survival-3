import { AbilityClass } from './ability-class';

const GUNSHIP_CANNON_X_OFFSET = 26;
const GUNSHIP_LASER_DURATION = 2;

export const AbilityAlmanac = {
  [AbilityClass.GUNSHIP]: {
    q: {
      name: 'Rocket',
      shortDescription: 'Fires a rocket from the left wing that destroys the first asteroid it hits.',
      cooldown: 6,
      activeTime: 0,
      sideXOffset: GUNSHIP_CANNON_X_OFFSET,
      launchYOffset: 8,
      rocketSpeed: 800
    },
    w: {
      name: 'Emergency Ammo',
      shortDescription: 'Instantly reloads the Rocket.',
      cooldown: 20,
      activeTime: 0
    },
    e: {
      name: 'Laser Beam',
      shortDescription: `Fires a laser from the right wing for ${GUNSHIP_LASER_DURATION} seconds that destroys everything it touches.`,
      cooldown: 18,
      activeTime: GUNSHIP_LASER_DURATION,
      laserWidth: 14,
      laserDuration: GUNSHIP_LASER_DURATION,
      sideXOffset: GUNSHIP_CANNON_X_OFFSET,
      launchYOffset: 14
    }
  }
} as const;

export enum SpecialAbilityName {
  STRONGER_ENGINES = 'Stronger engines',
  BOMB = 'Bomb',
  SHIELD_GENERATOR = 'Shield generator',
  URGENT_ORDERS = 'Urgent orders'
}

interface SpecialAbilityAlmanacEntry {
  shortDescription: string;
  cooldown?: number;
  [key: string]: string | number | undefined;
}

const STRONGER_ENGINES_SPEED_BONUS_PERCENT = 20;
const BOMB_EXPLOSION_DELAY = 4;
const SHIELD_GENERATOR_DURATION = 2;

export const SpecialAbilityAlmanac: Record<SpecialAbilityName, SpecialAbilityAlmanacEntry> = {
  [SpecialAbilityName.STRONGER_ENGINES]: {
    shortDescription: `Your spaceship moves ${STRONGER_ENGINES_SPEED_BONUS_PERCENT}% faster.`,
    movementSpeedMultiplier: 1 + STRONGER_ENGINES_SPEED_BONUS_PERCENT / 100
  },
  [SpecialAbilityName.BOMB]: {
    shortDescription: `Shoots a slow bomb forward. It explodes when you press R again, after ${BOMB_EXPLOSION_DELAY} seconds, or when it touches an asteroid, which it destroys. The blast pushes nearby asteroids away from its center, speeding them up sideways and downwards.`,
    cooldown: 15,
    explosionDelay: BOMB_EXPLOSION_DELAY
  },
  [SpecialAbilityName.SHIELD_GENERATOR]: {
    shortDescription: `Makes your spaceship immune to asteroids for ${SHIELD_GENERATOR_DURATION} seconds.`,
    cooldown: 15,
    duration: SHIELD_GENERATOR_DURATION
  },
  [SpecialAbilityName.URGENT_ORDERS]: {
    shortDescription: 'Halves all active cooldowns of your other abilities.',
    cooldown: 22,
    cooldownMultiplier: 0.5
  }
} as const;
