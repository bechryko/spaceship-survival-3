import './Settings.css';

import { NavLink } from 'react-router';
import { OptionStepper, ToggleSwitch } from '../../components';
import { useSettings } from '../../context';

const RESOLUTION_OPTIONS = [
  { value: 1, label: 'Low (960×540)' },
  { value: 2, label: 'Normal (1920×1080)' },
  { value: 4, label: 'High (3840×2160)' }
];

export default function Settings() {
  const { settings, setSettings } = useSettings();

  const setResolutionMultiplier = (resolutionMultiplier: number) =>
    setSettings({
      ...settings,
      resolutionMultiplier
    });

  const setShowFps = (showFps: boolean) =>
    setSettings({
      ...settings,
      showFps
    });

  return (
    <main className="settings">
      <h2>Settings</h2>
      <section>
        <OptionStepper
          label="Resolution"
          options={RESOLUTION_OPTIONS}
          value={settings.resolutionMultiplier}
          onChange={setResolutionMultiplier}
        />
        <ToggleSwitch label="FPS counter" checked={settings.showFps} onChange={setShowFps} />
        <NavLink className="button" to="/menu">
          Back to Menu
        </NavLink>
      </section>
    </main>
  );
}
