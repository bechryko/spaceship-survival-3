import { createContext, useContext, useState, type ReactNode } from 'react';

export interface Settings {
  resolutionMultiplier: number;
  showFps: boolean;
  debugControls: boolean;
  debugStatistics: boolean;
}

interface SettingsContextType {
  settings: Settings;
  setSettings: (settings: Settings) => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<Settings>({
    resolutionMultiplier: 2,
    showFps: false,
    debugControls: false,
    debugStatistics: false
  });

  return <SettingsContext.Provider value={{ settings, setSettings }}>{children}</SettingsContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useSettings() {
  const context = useContext(SettingsContext);

  if (!context) {
    throw new Error('useUser must be used within UserProvider');
  }

  return context;
}
