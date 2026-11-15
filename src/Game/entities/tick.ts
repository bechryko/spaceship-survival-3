import { Asteroid, AsteroidType, destroyAsteroid, pushAsteroid } from '../asteroids';
import { GameState } from '../hud';
import { explode } from './create';
import { Bomb, EntityType, Explosion, Laser, Rocket } from './entities';
import {
  getAsteroidSpanInBeam,
  getBombContactY,
  getDistanceToAsteroid,
  isAsteroidHitByLaser,
  LaserBeam
} from './hit-tests';

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
      case EntityType.BOMB:
        tickBomb(entity, state, deltaTime);
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

function tickLaser(laser: Laser, deltaTime: number, state: GameState): void {
  laser.timeLeft = Math.max(0, laser.timeLeft - deltaTime);

  const beam: LaserBeam = { x: laser.getX(), width: laser.width, bottomY: laser.getBottomY() };
  laser.topY = getLaserTopY(beam, state.asteroids);

  for (let i = state.asteroids.length - 1; i >= 0; i--) {
    const asteroid = state.asteroids[i];
    if (!asteroid.active) {
      continue;
    }

    if (isAsteroidHitByLaser(asteroid, beam, laser.topY)) {
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

const BOMB_SPEED = 75;

export function tickBomb(bomb: Bomb, state: GameState, deltaTime: number): void {
  const fromY = bomb.y;
  bomb.y -= BOMB_SPEED * deltaTime;
  bomb.age += deltaTime;

  const contact = findBombContact(bomb, fromY, state.asteroids);
  if (contact) {
    bomb.y = contact.y; // explode where it actually touched, not where the frame happened to end
    destroyAsteroid(state.asteroids[contact.index], state);

    detonateBomb(state, bomb);
  } else if (bomb.age >= bomb.explosionTime) {
    detonateBomb(state, bomb);
  }
}

/**
 * Swept test along the bomb's path this frame, against each asteroid's real outline, so a slow bomb
 * can't skip an asteroid on a long frame. Returns the first asteroid the bomb meets travelling up
 * (not just the first in the list) and the y where they touched, or null.
 */
function findBombContact(bomb: Bomb, fromY: number, asteroids: Asteroid[]): { index: number; y: number } | null {
  let best: { index: number; y: number } | null = null;

  for (let i = 0; i < asteroids.length; i++) {
    if (!asteroids[i].active) {
      continue;
    }

    const y = getBombContactY(asteroids[i], bomb.x, fromY, bomb.y, bomb.r);
    if (y !== null && (best === null || y > best.y)) {
      best = { index: i, y };
    }
  }

  return best;
}

const BOMB_BLAST_RADIUS = 150;
const BOMB_BLAST_SPEED = 180;
const BOMB_BLAST_MIN_SPEED_MULTIPLIER = 0.25;

export function detonateBomb(state: GameState, bomb: Bomb): void {
  const { x, y } = bomb;

  for (const asteroid of state.asteroids.filter(a => a.active)) {
    const dx = asteroid.x - x;
    const dy = asteroid.y - y;
    const distance = Math.hypot(dx, dy);

    const edgeDistance = getDistanceToAsteroid(asteroid, x, y);
    if (edgeDistance > BOMB_BLAST_RADIUS) {
      continue;
    }

    const strength = 1 - (edgeDistance / BOMB_BLAST_RADIUS) * (1 - BOMB_BLAST_MIN_SPEED_MULTIPLIER);
    const angle = distance > bomb.r ? Math.atan2(dy, dx) : Math.random() * Math.PI * 2;
    pushAsteroid(asteroid, BOMB_BLAST_SPEED * strength, angle);
  }

  explode(state, x, y, BOMB_BLAST_RADIUS);

  bomb.owner.abilities.r.activeTimer = 0;
  state.entities.splice(
    state.entities.findIndex(e => e === bomb),
    1
  );
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

    const half = Math.sqrt(reach * reach - dx * dx);
    if (asteroid.y + half < toY || asteroid.y - half > fromY) {
      continue;
    }

    const entry = Math.min(fromY, asteroid.y + half);
    if (entry > bestEntry) {
      bestEntry = entry;
      best = i;
    }
  }

  return best;
}

function getLaserTopY(beam: LaserBeam, asteroids: Asteroid[]): number {
  let topY = 0;

  for (const asteroid of asteroids) {
    if (!asteroid.active || asteroid.type !== AsteroidType.IRON) {
      continue;
    }

    // The part of the iron asteroid's outline inside the beam's column
    const span = getAsteroidSpanInBeam(asteroid, beam);
    const isBelowEmitter = span !== null && span.minY > beam.bottomY; // already flew past the ship
    if (!span || isBelowEmitter) {
      continue;
    }

    // The beam stops at the lowest point of that part
    topY = Math.max(topY, Math.min(span.maxY, beam.bottomY));
  }

  return topY;
}
