import { Asteroid, AsteroidType, destroyAsteroid } from '../asteroids';
import { GameState } from '../hud';
import { explode } from './create';
import { EntityType, Explosion, Laser, Rocket } from './entities';

export const EXPLOSION_DURATION = 0.6;

export function tickEntities(state: GameState, deltaTime: number): void {
  for (const entity of state.entities) {
    switch (entity.type) {
      case EntityType.ROCKET:
        tickRocket(entity, deltaTime, state);
        break;
      case EntityType.LASER:
        tickLaser(entity, deltaTime, state);
        break;
      case EntityType.EXPLOSION:
        tickExplosion(entity, deltaTime, state);
        break;
    }
  }
}

const ROCKET_EXPLOSION_RADIUS_MULTIPLIER = 1.6;
const ROCKET_UNSUCCESSFUL_EXPLOSION_RADIUS = 90;

function tickRocket(rocket: Rocket, deltaTime: number, state: GameState): void {
  const { asteroids } = state;
  const fromY = rocket.y;
  rocket.y -= rocket.speed * deltaTime;

  const rocketIdx = state.entities.findIndex(e => e === rocket);
  const hitIdx = findRocketHit(rocket.x, fromY, rocket.y, asteroids);
  if (hitIdx !== -1) {
    const target = asteroids[hitIdx];

    const success = destroyAsteroid(target, state, ROCKET_EXPLOSION_RADIUS_MULTIPLIER);
    state.entities.splice(rocketIdx, 1);
    if (!success) {
      explode(state, rocket.x, rocket.y, ROCKET_UNSUCCESSFUL_EXPLOSION_RADIUS);
    }
  } else if (rocket.y < -30) {
    state.entities.splice(rocketIdx, 1);
  }
}

const LASER_EXPLOSION_RADIUS_MULTIPLIER = 1.1;
const LASER_HIT_SCALE = 0.8;

function tickLaser(laser: Laser, deltaTime: number, state: GameState): void {
  laser.timeLeft = Math.max(0, laser.timeLeft - deltaTime);

  laser.topY = getLaserTopY(laser, state.asteroids);

  for (let i = state.asteroids.length - 1; i >= 0; i--) {
    const asteroid = state.asteroids[i];
    if (!asteroid.active) {
      continue;
    }

    const reach = asteroid.r * LASER_HIT_SCALE + laser.width / 2;
    const isInColumn = Math.abs(asteroid.x - laser.getX()) <= reach;
    const lowestPoint = asteroid.y + asteroid.r * LASER_HIT_SCALE;
    const highestPoint = asteroid.y - asteroid.r * LASER_HIT_SCALE;

    if (isInColumn && lowestPoint >= laser.topY && highestPoint <= laser.getBottomY()) {
      destroyAsteroid(asteroid, state, LASER_EXPLOSION_RADIUS_MULTIPLIER);
    }
  }

  if (laser.timeLeft === 0) {
    state.entities.splice(
      state.entities.findIndex(e => e === laser),
      1
    );
  }
}

function tickExplosion(explosion: Explosion, deltaTime: number, state: GameState): void {
  explosion.age += deltaTime;

  if (explosion.age >= EXPLOSION_DURATION) {
    state.entities.splice(
      state.entities.findIndex(e => e === explosion),
      1
    );
  }
}

/**
 * Swept test, so a fast rocket can't skip over an asteroid between frames.
 * Returns the index of the first asteroid the rocket reaches while travelling up
 * from `fromY` to `toY`, or -1.
 */
function findRocketHit(x: number, fromY: number, toY: number, asteroids: readonly Asteroid[]): number {
  let best = -1;
  let bestEntry = -Infinity;

  for (let i = 0; i < asteroids.length; i++) {
    const asteroid = asteroids[i];
    if (!asteroid.active) {
      continue;
    }

    const reach = asteroid.r * 0.9 + 5;
    const dx = asteroid.x - x;
    if (Math.abs(dx) > reach) {
      continue;
    }

    // The asteroid blocks the vertical line at x between a.y - half and a.y + half
    const half = Math.sqrt(reach * reach - dx * dx);
    if (asteroid.y + half < toY || asteroid.y - half > fromY) continue;

    // Going up, the rocket meets the lower edge of the asteroid first (larger y = reached first)
    const entry = Math.min(fromY, asteroid.y + half);
    if (entry > bestEntry) {
      bestEntry = entry;
      best = i;
    }
  }

  return best;
}

function getLaserTopY(laser: Laser, asteroids: Asteroid[]): number {
  let topY = 0;
  const bottomY = laser.getBottomY();

  for (const asteroid of asteroids) {
    if (!asteroid.active || asteroid.type !== AsteroidType.IRON) {
      continue;
    }

    const reach = asteroid.r * LASER_HIT_SCALE + laser.width / 2;
    const dx = Math.abs(asteroid.x - laser.getX());
    const isBesideBeam = dx > reach;
    const isBelowEmitter = asteroid.y - asteroid.r * LASER_HIT_SCALE > bottomY;
    if (isBesideBeam || isBelowEmitter) {
      continue;
    }

    // Bottom edge of the asteroid's circle at the beam's x position
    const lowestY = asteroid.y + Math.sqrt(reach * reach - dx * dx);
    topY = Math.max(topY, Math.min(lowestY, bottomY));
  }

  return topY;
}
