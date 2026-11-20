import { GameState } from '../hud';
import { DifficultyNoticeState } from './create';

export function tickGlobalEffects(state: GameState, deltaTime: number): void {
  const { globalEffects } = state;

  tickDifficultyNotices(globalEffects.difficultyNotice, state.statistics.asteroidsSpawned, deltaTime);
}

const DIFFICULTY_INTERVAL = 25;
const DIFFICULTY_MESSAGES = [
  'Level 2 asteroids incoming!',
  'Asteroid activity is increasing!',
  'More Level 2 asteroids approaching!',
  'Space is quiet... for now.',
  'Double asteroid waves incoming!'
];

function tickDifficultyNotices(
  difficultyNotice: DifficultyNoticeState,
  asteroidsSpawned: number,
  deltaTime: number
): void {
  const reached = Math.floor(asteroidsSpawned / DIFFICULTY_INTERVAL);

  while (difficultyNotice.milestone < reached && difficultyNotice.milestone < DIFFICULTY_MESSAGES.length) {
    difficultyNotice.milestone++;
    difficultyNotice.queue.push(DIFFICULTY_MESSAGES[difficultyNotice.milestone - 1]);
  }

  if (difficultyNotice.current) {
    difficultyNotice.current.age += deltaTime;
    if (difficultyNotice.current.age >= difficultyNotice.duration) {
      difficultyNotice.current = null;
    }
  }

  if (!difficultyNotice.current && difficultyNotice.queue.length > 0) {
    difficultyNotice.current = { text: difficultyNotice.queue.shift()!, age: 0 };
  }
}
