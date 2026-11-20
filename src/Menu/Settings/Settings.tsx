import './Settings.css';

import { NavLink } from 'react-router';
import { OptionStepper, ToggleSwitch } from '../../components';
import { Settings, useSettings } from '../../context';
import { saveSettings } from '../../localstorage';

const RESOLUTION_OPTIONS = [
  { value: 1, label: 'Low (960×540)' },
  { value: 2, label: 'Normal (1920×1080)' },
  { value: 4, label: 'High (3840×2160)' }
];

const DIFFICULTY_MILESTONE_NOTICE_DURATION_OPTIONS = [
  { value: 0, label: 'Off' },
  { value: 2, label: '2 seconds' },
  { value: 3, label: '3 seconds' },
  { value: 4, label: '4 seconds' },
  { value: 5, label: '5 seconds' }
];

export default function Settings() {
  const { settings, setSettings } = useSettings();

  const updateSetting = <K extends keyof Settings>(key: K, value: (typeof settings)[K]) => {
    const newSettings: Settings = {
      ...settings,
      [key]: value
    };

    setSettings(newSettings);
    saveSettings(newSettings);
  };

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
        <OptionStepper
          label="Difficulty Milestone notice duration"
          options={DIFFICULTY_MILESTONE_NOTICE_DURATION_OPTIONS}
          value={settings.difficultyMilestoneNoticeDuration}
          onChange={value => updateSetting('difficultyMilestoneNoticeDuration', value)}
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
