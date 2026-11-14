import { between } from '../utils';
import { Asteroid, AsteroidData, AsteroidType } from './asteroid';

export interface AsteroidBlueprint {
  type: AsteroidType;
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
    minSaturation: number;
    maxSaturation: number;
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
  type: AsteroidType.REGULAR,
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
    maxLightness: 46,
    minSaturation: 14,
    maxSaturation: 14
  },
  craters: {
    minCount: 5,
    maxCount: 9,
    minSize: 0.05,
    maxSize: 0.2
  }
};

export const icyAsteroidBlueprint: AsteroidBlueprint = {
  type: AsteroidType.ICY,
  velocity: DEFAULT_ASTEROID_VELOCITY,
  minSize: 75,
  maxSize: 100,
  sizeIncrease: 1.5,
  sizeIncreaseStart: 25,
  sizeIncreaseMax: 75,
  minVertexCount: 11,
  maxVertexCount: 16,
  maxReachIn: 0.6,
  color: {
    minHue: 195,
    maxHue: 215,
    minLightness: 58,
    maxLightness: 72,
    minSaturation: 45,
    maxSaturation: 65
  },
  craters: {
    minCount: 7,
    maxCount: 11,
    minSize: 0.04,
    maxSize: 0.12
  }
};

export const ironAsteroidBlueprint: AsteroidBlueprint = {
  type: AsteroidType.IRON,
  velocity: 100,
  minSize: 60,
  maxSize: 80,
  sizeIncrease: 1,
  sizeIncreaseStart: 25,
  sizeIncreaseMax: 70,
  minVertexCount: 9,
  maxVertexCount: 13,
  maxReachIn: 0.1,
  color: {
    minHue: 0,
    maxHue: 255,
    minLightness: 70,
    maxLightness: 90,
    minSaturation: 0,
    maxSaturation: 0
  },
  craters: {
    minCount: 6,
    maxCount: 10,
    minSize: 0.04,
    maxSize: 0.16
  }
};

export function createIceShardBlueprint(parent: Asteroid): AsteroidBlueprint {
  return {
    ...icyAsteroidBlueprint,
    type: AsteroidType.ICE_SHARD,
    minSize: parent.r * 0.25,
    maxSize: parent.r * 0.3,
    sizeIncrease: 0,
    minVertexCount: 5,
    maxVertexCount: 7,
    maxReachIn: 0.8,
    color: {
      minHue: parent.color.hue,
      maxHue: parent.color.hue,
      minLightness: parent.color.lightness,
      maxLightness: parent.color.lightness,
      minSaturation: parent.color.saturation,
      maxSaturation: parent.color.saturation
    },
    craters: {
      ...icyAsteroidBlueprint.craters,
      minCount: 0,
      maxCount: 0
    }
  };
}

export const ICY_ASTEROID_MIN_BREAK_OFF_TIME = 1;
export const ICY_ASTEROID_MAX_BREAK_OFF_TIME = 4;

export const startingAsteroidDataProvider: Partial<Record<AsteroidType, () => AsteroidData>> = {
  [AsteroidType.ICY]: () => ({
    iceShardBreakOffTimer: between(ICY_ASTEROID_MIN_BREAK_OFF_TIME, ICY_ASTEROID_MAX_BREAK_OFF_TIME, { floor: false })
  })
};

export const level2AsteroidBlueprints = [icyAsteroidBlueprint, ironAsteroidBlueprint];
