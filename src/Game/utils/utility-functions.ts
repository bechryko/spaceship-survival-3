import { AbilityAlmanac, Spaceship, SpaceshipAbilityIndex } from '../spaceships';

export function forEachAbility(callback: (ability: SpaceshipAbilityIndex) => void): void {
  for (const ability of ['q', 'w', 'e'] as const) {
    callback(ability);
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
