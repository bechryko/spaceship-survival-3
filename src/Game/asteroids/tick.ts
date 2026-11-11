import { GAME_HEIGHT, GameState } from '../hud';
import { SHIP_HULL } from '../spaceships';
import { boundingRadius, polygonsCollide, transformPolygon } from '../utils';
import { ASTEROID_SPAWN_TIME } from './constants';
import { createAsteroid } from './create';

export function tickAsteroids(state: GameState, deltaTime: number): { hit: boolean } {
  state.spawnTimer -= deltaTime;

  if (state.spawnTimer <= 0) {
    spawnAsteroid(state);
    console.log(state.asteroids.length, state.asteroids.filter(a => a.active).length);
  }

  for (const asteroid of state.asteroids.filter(a => a.active)) {
    asteroid.y += asteroid.velocity * deltaTime;

    const { player } = state;
    const lx = asteroid.x - player.x;
    const ly = asteroid.y - player.y;

    const hit =
      Math.hypot(lx, ly) <= boundingRadius(SHIP_HULL) + asteroid.r &&
      polygonsCollide(SHIP_HULL, transformPolygon(asteroid.shape.points, asteroid.r, asteroid.angle, lx, ly));
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
    createAsteroid(state.score, inactiveAsteroid);
  } else {
    state.asteroids.push(createAsteroid(state.score));
  }

  state.score++;
  state.spawnTimer = ASTEROID_SPAWN_TIME;
}
