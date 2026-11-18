import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Star, createStars, drawBackground } from '../Game/background';

const STAR_DENSITY = 1 / 3000;

const BACKGROUND_COLOR = '#0b103c';

export default function StarBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext('2d')!;
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

    let width = 0;
    let height = 0;
    let stars: Star[] = [];

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      width = canvas.clientWidth;
      height = canvas.clientHeight;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const day = Math.floor(Date.now() / 1000 / 60 / 60 / 24);
      stars = createStars(width, height, Math.round(width * height * STAR_DENSITY), day);

      if (reducedMotion.matches) {
        drawBackground(ctx, stars, BACKGROUND_COLOR, width, height);
      }
    };

    resize();
    const observer = new ResizeObserver(resize);
    observer.observe(canvas);

    let rafId = 0;

    const frame = () => {
      for (const star of stars) {
        star.phaseChange = Date.now() / 1000;
      }
      drawBackground(ctx, stars, BACKGROUND_COLOR, width, height);
      rafId = requestAnimationFrame(frame);
    };

    if (!reducedMotion.matches) {
      rafId = requestAnimationFrame(frame);
    }

    return () => {
      cancelAnimationFrame(rafId);
      observer.disconnect();
    };
  }, []);

  // Rendered into <body> so no ancestor (a transform, filter or fixed-size wrapper) can shrink it,
  // and with explicit resets so global `canvas { ... }` rules can't cap its size.
  return createPortal(
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      style={{
        position: 'fixed',
        inset: 0,
        width: '100%',
        height: '100%',
        maxWidth: 'none',
        maxHeight: 'none',
        aspectRatio: 'auto',
        margin: 0,
        border: 0,
        borderRadius: 0,
        display: 'block',
        zIndex: 0,
        pointerEvents: 'none'
      }}
    />,
    document.body
  );
}
