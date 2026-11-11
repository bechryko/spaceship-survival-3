import { Circle } from '../models';
import { AsteroidShape } from './hitbox';

export interface Asteroid {
  x: number;
  y: number;
  r: number;
  velocity: number;
  angle: number;
  shape: AsteroidShape;
  craters: readonly Circle[];
  hue: number;
  lightness: number;
  active: boolean;
}
