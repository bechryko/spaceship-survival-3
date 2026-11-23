import { getSpaceshipDefinition } from '../SpaceshipSelect/spaceship-catalog';
import { getSpecialAbility } from '../SpecialAbilitySelect/special-abilities';
import { HandbookEntry } from './handbook-entries';

export interface HandbookStat {
  label: string;
  value: string;
  isEnginePower?: boolean;
  isDifficultyLevel?: boolean;
}

/**
 * The table of facts under an entry's summary. Spaceships and special abilities read their numbers
 * from the same catalogs the selection screens use, so the almanac can't disagree with the game.
 * An entry can also bring its own `stats`, which are used as they are.
 */
export function getEntryStats(entry: HandbookEntry): HandbookStat[] {
  if (entry.stats) {
    return [...entry.stats];
  }

  if (entry.group === 'spaceships') {
    const ship = getSpaceshipDefinition(entry.iconId);

    return [
      { label: 'Engine power', value: `${ship.speedLevel}`, isEnginePower: true },
      { label: 'Difficulty level', value: `${ship.difficultyLevel}`, isDifficultyLevel: true },
      ...ship.abilities.map(ability => ({
        label: `${ability.key} · ${ability.name}`,
        value: `${ability.cooldown}s cooldown`
      }))
    ];
  }

  if (entry.group === 'special-abilities') {
    const ability = getSpecialAbility(entry.iconId);
    if (!ability) {
      return [];
    }

    if (ability.kind === 'passive') {
      return [{ label: 'Type', value: 'Passive, always on' }];
    }

    const type = 'Activatable' + (ability.kind === 'active-reactivate' ? ', can be reactivated' : '');
    return [
      { label: 'Type', value: type },
      { label: 'Cooldown', value: `${ability.cooldown}s` }
    ];
  }

  return [];
}
