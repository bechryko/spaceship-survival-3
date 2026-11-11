export interface Spaceship {
  color: string;
  x: number;
  y: number;
  speed: number;
  controls: SpaceshipControls;
}

export interface SpaceshipControls {
  left: boolean;
  right: boolean;
  leftKeyCode: string;
  rightKeyCode: string;
}
