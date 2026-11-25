import './Game.css';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useLocation } from 'react-router';
import { useSettings } from 'spaceship-survival-3/context';
import { forceRedirect, Page, useCustomNavigation } from 'spaceship-survival-3/hooks';
import { saveHighscore } from 'spaceship-survival-3/localstorage';
import { drawAsteroid, tickAsteroids } from './asteroids';
import { drawBackground, tickStars } from './background';
import { drawEntities, tickEntities } from './entities';
import { drawGlobalEffects, tickGlobalEffects } from './global-effects';
import { createFpsCounter, createGameState, drawHUD, EXIT_KEY_CODE, GameStateConfig, GameStatus, tickFps } from './hud';
import { activateAbility, drawSpaceships, SpecialAbilityAlmanac, tickSpaceships } from './spaceships';
import { calculateScore, collectPlayerControls, forEachAbility, getAlmanacForAbilities, initCanvas } from './utils';

const DEBUG_EXTRA_FAST_GAME_SPEED = 5;
const DEBUG_FAST_GAME_SPEED = 2;
const DEBUG_SLOW_GAME_SPEED = 0.1;
const DEBUG_EXTRA_SLOW_GAME_SPEED = 0.04;

export default function Game() {
  const navigationState = useLocation().state;
  const isQuickPlay = Boolean(navigationState?.quickPlay);
  const gameStateConfig: GameStateConfig = useMemo(
    () =>
      isQuickPlay
        ? {
            isQuickPlay
          }
        : {
            isQuickPlay,
            abilityClass: navigationState?.spaceshipId,
            specialAbilityName: navigationState?.specialAbilityId
          },
    [isQuickPlay, navigationState]
  );

  if (!isQuickPlay && (!navigationState?.spaceshipId || !navigationState?.specialAbilityId)) {
    forceRedirect(Page.SPACESHIP_SELECTION);
  }

  const { settings } = useSettings();

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [fpsCounter] = useState(() => createFpsCounter());
  const [gameState, setGameState] = useState(() => createGameState(gameStateConfig, settings));
  const stateRef = useRef(gameState);
  const navigate = useCustomNavigation();

  useEffect(() => {
    stateRef.current = gameState;

    const canvas = canvasRef.current!;
    const ctx = canvas.getContext('2d')!;
    initCanvas(canvas, settings);

    const playerControlKeys = collectPlayerControls(stateRef.current.players);
    const allControlKeys = [
      ...playerControlKeys,
      EXIT_KEY_CODE,
      settings.controls.menuBack,
      settings.controls.pauseResume,
      settings.controls.restart,
      ...Object.values(settings.controls.debug)
    ];

    // ----- Input -----
    const onKeyDown = (event: KeyboardEvent) => {
      const state = stateRef.current;
      if (allControlKeys.includes(event.code)) {
        event.preventDefault();
      }

      if (event.code === EXIT_KEY_CODE) {
        if ([GameStatus.PAUSED, GameStatus.OVER].includes(state.status)) {
          navigate(Page.MENU);
        }
      }

      if (event.code === settings.controls.menuBack) {
        if ([GameStatus.PAUSED, GameStatus.OVER].includes(state.status) && !isQuickPlay) {
          navigate(Page.SPACESHIP_SELECTION, navigationState);
        }
      }

      if (event.code === settings.controls.pauseResume) {
        if (state.status === GameStatus.PLAYING) {
          state.status = GameStatus.PAUSED;
        } else if (state.status === GameStatus.PAUSED) {
          state.status = GameStatus.PLAYING;
        }
      }

      if (event.code === settings.controls.restart) {
        if (state.status === GameStatus.OVER) {
          setGameState(createGameState(gameStateConfig, settings, GameStatus.PLAYING));
        }
      }

      if (state.status === GameStatus.PLAYING) {
        state.players.forEach(player => {
          const playerControls = player.controls;
          const playerAbilities = player.abilities;

          if (event.code === playerControls.leftKeyCode) {
            playerControls.left = true;
          }
          if (event.code === playerControls.rightKeyCode) {
            playerControls.right = true;
          }

          forEachAbility(abilityIdx => {
            const abilityProfile = playerAbilities.profile[abilityIdx];
            const ability = playerAbilities[abilityIdx];
            const abilityAlmanacEntry = getAlmanacForAbilities(player)[abilityIdx];

            activateAbility(player, state, event.code, ability, abilityProfile, abilityAlmanacEntry);
          });

          const specialAbility = playerAbilities.r;
          const specialAbilityProfile = playerAbilities.specialProfile;
          const specialAbilityAlmanacEntry = SpecialAbilityAlmanac[playerAbilities.special];

          activateAbility(player, state, event.code, specialAbility, specialAbilityProfile, specialAbilityAlmanacEntry);
        });
      }

      if (settings.debugControls) {
        switch (event.code) {
          case settings.controls.debug.extraFastGameSpeed:
            state.speed = DEBUG_EXTRA_FAST_GAME_SPEED;
            break;
          case settings.controls.debug.fastGameSpeed:
            state.speed = DEBUG_FAST_GAME_SPEED;
            break;
          case settings.controls.debug.normalGameSpeed:
            state.speed = 1;
            break;
          case settings.controls.debug.slowGameSpeed:
            state.speed = DEBUG_SLOW_GAME_SPEED;
            break;
          case settings.controls.debug.extraSlowGameSpeed:
            state.speed = DEBUG_EXTRA_SLOW_GAME_SPEED;
            break;
        }
      }
    };

    const onKeyUp = (event: KeyboardEvent) => {
      stateRef.current.players.forEach(player => {
        const playerControls = player.controls;
        const playerAbilities = player.abilities;

        if (event.code === playerControls.leftKeyCode) {
          playerControls.left = false;
        }

        if (event.code === playerControls.rightKeyCode) {
          playerControls.right = false;
        }

        forEachAbility(ability => {
          if (event.code === playerAbilities[ability].key) {
            playerAbilities[ability].reactivatable = true;
          }
        }, true);
      });
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
      tickStars(state.visual.stars, deltaTime);
      tickSpaceships(state, deltaTime);
      tickEntities(state, deltaTime);
      const { hitIndexes } = tickAsteroids(state, deltaTime);
      if (hitIndexes.length > 0) {
        state.status = GameStatus.OVER;
        const score = calculateScore(state);

        if (score > state.highscore) {
          saveHighscore(score);
        }
      }
      tickGlobalEffects(state, deltaTime);
    };

    const draw = () => {
      const state = stateRef.current;
      const { time } = state.statistics;

      drawBackground(ctx, state);
      for (const asteroid of state.asteroids) {
        if (!asteroid.active) {
          continue;
        }

        drawAsteroid(ctx, asteroid);
      }
      drawEntities(ctx, state.entities, time);
      drawSpaceships(ctx, state.players, time);
      drawGlobalEffects(ctx, state);
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
  }, [fpsCounter, gameState, gameStateConfig, isQuickPlay, navigate, navigationState, settings]);

  return <canvas id="game-canvas" ref={canvasRef} />;
}
