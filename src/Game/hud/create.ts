export interface FpsCounter {
  fps: number;
  frames: number;
  elapsed: number;
}

export function createFpsCounter(): FpsCounter {
  return { fps: 0, frames: 0, elapsed: 0 };
}
