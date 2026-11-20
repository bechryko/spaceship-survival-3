/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, type ReactNode } from 'react';
import { loadSettings } from '../localstorage';

export interface Settings {
  resolutionMultiplier: number;
  difficultyMilestoneNoticeDuration: number;
  showFps: boolean;
  debugControls: boolean;
  debugStatistics: boolean;
}

interface SettingsContextType {
  settings: Settings;
  setSettings: (settings: Settings) => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const defaultSettings: Settings = {
  resolutionMultiplier: 2,
  difficultyMilestoneNoticeDuration: 3,
  showFps: false,
  debugControls: false,
  debugStatistics: false
};

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<Settings>(loadSettings());

  return <SettingsContext.Provider value={{ settings, setSettings }}>{children}</SettingsContext.Provider>;
}

export function useSettings() {
  const context = useContext(SettingsContext);

  if (!context) {
    throw new Error('useUser must be used within UserProvider');
  }

  return context;
}
