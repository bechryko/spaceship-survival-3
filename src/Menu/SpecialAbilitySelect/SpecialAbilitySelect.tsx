import './SpecialAbilitySelect.css';

import { CSSProperties, useState } from 'react';
import { NavLink, useLocation } from 'react-router';
import { SpecialAbilityIcon } from 'spaceship-survival-3/components';
import { useSettings } from 'spaceship-survival-3/context';
import { Page, forceRedirect, useCustomNavigation, useEventListener } from 'spaceship-survival-3/hooks';
import { loadColor } from 'spaceship-survival-3/localstorage';
import { classNames } from 'spaceship-survival-3/utility';
import { getSpaceshipDefinition } from '../SpaceshipSelect/spaceship-catalog';
import StarBackground from '../StarBackground';
import LoadoutPreview from './LoadoutPreview';
import {
  SPECIAL_ABILITIES,
  SPECIAL_ABILITY_GRID_COLUMNS,
  SPECIAL_ABILITY_GRID_ROWS,
  getSpecialAbility
} from './special-abilities';

interface SelectionState {
  spaceshipIds?: Array<string | null>;
  specialAbilityNames?: Array<string | null>;
}

const SLOTS = Array.from(
  { length: SPECIAL_ABILITY_GRID_COLUMNS * SPECIAL_ABILITY_GRID_ROWS },
  (_, index) => SPECIAL_ABILITIES[index] ?? null
);

export default function SpecialAbilitySelect() {
  const navigate = useCustomNavigation();
  const returned = useLocation().state as SelectionState | null;

  const [selectedId1, setSelectedId1] = useState<string | null>(returned?.specialAbilityNames?.[0] ?? null);

  const [selectedId2, setSelectedId2] = useState<string | null>(returned?.specialAbilityNames?.[1] ?? null);

  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [readyState, setReadyState] = useState<[boolean, boolean]>([false, false]);
  const activeSelection = readyState[0] ? 2 : 1;

  const { settings } = useSettings();

  useEventListener('keydown', event => {
    if (event.code === settings.controls.menuBack) {
      navigate(Page.SPACESHIP_SELECTION, {
        spaceshipIds: returned?.spaceshipIds,
        specialAbilityNames: [selectedId1, selectedId2]
      });
    }
  });

  if (!returned?.spaceshipIds) {
    forceRedirect(Page.SPACESHIP_SELECTION);
    return;
  }

  const [spaceshipId1, spaceshipId2] = returned.spaceshipIds;
  const isMultiplayer = spaceshipId2 !== null;
  const spaceship1 = getSpaceshipDefinition(spaceshipId1);
  const spaceship2 = getSpaceshipDefinition(spaceshipId2);
  const color1 = loadColor();
  const color2 = loadColor(true);

  const previewId = hoveredId ?? (activeSelection === 1 ? selectedId1 : selectedId2);
  const preview = previewId ? getSpecialAbility(previewId) : undefined;

  const preview1 = activeSelection === 1 ? preview : selectedId1 ? getSpecialAbility(selectedId1) : undefined;
  const preview2 = activeSelection === 2 ? preview : selectedId2 ? getSpecialAbility(selectedId2) : undefined;

  const selectSpecialAbility = (id: string, isDisabled: boolean) => {
    if (isDisabled) {
      return;
    }

    if (!readyState[0]) {
      setSelectedId1(id);
    } else {
      setSelectedId2(id);
    }
  };

  const start = () => {
    if (selectedId1) {
      navigate(Page.GAME, {
        players: !isMultiplayer ? 1 : 2,
        spaceshipIds: returned.spaceshipIds,
        specialAbilityIds: [selectedId1, selectedId2]
      });
    }
  };

  const ready = (player: 0 | 1) => {
    const previousReadyState = readyState[player];
    const newReadyState: [boolean, boolean] = [...readyState];
    newReadyState[player] = !previousReadyState;

    if (newReadyState[0] && newReadyState[1]) {
      start();
    } else {
      setReadyState(newReadyState);
    }
  };

  return (
    <div className="select-screen ability-screen">
      <StarBackground />

      <div className="select-side">
        <NavLink
          className="button back-button blur-background"
          to={Page.SPACESHIP_SELECTION}
          state={{ spaceshipIds: returned.spaceshipIds, specialAbilityNames: [selectedId1, selectedId2] }}
        >
          Back to Spaceship selection
        </NavLink>
      </div>

      <div className="select-top">
        <section
          className={classNames({
            'loadout-container': true,
            singleplayer: !isMultiplayer,
            active: activeSelection === 1 && isMultiplayer
          })}
        >
          <LoadoutPreview
            isMultiplayer={isMultiplayer}
            specialAbilityPreview={preview1}
            color={color1}
            spaceship={spaceship1}
            selectedId={selectedId1}
          />

          {!isMultiplayer ? (
            <button
              type="button"
              className="button start-button blur-background"
              disabled={!selectedId1}
              onClick={start}
            >
              Start
            </button>
          ) : (
            <button
              type="button"
              className="button ready-button blur-background"
              disabled={!selectedId1}
              onClick={() => ready(0)}
            >
              {readyState[0] ? 'Not ready' : 'Ready'}
            </button>
          )}
        </section>

        {isMultiplayer && (
          <section
            className={classNames({ 'loadout-container': true, active: activeSelection === 2 && isMultiplayer })}
          >
            <LoadoutPreview
              isMultiplayer={isMultiplayer}
              specialAbilityPreview={preview2}
              color={color2}
              spaceship={spaceship2}
              selectedId={selectedId2}
            />

            <button
              type="button"
              className="button ready-button blur-background"
              disabled={!selectedId2}
              onClick={() => ready(1)}
            >
              {readyState[1] ? 'Not ready' : 'Ready'}
            </button>
          </section>
        )}
      </div>

      <hr className="select-divider" />

      <section className="select-bottom">
        <div className="slot-grid" style={{ '--columns': SPECIAL_ABILITY_GRID_COLUMNS } as CSSProperties}>
          {SLOTS.map((slotAbility, index) => {
            const isHighlighted = spaceship1.suggestedSpecialAbilities.includes(slotAbility?.id);

            const isDisabledMultiplayer = slotAbility?.conditions?.multiplayerOnly && !isMultiplayer;
            const isDisabled = Boolean(isDisabledMultiplayer);
            const disabledText = isDisabledMultiplayer ? 'Unavailable in singleplayer' : '';

            return slotAbility ? (
              <button
                key={slotAbility.id}
                type="button"
                className={classNames({ slot: true, highlighted: isHighlighted })}
                disabled={isDisabled}
                title={disabledText}
                aria-label={slotAbility.id}
                aria-pressed={slotAbility.id === selectedId1}
                onClick={() => selectSpecialAbility(slotAbility.id, isDisabled)}
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
