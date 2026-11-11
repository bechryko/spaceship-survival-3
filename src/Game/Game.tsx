import './Game.css';

import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router';
import { useSettings } from '../context';
import { drawAsteroid, tickAsteroids } from './asteroids';
import { drawBackground } from './background';
import { drawHUD, EXIT_KEY_CODE, GAME_HEIGHT, GAME_WIDTH, GameState, GameStatus, START_PAUSE_KEY_CODE } from './hud';
import { createSpaceship, drawSpaceship, tickSpaceships } from './spaceships';

const createState = (status = GameStatus.PLAYING): GameState => ({
  status,
  player: createSpaceship(),
  asteroids: [],
  score: 0,
  spawnTimer: 0
});

export default function Game() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stateRef = useRef<GameState>(createState());
  const bestRef = useRef(0);

  const [best, setBest] = useState(0);

  const { settings } = useSettings();

  const navigate = useNavigate();

  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext('2d')!;

    // Crisp rendering on HiDPI screens
    const dpr = (window.devicePixelRatio || 1) * settings.resolutionMultiplier;
    canvas.width = GAME_WIDTH * dpr;
    canvas.height = GAME_HEIGHT * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    // ----- Input -----
    const onKeyDown = (event: KeyboardEvent) => {
      const s = stateRef.current;
      const playerControls = s.player.controls;
      if ([playerControls.leftKeyCode, playerControls.rightKeyCode, START_PAUSE_KEY_CODE].includes(event.code)) {
        event.preventDefault();
      }

      switch (event.code) {
        case EXIT_KEY_CODE:
          if ([GameStatus.PAUSED, GameStatus.OVER].includes(s.status)) {
            navigate('/menu');
          }
          break;
        case START_PAUSE_KEY_CODE:
          switch (s.status) {
            case GameStatus.PLAYING:
              s.status = GameStatus.PAUSED;
              break;
            case GameStatus.PAUSED:
              s.status = GameStatus.PLAYING;
              break;
            case GameStatus.OVER:
              stateRef.current = createState(GameStatus.PLAYING);
              break;
          }
          break;
        case playerControls.leftKeyCode:
          playerControls.left = true;
          break;
        case playerControls.rightKeyCode:
          playerControls.right = true;
          break;
      }
    };
    const onKeyUp = (event: KeyboardEvent) => {
      const playerControls = stateRef.current.player.controls;
      switch (event.code) {
        case playerControls.leftKeyCode:
          playerControls.left = false;
          break;
        case playerControls.rightKeyCode:
          playerControls.right = false;
          break;
      }
    };

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);

    // ----- Update -----
    const update = (dt: number) => {
      const state = stateRef.current;
      if (state.status !== GameStatus.PLAYING) {
        return;
      }

      tickSpaceships(state, dt);

      const { hit } = tickAsteroids(state, dt);
      if (hit) {
        state.status = GameStatus.OVER;
        if (state.score > bestRef.current) {
          bestRef.current = state.score;
          setBest(state.score);
        }
      }
    };

    const draw = () => {
      const state = stateRef.current;

      drawBackground(ctx);
      for (const asteroid of state.asteroids) {
        drawAsteroid(ctx, asteroid);
      }
      drawSpaceship(ctx, state.player);
      drawHUD(ctx, state, bestRef.current);
    };

    let rafId = 0;
    let last = performance.now();

    const frame = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;

      update(dt);
      draw();
      rafId = requestAnimationFrame(frame);
    };
    rafId = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
    };
  });

  return <canvas ref={canvasRef} aria-label={`High score: ${best}`} />;
}
