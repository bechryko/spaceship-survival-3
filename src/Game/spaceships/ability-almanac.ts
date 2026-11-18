import { GAME_HEIGHT, GAME_WIDTH } from '../hud';
import { AbilityClass } from './ability-class';
import { SPACESHIP_MAX_SURVIVE_CHANCE, SPACESHIP_SURVIVE_CHANCE_PER_KNOWLEDGE } from './utils';

export const SpeedAlmanac: Record<number, number> = {
  1: 170,
  2: 185,
  3: 200,
  4: 215,
  5: 230
};

const GUNSHIP_CANNON_X_OFFSET = 26;
const GUNSHIP_LASER_DURATION = 2;

const SCIENTIST_PROBE_MAX_FLIGHT_TIME = 1.25;
const SCIENTIST_PROBE_MIN_ANALYSIS_TIME = 0.333;
const SCIENTIST_PROBE_MAX_ANALYSIS_TIME = 1.75;
const SCIENTIST_SHOCKWAVE_SLOW = 0.4;
const SCIENTIST_PLASMA_JET_ACTIVE_TIME = 6;
const SCIENTIST_PLASMA_JET_COOLDOWN_MULTIPLIER = 3.5;
const SCIENTIST_PLASMA_JET_ANGLE_DEGREES = 45;

export const AbilityAlmanac = {
  [AbilityClass.GUNSHIP]: {
    speedLevel: 2,
    q: {
      name: 'Rocket',
      shortDescription: 'Fires a rocket from the left wing that destroys the first asteroid it hits.',
      cooldown: 6,
      sideXOffset: GUNSHIP_CANNON_X_OFFSET,
      launchYOffset: 8,
      rocketSpeed: 800
    },
    w: {
      name: 'Emergency Ammo',
      shortDescription: 'Instantly reloads the Rocket.',
      cooldown: 20
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
  },
  [AbilityClass.SCIENTIST]: {
    speedLevel: 3,
    q: {
      name: 'Science Probe',
      shortDescription: `Launches a probe forward that can attach to an asteroid within ${SCIENTIST_PROBE_MAX_FLIGHT_TIME} seconds, then analyze it, destroying the asteroid and looking for a new one. For each analysis the spaceship gets a knowledge point, that gives ${SPACESHIP_SURVIVE_CHANCE_PER_KNOWLEDGE * 100}% chance to survive an asteroid hit (max: ${SPACESHIP_MAX_SURVIVE_CHANCE * 100}%).`,
      longDescription: `Launches a probe forward that gets destroyed in ${SCIENTIST_PROBE_MAX_FLIGHT_TIME} seconds. But if it reaches an asteroid, it attaches to its surface and analyzes it. After ${SCIENTIST_PROBE_MIN_ANALYSIS_TIME}-${SCIENTIST_PROBE_MAX_ANALYSIS_TIME} seconds (depending on the asteroid's size) the analysis is complete and the asteroid explodes, but if there is another asteroid nearby, the probe attaches to that, and this goes on in a chain. For each analysis the spaceship gets a knowledge point, and each knowledge point gives ${SPACESHIP_SURVIVE_CHANCE_PER_KNOWLEDGE * 100}% chance to survive an asteroid hit, for up to ${SPACESHIP_MAX_SURVIVE_CHANCE * 100}%. This chance is doubled against ice shards.`,
      cooldown: 7,
      flySpeed: 150,
      transferSpeed: 450,
      radius: 6,
      maxFlightTime: SCIENTIST_PROBE_MAX_FLIGHT_TIME,
      minAnalysisTime: SCIENTIST_PROBE_MIN_ANALYSIS_TIME,
      maxAnalysisTime: SCIENTIST_PROBE_MAX_ANALYSIS_TIME,
      minAnalysisTimeAsteroidSize: 25,
      maxAnalysisTimeAsteroidSize: 250,
      chainRange: 100,
      noseOffset: 32,
      lostFadeTime: 0.35
    },
    w: {
      name: 'Shockwave',
      shortDescription: `Creates a shockwave to slow down all asteroids in the screen to ${SCIENTIST_SHOCKWAVE_SLOW * 100}% of their current speed.`,
      cooldown: 12,
      speed: 1600,
      maxRadius: Math.max(GAME_WIDTH, GAME_HEIGHT),
      speedMultiplier: SCIENTIST_SHOCKWAVE_SLOW
    },
    e: {
      name: 'Plasma Jet',
      shortDescription: `Shoots plasma forward for at most ${SCIENTIST_PLASMA_JET_ACTIVE_TIME} seconds, that blows asteroids backwards and slightly sideways. The ability can be reactivated to end it early, and the cooldown is always the used duration times ${SCIENTIST_PLASMA_JET_COOLDOWN_MULTIPLIER}.`,
      cooldown: SCIENTIST_PLASMA_JET_ACTIVE_TIME * SCIENTIST_PLASMA_JET_COOLDOWN_MULTIPLIER,
      activeTime: SCIENTIST_PLASMA_JET_ACTIVE_TIME,
      cooldownMultiplier: SCIENTIST_PLASMA_JET_COOLDOWN_MULTIPLIER,
      rampIn: 0.2,
      rampOut: 0.25,
      noseOffset: 32,
      range: 250,
      halfAngle: (SCIENTIST_PLASMA_JET_ANGLE_DEGREES / 2 / 180) * Math.PI,
      nozzleHalfWidth: 6,
      backAcceleration: 240,
      sideAcceleration: 100,
      falloff: 0.8,
      referenceRadius: 90,
      minInertia: 0.7,
      maxInertia: 1.6
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
  activeTime: number;
  cooldown?: number;
  [key: string]: string | number | undefined;
}

const STRONGER_ENGINES_SPEED_BONUS_PERCENT = 25;
const BOMB_EXPLOSION_DELAY = 3;
const SHIELD_GENERATOR_DURATION = 2;

export const SpecialAbilityAlmanac: Record<SpecialAbilityName, SpecialAbilityAlmanacEntry> = {
  [SpecialAbilityName.STRONGER_ENGINES]: {
    shortDescription: `Your spaceship moves ${STRONGER_ENGINES_SPEED_BONUS_PERCENT}% faster.`,
    activeTime: Infinity,
    movementSpeedMultiplier: 1 + STRONGER_ENGINES_SPEED_BONUS_PERCENT / 100
  },
  [SpecialAbilityName.BOMB]: {
    shortDescription: `Shoots a slow bomb forward. It explodes when you press R again, after ${BOMB_EXPLOSION_DELAY} seconds, or when it touches an asteroid, which it destroys. The blast pushes nearby asteroids away from its center.`,
    activeTime: BOMB_EXPLOSION_DELAY,
    cooldown: 30,
    explosionDelay: BOMB_EXPLOSION_DELAY,
    radius: 10
  },
  [SpecialAbilityName.SHIELD_GENERATOR]: {
    shortDescription: `Creates an asteroid shield for ${SHIELD_GENERATOR_DURATION} seconds, so colliding with them destroys them.`,
    activeTime: SHIELD_GENERATOR_DURATION,
    cooldown: 15,
    duration: SHIELD_GENERATOR_DURATION
  },
  [SpecialAbilityName.URGENT_ORDERS]: {
    shortDescription: 'Halves all active cooldowns of your other abilities.',
    activeTime: 0,
    cooldown: 20,
    cooldownMultiplier: 0.5
  }
} as const;
