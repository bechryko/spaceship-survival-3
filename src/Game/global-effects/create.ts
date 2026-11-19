export interface GlobalEffectsState {
  difficultyNotice: DifficultyNoticeState;
}

export interface DifficultyNoticeState {
  milestone: number;
  queue: string[];
  current: { text: string; age: number } | null;
}

export function createGlobalEffectsState(): GlobalEffectsState {
  return {
    difficultyNotice: {
      milestone: 0,
      queue: [],
      current: null
    }
  };
}
