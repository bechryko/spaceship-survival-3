import { GAME_HEIGHT, GAME_WIDTH } from '../hud';
import { AbilityClass } from './ability-class';
import { STRONGER_ENGINES_MOVEMENT_SPEED_MULTIPLIER } from './effects';
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
const SCIENTIST_PROBE_MIN_ANALYSIS_TIME = 0.5;
const SCIENTIST_PROBE_MAX_ANALYSIS_TIME = 1.5;
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
      longDescription: [
        `Fires a rocket from the left wing that flies straight up at high speed. It explodes on the first asteroid it touches and destroys it, however big it is. The cooldown starts in the moment of fire, not when the rocket hits.`
      ] as string[],
      cooldown: 6,
      sideXOffset: GUNSHIP_CANNON_X_OFFSET,
      launchYOffset: 8,
      rocketSpeed: 800
    },
    w: {
      name: 'Emergency Ammo',
      shortDescription: 'Instantly reloads the Rocket.',
      longDescription: [
        "Instantly resets the cooldown of the rocket, so you can fire another one straight away. The ability is disabled when the rocket is ready to use, so you can't waste it on nothing."
      ] as string[],
      cooldown: 20
    },
    e: {
      name: 'Laser Beam',
      shortDescription: `Fires a laser from the right wing for ${GUNSHIP_LASER_DURATION} seconds that destroys everything it touches.`,
      longDescription: [
        `Switches on a laser from the right wing that lasts ${GUNSHIP_LASER_DURATION} seconds and follows the ship as it moves. Every asteroid the beam touches is destroyed. The cooldown starts when the beam ends.`
      ] as string[],
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
      longDescription: [
        `Launches a probe forward that gets destroyed in ${SCIENTIST_PROBE_MAX_FLIGHT_TIME} seconds. But if it reaches an asteroid, it attaches to its surface and analyzes it. After ${SCIENTIST_PROBE_MIN_ANALYSIS_TIME}-${SCIENTIST_PROBE_MAX_ANALYSIS_TIME} seconds (depending on the asteroid's size) the analysis is complete and the asteroid explodes, but if there is another asteroid nearby, the probe attaches to that (preferring asteroids higher on the screen), and this goes on in a chain.`,
        'For each analysis of normal asteroids the spaceship gets an asteroid knowledge point.',
        "If this ability is cast from another player's spaceship, they get the knowledge point."
      ] as string[],
      cooldown: 6,
      flySpeed: 150,
      transferSpeed: 450,
      radius: 6,
      maxFlightTime: SCIENTIST_PROBE_MAX_FLIGHT_TIME,
      minAnalysisTime: SCIENTIST_PROBE_MIN_ANALYSIS_TIME,
      maxAnalysisTime: SCIENTIST_PROBE_MAX_ANALYSIS_TIME,
      minAnalysisTimeAsteroidSize: 50,
      maxAnalysisTimeAsteroidSize: 200,
      chainRange: 100,
      noseOffset: 32,
      lostFadeTime: 0.35
    },
    w: {
      name: 'Shockwave',
      shortDescription: `Creates a shockwave to slow down all asteroids on the screen to ${SCIENTIST_SHOCKWAVE_SLOW * 100}% of their current speed.`,
      longDescription: [
        `Sends out a shockwave to slow down all asteroids on the screen to ${SCIENTIST_SHOCKWAVE_SLOW * 100}% of their current speed. This includes vertical and horizontal velocity as well.`
      ] as string[],
      cooldown: 12,
      speed: 1600,
      maxRadius: Math.max(GAME_WIDTH, GAME_HEIGHT),
      speedMultiplier: SCIENTIST_SHOCKWAVE_SLOW
    },
    e: {
      name: 'Plasma Jet',
      shortDescription: `Shoots plasma forward for at most ${SCIENTIST_PLASMA_JET_ACTIVE_TIME} seconds, that blows asteroids backwards and slightly sideways. The ability can be reactivated to end it early, and the cooldown is always the used duration times ${SCIENTIST_PLASMA_JET_COOLDOWN_MULTIPLIER}.`,
      longDescription: [
        `Shoots plasma forward for at most ${SCIENTIST_PLASMA_JET_ACTIVE_TIME} seconds in a good range, that blows asteroids backwards and slightly sideways. It is not an instant push, it takes time to redirect fully an asteroid's movement with the jet.`,
        `The ability can be reactivated to end it early, and the cooldown is always the used duration times ${SCIENTIST_PLASMA_JET_COOLDOWN_MULTIPLIER}.`
      ] as string[],
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
  STRONGER_ENGINES = 'Stronger Engines',
  BOMB = 'Bomb',
  SHIELD_GENERATOR = 'Shield Generator',
  URGENT_ORDERS = 'Urgent Orders'
}

interface SpecialAbilityAlmanacEntry {
  summary: string;
  shortDescription: string;
  longDescription: string[];
  activeTime: number;
  cooldown?: number;
  [key: string]: string | string[] | number | boolean | undefined;
}

const STRONGER_ENGINES_SPEED_BONUS_PERCENT = (STRONGER_ENGINES_MOVEMENT_SPEED_MULTIPLIER - 1) * 100;
const BOMB_EXPLOSION_DELAY = 3;
const SHIELD_GENERATOR_DURATION = 3;

export const SpecialAbilityAlmanac: Record<SpecialAbilityName, SpecialAbilityAlmanacEntry> = {
  [SpecialAbilityName.STRONGER_ENGINES]: {
    summary: 'A passive upgrade: the ship moves faster.',
    shortDescription: `Your spaceship moves ${STRONGER_ENGINES_SPEED_BONUS_PERCENT}% faster.`,
    longDescription: [
      `Your spaceship moves ${STRONGER_ENGINES_SPEED_BONUS_PERCENT}% faster. This equals to roughly +2 Engine Power levels.`
    ],
    activeTime: Infinity,
    movementSpeedMultiplier: STRONGER_ENGINES_MOVEMENT_SPEED_MULTIPLIER
  },
  [SpecialAbilityName.BOMB]: {
    summary: 'Shoots a slow bomb forward that you can set off at the right moment.',
    shortDescription: `Shoots a slow bomb forward. It explodes when you press R again, after ${BOMB_EXPLOSION_DELAY} seconds, or when it touches an asteroid, which it destroys. The blast pushes nearby asteroids away from its center.`,
    longDescription: [
      `Shoots a slow bomb forward. It explodes when you press R again, after ${BOMB_EXPLOSION_DELAY} seconds, or when it touches an asteroid, which it destroys. The blast pushes nearby asteroids away from its center in a medium range, regardless of the cause of its detonation. The cooldown starts after the bomb has detonated.`
    ],
    activeTime: BOMB_EXPLOSION_DELAY,
    reactivatable: true,
    cooldown: 30,
    explosionDelay: BOMB_EXPLOSION_DELAY,
    speed: 65,
    radius: 10
  },
  [SpecialAbilityName.SHIELD_GENERATOR]: {
    summary: 'Makes the ship immune to asteroids for a short time.',
    shortDescription: `Creates an asteroid shield for ${SHIELD_GENERATOR_DURATION} seconds, so colliding with them destroys them.`,
    longDescription: [
      `Creates a shield for ${SHIELD_GENERATOR_DURATION} seconds. Colliding with an asteroid with it destroys them instead of getting destroyed, but Iron asteroids cannot be destroyed with this, and colliding with them results in the spaceship's destruction.`,
      `The hitbox of the spaceship doesn't change despite the visuals, so when an asteroid collides with only the shield nothing happens.`
    ],
    activeTime: SHIELD_GENERATOR_DURATION,
    cooldown: 25,
    duration: SHIELD_GENERATOR_DURATION
  },
  [SpecialAbilityName.URGENT_ORDERS]: {
    summary: 'Cuts down the remaining cooldown of your other abilities.',
    shortDescription: 'Halves all active cooldowns of your other abilities.',
    longDescription: [
      "Halves all active cooldowns of your other abilities. Doesn't touch ready abilities or abilities casted later.",
      "If cast from another player's spaceship, their special ability's cooldown is also reduced."
    ],
    activeTime: 0,
    cooldown: 30,
    cooldownMultiplier: 0.5
  }
} as const;
