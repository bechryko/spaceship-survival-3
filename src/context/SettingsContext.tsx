/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, type ReactNode } from 'react';
import { loadSettings, saveSettings } from 'spaceship-survival-3/localstorage';

export interface Settings {
  resolutionMultiplier: number;
  difficultyMilestoneNoticeDuration: number;
  showFps: boolean;
  debugControls: boolean;
  debugStatistics: boolean;
  controls: ControlsSettings;
}

export interface ControlsSettings {
  pauseResume: string;
  restart: string;
  menuBack: string;
  player1: PlayerControlsSettings;
  player2: PlayerControlsSettings;
  debug: {
    extraSlowGameSpeed: string;
    slowGameSpeed: string;
    normalGameSpeed: string;
    fastGameSpeed: string;
    extraFastGameSpeed: string;
  };
}

export interface PlayerControlsSettings {
  moveLeft: string;
  moveRight: string;
  ability1: string;
  ability2: string;
  ability3: string;
  specialAbility: string;
}

interface SettingsContextType {
  settings: Settings;
  setSettings: (settings: Settings) => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

// adjust settings-storage.ts
export const defaultControls: ControlsSettings = {
  pauseResume: 'Space',
  restart: 'Space',
  menuBack: 'Backspace',
  player1: {
    moveLeft: 'KeyA',
    moveRight: 'KeyD',
    ability1: 'KeyQ',
    ability2: 'KeyW',
    ability3: 'KeyE',
    specialAbility: 'KeyR'
  },
  player2: {
    moveLeft: 'ArrowLeft',
    moveRight: 'ArrowRight',
    ability1: 'Numpad1',
    ability2: 'Numpad2',
    ability3: 'Numpad3',
    specialAbility: 'Numpad0'
  },
  debug: {
    extraSlowGameSpeed: 'KeyN',
    slowGameSpeed: 'KeyM',
    normalGameSpeed: 'Comma',
    fastGameSpeed: 'Period',
    extraFastGameSpeed: 'Slash'
  }
};

export const defaultSettings: Settings = {
  resolutionMultiplier: 2,
  difficultyMilestoneNoticeDuration: 3,
  showFps: false,
  debugControls: false,
  debugStatistics: false,
  controls: defaultControls
};

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, rawSetSettings] = useState<Settings>(loadSettings());

  const setSettings = (settings: Settings) => {
    saveSettings(settings);
    rawSetSettings(settings);
  };

  return <SettingsContext.Provider value={{ settings, setSettings }}>{children}</SettingsContext.Provider>;
}

export function useSettings() {
  const context = useContext(SettingsContext);

  if (!context) {
    throw new Error('useUser must be used within UserProvider');
  }

  return context;
}
