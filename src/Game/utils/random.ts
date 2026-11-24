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

export function randomAngle(): number {
  return between(0, Math.PI * 2, { floor: false });
}
