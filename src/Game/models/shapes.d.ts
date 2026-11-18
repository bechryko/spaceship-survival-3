/** X-Y coordinates touple. */
export type Point = readonly [number, number];

export type Circle = readonly { x: number; y: number; r: number };

export interface Range {
  min: number;
  max: number;
}

export interface HSLColor<T extends number | Range> {
  hue: T;
  saturation: T;
  lightness: T;
}
