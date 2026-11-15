import { Spaceship } from '../spaceships';

export enum EntityType {
  ROCKET,
  LASER,
  EXPLOSION,
  BOMB,
  URGENT_ORDER_ANIMATION
}

export type Entity = Rocket | Laser | Explosion | Bomb;

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
  topY: number;
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

export interface Bomb extends EntityBase {
  type: EntityType.BOMB;
  x: number;
  y: number;
  r: number;
  age: number;
  explosionTime: number;
  owner: Spaceship;
}
