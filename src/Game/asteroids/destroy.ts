import { explode } from '../entities';
import { GameState } from '../hud';
import { between } from '../utils';
import { Asteroid, AsteroidType } from './asteroid';
import { createIceShardBlueprint } from './blueprints';
import { ICY_ASTEROID_ICE_SHARD_VELOCITY, spawnAsteroid } from './tick';

const ICY_ASTEROID_MIN_SHARD_RELEASE = 4;
const ICY_ASTEROID_MAX_SHARD_RELEASE = 7;

const ASTEROID_TYPES_NOT_COUNTING_TOWARDS_STATISTICS = [AsteroidType.ICE_SHARD];

export function destroyAsteroid(asteroid: Asteroid, state: GameState, explosionRadiusMultiplier: number): boolean {
  if (asteroid.type === AsteroidType.IRON) {
    return false;
  }

  explode(state, asteroid.x, asteroid.y, asteroid.r * explosionRadiusMultiplier);

  const { asteroids } = state;
  asteroids.splice(
    asteroids.findIndex(a => a === asteroid),
    1
  );

  if (!ASTEROID_TYPES_NOT_COUNTING_TOWARDS_STATISTICS.includes(asteroid.type)) {
    state.statistics.asteroidsDestroyed++;
  }

  if (asteroid.type === AsteroidType.ICY) {
    for (let i = 0; i < between(ICY_ASTEROID_MIN_SHARD_RELEASE, ICY_ASTEROID_MAX_SHARD_RELEASE); i++) {
      const angle = Math.random() * Math.PI * 2;
      const distanceMultiplier = between(0, 1, { squaredDistribution: true, floor: false });
      const distance = asteroid.r * distanceMultiplier;

      spawnAsteroid(state, {
        blueprint: createIceShardBlueprint(asteroid),
        x: asteroid.x + Math.cos(angle) * distance,
        y: asteroid.y + Math.sin(angle) * distance,
        velocity: asteroid.velocity + Math.sin(angle) * ICY_ASTEROID_ICE_SHARD_VELOCITY * distanceMultiplier,
        velocityHorizontal: Math.cos(angle) * ICY_ASTEROID_ICE_SHARD_VELOCITY * distanceMultiplier,
        notPrimaryAsteroid: true
      });
    }
  }

  return true;
}
