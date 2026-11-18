import './SpaceshipSelect.css';

import { useState, type CSSProperties } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router';
import { loadColor, saveColor } from '../../localstorage';
import StarBackground from '../StarBackground';
import ColorPicker from './ColorPicker/ColorPicker';
import { SPACESHIP_COLORS } from './ColorPicker/spaceship-colors';
import SpaceshipIcon from './SpaceshipIcon';
import { getSpaceshipDefinition, SPACESHIP_GRID_COLUMNS, SPACESHIP_GRID_ROWS, SPACESHIPS } from './spaceship-catalog';

const SLOTS = Array.from(
  { length: SPACESHIP_GRID_COLUMNS * SPACESHIP_GRID_ROWS },
  (_, index) => SPACESHIPS[index] ?? null
);

const ENGINE_POWER_MAX_LEVELS = 5;

/** "Engine power" with five rising bars, as many lit as the ship's speed level. */
function EnginePower({ level }: { level: number }) {
  const lit = Math.min(ENGINE_POWER_MAX_LEVELS, Math.max(0, Math.round(level)));

  return (
    <div className="engine-power" role="img" aria-label={`Engine power: ${lit} out of ${ENGINE_POWER_MAX_LEVELS}`}>
      <span className="engine-power-label">Engine power</span>
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

interface ReturnState {
  spaceshipId?: string;
  specialAbilityName?: string;
}

export default function SpaceshipSelect() {
  const navigate = useNavigate();
  const returned = useLocation().state as ReturnState | null;

  const [selectedId, setSelectedId] = useState<string | null>(returned?.spaceshipId ?? null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [color, setColor] = useState(loadColor());
  const [specialAbilityName, setSpecialAbilityName] = useState(returned?.specialAbilityName);

  const previewId = hoveredId ?? selectedId;
  const preview = previewId ? getSpaceshipDefinition(previewId) : null;

  const changeColor = (color: string) => {
    setColor(color);
    saveColor(color);
  };

  const selectSpaceship = (id: string) => {
    if (id === selectedId) {
      return;
    }

    setSelectedId(id);
    setSpecialAbilityName(undefined);
  };

  const next = () => {
    if (selectedId) {
      navigate('/select/2', { state: { spaceshipId: selectedId, specialAbilityName } });
    }
  };

  return (
    <div className="select-screen spaceship-screen">
      <StarBackground />

      <div className="select-side">
        <NavLink className="button back-button" to="/menu">
          Back to Menu
        </NavLink>

        <ColorPicker label="Change Color" colors={SPACESHIP_COLORS} value={color} onChange={changeColor} />
      </div>

      <section className="select-top">
        <div className="preview" aria-live="polite">
          {preview ? (
            <>
              <div className="preview-icon" style={{ '--ship-color': color } as CSSProperties}>
                <SpaceshipIcon color={color} shape={preview.shape} flame="animated" />
              </div>

              <div className="preview-details glass-scrollbar">
                <h2>
                  {preview.name}
                  {preview.id === selectedId && <span className="preview-tag">Selected</span>}
                </h2>
                <EnginePower level={preview.speedLevel} />
                <p className="preview-description">{preview.description}</p>

                <ul className="abilities">
                  {preview.abilities.map(ability => (
                    <li key={ability.key} className="ability">
                      <span className="ability-key">{ability.key}</span>
                      <div>
                        <span className="ability-name">{ability.name}</span>
                        <span className="ability-cooldown">{ability.cooldown}s cooldown</span>
                        <p className="ability-description">{ability.description}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </>
          ) : (
            <p className="preview-empty">Choose your spaceship</p>
          )}
        </div>

        <button type="button" className="button start-button" disabled={!selectedId} onClick={next}>
          Next
        </button>
      </section>

      <hr className="select-divider" />

      <section className="select-bottom">
        <div className="slot-grid" style={{ '--columns': SPACESHIP_GRID_COLUMNS } as CSSProperties}>
          {SLOTS.map((spaceship, index) =>
            spaceship ? (
              <button
                key={spaceship.id}
                type="button"
                className="slot"
                aria-label={spaceship.name}
                aria-pressed={spaceship.id === selectedId}
                onClick={() => selectSpaceship(spaceship.id)}
                onMouseEnter={() => setHoveredId(spaceship.id)}
                onMouseLeave={() => setHoveredId(null)}
                onFocus={() => setHoveredId(spaceship.id)}
                onBlur={() => setHoveredId(null)}
              >
                <SpaceshipIcon color={color} shape={spaceship.shape} flame="static" />
              </button>
            ) : (
              <span key={`empty-${index}`} className="slot slot-empty" aria-hidden="true" />
            )
          )}
        </div>
      </section>
    </div>
  );
}
