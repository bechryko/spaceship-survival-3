import { createLocalstorageKey } from './localstorage-key';
import { Schema, validateJSON } from './validator';

const HIGHSCORE_STORAGE_KEY = createLocalstorageKey('highscore');

export interface Highscores {
  single: number;
  multi: number;
}

const defaultHighscores: Highscores = {
  single: 0,
  multi: 0
};

export function loadHighscores(): Highscores {
  const loaded = localStorage.getItem(HIGHSCORE_STORAGE_KEY);

  if (!loaded || !validateJSON(loaded, highscoreSchema)) {
    if (!loaded || validateJSON(loaded, 'number')) {
      saveHighscores({
        single: Number(JSON.parse(loaded ?? '0')),
        multi: 0
      });
      return defaultHighscores;
    }

    saveHighscores(null);
    return defaultHighscores;
  }
  return JSON.parse(loaded);
}

export function saveHighscores(highscores: Highscores | null): void {
  localStorage.setItem(HIGHSCORE_STORAGE_KEY, JSON.stringify(highscores ?? defaultHighscores));
}

const highscoreSchema: Schema = {
  single: 'number',
  multi: 'number'
};
