import { defaultSettings, Settings } from '../context';
import { createLocalstorageKey } from './localstorage-key';

const SETTINGS_STORAGE_KEY = createLocalstorageKey('settings');

export function loadSettings(): Settings {
  const loaded = localStorage.getItem(SETTINGS_STORAGE_KEY);
  if (!loaded || !validateLoaded(loaded)) {
    return defaultSettings;
  }
  return JSON.parse(loaded);
}

export function saveSettings(settings: Settings): void {
  localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
}

const settingsObjectKeys: Array<keyof Settings> = [
  'resolutionMultiplier',
  'difficultyMilestoneNoticeDuration',
  'showFps',
  'debugControls',
  'debugStatistics'
];

const permittedNumberValueMap: Record<string, number[]> = {
  resolutionMultiplier: [1, 2, 4],
  difficultyMilestoneNoticeDuration: [0, 2, 3, 4, 5]
};

function validateLoaded(loaded: string): boolean {
  try {
    const obj = JSON.parse(loaded);

    if (!obj || typeof obj !== 'object') {
      return false;
    }

    const remainingKeys = new Set<string>(settingsObjectKeys);
    for (const key in obj) {
      const exists = remainingKeys.delete(key);
      if (!exists) {
        return false;
      }

      const value = obj[key];
      switch (key) {
        // Integers
        case 'resolutionMultiplier':
        case 'difficultyMilestoneNoticeDuration':
          if (
            typeof value !== 'number' ||
            value !== Math.floor(value) ||
            !permittedNumberValueMap[key].includes(value)
          ) {
            return false;
          }
          break;

        // Booleans
        case 'showFps':
        case 'debugControls':
        case 'debugStatistics':
          if (typeof value !== 'boolean') {
            return false;
          }
          break;
      }
    }

    if (remainingKeys.size > 0) {
      return false;
    }
  } catch (error) {
    console.warn(error);
    return false;
  }

  return true;
}
