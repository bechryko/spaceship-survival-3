import { Range } from '../models';
import { AbilityAlmanac, Spaceship, SpaceshipAbilityIndex } from '../spaceships';
import { between } from './random';

export function forEachAbility(callback: (ability: SpaceshipAbilityIndex) => void, includeSpecial = false): void {
  const abilities = ['q', 'w', 'e'];
  if (includeSpecial) {
    abilities.push('r');
  }

  for (const ability of abilities) {
    callback(ability as SpaceshipAbilityIndex);
  }
}

export function getAlmanacForAbilities(player: Spaceship) {
  return AbilityAlmanac[player.abilities.profile.abilityClass as keyof typeof AbilityAlmanac];
}

export function collectPlayerControls(player: Spaceship): string[] {
  const controls = [player.controls.leftKeyCode, player.controls.rightKeyCode];

  forEachAbility(a => {
    controls.push(player.abilities[a].key);
  });

  return controls;
}

export function displayKeyCode(keyCode: string): string {
  return keyCode.replaceAll('Key', '');
}

export function clamp01(value: number): number {
  return Math.min(1, Math.max(0, value));
}

/** '#rrggbb' to 'rgba(r, g, b, alpha)' */
export function withAlpha(hex: string, alpha: number): string {
  const n = parseInt(hex.slice(1), 16);
  return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${alpha})`;
}

/** Rises past 1 and settles back: a "pop" when something appears. 0 at t = 0, 1 at t = 1. */
export function easeOutBack(t: number): number {
  const c1 = 1.70158;
  const c3 = c1 + 1;
  return 1 + c3 * (t - 1) ** 3 + c1 * (t - 1) ** 2;
}

export function easeOutCubic(t: number): number {
  return 1 - (1 - t) ** 3;
}

export function easeInOutCubic(t: number): number {
  return t < 0.5 ? 4 * t ** 3 : 1 - (-2 * t + 2) ** 3 / 2;
}

export function getNumberOrRangeValue(value: number | Range, isInteger = true): number {
  return typeof value === 'number' ? value : between(value.min, value.max, { floor: isInteger });
}
