import './Settings.css';

import { NavLink } from 'react-router';
import { OptionStepper, ToggleSwitch } from '../../components';
import { Settings, useSettings } from '../../context';

const RESOLUTION_OPTIONS = [
  { value: 1, label: 'Low (960×540)' },
  { value: 2, label: 'Normal (1920×1080)' },
  { value: 4, label: 'High (3840×2160)' }
];

export default function Settings() {
  const { settings, setSettings } = useSettings();

  const updateSetting = <K extends keyof Settings>(key: K, value: (typeof settings)[K]) =>
    setSettings({
      ...settings,
      [key]: value
    });

  return (
    <main className="settings">
      <h2>Settings</h2>
      <section>
        <OptionStepper
          label="Resolution"
          options={RESOLUTION_OPTIONS}
          value={settings.resolutionMultiplier}
          onChange={value => updateSetting('resolutionMultiplier', value)}
        />

        <h3 className="settings-divider">Debug Settings</h3>
        <ToggleSwitch
          label="FPS counter"
          checked={settings.showFps}
          onChange={checked => updateSetting('showFps', checked)}
        />
        <ToggleSwitch
          label="Debug statistics"
          checked={settings.debugStatistics}
          onChange={checked => updateSetting('debugStatistics', checked)}
        />
        <ToggleSwitch
          label="Debug controls"
          checked={settings.debugControls}
          onChange={checked => updateSetting('debugControls', checked)}
        />

        <NavLink className="button back-button" to="/menu">
          Back to Menu
        </NavLink>
      </section>
    </main>
  );
}
