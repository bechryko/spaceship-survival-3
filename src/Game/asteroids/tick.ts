import { GAME_HEIGHT, GAME_WIDTH, GameState } from '../hud';
import { isSpaceshipImmune } from '../spaceships';
import { between, boundingRadius, clamp01, polygonsCollide, transformPolygon } from '../utils';
import { Asteroid, AsteroidType } from './asteroid';
import {
  createIceShardBlueprint,
  ICE_ASTEROID_MAX_BREAK_OFF_TIME,
  ICE_ASTEROID_MIN_BREAK_OFF_TIME
} from './blueprints';
import { AsteroidCreationModifiers, createAsteroid } from './create';
import { destroyAsteroid } from './destroy';

const ICE_ASTEROID_ICE_SHARD_MIN_VELOCITY = 45;
const ICE_ASTEROID_ICE_SHARD_MAX_VELOCITY = 75;

export function tickAsteroids(state: GameState, deltaTime: number): { hit: boolean } {
  state.spawnTimer.timer += deltaTime;

  if (state.spawnTimer.timer >= state.spawnTimer.spawnTime) {
    spawnAsteroid(state);
  }

  for (const asteroid of state.asteroids.filter(a => a.active)) {
    asteroid.y += asteroid.velocity * deltaTime;
    asteroid.x += asteroid.velocityHorizontal * deltaTime;

    const { player } = state;
    const { hitbox } = player.shape;
    const lx = asteroid.x - player.x;
    const ly = asteroid.y - player.y;

    const hit =
      Math.hypot(lx, ly) <= boundingRadius(hitbox) + asteroid.r &&
      polygonsCollide(hitbox, transformPolygon(asteroid.shape, asteroid.r, asteroid.angle, lx, ly));
    if (hit) {
      if (isSpaceshipImmune(player, asteroid)) {
        destroyAsteroid(asteroid, state);
      } else {
        return { hit: true };
      }
    }

    if (asteroid.type === AsteroidType.ICE) {
      asteroid.data.iceShardBreakOffTimer! = Math.max(0, asteroid.data.iceShardBreakOffTimer! - deltaTime);

      if (asteroid.data.iceShardBreakOffTimer! === 0) {
        asteroid.data.iceShardBreakOffTimer! = between(
          ICE_ASTEROID_MIN_BREAK_OFF_TIME,
          ICE_ASTEROID_MAX_BREAK_OFF_TIME,
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
          between(ICE_ASTEROID_ICE_SHARD_MIN_VELOCITY, ICE_ASTEROID_ICE_SHARD_MAX_VELOCITY),
          angle
        );
      }
    }
  }

  state.asteroids
    .filter(asteroid => asteroid.active)
    .filter(
      asteroid =>
        (asteroid.x < -asteroid.r && asteroid.velocityHorizontal <= 0) ||
        (asteroid.x > GAME_WIDTH + asteroid.r && asteroid.velocityHorizontal >= 0) ||
        (asteroid.y < -asteroid.r && asteroid.velocity <= 0) ||
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
  state.spawnTimer.spawnTime = getAsteroidSpawnTimer(state.statistics.asteroidsSpawned);
  state.spawnTimer.timer = 0;

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

const SPAWN_SLOW_THRESHOLD = 50;
const SPAWN_FAST_THRESHOLD = 75;
const SPAWN_SLOW_INTERVAL = 1;
const SPAWN_FAST_INTERVAL = 0.75;

function getAsteroidSpawnTimer(asteroidsSpawned: number): number {
  const progress = (asteroidsSpawned - SPAWN_SLOW_THRESHOLD) / (SPAWN_FAST_THRESHOLD - SPAWN_SLOW_THRESHOLD);
  return SPAWN_SLOW_INTERVAL + (SPAWN_FAST_INTERVAL - SPAWN_SLOW_INTERVAL) * clamp01(progress);
}
