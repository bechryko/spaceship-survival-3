/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  SpaceshipAbilityType,
  specialAbilities,
  SpecialAbilityAlmanac,
  SpecialAbilityName
} from 'spaceship-survival-3/Game/spaceships';

export interface SpecialAbilityDefinition {
  id: string;
  type: SpaceshipAbilityType;
  activation: 'passive' | 'active' | 'active-reactivate';
  summary: string;
  shortDescription: string;
  longDescription: string[];
  cooldown?: number;
}

export const SPECIAL_ABILITIES: readonly SpecialAbilityDefinition[] = Object.entries(SpecialAbilityAlmanac).map(
  ([key, value]) => {
    const profile = specialAbilities[key as SpecialAbilityName];

    return {
      id: key,
      type: profile.type,
      activation: (value as any).cooldown ? ((value as any).reactivatable ? 'active-reactivate' : 'active') : 'passive',
      summary: value.summary,
      shortDescription: value.shortDescription,
      longDescription: value.longDescription,
      cooldown: (value as any).cooldown
    };
  }
);

export const SPECIAL_ABILITY_GRID_COLUMNS = 7;
export const SPECIAL_ABILITY_GRID_ROWS = 2;

export function getSpecialAbility(id?: string | null): SpecialAbilityDefinition | undefined {
  return SPECIAL_ABILITIES.find(ability => ability.id === id);
}
