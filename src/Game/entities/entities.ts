export enum EntityType {
  ROCKET,
  LASER,
  EXPLOSION
}

export type Entity = Rocket | Laser | Explosion;

interface EntityBase {
  type: EntityType;
}

export interface Rocket extends EntityBase {
  type: EntityType.ROCKET;
  x: number;
  y: number;
  speed: number;
}

export interface Laser extends EntityBase {
  type: EntityType.LASER;
  getX: () => number;
  getBottomY: () => number;
  width: number;
  totalTime: number;
  timeLeft: number;
}

export interface Explosion extends EntityBase {
  type: EntityType.EXPLOSION;
  x: number;
  y: number;
  r: number;
  age: number;
  sparks: Spark[];
}

export interface Spark {
  angle: number;
  distance: number;
  size: number;
}
