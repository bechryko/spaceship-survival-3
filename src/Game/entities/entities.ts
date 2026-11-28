import { Asteroid } from '../asteroids';
import { Point } from '../models';
import { Spaceship } from '../spaceships';

export enum EntityType {
  ROCKET,
  LASER,
  EXPLOSION,
  BOMB,
  SCIENCE_PROBE,
  SHOCKWAVE,
  PLASMA_JET,
  SHIELD_TUNNEL
}

export type Entity = Rocket | Laser | Explosion | Bomb | ScienceProbe | Shockwave | PlasmaJet | ShieldTunnel;

interface EntityBase {
  type: EntityType;
  active: boolean;
}

export interface Rocket extends EntityBase {
  type: EntityType.ROCKET;
  x: number;
  y: number;
  speed: number;
  isPowerful?: boolean;
}

export interface Laser extends EntityBase {
  type: EntityType.LASER;
  owner: Spaceship;
  topY: number;
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
  color?: string;
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

export interface ScienceProbe extends EntityBase {
  type: EntityType.SCIENCE_PROBE;
  owner: Spaceship;
  phase: 'flying' | 'transfer' | 'analyzing' | 'lost';
  x: number;
  y: number;
  currentSpeed: number;
  targetSpeed: number;
  flySpeed: number;
  transferSpeed: number;
  direction: Point;
  flightTime: number;
  target?: Asteroid;
  attach: Point;
  analysisTime: number;
  analysisProgress: number;
  lostTime: number;
}

export interface Shockwave extends EntityBase {
  type: EntityType.SHOCKWAVE;
  x: number;
  y: number;
  speed: number;
  radius: number;
  maxRadius: number;
  slowed: WeakSet<Asteroid>;
  contactCallback: (wave: Shockwave, asteroid: Asteroid) => void;
}

export interface PlasmaJet extends EntityBase {
  type: EntityType.PLASMA_JET;
  owner: Spaceship;
  isActivated: boolean;
  usedTime: number;
  intensity: number;
  affected: Asteroid[];
}

export interface ShieldTunnel extends EntityBase {
  type: EntityType.SHIELD_TUNNEL;
  x1: number;
  x2: number;
  age: number;
  duration: number;
  shatter?: { x: number; y: number; age: number };
}
