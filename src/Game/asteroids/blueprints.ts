import { HSLColor, Range } from '../models';
import { between } from '../utils';
import { Asteroid, AsteroidData, AsteroidType } from './asteroid';

export interface AsteroidBlueprint {
  type: AsteroidType;
  velocity: number | Range;
  minSize: number;
  maxSize: number;
  sizeIncreases: AsteroidSizeIncrease[];
  vertexCount: number | Range;
  maxReachIn: number;
  minFullRadiusVertices: number;
  color: HSLColor<number | Range>;
  craters: {
    count: number | Range;
    size: number | Range;
  };
}

export interface AsteroidSizeIncrease {
  start: number;
  increase: number;
  max: number;
  type: 'min' | 'max' | 'both';
}

const DEFAULT_ASTEROID_VELOCITY = 140;
const COMMON_SIZE_INCREASE_THRESHOLD = 175;

export const regularAsteroidBlueprint: AsteroidBlueprint = {
  type: AsteroidType.REGULAR,
  velocity: DEFAULT_ASTEROID_VELOCITY,
  minSize: 80,
  maxSize: 145,
  sizeIncreases: [
    {
      start: 0,
      increase: 1.5,
      max: 75,
      type: 'max'
    },
    {
      start: COMMON_SIZE_INCREASE_THRESHOLD,
      increase: 0.25,
      max: 50,
      type: 'both'
    }
  ],
  vertexCount: {
    min: 9,
    max: 13
  },
  maxReachIn: 0.25,
  minFullRadiusVertices: 3,
  color: {
    hue: {
      min: 15,
      max: 40
    },
    lightness: {
      min: 34,
      max: 46
    },
    saturation: 14
  },
  craters: {
    count: {
      min: 5,
      max: 9
    },
    size: {
      min: 0.05,
      max: 0.2
    }
  }
};

export const iceAsteroidBlueprint: AsteroidBlueprint = {
  type: AsteroidType.ICE,
  velocity: DEFAULT_ASTEROID_VELOCITY,
  minSize: 80,
  maxSize: 115,
  sizeIncreases: [
    {
      start: 25,
      increase: 1.75,
      max: 125,
      type: 'max'
    },
    {
      start: COMMON_SIZE_INCREASE_THRESHOLD,
      increase: 0.5,
      max: 100,
      type: 'both'
    }
  ],
  vertexCount: {
    min: 11,
    max: 16
  },
  maxReachIn: 0.65,
  minFullRadiusVertices: 1,
  color: {
    hue: {
      min: 195,
      max: 215
    },
    lightness: {
      min: 58,
      max: 72
    },
    saturation: {
      min: 45,
      max: 65
    }
  },
  craters: {
    count: {
      min: 7,
      max: 11
    },
    size: {
      min: 0.04,
      max: 0.12
    }
  }
};

export const ironAsteroidBlueprint: AsteroidBlueprint = {
  type: AsteroidType.IRON,
  velocity: {
    min: 100,
    max: DEFAULT_ASTEROID_VELOCITY
  },
  minSize: 60,
  maxSize: 95,
  sizeIncreases: [
    {
      start: 25,
      increase: 0.5,
      max: 25,
      type: 'max'
    },
    {
      start: COMMON_SIZE_INCREASE_THRESHOLD,
      increase: 0.25,
      max: 50,
      type: 'max'
    }
  ],
  vertexCount: {
    min: 9,
    max: 13
  },
  maxReachIn: 0.1,
  minFullRadiusVertices: 5,
  color: {
    hue: 0,
    lightness: {
      min: 70,
      max: 90
    },
    saturation: 0
  },
  craters: {
    count: {
      min: 6,
      max: 10
    },
    size: {
      min: 0.04,
      max: 0.16
    }
  }
};

export function createIceShardBlueprint(parent: Asteroid): AsteroidBlueprint {
  return {
    ...iceAsteroidBlueprint,
    type: AsteroidType.ICE_SHARD,
    minSize: parent.r * 0.25,
    maxSize: parent.r * 0.3,
    sizeIncreases: [],
    vertexCount: {
      min: 5,
      max: 7
    },
    maxReachIn: 0.8,
    color: { ...parent.color },
    craters: {
      ...iceAsteroidBlueprint.craters,
      count: 0
    }
  };
}

export const ICE_ASTEROID_MIN_BREAK_OFF_TIME = 1;
export const ICE_ASTEROID_MAX_BREAK_OFF_TIME = 4;

export const startingAsteroidDataProvider: Partial<Record<AsteroidType, () => AsteroidData>> = {
  [AsteroidType.ICE]: () => ({
    iceShardBreakOffTimer: between(ICE_ASTEROID_MIN_BREAK_OFF_TIME, ICE_ASTEROID_MAX_BREAK_OFF_TIME, { floor: false })
  })
};

export const level2AsteroidBlueprints = [iceAsteroidBlueprint, ironAsteroidBlueprint];
