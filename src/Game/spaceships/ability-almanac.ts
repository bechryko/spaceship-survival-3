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
