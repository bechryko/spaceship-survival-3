import { Settings } from 'spaceship-survival-3/context';
import { GAME_HEIGHT, GAME_WIDTH } from '../hud';

// Crisp rendering on HiDPI screens
export function initCanvas(canvas: HTMLCanvasElement, settings: Settings): void {
  const scale = (window.devicePixelRatio || 1) * settings.resolutionMultiplier;

  canvas.width = GAME_WIDTH * scale;
  canvas.height = GAME_HEIGHT * scale;

  const ctx = canvas.getContext('2d')!;
  ctx.setTransform(scale, 0, 0, scale, 0, 0);
}
