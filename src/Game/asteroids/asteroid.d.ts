import { AsteroidShape } from './hitbox';

export interface Asteroid {
  x: number;
  y: number;
  r: number;
  velocity: number;
  angle: number;
  shape: AsteroidShape;
  active: boolean;
}
