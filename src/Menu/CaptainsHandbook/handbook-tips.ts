import { AbilityAlmanac, AbilityClass, SpecialAbilityName } from '../../Game/spaceships';

export const HANDBOOK_TIPS: Record<string, string[]> = {
  ['spaceship_' + AbilityClass.GUNSHIP]: [
    'Both of its weapons are mounted on the wings: the rocket launcher on the left and the laser emitter on the right. That means the two sides of the ship are not equal when you line up a shot, and learning which side to put over an asteroid is a big part of mastering it.',
    `The ${AbilityAlmanac[AbilityClass.GUNSHIP].w.name}'s cooldown is the longest of the ship's abilities, so it is worth saving for the moments that count.`,
    `Be careful with Iron asteroids! The Destroyer's power relies on its weapons, but the ${AbilityAlmanac[AbilityClass.GUNSHIP].q.name} and the ${AbilityAlmanac[AbilityClass.GUNSHIP].e.name} are useless against them. Iron asteroids also block the ${AbilityAlmanac[AbilityClass.GUNSHIP].e.name}, so any asteroid behind them is safe.`
  ],
  ['spaceship_' + AbilityClass.SCIENTIST]: [
    `The ship's abilities work together very well: the ${AbilityAlmanac[AbilityClass.SCIENTIST].q.name} takes asteroids apart one after another and builds up knowledge, and the ${AbilityAlmanac[AbilityClass.SCIENTIST].w.name} buys time when the screen gets crowded, so the ${AbilityAlmanac[AbilityClass.SCIENTIST].q.name} can finish its work in time. And when you find yourself in a tight situation, the ${AbilityAlmanac[AbilityClass.SCIENTIST].e.name} can clean the way for you.`,
    `Using ${AbilityAlmanac[AbilityClass.SCIENTIST].w.name} as soon as you can may sound like a good idea, but having slow and normal speed asteroids come towards you at the same time can be very dangerous. Make sure to use this ability only when you can deal with the slowed asteroids, or in a tight situation as your last resort.`
  ],
  ['special-ability_' + SpecialAbilityName.STRONGER_ENGINES]: [
    "This special ability is recommended for beginners. You don't have to pay attention to another ability to activate, and the bonus speed comes in handy in every situation.",
    'Be careful with using Stronger Engines in a spaceship with high Engine Power! Too much speed can make your movement inaccurate, and you can collide with asteroids in thin corridors.'
  ],
  ['special-ability_' + SpecialAbilityName.BOMB]: [
    `Because you choose when it explodes, the ${SpecialAbilityName.BOMB} is at its best when it is set off in the middle of a cluster, even if it has not touched anything. The blast scatters the group and gives you room to move.`,
    `Iron asteroids survive the contact, but the explosion still pushes them, so a ${SpecialAbilityName.BOMB} can be used to move one out of your way.`
  ],
  ['special-ability_' + SpecialAbilityName.SHIELD_GENERATOR]: [],
  ['special-ability_' + SpecialAbilityName.URGENT_ORDERS]: [
    'Use this special ability on spaceships that have combo abilities, that have to be casted at the same time.'
  ]
};
