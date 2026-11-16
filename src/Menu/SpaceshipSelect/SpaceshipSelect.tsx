import './SpaceshipSelect.css';

import { useState, type CSSProperties } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router';
import StarBackground from '../StarBackground';
import ColorPicker from './ColorPicker/ColorPicker';
import { loadColor, saveColor, SPACESHIP_COLORS } from './ColorPicker/spaceship-colors';
import SpaceshipIcon from './SpaceshipIcon';
import { getSpaceshipDefinition, SPACESHIP_GRID_COLUMNS, SPACESHIP_GRID_ROWS, SPACESHIPS } from './spaceship-catalog';

const SLOTS = Array.from(
  { length: SPACESHIP_GRID_COLUMNS * SPACESHIP_GRID_ROWS },
  (_, index) => SPACESHIPS[index] ?? null
);

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
                <SpaceshipIcon color={color} flame="animated" />
              </div>

              <div className="preview-details">
                <h2>
                  {preview.name}
                  {preview.id === selectedId && <span className="preview-tag">Selected</span>}
                </h2>
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
                <SpaceshipIcon color={color} flame="static" />
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
