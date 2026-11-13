import { GAME_HEIGHT, GameState } from '../hud';
import { SHIP_HULL } from '../spaceships';
import { boundingRadius, polygonsCollide, transformPolygon } from '../utils';
import { createAsteroid } from './create';

export function tickAsteroids(state: GameState, deltaTime: number): { hit: boolean } {
  state.spawnTimer -= deltaTime;

  if (state.spawnTimer <= 0) {
    spawnAsteroid(state);
  }

  for (const asteroid of state.asteroids.filter(a => a.active)) {
    asteroid.y += asteroid.velocity * deltaTime;

    const { player } = state;
    const lx = asteroid.x - player.x;
    const ly = asteroid.y - player.y;

    const hit =
      Math.hypot(lx, ly) <= boundingRadius(SHIP_HULL) + asteroid.r &&
      polygonsCollide(SHIP_HULL, transformPolygon(asteroid.shape, asteroid.r, asteroid.angle, lx, ly));
    if (hit) {
      return { hit: true };
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

function spawnAsteroid(state: GameState): void {
  const inactiveAsteroid = state.asteroids.find(a => !a.active);
  if (inactiveAsteroid) {
    createAsteroid(state.statistics.asteroidsSpawned, inactiveAsteroid);
  } else {
    state.asteroids.push(createAsteroid(state.statistics.asteroidsSpawned));
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
