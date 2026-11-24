import { createLocalstorageKey } from './localstorage-key';
import { validateJSON } from './validator';

const HIGHSCORE_STORAGE_KEY = createLocalstorageKey('highscore');

export function loadHighscore(): number {
  const loaded = localStorage.getItem(HIGHSCORE_STORAGE_KEY);

  if (!loaded || !validateJSON(loaded, 'number')) {
    return 0;
  }
  return JSON.parse(loaded);
}

export function saveHighscore(highscore: number): void {
  localStorage.setItem(HIGHSCORE_STORAGE_KEY, JSON.stringify(highscore));
}
