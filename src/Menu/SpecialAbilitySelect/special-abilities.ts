/* eslint-disable @typescript-eslint/no-explicit-any */
import { SpecialAbilityAlmanac } from '../../Game/spaceships/ability-almanac';

export interface SpecialAbilityDefinition {
  id: string;
  kind: 'passive' | 'active';
  description: string;
  cooldown?: number;
}

export const SPECIAL_ABILITIES: readonly SpecialAbilityDefinition[] = Object.entries(SpecialAbilityAlmanac).map(
  ([key, value]) => ({
    id: key,
    kind: (value as any).cooldown ? 'active' : 'passive',
    description: value.shortDescription,
    cooldown: (value as any).cooldown
  })
);

export const SPECIAL_ABILITY_GRID_COLUMNS = 7;
export const SPECIAL_ABILITY_GRID_ROWS = 2;

export function getSpecialAbility(id?: string | null): SpecialAbilityDefinition | undefined {
  return SPECIAL_ABILITIES.find(ability => ability.id === id);
}
