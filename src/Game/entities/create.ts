import { GameState } from '../hud';
import { between } from '../utils';
import { EntityType } from './entities';

const EXPLOSION_SPARK_COUNT_MULTIPLIER = 0.25;
const EXPLOSION_SPARK_MIN_DISTANCE = 0.5;
const EXPLOSION_SPARK_MAX_DISTANCE = 2.25;
const EXPLOSION_SPARK_MIN_SIZE = 1.5;
const EXPLOSION_SPARK_MAX_SIZE = 4;

export function explode(state: GameState, x: number, y: number, r: number) {
  state.entities.push({
    type: EntityType.EXPLOSION,
    x,
    y,
    r,
    age: 0,
    sparks: Array.from({ length: Math.round(r * EXPLOSION_SPARK_COUNT_MULTIPLIER) }, () => ({
      angle: Math.random() * Math.PI * 2,
      distance: r * between(EXPLOSION_SPARK_MIN_DISTANCE, EXPLOSION_SPARK_MAX_DISTANCE, { floor: false }),
      size: between(EXPLOSION_SPARK_MIN_SIZE, EXPLOSION_SPARK_MAX_SIZE, { floor: false })
    }))
  });
}
