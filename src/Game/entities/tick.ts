import { Asteroid, AsteroidType, destroyAsteroid, getAsteroidPolygon, pushAsteroid } from '../asteroids';
import { GAME_HEIGHT, GameState } from '../hud';
import { Point } from '../models';
import { AbilityAlmanac, AbilityClass, SpecialAbilityAlmanac, SpecialAbilityName } from '../spaceships';
import { chance, clamp, clamp01, easeOutCubic, isAboveScreen, polygonsCollide, randomAngle } from '../utils';
import { explode } from './create';
import {
  Bomb,
  EntityType,
  Explosion,
  Laser,
  PlasmaJet,
  Rocket,
  ScienceProbe,
  ShieldTunnel,
  Shockwave
} from './entities';
import {
  findFirstContact,
  getAsteroidSpanInBeam,
  getDistanceToAsteroid,
  isAsteroidHitByLaser,
  isAsteroidTouchingRect,
  LaserBeam
} from './hit-tests';

export const EXPLOSION_DURATION = 0.6;

export function tickEntities(state: GameState, deltaTime: number): void {
  for (const entity of state.entities) {
    if (!entity.active) {
      continue;
    }

    switch (entity.type) {
      case EntityType.ROCKET:
        tickRocket(entity, deltaTime, state);
        break;
      case EntityType.LASER:
        tickLaser(entity, deltaTime, state);
        break;
      case EntityType.EXPLOSION:
        tickExplosion(entity, deltaTime);
        break;
      case EntityType.BOMB:
        tickBomb(entity, state, deltaTime);
        break;
      case EntityType.SCIENCE_PROBE:
        tickScienceProbe(entity, state, deltaTime);
        break;
      case EntityType.SHOCKWAVE:
        tickShockwave(entity, state, deltaTime);
        break;
      case EntityType.PLASMA_JET:
        tickPlasmaJet(entity, state, deltaTime);
        break;
      case EntityType.SHIELD_TUNNEL:
        tickShieldTunnel(entity, state, deltaTime);
        break;
    }
  }
}

const ROCKET_RADIUS = 5;
const ROCKET_EXPLOSION_RADIUS_MULTIPLIER = 1.25;
const ROCKET_POWERFUL_EXPLOSION_RADIUS_MULTIPLIER = 1.75;
const ROCKET_POWERFUL_EXPLOSION_COLOR = '#7dffbe';
const ROCKET_UNSUCCESSFUL_EXPLOSION_RADIUS = 90;
const ROCKET_POWERFUL_UNSUCCESSFUL_EXPLOSION_RADIUS = 135;
const ROCKET_POWERFUL_PUSH_FORCE = 600;

function tickRocket(rocket: Rocket, deltaTime: number, state: GameState): void {
  const { asteroids } = state;
  const fromY = rocket.y;
  rocket.y -= rocket.speed * deltaTime;

  const contact = findFirstContact(rocket.x, fromY, rocket.y, ROCKET_RADIUS, asteroids);
  if (contact) {
    const target = asteroids[contact.index];
    const explosionRadiusMultiplier = rocket.isPowerful
      ? ROCKET_POWERFUL_EXPLOSION_RADIUS_MULTIPLIER
      : ROCKET_EXPLOSION_RADIUS_MULTIPLIER;
    const explosionColor = rocket.isPowerful ? ROCKET_POWERFUL_EXPLOSION_COLOR : undefined;

    const success = destroyAsteroid(target, state, explosionRadiusMultiplier, explosionColor);
    rocket.active = false;

    if (!success) {
      const explosionRadius = rocket.isPowerful
        ? ROCKET_POWERFUL_UNSUCCESSFUL_EXPLOSION_RADIUS
        : ROCKET_UNSUCCESSFUL_EXPLOSION_RADIUS;

      explode(state, rocket.x, contact.y, explosionRadius, explosionColor);

      if (rocket.isPowerful) {
        const dx = target.x - rocket.x;
        const dy = target.y - rocket.y;
        const originalAngle = Math.atan2(dy, dx) - Math.PI / 2;
        const angle = originalAngle <= Math.PI ? originalAngle / 2 : Math.PI + originalAngle / 2;

        pushAsteroid(target, ROCKET_POWERFUL_PUSH_FORCE, angle);
      }
    }
  } else if (rocket.y < -30) {
    rocket.active = false;
  }
}

const LASER_EXPLOSION_RADIUS_MULTIPLIER = 1.1;

function tickLaser(laser: Laser, deltaTime: number, state: GameState): void {
  if (!laser.owner.alive) {
    laser.active = false;
    return;
  }

  const laserStats = AbilityAlmanac[AbilityClass.GUNSHIP].e;

  laser.timeLeft = Math.max(0, laser.timeLeft - deltaTime);

  const beam: LaserBeam = {
    x: laser.owner.x + laserStats.sideXOffset,
    width: laser.width,
    bottomY: laser.owner.y + laserStats.launchYOffset
  };
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
    laser.active = false;
  }
}

function tickExplosion(explosion: Explosion, deltaTime: number): void {
  explosion.age += deltaTime;

  if (explosion.age >= EXPLOSION_DURATION) {
    explosion.active = false;
  }
}

function tickBomb(bomb: Bomb, state: GameState, deltaTime: number): void {
  const bombStats = SpecialAbilityAlmanac[SpecialAbilityName.BOMB];

  const fromY = bomb.y;
  bomb.y -= Number(bombStats.speed) * deltaTime;
  bomb.age += deltaTime;

  const contact = findFirstContact(bomb.x, fromY, bomb.y, bomb.r, state.asteroids);
  if (contact) {
    bomb.y = contact.y;
    destroyAsteroid(state.asteroids[contact.index], state);

    detonateBomb(state, bomb);
  } else if (bomb.age >= bomb.explosionTime) {
    detonateBomb(state, bomb);
  }
}

const PROBE_ATTACH_RADIUS = 15;
const PROBE_ACCELERATION = 200;
const PROBE_KNOWLEDGE_GIVER_ASTEROIDS = new Set([AsteroidType.REGULAR, AsteroidType.ICE, AsteroidType.IRON]);

function tickScienceProbe(probe: ScienceProbe, state: GameState, deltaTime: number): void {
  const probeStats = AbilityAlmanac[AbilityClass.SCIENTIST].q;

  if (probe.currentSpeed !== probe.targetSpeed) {
    const dSpeedSign = Math.sign(probe.targetSpeed - probe.currentSpeed);
    probe.currentSpeed += Math.sign(probe.targetSpeed - probe.currentSpeed) * PROBE_ACCELERATION * deltaTime;

    if (Math.sign(probe.targetSpeed - probe.currentSpeed) !== dSpeedSign) {
      probe.currentSpeed = probe.targetSpeed;
    }
  }

  if (probe.y > GAME_HEIGHT + probeStats.radius + (probe.target?.r ?? 0)) {
    probe.active = false;
  }

  switch (probe.phase) {
    case 'flying': {
      probe.targetSpeed = probe.flySpeed;

      const fromY = probe.y;
      probe.y -= probe.flySpeed * deltaTime;
      probe.currentSpeed += deltaTime;
      probe.flightTime += deltaTime;

      const contact = findFirstContact(probe.x, fromY, probe.y, probeStats.radius, state.asteroids);
      if (contact) {
        probe.phase = 'transfer';
        probe.target = state.asteroids[contact.index];
      } else if (probe.flightTime >= probeStats.maxFlightTime || probe.y < -40) {
        probe.phase = 'lost';
        probe.lostTime = 0;
      }
      break;
    }

    case 'transfer': {
      probe.targetSpeed = probe.transferSpeed;

      const target = probe.target;
      if (!target || !target.active) {
        chainProbe(probe, state.asteroids);
        break;
      }

      if ((probe.x - target.x) ** 2 + (probe.y - target.y) ** 2 <= (probeStats.radius + PROBE_ATTACH_RADIUS) ** 2) {
        attachProbe(probe, target, state);
        break;
      }

      const dx = target.x - probe.x;
      const dy = target.y - probe.y;
      const length = Math.hypot(dx, dy) || 1;
      probe.direction = [dx / length, dy / length];
      const step = Math.min(probe.currentSpeed * deltaTime, length);
      probe.x += probe.direction[0] * step;
      probe.y += probe.direction[1] * step;
      break;
    }

    case 'analyzing': {
      const target = probe.target;
      if (!target || !target.active) {
        chainProbe(probe, state.asteroids);
        break;
      }

      [probe.x, probe.y] = fromAsteroidSpace(target, probe.attach); // ride along with the asteroid
      probe.analysisProgress += deltaTime;

      if (probe.analysisProgress >= probe.analysisTime) {
        target.data.isAnalyzed = true;
        destroyAsteroid(target, state);

        if (PROBE_KNOWLEDGE_GIVER_ASTEROIDS.has(target.type)) {
          probe.owner.asteroidKnowledge++;
        }

        chainProbe(probe, state.asteroids, target.r);
      }
      break;
    }

    case 'lost': {
      probe.lostTime += deltaTime;
      if (probe.lostTime >= probeStats.lostFadeTime) {
        probe.active = false;
      }
      break;
    }
  }
}

function tickShockwave(wave: Shockwave, state: GameState, deltaTime: number): void {
  wave.radius += wave.speed * deltaTime;

  for (const asteroid of state.asteroids) {
    if (!asteroid.active || isAboveScreen(asteroid)) {
      continue;
    }

    if (Math.hypot(asteroid.x - wave.x, asteroid.y - wave.y) - asteroid.r <= wave.radius) {
      wave.contactCallback(wave, asteroid);
    }
  }

  if (wave.radius >= wave.maxRadius) {
    wave.active = false;
  }
}

function tickPlasmaJet(plasmaJet: PlasmaJet, state: GameState, deltaTime: number): void {
  if (!plasmaJet.owner.alive) {
    plasmaJet.active = false;
    return;
  }

  const plasmaJetStats = AbilityAlmanac[AbilityClass.SCIENTIST].e;

  if (plasmaJet.isActivated) {
    plasmaJet.usedTime = Math.min(plasmaJetStats.activeTime, plasmaJet.usedTime + deltaTime);
    if (plasmaJet.usedTime >= plasmaJetStats.activeTime) {
      plasmaJet.isActivated = false;
    }
  }

  const ramp = plasmaJet.isActivated ? deltaTime / plasmaJetStats.rampIn : -deltaTime / plasmaJetStats.rampOut;
  plasmaJet.intensity = clamp01(plasmaJet.intensity + ramp);

  if (plasmaJet.intensity > 0) {
    const spaceship = plasmaJet.owner;

    plasmaJet.affected.length = 0;

    const range = plasmaJetStats.range * easeOutCubic(plasmaJet.intensity);
    if (range < 1) {
      return;
    }

    const nozzleY = spaceship.y - plasmaJetStats.noseOffset;
    const jet = getJetShape(plasmaJet, range);

    for (const asteroid of state.asteroids) {
      if (!asteroid.active) {
        continue;
      }

      // Quick rejection before the exact test: the outline stays within about 1.05 radii of the centre
      const bound = asteroid.r * 1.05;
      const farEdgeDistance = clamp(nozzleY - (asteroid.y - bound), 0, range);
      if (
        asteroid.y - bound > nozzleY ||
        asteroid.y + bound < nozzleY - range ||
        Math.abs(asteroid.x - spaceship.x) >
          plasmaJetStats.nozzleHalfWidth + farEdgeDistance * Math.tan(plasmaJetStats.halfAngle) + bound
      ) {
        continue;
      }

      if (!polygonsCollide(getAsteroidPolygon(asteroid), jet)) {
        continue;
      }

      // Backward push
      const along = clamp01((nozzleY - asteroid.y) / range);
      const strength = plasmaJet.intensity * (1 - plasmaJetStats.falloff * along);
      const inertia = clamp(
        asteroid.r / plasmaJetStats.referenceRadius,
        plasmaJetStats.minInertia,
        plasmaJetStats.maxInertia
      );
      asteroid.velocity -= ((plasmaJetStats.backAcceleration * strength) / inertia) * deltaTime;

      // Sideways push
      const dx = asteroid.x - spaceship.x;
      const side = dx === 0 ? (chance() ? 1 : -1) : Math.sign(dx);
      const push = ((plasmaJetStats.sideAcceleration * strength) / inertia) * deltaTime;
      asteroid.velocityHorizontal += side * push;

      plasmaJet.affected.push(asteroid);
    }
  } else if (!plasmaJet.isActivated) {
    plasmaJet.active = false;
  }
}

export const SHIELD_TUNNEL_Y_MARGIN = 15;
export const SHIELD_TUNNEL_HEIGHT = 100;
export const SHIELD_TUNNEL_SHATTER_DURATION = 0.7;
export const SHIELD_TUNNEL_CORNER_RADIUS = 10;

function tickShieldTunnel(shieldTunnel: ShieldTunnel, state: GameState, deltaTime: number): void {
  if (shieldTunnel.shatter) {
    shieldTunnel.shatter.age += deltaTime;
    if (shieldTunnel.shatter.age >= SHIELD_TUNNEL_SHATTER_DURATION) {
      shieldTunnel.active = false;
    }
    return;
  }

  shieldTunnel.age += deltaTime;
  if (shieldTunnel.age >= shieldTunnel.duration) {
    shieldTunnel.active = false;
    return;
  }

  let hitByIron: { x: number; y: number } | null = null;

  // A copy of the list: destroying an asteroid can add new ones (the pieces of an icy asteroid)
  for (const asteroid of [...state.asteroids]) {
    const bottom = GAME_HEIGHT - SHIELD_TUNNEL_Y_MARGIN;
    const top = bottom - SHIELD_TUNNEL_HEIGHT;

    if (
      !asteroid.active ||
      !isAsteroidTouchingRect(asteroid, shieldTunnel.x1, top, shieldTunnel.x2, bottom, SHIELD_TUNNEL_CORNER_RADIUS)
    ) {
      continue;
    }

    if (asteroid.type === AsteroidType.IRON) {
      hitByIron ??= {
        x: Math.min(shieldTunnel.x2, Math.max(shieldTunnel.x1, asteroid.x)),
        y: Math.min(bottom, Math.max(top, asteroid.y))
      };
    } else {
      destroyAsteroid(asteroid, state);
    }
  }

  if (hitByIron) {
    shieldTunnel.shatter = { ...hitByIron, age: 0 };
  }
}

// =====================================================================================
// Helper functions
// =====================================================================================

const BOMB_BLAST_RADIUS = 150;
const BOMB_BLAST_SPEED = 200;
const BOMB_BLAST_MIN_SPEED_MULTIPLIER = 0.2;

export function detonateBomb(state: GameState, bomb: Bomb): void {
  const { x, y } = bomb;

  for (const asteroid of state.asteroids) {
    if (!asteroid.active) {
      continue;
    }

    const dx = asteroid.x - x;
    const dy = asteroid.y - y;
    const isBombClose = dx ** 2 + dy ** 2 <= bomb.r ** 2;

    const edgeDistance = getDistanceToAsteroid(asteroid, x, y);
    if (edgeDistance > BOMB_BLAST_RADIUS) {
      continue;
    }

    const strength = 1 - (edgeDistance / BOMB_BLAST_RADIUS) * (1 - BOMB_BLAST_MIN_SPEED_MULTIPLIER);
    const angle = isBombClose ? randomAngle() : Math.atan2(dy, dx);
    pushAsteroid(asteroid, BOMB_BLAST_SPEED * strength, angle);
  }

  explode(state, x, y, BOMB_BLAST_RADIUS);

  bomb.owner.abilities.r.activeTimer = 0;
  bomb.active = false;
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

function attachProbe(probe: ScienceProbe, asteroid: Asteroid, state: GameState): void {
  if (
    asteroid.data.isAnalyzed ||
    state.entities.find(e => e.active && e !== probe && e.type === EntityType.SCIENCE_PROBE && e.target === asteroid)
  ) {
    chainProbe(probe, state.asteroids, asteroid.r);
    return;
  }

  const probeStats = AbilityAlmanac[AbilityClass.SCIENTIST].q;

  probe.phase = 'analyzing';
  probe.target = asteroid;
  probe.analysisProgress = 0;
  probe.analysisTime =
    probeStats.minAnalysisTime +
    clamp01(
      (asteroid.r - probeStats.minAnalysisTimeAsteroidSize) /
        (probeStats.maxAnalysisTimeAsteroidSize - probeStats.minAnalysisTimeAsteroidSize)
    ) *
      (probeStats.maxAnalysisTime - probeStats.minAnalysisTime);
  probe.attach = toAsteroidSpace(asteroid, [probe.x, probe.y]);
}

function chainProbe(probe: ScienceProbe, asteroids: Asteroid[], previousTargetR = 0): void {
  const bests: Array<Asteroid | null> = [null, null];
  const bestDistances = [Infinity, Infinity];

  for (const asteroid of asteroids) {
    if (!asteroid.active || asteroid.data.isAnalyzed) {
      continue;
    }

    const distance = getDistanceToAsteroid(asteroid, probe.x, probe.y);
    const isWithinRange = distance <= AbilityAlmanac[AbilityClass.SCIENTIST].q.chainRange + previousTargetR;
    if (asteroid.y < probe.y && isWithinRange && distance < bestDistances[0]) {
      bests[0] = asteroid;
      bestDistances[0] = distance;
    }
    if (asteroid.y >= probe.y && isWithinRange && distance < bestDistances[1]) {
      bests[1] = asteroid;
      bestDistances[1] = distance;
    }
  }

  if (bests[0]) {
    probe.phase = 'transfer';
    probe.target = bests[0];
  } else if (bests[1]) {
    probe.phase = 'transfer';
    probe.target = bests[1];
  } else {
    probe.phase = 'lost';
    delete probe.target;
    probe.lostTime = 0;
  }
}

function fromAsteroidSpace(asteroid: Asteroid, [ux, uy]: Point): Point {
  const cos = Math.cos(asteroid.angle);
  const sin = Math.sin(asteroid.angle);
  return [asteroid.x + (ux * cos - uy * sin) * asteroid.r, asteroid.y + (ux * sin + uy * cos) * asteroid.r];
}

/** A point on an asteroid, as unit-space coordinates that stay valid as it moves and turns. */
function toAsteroidSpace(asteroid: Asteroid, [x, y]: Point): Point {
  const dx = x - asteroid.x;
  const dy = y - asteroid.y;
  const cos = Math.cos(asteroid.angle);
  const sin = Math.sin(asteroid.angle);

  return [(dx * cos + dy * sin) / asteroid.r, (-dx * sin + dy * cos) / asteroid.r];
}

/** The jet as a four-sided shape in game coordinates, narrow at the nozzle and widening forward. */
function getJetShape(plasmaJet: PlasmaJet, range: number): Point[] {
  const plasmaJetStats = AbilityAlmanac[AbilityClass.SCIENTIST].e;
  const spaceship = plasmaJet.owner;
  const nozzleY = spaceship.y - plasmaJetStats.noseOffset;
  const endHalfWidth = plasmaJetStats.nozzleHalfWidth + range * Math.tan(plasmaJetStats.halfAngle);

  return [
    [spaceship.x - plasmaJetStats.nozzleHalfWidth, nozzleY],
    [spaceship.x + plasmaJetStats.nozzleHalfWidth, nozzleY],
    [spaceship.x + endHalfWidth, nozzleY - range],
    [spaceship.x - endHalfWidth, nozzleY - range]
  ];
}
