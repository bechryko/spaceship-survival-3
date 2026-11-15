import './SpaceshipSelect.css';

import { useState, type CSSProperties } from 'react';
import { NavLink, useNavigate } from 'react-router';
import StarBackground from '../StarBackground';
import ColorPicker from './ColorPicker/ColorPicker';
import { loadColor, saveColor, SPACESHIP_COLORS } from './ColorPicker/spaceship-colors';
import SpaceshipIcon from './SpaceshipIcon';
import { getSpaceshipDefinition, GRID_SLOT_COUNT, SPACESHIPS } from './spaceship-catalog';

const SLOTS = Array.from({ length: GRID_SLOT_COUNT }, (_, index) => SPACESHIPS[index] ?? null);

export default function SpaceshipSelect() {
  const navigate = useNavigate();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [color, setColor] = useState(loadColor());

  const previewId = hoveredId ?? selectedId;
  const preview = previewId ? getSpaceshipDefinition(previewId) : null;

  const changeColor = (color: string) => {
    setColor(color);
    saveColor(color);
  };

  const start = () => {
    if (selectedId) {
      navigate('/play', { state: { spaceshipId: selectedId, color } });
    }
  };

  return (
    <div className="select-screen">
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

        <button type="button" className="button start-button" disabled={!selectedId} onClick={start}>
          Start
        </button>
      </section>

      <hr className="select-divider" />

      <section className="select-bottom">
        <div className="slot-grid">
          {SLOTS.map((spaceship, index) =>
            spaceship ? (
              <button
                key={spaceship.id}
                type="button"
                className="slot"
                aria-label={spaceship.name}
                aria-pressed={spaceship.id === selectedId}
                onClick={() => setSelectedId(spaceship.id)}
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
