import { GameState } from '../hud';
import { between, clearObject, randomAngle } from '../utils';
import { Entity, EntityType, Explosion } from './entities';

const EXPLOSION_SPARK_COUNT_MULTIPLIER = 0.25;
const EXPLOSION_SPARK_MIN_DISTANCE = 0.5;
const EXPLOSION_SPARK_MAX_DISTANCE = 2.25;
const EXPLOSION_SPARK_MIN_SIZE = 1.5;
const EXPLOSION_SPARK_MAX_SIZE = 4;

export function spawnEntity<ET extends Entity>(entity: Omit<ET, 'active'>, state: GameState): void {
  const inactiveEntity = state.entities.find(e => e.type === entity.type && !e.active);
  if (inactiveEntity) {
    clearObject(inactiveEntity);
    Object.assign(inactiveEntity, entity);
    inactiveEntity.active = true;
  } else {
    state.entities.push({
      ...entity,
      active: true
    } as ET);
  }
}

export function explode(state: GameState, x: number, y: number, r: number, color?: string) {
  spawnEntity<Explosion>(
    {
      type: EntityType.EXPLOSION,
      x,
      y,
      r,
      age: 0,
      sparks: Array.from({ length: Math.round(r * EXPLOSION_SPARK_COUNT_MULTIPLIER) }, () => ({
        angle: randomAngle(),
        distance: r * between(EXPLOSION_SPARK_MIN_DISTANCE, EXPLOSION_SPARK_MAX_DISTANCE, { floor: false }),
        size: between(EXPLOSION_SPARK_MIN_SIZE, EXPLOSION_SPARK_MAX_SIZE, { floor: false })
      })),
      color
    },
    state
  );
}
