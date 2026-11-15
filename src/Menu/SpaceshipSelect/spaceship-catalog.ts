import { AbilityAlmanac, AbilityClass } from '../../Game/spaceships';

export interface SpaceshipAbilityInfo {
  key: 'Q' | 'W' | 'E';
  name: string;
  description: string;
  cooldown: number;
}

export interface SpaceshipDefinition {
  id: AbilityClass;
  name: string;
  color: string;
  description: string;
  abilities: readonly SpaceshipAbilityInfo[];
}

export const SPACESHIPS: readonly SpaceshipDefinition[] = [
  {
    id: AbilityClass.GUNSHIP,
    name: 'Destroyer',
    color: 'forestgreen',
    description:
      'A spaceship equipped with the best weapons available: a rocket launcher on one wing, a long-ranger laser on the other.',
    abilities: [
      {
        key: 'Q',
        name: AbilityAlmanac[AbilityClass.GUNSHIP].q.name,
        description: AbilityAlmanac[AbilityClass.GUNSHIP].q.shortDescription,
        cooldown: AbilityAlmanac[AbilityClass.GUNSHIP].q.cooldown
      },
      {
        key: 'W',
        name: AbilityAlmanac[AbilityClass.GUNSHIP].w.name,
        description: AbilityAlmanac[AbilityClass.GUNSHIP].w.shortDescription,
        cooldown: AbilityAlmanac[AbilityClass.GUNSHIP].w.cooldown
      },
      {
        key: 'E',
        name: AbilityAlmanac[AbilityClass.GUNSHIP].e.name,
        description: AbilityAlmanac[AbilityClass.GUNSHIP].e.shortDescription,
        cooldown: AbilityAlmanac[AbilityClass.GUNSHIP].e.cooldown
      }
    ]
  }
];

export const SPACESHIP_GRID_COLUMNS = 5;
export const SPACESHIP_GRID_ROWS = 2;

export const DEFAULT_SPACESHIP_ID = SPACESHIPS[0].id;

/** Falls back to the first spaceship for a missing or unknown id, e.g. when /play is opened directly. */
export function getSpaceshipDefinition(id?: string | null): SpaceshipDefinition {
  return SPACESHIPS.find(spaceship => spaceship.id === id) ?? SPACESHIPS[0];
}
