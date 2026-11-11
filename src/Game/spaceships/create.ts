import { GAME_HEIGHT, GAME_WIDTH } from '../hud';
import { Spaceship } from './spaceship';

export function createSpaceship(): Spaceship {
  return {
    color: 'forestgreen',
    x: GAME_WIDTH / 2,
    y: GAME_HEIGHT - 70,
    speed: 200,
    controls: {
      left: false,
      right: false,
      leftKeyCode: 'KeyA',
      rightKeyCode: 'KeyD'
    }
  };
}
