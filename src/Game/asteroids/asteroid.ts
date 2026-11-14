import { Circle } from '../models';
import { AsteroidShape } from './hitbox';

export enum AsteroidType {
  REGULAR,
  ICY,
  ICE_SHARD,
  IRON
}

export interface Asteroid {
  type: AsteroidType;
  x: number;
  y: number;
  r: number;
  velocity: number;
  velocityHorizontal: number;
  angle: number;
  shape: AsteroidShape;
  craters: readonly Circle[];
  color: {
    hue: number;
    saturation: number;
    lightness: number;
  };
  active: boolean;
  data: AsteroidData;
}

export interface AsteroidData {
  iceShardBreakOffTimer?: number;
}
