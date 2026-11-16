import { GAME_HEIGHT, GAME_WIDTH, GameState } from '../hud';
import { isSpaceshipImmune, SHIP_HULL } from '../spaceships';
import { between, boundingRadius, polygonsCollide, transformPolygon } from '../utils';
import { Asteroid, AsteroidType } from './asteroid';
import {
  createIceShardBlueprint,
  ICY_ASTEROID_MAX_BREAK_OFF_TIME,
  ICY_ASTEROID_MIN_BREAK_OFF_TIME
} from './blueprints';
import { AsteroidCreationModifiers, createAsteroid } from './create';
import { destroyAsteroid } from './destroy';

const ICY_ASTEROID_ICE_SHARD_MIN_VELOCITY = 45;
const ICY_ASTEROID_ICE_SHARD_MAX_VELOCITY = 75;

export function tickAsteroids(state: GameState, deltaTime: number): { hit: boolean } {
  state.spawnTimer -= deltaTime;

  if (state.spawnTimer <= 0) {
    spawnAsteroid(state);
  }

  for (const asteroid of state.asteroids.filter(a => a.active)) {
    asteroid.y += asteroid.velocity * deltaTime;
    asteroid.x += asteroid.velocityHorizontal * deltaTime;

    const { player } = state;
    const lx = asteroid.x - player.x;
    const ly = asteroid.y - player.y;

    const hit =
      Math.hypot(lx, ly) <= boundingRadius(SHIP_HULL) + asteroid.r &&
      polygonsCollide(SHIP_HULL, transformPolygon(asteroid.shape, asteroid.r, asteroid.angle, lx, ly));
    if (hit) {
      if (isSpaceshipImmune(player) && asteroid.type !== AsteroidType.IRON) {
        destroyAsteroid(asteroid, state);
      } else {
        return { hit: true };
      }
    }

    if (asteroid.type === AsteroidType.ICY) {
      asteroid.data.iceShardBreakOffTimer! = Math.max(0, asteroid.data.iceShardBreakOffTimer! - deltaTime);

      if (asteroid.data.iceShardBreakOffTimer! === 0) {
        asteroid.data.iceShardBreakOffTimer! = between(
          ICY_ASTEROID_MIN_BREAK_OFF_TIME,
          ICY_ASTEROID_MAX_BREAK_OFF_TIME,
          { floor: false }
        );

        const angle = Math.random() * Math.PI * 2;
        const iceShard = spawnAsteroid(state, {
          blueprint: createIceShardBlueprint(asteroid),
          x: asteroid.x,
          y: asteroid.y,
          velocity: asteroid.velocity,
          notPrimaryAsteroid: true
        });
        pushAsteroid(
          iceShard,
          between(ICY_ASTEROID_ICE_SHARD_MIN_VELOCITY, ICY_ASTEROID_ICE_SHARD_MAX_VELOCITY),
          angle
        );
      }
    }
  }

  state.asteroids
    .filter(asteroid => asteroid.active)
    .filter(
      asteroid =>
        asteroid.x < -asteroid.r ||
        asteroid.x > GAME_WIDTH + asteroid.r ||
        asteroid.y < -asteroid.r ||
        asteroid.y > GAME_HEIGHT + asteroid.r
    )
    .forEach(a => {
      a.active = false;
    });

  return { hit: false };
}

export function spawnAsteroid(state: GameState, creationModifiers: AsteroidCreationModifiers = {}): Asteroid {
  const inactiveAsteroid = state.asteroids.find(a => !a.active);
  let asteroid: Asteroid;

  if (inactiveAsteroid) {
    asteroid = createAsteroid(state, creationModifiers, inactiveAsteroid);
  } else {
    asteroid = createAsteroid(state, creationModifiers);
    state.asteroids.push(asteroid);
  }

  state.statistics.asteroidsSpawned++;
  state.spawnTimer = getAsteroidSpawnTimer(state.statistics.asteroidsSpawned);

  return asteroid;
}

const IRON_ASTEROID_PUSH_FORCE_MULTIPLIER = 0.25;

export function pushAsteroid(asteroid: Asteroid, force: number, angle: number): void {
  if (asteroid.type === AsteroidType.IRON) {
    force *= IRON_ASTEROID_PUSH_FORCE_MULTIPLIER;
  }

  asteroid.velocity += Math.sin(angle) * force;
  asteroid.velocityHorizontal += Math.cos(angle) * force;
}

const SPAWN_SLOW_SCORE = 25;
const SPAWN_FAST_SCORE = 100;
const SPAWN_SLOW_INTERVAL = 1;
const SPAWN_FAST_INTERVAL = 0.5;

function getAsteroidSpawnTimer(score: number): number {
  const progress = (score - SPAWN_SLOW_SCORE) / (SPAWN_FAST_SCORE - SPAWN_SLOW_SCORE);
  const t = Math.min(1, Math.max(0, progress));
  return SPAWN_SLOW_INTERVAL + (SPAWN_FAST_INTERVAL - SPAWN_SLOW_INTERVAL) * t;
}
