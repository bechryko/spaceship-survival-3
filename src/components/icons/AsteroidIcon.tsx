import { useId } from 'react';

type Point = readonly [number, number];
type Crater = readonly [number, number, number];

type AsteroidLook = {
  body: readonly Point[];
  craters: readonly Crater[];
  gradient: { cx: number; cy: number; r: number; light: string; dark: string };
  outline: string;
  crater: string;
  rim: string;
};

const ASTEROID_ICONS: Record<string, AsteroidLook> = {
  regular: {
    body: [
      [-6.9, -18.9],
      [-14.0, -14.0],
      [-18.4, -6.6],
      [-20.0, 5.6],
      [-8.5, 15.4],
      [-3.2, 17.9],
      [8.8, 16.2],
      [16.2, 7.6],
      [20.0, -3.5],
      [14.6, -10.6],
      [5.1, -16.7]
    ],
    craters: [
      [3.5, 5.9, 3.6],
      [-11.7, -6.7, 2.9],
      [-7.2, 6.9, 2.5],
      [15.1, -2.8, 1.6],
      [0.9, -4.2, 1.4]
    ],
    gradient: { cx: -6.8, cy: -5.8, r: 30.3, light: 'hsl(20 14% 54%)', dark: 'hsl(20 14% 34%)' },
    outline: 'hsl(20 14% 25%)',
    crater: 'hsl(18 14% 29%)',
    rim: 'hsl(21 14% 59%)'
  },

  ice: {
    body: [
      [-11.1, -25.0],
      [-10.3, -10.0],
      [-24.7, 0.4],
      [-12.7, 21.3],
      [2.3, 17.2],
      [14.3, 25.0],
      [17.4, 5.8],
      [17.2, -2.5],
      [24.7, -15.2],
      [13.8, -13.5],
      [3.7, -23.3]
    ],
    craters: [
      [6.8, -8.2, 3.4],
      [-10.1, -3.4, 3.1],
      [-7.9, 12.5, 3.1],
      [11.7, 0.5, 1.7],
      [8.2, 12.4, 1.7],
      [-7.4, -20.1, 1.5]
    ],
    gradient: { cx: 2.6, cy: 12.1, r: 39.6, light: 'hsl(214 54% 82%)', dark: 'hsl(214 54% 64%)' },
    outline: 'hsl(214 54% 52%)',
    crater: 'hsl(214 54% 56%)',
    rim: 'hsl(214 55% 86%)'
  },

  iron: {
    body: [
      [-0.9, -14.0],
      [-7.1, -11.8],
      [-13.6, -4.5],
      [-13.5, 2.1],
      [-10.6, 9.6],
      [-3.8, 13.1],
      [2.8, 14.0],
      [10.2, 9.1],
      [13.1, 2.9],
      [13.6, -4.9],
      [12.0, -8.5],
      [4.1, -13.3]
    ],
    craters: [
      [-4.8, -2.3, 1.8],
      [-1.4, -8.8, 1.3],
      [6.4, 1.8, 1.3],
      [2.0, 10.4, 1.2],
      [-4.8, 3.6, 0.8],
      [8.1, -7.2, 0.6]
    ],
    gradient: { cx: 4.3, cy: -6.1, r: 21.6, light: 'hsl(0 0% 83%)', dark: 'hsl(0 0% 64%)' },
    outline: 'hsl(0 0% 54%)',
    crater: 'hsl(0 0% 58%)',
    rim: 'hsl(0 0% 88%)'
  }
};

const OUTLINE_WIDTH = 1.6;

const toPoints = (points: readonly Point[]): string => points.map(([x, y]) => `${x},${y}`).join(' ');

const rimPath = ([cx, cy, r]: Crater): string => {
  const radius = r * 1.1;
  const end = (125 * Math.PI) / 180;
  return `M ${cx + radius} ${cy} A ${radius} ${radius} 0 0 1 ${cx + Math.cos(end) * radius} ${cy + Math.sin(end) * radius}`;
};

type Props = {
  id: string;
};

export function AsteroidIcon({ id }: Props) {
  const gradientId = `asteroid-gradient-${useId().replace(/:/g, '')}`;
  const asteroid = ASTEROID_ICONS[id] ?? ASTEROID_ICONS.regular;
  const { gradient } = asteroid;

  return (
    <svg viewBox="-28 -28 56 56" aria-hidden="true" focusable="false">
      <defs>
        <radialGradient id={gradientId} gradientUnits="userSpaceOnUse" cx={gradient.cx} cy={gradient.cy} r={gradient.r}>
          <stop offset="0" stopColor={gradient.light} />
          <stop offset="1" stopColor={gradient.dark} />
        </radialGradient>
      </defs>

      <polygon
        points={toPoints(asteroid.body)}
        fill={`url(#${gradientId})`}
        stroke={asteroid.outline}
        strokeWidth={OUTLINE_WIDTH}
        strokeLinejoin="round"
      />

      {asteroid.craters.map(crater => (
        <g key={`${crater[0]},${crater[1]}`}>
          <circle cx={crater[0]} cy={crater[1]} r={crater[2]} fill={asteroid.crater} />
          <path
            d={rimPath(crater)}
            fill="none"
            stroke={asteroid.rim}
            strokeWidth={Math.max(0.45, crater[2] * 0.22)}
            strokeLinecap="round"
          />
        </g>
      ))}
    </svg>
  );
}
