import './SpecialAbilitySelect.css';

import { useState, type CSSProperties } from 'react';
import { NavLink, useLocation } from 'react-router';
import { SpaceshipIcon, SpecialAbilityIcon } from '../../components';
import { useSettings } from '../../context';
import { forceRedirect, Page, useCustomNavigation, useEventListener } from '../../hooks';
import { loadColor } from '../../localstorage';
import { getSpaceshipDefinition } from '../SpaceshipSelect/spaceship-catalog';
import StarBackground from '../StarBackground';
import {
  getSpecialAbility,
  SPECIAL_ABILITIES,
  SPECIAL_ABILITY_GRID_COLUMNS,
  SPECIAL_ABILITY_GRID_ROWS
} from './special-abilities';

interface SelectionState {
  spaceshipId?: string;
  specialAbilityName?: string;
}

const SLOTS = Array.from(
  { length: SPECIAL_ABILITY_GRID_COLUMNS * SPECIAL_ABILITY_GRID_ROWS },
  (_, index) => SPECIAL_ABILITIES[index] ?? null
);

export default function AbilitySelect() {
  const navigate = useCustomNavigation();
  const location = useLocation();
  const state = location.state as SelectionState | null;
  const { settings } = useSettings();

  const [selectedId, setSelectedId] = useState<string | null>(state?.specialAbilityName ?? null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  useEventListener('keydown', event => {
    if (event.code === settings.controls.menuBack) {
      navigate(Page.SPACESHIP_SELECTION, { spaceshipId: state?.spaceshipId, specialAbilityName: selectedId });
    }
  });

  if (!state?.spaceshipId) {
    forceRedirect(Page.SPACESHIP_SELECTION);
    return;
  }

  const { spaceshipId } = state;
  const spaceship = getSpaceshipDefinition(spaceshipId);
  const color = loadColor();

  const previewId = hoveredId ?? selectedId;
  const ability = previewId ? getSpecialAbility(previewId) : undefined;

  const start = () => {
    if (selectedId) {
      navigate(Page.GAME, { spaceshipId, specialAbilityId: selectedId });
    }
  };

  return (
    <div className="select-screen ability-screen">
      <StarBackground />

      <div className="select-side">
        <NavLink
          className="button back-button"
          to={Page.SPACESHIP_SELECTION}
          state={{ spaceshipId, specialAbilityName: selectedId }}
        >
          Back
        </NavLink>
      </div>

      <section className="select-top">
        <div className="loadout">
          <div className="loadout-ship">
            <div className="loadout-ship-icon" style={{ '--ship-color': color } as CSSProperties}>
              <SpaceshipIcon color={color} shape={spaceship.shape} flame="animated" />
            </div>
            <h2>{spaceship.name}</h2>
          </div>

          <div className="loadout-ability glass-scrollbar" aria-live="polite">
            {ability ? (
              <>
                <div className="loadout-ability-icon">
                  <SpecialAbilityIcon id={ability.id} />
                </div>

                <div>
                  <h2>
                    {ability.id}
                    {ability.id === selectedId && <span className="preview-tag">Selected</span>}
                  </h2>
                  <p className="loadout-ability-meta">
                    {ability.kind === 'passive' ? 'Passive' : `Press R · ${ability.cooldown}s cooldown`}
                  </p>
                  <p className="loadout-ability-description">{ability.shortDescription}</p>
                </div>
              </>
            ) : (
              <p className="preview-empty">Choose a special ability</p>
            )}
          </div>
        </div>

        <button type="button" className="button start-button" disabled={!selectedId} onClick={start}>
          Start
        </button>
      </section>

      <hr className="select-divider" />

      <section className="select-bottom">
        <div className="slot-grid" style={{ '--columns': SPECIAL_ABILITY_GRID_COLUMNS } as CSSProperties}>
          {SLOTS.map((slotAbility, index) => {
            const isHighlighted = spaceship.suggestedSpecialAbilities.includes(slotAbility?.id);

            return slotAbility ? (
              <button
                key={slotAbility.id}
                type="button"
                className={'slot' + (isHighlighted ? ' highlighted' : '')}
                aria-label={slotAbility.id}
                aria-pressed={slotAbility.id === selectedId}
                onClick={() => setSelectedId(slotAbility.id)}
                onMouseEnter={() => setHoveredId(slotAbility.id)}
                onMouseLeave={() => setHoveredId(null)}
                onFocus={() => setHoveredId(slotAbility.id)}
                onBlur={() => setHoveredId(null)}
              >
                <SpecialAbilityIcon id={slotAbility.id} />
              </button>
            ) : (
              <span key={`empty-${index}`} className="slot slot-empty" aria-hidden="true" />
            );
          })}
        </div>
      </section>
    </div>
  );
}
