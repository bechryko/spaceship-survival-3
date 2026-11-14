import { GameState } from '../hud';
import { AbilityClass } from './ability-class';
import { Spaceship } from './spaceship';

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
  isDisabled?: (spaceship: Spaceship, state: GameState) => boolean;
}
