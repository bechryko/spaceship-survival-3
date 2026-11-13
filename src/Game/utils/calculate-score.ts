import { GameStatistics } from '../hud';

const ASTEROID_DESTROY_SCORE = 2;
const ABILITY_USE_SCORE = -1;

export function calculateScore(statistics: GameStatistics): number {
  const scoreFromAsteroidSpawning = statistics.asteroidsSpawned;
  const scoreFromAsteroidsDestroyed = statistics.asteroidsDestroyed * ASTEROID_DESTROY_SCORE;
  const scoreFromAbilitiesUsed = statistics.abilitiesUsed * ABILITY_USE_SCORE;

  return scoreFromAsteroidSpawning + scoreFromAsteroidsDestroyed + scoreFromAbilitiesUsed;
}
