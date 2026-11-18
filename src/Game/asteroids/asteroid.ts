import { Circle, HSLColor } from '../models';
import { AsteroidShape } from './hitbox';

export enum AsteroidType {
  REGULAR,
  ICE,
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
  color: HSLColor<number>;
  active: boolean;
  data: AsteroidData;
}

export interface AsteroidData {
  iceShardBreakOffTimer?: number;
  isAnalyzed?: boolean;
}
