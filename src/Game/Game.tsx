import './Game.css';

import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router';
import { useSettings } from '../context';
import { drawAsteroid, tickAsteroids } from './asteroids';
import { createStars, drawBackground, tickStars } from './background';
import { drawEntities, tickEntities } from './entities';
import { drawHUD, EXIT_KEY_CODE, GAME_HEIGHT, GAME_WIDTH, GameState, GameStatus, START_PAUSE_KEY_CODE } from './hud';
import { createSpaceship, drawSpaceship, tickSpaceships } from './spaceships';
import { calculateScore, collectPlayerControls, forEachAbility, getAlmanacForAbilities } from './utils';

const createState = (status = GameStatus.PLAYING): GameState => ({
  status,
  statistics: {
    time: 0,
    asteroidsSpawned: 0,
    asteroidsDestroyed: 0,
    abilitiesUsed: 0
  },
  player: createSpaceship(),
  asteroids: [],
  entities: [],
  stars: createStars(),
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

    const playerControlKeys = collectPlayerControls(stateRef.current.player);

    // ----- Input -----
    const onKeyDown = (event: KeyboardEvent) => {
      const state = stateRef.current;
      const playerControls = state.player.controls;
      const playerAbilities = state.player.abilities;
      if (playerControlKeys.includes(event.code)) {
        event.preventDefault();
      }

      switch (event.code) {
        case EXIT_KEY_CODE:
          if ([GameStatus.PAUSED, GameStatus.OVER].includes(state.status)) {
            navigate('/menu');
          }
          break;
        case START_PAUSE_KEY_CODE:
          switch (state.status) {
            case GameStatus.PLAYING:
              state.status = GameStatus.PAUSED;
              break;
            case GameStatus.PAUSED:
              state.status = GameStatus.PLAYING;
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
        default:
          forEachAbility(abilityIdx => {
            const ability = playerAbilities[abilityIdx];
            const abilityProfile = playerAbilities.profile[abilityIdx];
            const almanacEntry = getAlmanacForAbilities(state.player)[abilityIdx];

            if (event.code === ability.key && ability.cooldownTimer === 0) {
              abilityProfile.callback(state.player, state);
              ability.activeTimer = almanacEntry.activeTime;
              ability.cooldownTimer = almanacEntry.cooldown + almanacEntry.activeTime;
              state.statistics.abilitiesUsed++;
            }
          });
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
    const update = (deltaTime: number) => {
      const state = stateRef.current;
      if (state.status !== GameStatus.PLAYING) {
        return;
      }

      state.statistics.time += deltaTime;

      tickStars(state.stars, deltaTime);
      tickSpaceships(state, deltaTime);
      tickEntities(state, deltaTime);
      const { hit } = tickAsteroids(state, deltaTime);
      if (hit) {
        state.status = GameStatus.OVER;
        const score = calculateScore(state.statistics);

        if (score > bestRef.current) {
          bestRef.current = score;
          setBest(score);
        }
      }
    };

    const draw = () => {
      const state = stateRef.current;

      drawBackground(ctx, state.stars);
      for (const asteroid of state.asteroids.filter(a => a.active)) {
        drawAsteroid(ctx, asteroid);
      }
      drawEntities(ctx, state.entities);
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

  return <canvas id="game-canvas" ref={canvasRef} aria-label={`High score: ${best}`} />;
}
