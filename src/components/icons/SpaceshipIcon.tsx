import { Point } from 'spaceship-survival-3/Game/models';
import { SpaceshipShape } from 'spaceship-survival-3/Game/spaceships';
import { classNames } from 'spaceship-survival-3/utility';

const toPoints = (points: readonly Point[]): string => points.map(([x, y]) => `${x},${y}`).join(' ');

type Props = {
  color: string;
  shape: SpaceshipShape;
  flame?: 'none' | 'static' | 'animated';
};

export function SpaceshipIcon({ color, shape, flame = 'none' }: Props) {
  const flameHalfWidth = shape.engines.length > 1 ? 3 : 4; // ships with twin engines get slimmer flames

  return (
    <svg viewBox="-28 -32 56 80" aria-hidden="true" focusable="false">
      {flame !== 'none' &&
        shape.engines.map(([x, y], index) => (
          <polygon
            key={index}
            className={classNames({ 'spaceship-flame': flame === 'animated' })}
            points={`${x - flameHalfWidth},${y} ${x},${y + 16} ${x + flameHalfWidth},${y}`}
            fill="#ffb703"
            opacity="0.9"
          />
        ))}

      <polygon
        points={toPoints(shape.hull)}
        fill={color}
        stroke="rgba(0, 0, 0, 0.4)"
        strokeWidth="1.2"
        strokeLinejoin="round"
      />

      {shape.panels?.map((panel, index) => (
        <polygon key={index} points={toPoints(panel)} fill="rgba(0, 0, 0, 0.2)" />
      ))}

      {shape.spine && (
        <line
          x1={shape.spine[0][0]}
          y1={shape.spine[0][1]}
          x2={shape.spine[1][0]}
          y2={shape.spine[1][1]}
          stroke="rgba(255, 255, 255, 0.25)"
          strokeWidth="1"
        />
      )}

      {shape.lights?.map(([x, y], index) => (
        <circle key={index} cx={x} cy={y} r="1.6" fill="#7fe8ff" />
      ))}

      <ellipse cx={shape.cockpit.cx} cy={shape.cockpit.cy} rx={shape.cockpit.rx} ry={shape.cockpit.ry} fill="#bde0fe" />
    </svg>
  );
}
