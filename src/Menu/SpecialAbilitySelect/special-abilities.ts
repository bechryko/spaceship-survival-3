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
  conditions?: SpecialAbilityConditions;
}

interface SpecialAbilityConditions {
  multiplayerOnly?: boolean;
}

export const SPECIAL_ABILITIES: readonly SpecialAbilityDefinition[] = Object.entries(SpecialAbilityAlmanac).map(
  ([key, entry]) => {
    const profile = specialAbilities[key as SpecialAbilityName];

    return {
      id: key,
      type: profile.type,
      activation: entry.cooldown ? (entry.reactivatable ? 'active-reactivate' : 'active') : 'passive',
      summary: entry.summary,
      shortDescription: entry.shortDescription,
      longDescription: entry.longDescription,
      cooldown: entry.cooldown,
      conditions: {
        multiplayerOnly: entry.isMultiplayerOnly
      }
    };
  }
);

export const SPECIAL_ABILITY_GRID_COLUMNS = 7;
export const SPECIAL_ABILITY_GRID_ROWS = 2;

export function getSpecialAbility(id?: string | null): SpecialAbilityDefinition | undefined {
  return SPECIAL_ABILITIES.find(ability => ability.id === id);
}
