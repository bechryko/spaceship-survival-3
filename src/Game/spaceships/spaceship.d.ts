import { SpaceshipAbilities } from './spaceship-abilities';

export interface Spaceship {
  x: number;
  y: number;
  speed: number;
  abilities: SpaceshipAbilities;
  controls: SpaceshipControls;
  color: string;
}

export interface SpaceshipControls {
  left: boolean;
  right: boolean;
  leftKeyCode: string;
  rightKeyCode: string;
}
