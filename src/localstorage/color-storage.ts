import { SPACESHIP_COLORS } from 'spaceship-survival-3/Menu/SpaceshipSelect/ColorPicker/spaceship-colors';
import { createLocalstorageKey } from './localstorage-key';

const PLAYER1_COLOR_STORAGE_KEY = createLocalstorageKey('player1-color');
const PLAYER2_COLOR_STORAGE_KEY = createLocalstorageKey('player2-color');

const OLD_COLOR_STORAGE_KEY = createLocalstorageKey('color');

function getStorageKey(isPlayer2: boolean): string {
  return isPlayer2 ? PLAYER2_COLOR_STORAGE_KEY : PLAYER1_COLOR_STORAGE_KEY;
}

function getFallbackColor(excludedColor?: string): string {
  return SPACESHIP_COLORS.find(color => color.value !== excludedColor)?.value ?? SPACESHIP_COLORS[0].value;
}

export function loadColor(isPlayer2 = false): string {
  const storageKey = getStorageKey(isPlayer2);
  let loaded = localStorage.getItem(storageKey);

  if (!isPlayer2 && !loaded) {
    loaded = localStorage.getItem(OLD_COLOR_STORAGE_KEY);

    if (loaded) {
      localStorage.setItem(PLAYER1_COLOR_STORAGE_KEY, loaded);
      localStorage.removeItem(OLD_COLOR_STORAGE_KEY);
    }
  }

  const colorValue = SPACESHIP_COLORS.find(color => color.name === loaded)?.value;

  if (colorValue) {
    return colorValue;
  }

  if (isPlayer2) {
    const player1Color = loadColor(false);
    return getFallbackColor(player1Color);
  }

  return SPACESHIP_COLORS[0].value;
}

export function saveColor(colorValue: string, isPlayer2 = false): void {
  const colorName = SPACESHIP_COLORS.find(color => color.value === colorValue)?.name;

  if (colorName) {
    localStorage.setItem(getStorageKey(isPlayer2), colorName);
  }
}
