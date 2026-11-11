import { GAME_HEIGHT, GameState } from '../hud';
import { SHIP_HULL } from '../spaceships';
import { boundingRadius, polygonsCollide, transformPolygon } from '../utils';
import { ASTEROID_SPAWN_TIME } from './constants';
import { createAsteroid } from './create';

export function tickAsteroids(state: GameState, deltaTime: number): { hit: boolean } {
  // Spawn asteroids – faster as the score climbs
  state.spawnTimer -= deltaTime;
  if (state.spawnTimer <= 0) {
    state.asteroids.push(createAsteroid(state.score));
    state.score++;
    state.spawnTimer = ASTEROID_SPAWN_TIME;
  }

  // Move asteroids, cull off-screen, check collisions
  for (const rock of state.asteroids) {
    rock.y += rock.velocity * deltaTime;

    const { player } = state;
    const lx = rock.x - player.x;
    const ly = rock.y - player.y;

    // Test in the ship's local space so the hull polygon never needs re-translating
    const hit =
      Math.hypot(lx, ly) <= boundingRadius(SHIP_HULL) + rock.r &&
      polygonsCollide(SHIP_HULL, transformPolygon(rock.shape.points, rock.r, rock.angle, lx, ly));
    if (hit) {
      return { hit: true };
    }
  }
  state.asteroids = state.asteroids.filter(r => r.y - r.r < GAME_HEIGHT);

  return { hit: false };
}
