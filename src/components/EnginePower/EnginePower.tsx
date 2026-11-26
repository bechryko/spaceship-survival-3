import './EnginePower.css';

import { classNames } from 'spaceship-survival-3/utility';

interface Props {
  level: number;
  label?: boolean;
}

const ENGINE_POWER_MAX_LEVELS = 5;

export function EnginePower({ level, label = true }: Props) {
  const lit = Math.min(ENGINE_POWER_MAX_LEVELS, Math.max(0, Math.round(level)));

  return (
    <div
      className={classNames({ 'engine-power': true, 'no-margin': !label })}
      role="img"
      aria-label={`Engine power: ${lit} out of ${ENGINE_POWER_MAX_LEVELS}`}
    >
      {label && <span className="engine-power-label">Engine power</span>}
      <span className="engine-power-bars" aria-hidden="true">
        {Array.from({ length: ENGINE_POWER_MAX_LEVELS }, (_, index) => (
          <span
            key={index}
            className="engine-power-bar"
            data-lit={index < lit}
            style={{ height: `${40 + index * 15}%` }}
          />
        ))}
      </span>
    </div>
  );
}
