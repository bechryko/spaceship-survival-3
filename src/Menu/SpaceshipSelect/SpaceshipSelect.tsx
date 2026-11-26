import './SpaceshipSelect.css';

import { CSSProperties, useState } from 'react';
import { NavLink, useLocation } from 'react-router';
import { SpaceshipIcon } from 'spaceship-survival-3/components';
import { useSettings } from 'spaceship-survival-3/context';
import { Page, useCustomNavigation, useEventListener } from 'spaceship-survival-3/hooks';
import { loadColor, saveColor } from 'spaceship-survival-3/localstorage';
import { menuKeybinds } from '../menu-keybinds';
import StarBackground from '../StarBackground';
import ColorPicker from './ColorPicker/ColorPicker';
import { SPACESHIP_COLORS } from './ColorPicker/spaceship-colors';
import { getSpaceshipDefinition, SPACESHIP_GRID_COLUMNS, SPACESHIP_GRID_ROWS, SPACESHIPS } from './spaceship-catalog';
import SpaceshipPreview from './SpaceshipPreview';

const SLOTS = Array.from(
  { length: SPACESHIP_GRID_COLUMNS * SPACESHIP_GRID_ROWS },
  (_, index) => SPACESHIPS[index] ?? null
);

interface ReturnState {
  spaceshipIds?: Array<string | null>;
  specialAbilityNames?: Array<string | null>;
}

export default function SpaceshipSelect() {
  const navigate = useCustomNavigation();
  const returned = useLocation().state as ReturnState | null;

  const [selectedId1, setSelectedId1] = useState<string | null>(returned?.spaceshipIds?.[0] ?? null);
  const [color1, setColor1] = useState(loadColor());
  const [specialAbilityName1, setSpecialAbilityName1] = useState(returned?.specialAbilityNames?.[0]);

  const [selectedId2, setSelectedId2] = useState<string | null>(returned?.spaceshipIds?.[1] ?? null);
  const [color2, setColor2] = useState(loadColor(true));
  const [specialAbilityName2, setSpecialAbilityName2] = useState(returned?.specialAbilityNames?.[1]);

  const [readyState, setReadyState] = useState<[boolean, boolean]>([false, false]);
  const activeSelection = readyState[0] ? 2 : 1;

  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [isMultiplayer, setMultiplayer] = useState(selectedId2 !== null);
  const { settings } = useSettings();

  const previewId = hoveredId ?? (!readyState[0] ? selectedId1 : selectedId2);
  const preview = previewId ? getSpaceshipDefinition(previewId) : null;

  const preview1 = activeSelection === 1 ? preview : selectedId1 ? getSpaceshipDefinition(selectedId1) : null;
  const preview2 = activeSelection === 2 ? preview : selectedId2 ? getSpaceshipDefinition(selectedId2) : null;

  const changeColor = (color: string, isPlayer2 = false) => {
    if (!isPlayer2) {
      if (color === color2) {
        changeColor(color1, true);
      }
      setColor1(color);
    } else {
      setColor2(color);
    }
    saveColor(color, isPlayer2);
  };

  const selectSpaceship = (id: string) => {
    if (!readyState[0]) {
      setSelectedId1(id);
      setSpecialAbilityName1(undefined);
    } else {
      setSelectedId2(id);
      setSpecialAbilityName2(undefined);
    }
  };

  const next = () => {
    if (selectedId1) {
      navigate(Page.SPECIAL_ABILITY_SELECTION, {
        spaceshipIds: [selectedId1, null],
        specialAbilityNames: [specialAbilityName1, null]
      });
    }
  };

  const ready = (player: 0 | 1) => {
    const previousReadyState = readyState[player];
    const newReadyState: [boolean, boolean] = [...readyState];
    newReadyState[player] = !previousReadyState;

    if (newReadyState[0] && newReadyState[1]) {
      navigate(Page.SPECIAL_ABILITY_SELECTION, {
        spaceshipIds: [selectedId1, selectedId2],
        specialAbilityNames: [specialAbilityName1, specialAbilityName2]
      });
    } else {
      setReadyState(newReadyState);
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
        <NavLink className="button back-button blur-background" to={Page.MENU}>
          Back to Menu
        </NavLink>

        <ColorPicker
          className="player1"
          label="Change Color"
          colors={SPACESHIP_COLORS}
          disabledColorNames={isMultiplayer ? [color2] : []}
          value={color1}
          onChange={changeColor}
        />

        {isMultiplayer && (
          <ColorPicker
            className="player2"
            label="Change Color"
            colors={SPACESHIP_COLORS}
            disabledColorNames={[color1]}
            value={color2}
            onChange={color => changeColor(color, true)}
          />
        )}
      </div>

      <div className="select-top">
        <section className="player-selection player-1-selection">
          <SpaceshipPreview isMultiplayer={isMultiplayer} preview={preview1} color={color1} selectedId={selectedId1} />

          {!isMultiplayer ? (
            <button
              type="button"
              className="button start-button blur-background"
              disabled={!selectedId1}
              onClick={next}
            >
              Next
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

        <section className="player-selection player-2-selection">
          {!isMultiplayer ? (
            <button className="button add-player blur-background" onClick={() => setMultiplayer(true)}>
              <span className="plus-sign">+</span>
              <p>Add player</p>
            </button>
          ) : (
            <>
              <SpaceshipPreview
                isMultiplayer={isMultiplayer}
                preview={preview2}
                color={color2}
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

              <button className="button drop-player" onClick={() => setMultiplayer(false)}>
                X
              </button>
            </>
          )}
        </section>
      </div>

      <hr className="select-divider" />

      <section className="select-bottom">
        <div className="slot-grid" style={{ '--columns': SPACESHIP_GRID_COLUMNS } as CSSProperties}>
          {SLOTS.map((spaceship, index) =>
            spaceship ? (
              <button
                key={spaceship.id}
                type="button"
                className="slot blur-background"
                aria-label={spaceship.name}
                aria-pressed={spaceship.id === selectedId1}
                onClick={() => selectSpaceship(spaceship.id)}
                onMouseEnter={() => setHoveredId(spaceship.id)}
                onMouseLeave={() => setHoveredId(null)}
                onFocus={() => setHoveredId(spaceship.id)}
                onBlur={() => setHoveredId(null)}
              >
                <SpaceshipIcon color={activeSelection === 1 ? color1 : color2} shape={spaceship.shape} flame="static" />
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
