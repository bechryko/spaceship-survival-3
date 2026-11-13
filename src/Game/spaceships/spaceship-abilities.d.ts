export type SpaceshipAbilityIndex = 'q' | 'w' | 'e';

export interface SpaceshipAbilities extends Record<SpaceshipAbilityIndex, SpaceshipAbility> {
  profile: SpaceshipAbilitiesProfile;
}

export interface SpaceshipAbility {
  cooldownTimer: number;
  activeTimer: number;
  key: string;
}

export interface SpaceshipAbilitiesProfile extends Record<SpaceshipAbilityIndex, SpaceshipAbilityProfile> {
  abilityClass: AbilityClass;
}

export interface SpaceshipAbilityProfile {
  callback: (spaceship: Spaceship, state: GameState) => void;
}
