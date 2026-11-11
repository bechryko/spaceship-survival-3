export interface BetweenConfig {
  includeMax: boolean;
  squaredDistribution: boolean;
  floor: boolean;
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
    - `floor`: rounds the result down (default: `true`) */
export function between(min: number, max: number, config: Partial<BetweenConfig> = {}): number {
  const finalConfig = {
    ...defaultBetweenConfig,
    ...config
  };
  const addition = finalConfig.includeMax && finalConfig.floor ? 1 : 0;

  let randomFn = Math.random;
  if (finalConfig.squaredDistribution) {
    randomFn = () => Math.sqrt(Math.random());
  }

  let result = min + randomFn() * (max - min + addition);
  if (finalConfig.floor) {
    result = Math.floor(result);
  }
  return result;
}
