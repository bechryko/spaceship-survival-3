import './DifficultyLevel.css';

import { CSSProperties } from 'react';
import { clamp } from 'spaceship-survival-3/Game/utils';

interface Props {
  level: number;
  label?: boolean;
}

const DIFFICULTY_COLORS = ['#ffd269', '#ff9a4d', '#ff7a59', '#ff5d86', '#b65dff'];
const DIFFICULTY_MAX_LEVEL = 5;

export function DifficultyLevel({ level, label = true }: Props) {
  const lit = clamp(level, 0, DIFFICULTY_MAX_LEVEL);

  return (
    <div
      className={'difficulty' + (label ? '' : ' no-margin')}
      role="img"
      aria-label={`Difficulty: ${lit} out of ${DIFFICULTY_MAX_LEVEL}`}
    >
      {label && <span className="difficulty-label">Difficulty</span>}
      <span className="difficulty-pips" aria-hidden="true">
        {Array.from({ length: DIFFICULTY_MAX_LEVEL }, (_, index) => (
          <span
            key={index}
            className="difficulty-pip"
            data-lit={index < lit}
            style={{ '--pip-color': DIFFICULTY_COLORS[index] } as CSSProperties}
          />
        ))}
      </span>
    </div>
  );
}
