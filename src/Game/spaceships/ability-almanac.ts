import { AbilityClass } from './ability-class';

const GUNSHIP_CANNON_X_OFFSET = 26;
const GUNSHIP_LASER_DURATION = 2;

export const AbilityAlmanac = {
  [AbilityClass.GUNSHIP]: {
    q: {
      name: 'Rocket',
      cooldown: 6,
      activeTime: 0,
      sideXOffset: GUNSHIP_CANNON_X_OFFSET,
      launchYOffset: 8,
      rocketSpeed: 800
    },
    w: {
      name: 'Emergency Ammo',
      cooldown: 20,
      activeTime: 0
    },
    e: {
      name: 'Laser Beam',
      cooldown: 18,
      activeTime: GUNSHIP_LASER_DURATION,
      laserWidth: 14,
      laserDuration: GUNSHIP_LASER_DURATION,
      sideXOffset: GUNSHIP_CANNON_X_OFFSET,
      launchYOffset: 14
    }
  }
} as const;
