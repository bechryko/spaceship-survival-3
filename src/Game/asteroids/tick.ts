import { GAME_HEIGHT, GameState } from '../hud';
import { SHIP_HULL } from '../spaceships';
import { between, boundingRadius, polygonsCollide, transformPolygon } from '../utils';
import { AsteroidType } from './asteroid';
import {
  createIceShardBlueprint,
  ICY_ASTEROID_MAX_BREAK_OFF_TIME,
  ICY_ASTEROID_MIN_BREAK_OFF_TIME
} from './blueprints';
import { AsteroidCreationModifiers, createAsteroid } from './create';

export const ICY_ASTEROID_ICE_SHARD_VELOCITY = 75;

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
      return { hit: true };
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
        spawnAsteroid(state, {
          blueprint: createIceShardBlueprint(asteroid),
          x: asteroid.x + Math.cos(angle) * asteroid.r * 0.8,
          y: asteroid.y + Math.sin(angle) * asteroid.r * 0.8,
          velocity: asteroid.velocity + Math.sin(angle) * ICY_ASTEROID_ICE_SHARD_VELOCITY,
          velocityHorizontal: Math.cos(angle) * ICY_ASTEROID_ICE_SHARD_VELOCITY,
          notPrimaryAsteroid: true
        });
      }
    }
  }

  state.asteroids
    .filter(a => a.active)
    .filter(a => a.y - a.r > GAME_HEIGHT)
    .forEach(a => {
      a.active = false;
    });

  return { hit: false };
}

export function spawnAsteroid(state: GameState, creationModifiers: AsteroidCreationModifiers = {}): void {
  const inactiveAsteroid = state.asteroids.find(a => !a.active);
  if (inactiveAsteroid) {
    createAsteroid(state, creationModifiers, inactiveAsteroid);
  } else {
    state.asteroids.push(createAsteroid(state, creationModifiers));
  }

  state.statistics.asteroidsSpawned++;
  state.spawnTimer = getAsteroidSpawnTimer(state.statistics.asteroidsSpawned);
}

const SPAWN_SLOW_SCORE = 25;
const SPAWN_FAST_SCORE = 100;
const SPAWN_SLOW_INTERVAL = 1;
const SPAWN_FAST_INTERVAL = 0.5;

function getAsteroidSpawnTimer(score: number) {
  const progress = (score - SPAWN_SLOW_SCORE) / (SPAWN_FAST_SCORE - SPAWN_SLOW_SCORE);
  const t = Math.min(1, Math.max(0, progress));
  return SPAWN_SLOW_INTERVAL + (SPAWN_FAST_INTERVAL - SPAWN_SLOW_INTERVAL) * t;
}
