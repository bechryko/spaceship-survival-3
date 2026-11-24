import { Settings } from 'spaceship-survival-3/context';

export interface GlobalEffectsState {
  difficultyNotice: DifficultyNoticeState;
}

export interface DifficultyNoticeState {
  milestone: number;
  duration: number;
  queue: string[];
  current: { text: string; age: number } | null;
}

export function createGlobalEffectsState(settings: Settings): GlobalEffectsState {
  return {
    difficultyNotice: {
      milestone: 0,
      duration: settings.difficultyMilestoneNoticeDuration,
      queue: [],
      current: null
    }
  };
}
