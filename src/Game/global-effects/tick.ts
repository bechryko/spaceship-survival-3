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
export const DIFFICULTY_NOTICE_DURATION = 3;

function tickDifficultyNotices(
  globalEffects: DifficultyNoticeState,
  asteroidsSpawned: number,
  deltaTime: number
): void {
  const reached = Math.floor(asteroidsSpawned / DIFFICULTY_INTERVAL);

  while (globalEffects.milestone < reached && globalEffects.milestone < DIFFICULTY_MESSAGES.length) {
    globalEffects.milestone++;
    globalEffects.queue.push(DIFFICULTY_MESSAGES[globalEffects.milestone - 1]);
  }

  if (globalEffects.current) {
    globalEffects.current.age += deltaTime;
    if (globalEffects.current.age >= DIFFICULTY_NOTICE_DURATION) {
      globalEffects.current = null;
    }
  }

  if (!globalEffects.current && globalEffects.queue.length > 0) {
    globalEffects.current = { text: globalEffects.queue.shift()!, age: 0 };
  }
}
