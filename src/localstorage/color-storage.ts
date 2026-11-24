import { SPACESHIP_COLORS } from 'spaceship-survival-3/Menu/SpaceshipSelect/ColorPicker/spaceship-colors';
import { createLocalstorageKey } from './localstorage-key';

const COLOR_STORAGE_KEY = createLocalstorageKey('color');

export function loadColor(): string {
  const loaded = localStorage.getItem(COLOR_STORAGE_KEY);
  const colorValue = SPACESHIP_COLORS.find(color => color.name === loaded)?.value;
  return colorValue ?? SPACESHIP_COLORS[0].name;
}

export function saveColor(colorValue: string): void {
  const colorName = SPACESHIP_COLORS.find(color => color.value === colorValue)?.name;
  if (colorName) {
    localStorage.setItem(COLOR_STORAGE_KEY, colorName);
  }
}
