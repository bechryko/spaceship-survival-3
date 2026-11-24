import {
  ASTEROID_SPAWN_CHANCES,
  ASTEROID_SPAWN_FAST_INTERVAL,
  ASTEROID_SPAWN_SLOW_INTERVAL,
  ASTEROID_WAVE_MAX_SPAWN_TIMER,
  ASTEROID_WAVE_MIN_SPAWN_TIMER,
  AsteroidType,
  ICE_ASTEROID_MAX_SHARD_RELEASE,
  ICE_ASTEROID_MIN_SHARD_RELEASE,
  TRIPLE_ASTEROID_CHANCE
} from 'spaceship-survival-3/Game/asteroids';
import {
  AbilityAlmanac,
  AbilityClass,
  SPACESHIP_MAX_SURVIVE_CHANCE,
  SPACESHIP_SURVIVE_CHANCE_PER_KNOWLEDGE
} from 'spaceship-survival-3/Game/spaceships';
import { SPACESHIPS } from '../SpaceshipSelect/spaceship-catalog';
import { SPECIAL_ABILITIES } from '../SpecialAbilitySelect/special-abilities';
import { HANDBOOK_TIPS } from './handbook-tips';

export type HandbookGroupId = 'general' | 'spaceships' | 'special-abilities' | 'asteroids';

export interface HandbookGroup {
  id: HandbookGroupId;
  title: string;
  icons: boolean;
  borderlessIcons?: boolean;
}

export interface HandbookSection {
  heading: string;
  paragraphs: readonly string[];
  isList?: boolean;
}

export interface HandbookEntry {
  id: string;
  group: HandbookGroupId;
  name: string;
  iconId?: string;
  summary: string;
  stats?: readonly { label: string; value: string }[];
  sections: readonly HandbookSection[];
}

export const HANDBOOK_GROUPS: readonly HandbookGroup[] = [
  { id: 'general', title: 'General', icons: false },
  { id: 'spaceships', title: 'Spaceships', icons: true },
  { id: 'special-abilities', title: 'Special abilities', icons: true },
  { id: 'asteroids', title: 'Asteroids', icons: true, borderlessIcons: true }
];

export const HANDBOOK_ENTRIES: readonly HandbookEntry[] = [
  ...getGeneralEntries(),
  ...getSpaceshipEntries(),
  ...getSpecialAbilityEntries(),
  ...getAsteroidEntries()
];

function getGeneralEntries(): HandbookEntry[] {
  return [
    {
      id: 'general_difficulties',
      group: 'general',
      name: 'Difficulty Milestones',
      summary:
        'As the game goes on, space becomes more and more harsh, and asteroids more powerful. After a certain number of asteroids, new challenges emerge - these are called Difficulty Milestones.',
      stats: [
        { label: 'From the start', value: 'Level 1 asteroid growth' },
        { label: 'After 25 asteroids', value: 'Level 2 asteroids' },
        { label: 'From 50 to 75 asteroids', value: 'More frequent asteroids' },
        { label: 'After 75 asteroids', value: 'More Level 2 asteroids' },
        { label: 'After 125 asteroids', value: 'Double asteroid waves' },
        { label: 'After 175 asteroids', value: 'Bigger asteroids' },
        { label: 'After 200 asteroids', value: 'Triple asteroid waves' }
      ],
      sections: [
        {
          heading: 'Level 1 asteroid growth',
          paragraphs: [
            "Starting from the beginning of a round, the potential size of the Level 1 asteroids will continuously grow, to make dodging them harder, and forcing you to use the potential of your spaceship's abilities. This growth will stop after reaching a certain size."
          ]
        },
        {
          heading: 'Level 2 asteroids',
          paragraphs: [
            `Level 2 asteroids shape the way you have to play the game. These asteroids have special properties and behavior you have to play around. There are more Level 2 asteroids in the game, but you will encounter only one of them each game. They will spawn with a ${ASTEROID_SPAWN_CHANCES[0].level2Chance * 100}% chance.`,
            'Similar to Level 1 asteroids, Level 2 asteroids will grow in size as time goes on, but will eventually stop growing.'
          ]
        },
        {
          heading: 'More frequent asteroids',
          paragraphs: [
            `At the start of the game asteroids will appear in a ${ASTEROID_SPAWN_SLOW_INTERVAL}s interval, but this will gradually decrease until it reaches a ${ASTEROID_SPAWN_FAST_INTERVAL}s interval. This will make surviving significantly harder, so prepare for this challenge!`
          ]
        },
        {
          heading: 'More Level 2 asteroids',
          paragraphs: [`Level 2 asteroids will spawn with a ${ASTEROID_SPAWN_CHANCES[1].level2Chance * 100}% chance.`]
        },
        {
          heading: 'Double asteroid waves',
          paragraphs: [
            `Sometimes asteroid waves will spawn, which means 2 asteroids appear at once at the top instead of 1. There are at least ${ASTEROID_WAVE_MIN_SPAWN_TIMER} and at most ${ASTEROID_WAVE_MAX_SPAWN_TIMER} asteroids between two waves.`
          ]
        },
        {
          heading: 'Bigger asteroids',
          paragraphs: [
            'Asteroid sizes will continue to slowly grow over time, that will cause much more size increase than the one at the start of the game. This applies to all levels of asteroids.'
          ]
        },
        {
          heading: 'Triple asteroid waves',
          paragraphs: [
            `Asteroid waves will have a ${TRIPLE_ASTEROID_CHANCE * 100}% chance to have 3 asteroids at the same time instead of 2.`
          ]
        }
      ]
    },
    {
      id: 'general_knowledge',
      group: 'general',
      name: 'Asteroid knowledge',
      summary:
        'Getting to know the universe can be a good strategy to play the game. There are some ways to acquire knowledge about asteroids, and if you do, different benefits are waiting to help your journeys.',
      sections: [
        {
          heading: 'How to get it',
          paragraphs: [
            `Knowledge is hard to acquire, only the Scientist Ship is able to get it. Analyzing an asteroid with its ${AbilityAlmanac[AbilityClass.SCIENTIST].q.name} gives a knowledge point.`,
            "Since ice shards are only fragments of asteroids, they are too small to carry any useful information, and they don't give knowledge when analyzed."
          ]
        },
        {
          heading: 'Benefits',
          paragraphs: [
            `Each knowledge point acquired gives ${SPACESHIP_SURVIVE_CHANCE_PER_KNOWLEDGE * 100}% chance of surviving an asteroid impact. However, this can't save you certainly, because the maximum survive chance is ${SPACESHIP_MAX_SURVIVE_CHANCE * 100}%.`,
            `Ice shard collisions are easier to survive, so this chance is doubled against them. (${SPACESHIP_SURVIVE_CHANCE_PER_KNOWLEDGE * 200}% chance per knowledge, ${SPACESHIP_MAX_SURVIVE_CHANCE * 200}% maximum chance.)`
          ]
        }
      ]
    }
  ];
}

function getSpaceshipEntries(): HandbookEntry[] {
  return SPACESHIPS.map(spaceshipDefinition => {
    const id = 'spaceship_' + spaceshipDefinition.id;

    return {
      id,
      group: 'spaceships',
      name: spaceshipDefinition.name,
      iconId: spaceshipDefinition.id,
      summary: spaceshipDefinition.description,
      sections: [
        {
          heading: `${spaceshipDefinition.abilities[0].name} (Q)`,
          paragraphs: [AbilityAlmanac[spaceshipDefinition.id].q.longDescription]
        },
        {
          heading: `${spaceshipDefinition.abilities[1].name} (W)`,
          paragraphs: [AbilityAlmanac[spaceshipDefinition.id].w.longDescription]
        },
        {
          heading: `${spaceshipDefinition.abilities[2].name} (E)`,
          paragraphs: [AbilityAlmanac[spaceshipDefinition.id].e.longDescription]
        },
        {
          heading: 'Suggested Special Abilities',
          paragraphs: [spaceshipDefinition.suggestedSpecialAbilities.join(', ')]
        },
        {
          heading: 'Tips',
          paragraphs: HANDBOOK_TIPS[id],
          isList: true
        }
      ]
    };
  });
}

function getSpecialAbilityEntries(): HandbookEntry[] {
  return SPECIAL_ABILITIES.map(specialAbilityDefinition => {
    const id = 'special-ability_' + specialAbilityDefinition.id;

    return {
      id,
      group: 'special-abilities',
      name: specialAbilityDefinition.id,
      iconId: specialAbilityDefinition.id,
      summary: specialAbilityDefinition.summary,
      sections: [
        {
          heading: 'How it works',
          paragraphs: [specialAbilityDefinition.longDescription]
        },
        {
          heading: 'Using it well',
          paragraphs: HANDBOOK_TIPS[id],
          isList: true
        }
      ]
    };
  });
}

function getAsteroidEntries(): HandbookEntry[] {
  const group = 'asteroids';

  return [
    {
      id: group + '_' + AsteroidType.REGULAR,
      group,
      name: 'Regular asteroid',
      iconId: 'regular',
      summary: 'The most common rock: brown and steady. But in a group, very deadly.',
      stats: [
        { label: 'Level', value: '1' },
        { label: 'Size', value: 'normal' },
        { label: 'Special behavior', value: 'None' }
      ],
      sections: [
        {
          heading: 'Description',
          paragraphs: [
            'Regular asteroids are rough brown rocks with craters, and they fall straight down the screen at a steady speed. They have no tricks, and any of your weapons will destroy them. Each one has its own shape and size, so no two look quite the same.'
          ]
        }
      ]
    },
    {
      id: group + '_' + AsteroidType.ICE,
      group,
      name: 'Ice asteroid',
      iconId: 'ice',
      summary: 'A pale blue rock that sheds pieces as it falls and shatters when destroyed.',
      stats: [
        { label: 'Level', value: '2' },
        { label: 'Size', value: 'normal - larger' },
        { label: 'Special behavior', value: 'Sheds ice, splits when destroyed' }
      ],
      sections: [
        {
          heading: 'Description',
          paragraphs: [
            'Ice asteroids are easy to recognize: they are blue, have an irregular shape, often spikes, and they are covered in many small craters. They look delicate, but they are far from harmless.',
            'Every now and then a small ice shard breaks off one and falls away, drifting a little to the side. It is a small asteroid, but it is a real one, and it can end a run as easily as a large one.',
            'Ice asteroids can be destroyed by any weapon.'
          ]
        },
        {
          heading: 'When destroyed',
          paragraphs: [
            `Destroying an Ice asteroid releases between ${ICE_ASTEROID_MIN_SHARD_RELEASE} and ${ICE_ASTEROID_MAX_SHARD_RELEASE} small ice shards that fly out sideways in different directions, so the screen can be busier after you destroy one than before. The small pieces do not shed or split any further.`
          ]
        }
      ]
    },
    {
      id: group + '_' + AsteroidType.IRON,
      group,
      name: 'Iron asteroid',
      iconId: 'iron',
      summary: 'A rock consisting overwhelmingly of an iron-nickel alloy that cannot be destroyed by any weapon.',
      stats: [
        { label: 'Level', value: '2' },
        { label: 'Size', value: 'smaller' },
        { label: 'Special behavior', value: 'Indestructible, blocks laser beam' }
      ],
      sections: [
        {
          heading: 'Description',
          paragraphs: [
            'Iron asteroids cannot be destroyed by anything in the game. Rockets and bombs explode on contact and leave them untouched, probes can analyze them but never break them, and a laser stops dead against them.',
            'The laser is blocked at the lowest point of the Iron asteroid. Anything behind it is shielded from the beam, so a regular rock hiding behind an iron one cannot be reached from below.'
          ]
        },
        {
          heading: 'How to deal with them',
          paragraphs: [
            'The only thing that is good against an Iron asteroid is a push. Blasts from a bomb and the stream of the plasma jet can shove them aside, and the shockwave can slow them down. Otherwise, the answer is simply to steer around them.',
            'Because they cannot be removed, an Iron asteroid that you let fall past the ship is gone for good, so patience and positioning are better than trying to out-fight one.'
          ],
          isList: true
        }
      ]
    }
  ];
}
