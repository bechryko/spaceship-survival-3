import { GameState } from '../hud';
import { SpecialAbilityName } from './ability-almanac';
import { AbilityClass } from './ability-class';
import { Spaceship } from './spaceship';

export type SpaceshipAbilityIndex = 'q' | 'w' | 'e';

export interface SpaceshipAbilities extends Record<SpaceshipAbilityIndex | 'r', SpaceshipAbility> {
  profile: SpaceshipAbilitiesProfile;
  special: SpecialAbilityName;
  specialProfile: SpaceshipAbilityProfile;
}

export interface SpaceshipAbility {
  cooldownTimer: number;
  activeTimer: number;
  key: string;
  reactivatable: boolean;
}

export interface SpaceshipAbilitiesProfile extends Record<SpaceshipAbilityIndex, SpaceshipAbilityProfile> {
  abilityClass: AbilityClass;
}

export enum SpaceshipAbilityType {
  EQUIPMENT = 'equipment',
  DEVICE = 'device'
}

export interface SpaceshipAbilityProfile {
  type: SpaceshipAbilityType;
  callback: (spaceship: Spaceship, state: GameState) => void;
  reactivateCallback?: (spaceship: Spaceship, state: GameState) => void;
  isDisabled?: (spaceship: Spaceship, state: GameState) => boolean;
}
