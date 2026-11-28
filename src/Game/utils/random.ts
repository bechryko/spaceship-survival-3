import { hash } from './utility-functions';

export interface BetweenConfig {
  includeMax: boolean;
  squaredDistribution: boolean;
  floor: boolean;
  seed?: number;
}

const defaultBetweenConfig: BetweenConfig = {
  includeMax: true,
  squaredDistribution: false,
  floor: true
};

/** Creates a random number between the two bounds.
    Config:
    - `includeMax`: if `floor` is `true`, includes the max bound (integer) (default: `true`)
    - `squaredDistribution`: generates the numbers in a squared distribution instead of uniform (default: `false`)
    - `floor`: rounds the result down (default: `true`)
    - `seed`: a seed to generate a pseudo-random number */
export function between(min: number, max: number, config: Partial<BetweenConfig> = {}): number {
  const finalConfig = {
    ...defaultBetweenConfig,
    ...config
  };
  const addition = finalConfig.includeMax && finalConfig.floor ? 1 : 0;

  const randomFn = finalConfig.seed ? () => hash(finalConfig.seed!) : () => Math.random();

  const randomValue = finalConfig.squaredDistribution ? Math.sqrt(randomFn()) : randomFn();

  let result = min + randomValue * (max - min + addition);
  if (finalConfig.floor) {
    result = Math.floor(result);
  }
  return result;
}

export function choose<T>(array: T[], seed?: number): T {
  return array[between(0, array.length, { includeMax: false, seed })];
}

export function chooseMultiple<T>(array: T[], amount: number): T[] {
  const copy = [...array];
  const ret: T[] = [];

  for (let i = 0; i < amount; i++) {
    const chosen = choose(copy);
    copy.splice(copy.indexOf(chosen), 1);
    ret.push(chosen);
  }

  return ret;
}

export function chance(chance = 0.5): boolean {
  return Math.random() < chance;
}

export function randomAngle(): number {
  return between(0, Math.PI * 2, { floor: false });
}

/** Normally distributed random number: mostly near 0, rarely far. Makes clusters look natural. */
export function gaussian(): number {
  let u = 0;
  while (u === 0) u = Math.random();
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * Math.random());
}
