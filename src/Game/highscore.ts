const HIGHSCORE_STORAGE_KEY = 'SpaceshipSurvival3_highscore';

export function loadHighscore(): number {
  const loaded = localStorage.getItem(HIGHSCORE_STORAGE_KEY);
  return Number(loaded ?? '0');
}

export function saveHighscore(highscore: number): void {
  localStorage.setItem(HIGHSCORE_STORAGE_KEY, String(highscore));
}
