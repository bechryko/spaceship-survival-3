import './Game.css';

import { useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router';
import { useSettings } from '../context';
import { loadColor, loadHighscore, saveHighscore } from '../localstorage';
import { drawAsteroid, level2AsteroidBlueprints, tickAsteroids } from './asteroids';
import { createStars, drawBackground, tickStars } from './background';
import { drawEntities, tickEntities } from './entities';
import { createGlobalEffectsState, drawGlobalEffects, tickGlobalEffects } from './global-effects';
import {
  BACK_TO_SELECTION_KEY_CODE,
  createFpsCounter,
  drawHUD,
  EXIT_KEY_CODE,
  GAME_HEIGHT,
  GAME_WIDTH,
  GameState,
  GameStatus,
  START_PAUSE_KEY_CODE,
  tickFps
} from './hud';
import {
  AbilityClass,
  activateAbility,
  createSpaceship,
  drawSpaceship,
  SpecialAbilityAlmanac,
  SpecialAbilityName,
  tickSpaceships
} from './spaceships';
import { calculateScore, choose, collectPlayerControls, forEachAbility, getAlmanacForAbilities } from './utils';

const DEBUG_SLOW_GAME_SPEED = 0.1;
const DEBUG_EXTRA_SLOW_GAME_SPEED = 0.04;

export default function Game() {
  const navigationState = useLocation().state;
  const isQuickPlay = Boolean(navigationState?.quickPlay);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stateRef = useRef<GameState>(createState());

  const { settings } = useSettings();
  const navigate = useNavigate();
  if (!navigationState?.spaceshipId || !navigationState?.specialAbilityId) {
    navigate('/select/1');
  }

  const fpsCounter = createFpsCounter();

  function createState(status = GameStatus.PLAYING): GameState {
    const spaceshipAbilityClass: AbilityClass = isQuickPlay
      ? choose(Object.values(AbilityClass))
      : navigationState?.spaceshipId;
    const specialAbilityId: SpecialAbilityName = isQuickPlay
      ? choose(Object.values(SpecialAbilityName))
      : navigationState?.specialAbilityId;

    return {
      status,
      speed: 1,
      statistics: {
        time: 0,
        asteroidsSpawned: 0,
        asteroidsDestroyed: 0,
        abilitiesUsed: 0
      },
      asteroidBlueprints: {
        level2: choose(level2AsteroidBlueprints)
      },
      highscore: loadHighscore(),
      player: createSpaceship(spaceshipAbilityClass, loadColor(), specialAbilityId),
      asteroids: [],
      entities: [],
      globalEffects: createGlobalEffectsState(),
      stars: createStars(),
      spawnTimer: 0
    };
  }

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
      if ([...playerControlKeys, 'ArrowLeft', 'ArrowRight'].includes(event.code)) {
        event.preventDefault();
      }

      switch (event.code) {
        case EXIT_KEY_CODE:
          if ([GameStatus.PAUSED, GameStatus.OVER].includes(state.status)) {
            navigate('/menu');
          }
          break;
        case BACK_TO_SELECTION_KEY_CODE:
          if ([GameStatus.PAUSED, GameStatus.OVER].includes(state.status) && !isQuickPlay) {
            navigate('/select/1', { state: navigationState });
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
        case 'ArrowLeft':
        case playerControls.leftKeyCode:
          playerControls.left = true;
          break;
        case 'ArrowRight':
        case playerControls.rightKeyCode:
          playerControls.right = true;
          break;
        default:
          if (state.status === GameStatus.PLAYING) {
            forEachAbility(abilityIdx => {
              const abilityProfile = playerAbilities.profile[abilityIdx];
              const ability = playerAbilities[abilityIdx];
              const abilityAlmanacEntry = getAlmanacForAbilities(state.player)[abilityIdx];

              activateAbility(state, event.code, ability, abilityProfile, abilityAlmanacEntry);
            });

            const specialAbility = playerAbilities.r;
            const specialAbilityProfile = playerAbilities.specialProfile;
            const specialAbilityAlmanacEntry = SpecialAbilityAlmanac[playerAbilities.special];

            activateAbility(state, event.code, specialAbility, specialAbilityProfile, specialAbilityAlmanacEntry);
          }
          if (settings.debugControls) {
            switch (event.code) {
              case 'Comma':
                state.speed = 1;
                break;
              case 'Period':
                state.speed = DEBUG_SLOW_GAME_SPEED;
                break;
              case 'Slash':
                state.speed = DEBUG_EXTRA_SLOW_GAME_SPEED;
                break;
            }
          }
      }
    };
    const onKeyUp = (event: KeyboardEvent) => {
      const { player } = stateRef.current;
      const playerControls = player.controls;
      const playerAbilities = player.abilities;

      switch (event.code) {
        case 'ArrowLeft':
        case playerControls.leftKeyCode:
          playerControls.left = false;
          break;
        case 'ArrowRight':
        case playerControls.rightKeyCode:
          playerControls.right = false;
          break;
        case playerAbilities.q.key:
          playerAbilities.q.reactivatable = true;
          break;
        case playerAbilities.w.key:
          playerAbilities.w.reactivatable = true;
          break;
        case playerAbilities.e.key:
          playerAbilities.e.reactivatable = true;
          break;
        case playerAbilities.r.key:
          playerAbilities.r.reactivatable = true;
          break;
      }
    };

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);

    // ----- Update -----
    const update = (deltaTime: number) => {
      const originalDeltaTime = deltaTime;
      const state = stateRef.current;
      deltaTime *= state.speed;
      state.statistics.time += deltaTime;

      tickFps(fpsCounter, originalDeltaTime);
      tickStars(state.stars, deltaTime);
      tickSpaceships(state, deltaTime);
      tickEntities(state, deltaTime);
      const { hit } = tickAsteroids(state, deltaTime);
      if (hit) {
        state.status = GameStatus.OVER;
        const score = calculateScore(state);

        if (score > state.highscore) {
          saveHighscore(score);
        }
      }
      tickGlobalEffects(state.globalEffects, state, deltaTime);
    };

    const draw = () => {
      const state = stateRef.current;
      const { time } = state.statistics;

      drawBackground(ctx, state.stars);
      for (const asteroid of state.asteroids.filter(a => a.active)) {
        drawAsteroid(ctx, asteroid);
      }
      drawEntities(ctx, state.entities, time);
      drawSpaceship(ctx, state.player, time);
      drawGlobalEffects(ctx, state.globalEffects);
      drawHUD(ctx, state, settings, isQuickPlay, settings.showFps ? fpsCounter : null);
    };

    let rafId = 0;
    let last = performance.now();

    const frame = (now: number) => {
      const deltaTime = Math.min((now - last) / 1000, 0.05);
      last = now;

      const isPaused = stateRef.current.status !== GameStatus.PLAYING;

      if (!isPaused) {
        update(deltaTime);
      }
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

  return <canvas id="game-canvas" ref={canvasRef} />;
}
