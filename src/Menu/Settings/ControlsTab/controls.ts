import { ControlsSettings, PlayerControlsSettings } from 'spaceship-survival-3/context';

type DebugControlsSettings = ControlsSettings['debug'];
type GeneralControlKey = 'pauseResume' | 'restart' | 'menuBack';

/** One row: how to read its key out of the settings, and how to write a new one. */
interface ControlDefinition {
  id: string;
  label: string;
  get: (controls: ControlsSettings) => string;
  set: (controls: ControlsSettings, code: string) => ControlsSettings;
}

export enum SettingsControlGroup {
  GENERAL,
  PLAYER_1,
  PLAYER_2,
  DEBUG
}

interface ControlGroup {
  id: SettingsControlGroup;
  title: string;
  controls: readonly ControlDefinition[];
}

// ---------- The rows ----------
const GENERAL_CONTROLS: readonly (readonly [GeneralControlKey, string])[] = [
  ['pauseResume', 'Pause / Resume game'],
  ['restart', 'Restart game'],
  ['menuBack', 'Back to (previous) menu']
];

const PLAYER_CONTROLS: readonly (readonly [keyof PlayerControlsSettings, string])[] = [
  ['moveLeft', 'Move left'],
  ['moveRight', 'Move right'],
  ['ability1', 'Ability 1'],
  ['ability2', 'Ability 2'],
  ['ability3', 'Ability 3'],
  ['specialAbility', 'Special ability']
];

const DEBUG_CONTROLS: readonly (readonly [keyof DebugControlsSettings, string])[] = [
  ['extraSlowGameSpeed', 'Extra slow game speed'],
  ['slowGameSpeed', 'Slow game speed'],
  ['normalGameSpeed', 'Normal game speed'],
  ['fastGameSpeed', 'Fast game speed'],
  ['extraFastGameSpeed', 'Extra fast game speed']
];

const generalControls = (): ControlDefinition[] =>
  GENERAL_CONTROLS.map(([key, label]) => ({
    id: key,
    label,
    get: controls => controls[key],
    set: (controls, code) => ({ ...controls, [key]: code })
  }));

const playerControls = (player: 'player1' | 'player2'): ControlDefinition[] =>
  PLAYER_CONTROLS.map(([key, label]) => ({
    id: `${player}.${key}`,
    label,
    get: controls => controls[player][key],
    set: (controls, code) => ({ ...controls, [player]: { ...controls[player], [key]: code } }) as ControlsSettings
  }));

const debugControls = (): ControlDefinition[] =>
  DEBUG_CONTROLS.map(([key, label]) => ({
    id: `debug.${key}`,
    label,
    get: controls => controls.debug[key],
    set: (controls, code) => ({ ...controls, debug: { ...controls.debug, [key]: code } })
  }));

export const CONTROL_GROUPS: readonly ControlGroup[] = [
  { id: SettingsControlGroup.GENERAL, title: 'General', controls: generalControls() },
  { id: SettingsControlGroup.PLAYER_1, title: 'Player', controls: playerControls('player1') },
  { id: SettingsControlGroup.PLAYER_2, title: 'Player 2', controls: playerControls('player2') },
  { id: SettingsControlGroup.DEBUG, title: 'Debug', controls: debugControls() }
];

export const ALL_CONTROLS = CONTROL_GROUPS.flatMap(group =>
  group.controls.map(control => ({ ...control, group: group.title, groupId: group.id }))
);
