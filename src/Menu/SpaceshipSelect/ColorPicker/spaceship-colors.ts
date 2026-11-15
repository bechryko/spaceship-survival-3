import { createLocalstorageKey } from '../../../localstorage-key';

export type SpaceshipColor = {
  value: string;
  name: string;
};

export const SPACESHIP_COLORS: readonly SpaceshipColor[] = [
  { value: '#156B15', name: 'Green' },
  { value: '#045cb3', name: 'Blue' },
  { value: '#ac0a2a', name: 'Red' },
  { value: '#ad5f00', name: 'Orange' },
  { value: '#9932b2', name: 'Purple' },
  { value: '#0a8680', name: 'Teal' }
];

export const DEFAULT_SPACESHIP_COLOR = SPACESHIP_COLORS[0].value;
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
