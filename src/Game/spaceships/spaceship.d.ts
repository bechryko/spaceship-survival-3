import { SpaceshipShape } from './hitbox';
import { SpaceshipAbilities } from './spaceship-abilities';

export interface Spaceship {
  index: number;
  alive: boolean;
  x: number;
  y: number;
  speed: number;
  abilities: SpaceshipAbilities;
  controls: SpaceshipControls;
  color: string;
  shape: SpaceshipShape;
  asteroidKnowledge: number;
}

export interface SpaceshipControls {
  left: boolean;
  right: boolean;
  leftKeyCode: string;
  rightKeyCode: string;
}
