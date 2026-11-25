import {
  AbilityAlmanac,
  AbilityClass,
  SpaceshipAbilityType,
  SpaceshipShape,
  SpecialAbilityName,
  abilities,
  spaceshipAbilityClassShipShapeMap
} from 'spaceship-survival-3/Game/spaceships';

export interface SpaceshipDefinition {
  id: AbilityClass;
  name: string;
  description: string;
  speedLevel: number;
  difficultyLevel: number;
  abilities: readonly SpaceshipAbilityInfo[];
  suggestedSpecialAbilities: string[];
  shape: SpaceshipShape;
}

export interface SpaceshipAbilityInfo {
  type: SpaceshipAbilityType;
  key: 'Q' | 'W' | 'E';
  name: string;
  description: string;
  cooldown: number;
}

export const SPACESHIPS: readonly SpaceshipDefinition[] = [
  {
    id: AbilityClass.GUNSHIP,
    name: 'Destroyer',
    description:
      'A spaceship equipped with the best weapons available: a rocket launcher on one wing, a long-range laser on the other.',
    speedLevel: AbilityAlmanac[AbilityClass.GUNSHIP].speedLevel,
    difficultyLevel: 1,
    abilities: [
      {
        type: abilities[AbilityClass.GUNSHIP].q.type,
        key: 'Q',
        name: AbilityAlmanac[AbilityClass.GUNSHIP].q.name,
        description: AbilityAlmanac[AbilityClass.GUNSHIP].q.shortDescription,
        cooldown: AbilityAlmanac[AbilityClass.GUNSHIP].q.cooldown
      },
      {
        type: abilities[AbilityClass.GUNSHIP].w.type,
        key: 'W',
        name: AbilityAlmanac[AbilityClass.GUNSHIP].w.name,
        description: AbilityAlmanac[AbilityClass.GUNSHIP].w.shortDescription,
        cooldown: AbilityAlmanac[AbilityClass.GUNSHIP].w.cooldown
      },
      {
        type: abilities[AbilityClass.GUNSHIP].e.type,
        key: 'E',
        name: AbilityAlmanac[AbilityClass.GUNSHIP].e.name,
        description: AbilityAlmanac[AbilityClass.GUNSHIP].e.shortDescription,
        cooldown: AbilityAlmanac[AbilityClass.GUNSHIP].e.cooldown
      }
    ],
    suggestedSpecialAbilities: [SpecialAbilityName.BOMB],
    shape: spaceshipAbilityClassShipShapeMap[AbilityClass.GUNSHIP]
  },
  {
    id: AbilityClass.SCIENTIST,
    name: 'Scientist Ship',
    description:
      'A spaceship to bring scientists closer to understanding our universe. Its storage is loaded with probes ready to uncover the mysteries of asteroids.',
    speedLevel: AbilityAlmanac[AbilityClass.SCIENTIST].speedLevel,
    difficultyLevel: 3,
    abilities: [
      {
        type: abilities[AbilityClass.SCIENTIST].q.type,
        key: 'Q',
        name: AbilityAlmanac[AbilityClass.SCIENTIST].q.name,
        description: AbilityAlmanac[AbilityClass.SCIENTIST].q.shortDescription,
        cooldown: AbilityAlmanac[AbilityClass.SCIENTIST].q.cooldown
      },
      {
        type: abilities[AbilityClass.SCIENTIST].w.type,
        key: 'W',
        name: AbilityAlmanac[AbilityClass.SCIENTIST].w.name,
        description: AbilityAlmanac[AbilityClass.SCIENTIST].w.shortDescription,
        cooldown: AbilityAlmanac[AbilityClass.SCIENTIST].w.cooldown
      },
      {
        type: abilities[AbilityClass.SCIENTIST].e.type,
        key: 'E',
        name: AbilityAlmanac[AbilityClass.SCIENTIST].e.name,
        description: AbilityAlmanac[AbilityClass.SCIENTIST].e.shortDescription,
        cooldown: AbilityAlmanac[AbilityClass.SCIENTIST].e.cooldown
      }
    ],
    suggestedSpecialAbilities: [SpecialAbilityName.URGENT_ORDERS],
    shape: spaceshipAbilityClassShipShapeMap[AbilityClass.SCIENTIST]
  }
];

export const SPACESHIP_GRID_COLUMNS = 5;
export const SPACESHIP_GRID_ROWS = 2;

export const DEFAULT_SPACESHIP_ID = SPACESHIPS[0].id;

export function getSpaceshipDefinition(id?: string | null): SpaceshipDefinition {
  return SPACESHIPS.find(spaceship => spaceship.id === id) ?? SPACESHIPS[0];
}
