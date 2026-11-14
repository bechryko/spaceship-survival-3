export interface AsteroidBlueprint {
  velocity: number;
  minSize: number;
  maxSize: number;
  sizeIncrease: number;
  sizeIncreaseStart: number;
  sizeIncreaseMax: number;
  minVertexCount: number;
  maxVertexCount: number;
  maxReachIn: number;
  color: {
    minHue: number;
    maxHue: number;
    minLightness: number;
    maxLightness: number;
  };
  craters: {
    minCount: number;
    maxCount: number;
    minSize: number;
    maxSize: number;
  };
}

const DEFAULT_ASTEROID_VELOCITY = 140;

export const regularAsteroidBlueprint: AsteroidBlueprint = {
  velocity: DEFAULT_ASTEROID_VELOCITY,
  minSize: 75,
  maxSize: 125,
  sizeIncrease: 1.5,
  sizeIncreaseStart: 0,
  sizeIncreaseMax: 75,
  minVertexCount: 9,
  maxVertexCount: 13,
  maxReachIn: 0.25,
  color: {
    minHue: 15,
    maxHue: 40,
    minLightness: 34,
    maxLightness: 46
  },
  craters: {
    minCount: 5,
    maxCount: 9,
    minSize: 0.05,
    maxSize: 0.2
  }
};
