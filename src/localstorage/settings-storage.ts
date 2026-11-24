import { defaultSettings, Settings } from '../context';
import { createLocalstorageKey } from './localstorage-key';
import { Schema, validateJSON } from './validator';

const SETTINGS_STORAGE_KEY = createLocalstorageKey('settings');

export function loadSettings(): Settings {
  const loaded = localStorage.getItem(SETTINGS_STORAGE_KEY);

  if (!loaded || !validateJSON(loaded, settingsSchema)) {
    saveSettings(defaultSettings);
    return defaultSettings;
  }
  return JSON.parse(loaded);
}

export function saveSettings(settings: Settings): void {
  localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
}

// adjust SettingsContext.tsx
const settingsSchema: Schema = {
  resolutionMultiplier: [1, 2, 4],
  difficultyMilestoneNoticeDuration: [0, 2, 3, 4, 5],
  showFps: 'boolean',
  debugControls: 'boolean',
  debugStatistics: 'boolean',

  controls: {
    pauseResume: 'string',
    restart: 'string',
    menuBack: 'string',

    player1: {
      moveLeft: 'string',
      moveRight: 'string',
      ability1: 'string',
      ability2: 'string',
      ability3: 'string',
      specialAbility: 'string'
    },

    player2: {
      moveLeft: 'string',
      moveRight: 'string',
      ability1: 'string',
      ability2: 'string',
      ability3: 'string',
      specialAbility: 'string'
    },

    debug: {
      extraSlowGameSpeed: 'string',
      slowGameSpeed: 'string',
      normalGameSpeed: 'string',
      fastGameSpeed: 'string',
      extraFastGameSpeed: 'string'
    }
  }
};
