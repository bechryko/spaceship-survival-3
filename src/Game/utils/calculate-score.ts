import { GameState } from '../hud';

const ASTEROID_DESTROY_SCORE = 2;
const ABILITY_USE_SCORE = -1;
const KNOWLEDGE_SCORE_BULK = 15;
const KNOWLEDGE_SCORE_AMOUNT = 2;

export function calculateScore(state: GameState): number {
  const { statistics, players } = state;

  const scoreFromAsteroidSpawning = statistics.asteroidsSpawned;
  const scoreFromAsteroidsDestroyed = statistics.asteroidsDestroyed * ASTEROID_DESTROY_SCORE;
  const scoreFromAbilitiesUsed = statistics.abilitiesUsed * ABILITY_USE_SCORE;

  let scoreFromKnowledge = 0;
  players.forEach(player => {
    scoreFromKnowledge += Math.floor(player.asteroidKnowledge / KNOWLEDGE_SCORE_BULK) * KNOWLEDGE_SCORE_AMOUNT;
  });

  return scoreFromAsteroidSpawning + scoreFromAsteroidsDestroyed + scoreFromAbilitiesUsed + scoreFromKnowledge;
}
