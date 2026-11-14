import { FpsCounter } from './create';

const FPS_COUNTER_UPDATE_INTERVAL = 0.5;
const FPS_COUNTER_MAX_FRAME_TIME = 1;

export function tickFps(counter: FpsCounter, deltaTime: number): void {
  if (deltaTime > FPS_COUNTER_MAX_FRAME_TIME) {
    counter.frames = 0;
    counter.elapsed = 0;
    return;
  }

  counter.frames++;
  counter.elapsed += deltaTime;

  if (counter.elapsed >= FPS_COUNTER_UPDATE_INTERVAL) {
    counter.fps = counter.frames / counter.elapsed;
    counter.frames = 0;
    counter.elapsed = 0;
  }
}
