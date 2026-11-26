import { Spaceship } from './spaceship';

export enum SpaceshipEffectType {
  SHIELD,
  STRONGER_ENGINES
}

export interface SpaceshipEffect {
  type: SpaceshipEffectType;
  age: number;
  duration: number;
}

export function startEffect(spaceship: Spaceship, effectType: SpaceshipEffectType, duration: number): void {
  spaceship.effects.push({
    type: effectType,
    age: 0,
    duration
  });
}

export function findEffect(spaceship: Spaceship, effectType: SpaceshipEffectType): SpaceshipEffect | undefined {
  return spaceship.effects.find(effect => effect.type === effectType);
}

export const STRONGER_ENGINES_MOVEMENT_SPEED_MULTIPLIER = 1.25;
