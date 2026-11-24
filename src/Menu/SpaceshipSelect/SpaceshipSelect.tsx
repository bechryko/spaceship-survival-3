import './SpaceshipSelect.css';

import { CSSProperties, useState } from 'react';
import { NavLink, useLocation } from 'react-router';
import { DifficultyLevel, EnginePower, SpaceshipIcon } from 'spaceship-survival-3/components';
import { useSettings } from 'spaceship-survival-3/context';
import { Page, useCustomNavigation, useEventListener } from 'spaceship-survival-3/hooks';
import { loadColor, saveColor } from 'spaceship-survival-3/localstorage';
import { menuKeybinds } from '../menu-keybinds';
import StarBackground from '../StarBackground';
import ColorPicker from './ColorPicker/ColorPicker';
import { SPACESHIP_COLORS } from './ColorPicker/spaceship-colors';
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
  const navigate = useCustomNavigation();
  const returned = useLocation().state as ReturnState | null;

  const [selectedId, setSelectedId] = useState<string | null>(returned?.spaceshipId ?? null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [color, setColor] = useState(loadColor());
  const [specialAbilityName, setSpecialAbilityName] = useState(returned?.specialAbilityName);
  const { settings } = useSettings();

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
      navigate(Page.SPECIAL_ABILITY_SELECTION, { spaceshipId: selectedId, specialAbilityName });
    }
  };

  useEventListener('keydown', event => {
    if (event.code === settings.controls.menuBack || event.code === menuKeybinds.backToMainMenu) {
      navigate(Page.MENU);
    }
  });

  return (
    <div className="select-screen spaceship-screen">
      <StarBackground />

      <div className="select-side">
        <NavLink className="button back-button" to={Page.MENU}>
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
                <DifficultyLevel level={preview.difficultyLevel}></DifficultyLevel>
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
