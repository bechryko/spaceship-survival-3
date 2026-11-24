import './Settings.css';

import { useState } from 'react';
import { NavLink, useSearchParams } from 'react-router';
import { OptionStepper, ToggleSwitch } from 'spaceship-survival-3/components';
import { Settings, useSettings } from 'spaceship-survival-3/context';
import { Page, useCustomNavigation, useEventListener } from 'spaceship-survival-3/hooks';
import { menuKeybinds } from '../menu-keybinds';
import ControlsTab from './ControlsTab/ControlsTab';

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

const TABS = [
  { id: 'game', label: 'Game' },
  { id: 'debug', label: 'Debug' },
  { id: 'controls', label: 'Controls' }
] as const;
type TabId = (typeof TABS)[number]['id'];
const tabElementId = (id: TabId): string => `settings-tab-${id}`;

const SELECTED_TAB_URL_PARAM_KEY = 'tabId';

function getDefaultActiveTab(searchParams: URLSearchParams): TabId {
  const selectedTabId = searchParams.get(SELECTED_TAB_URL_PARAM_KEY);

  if (
    Object.values(TABS)
      .map(tab => tab.id)
      .includes(selectedTabId as TabId)
  ) {
    return selectedTabId as TabId;
  }
  return 'game';
}

export default function Settings() {
  const { settings, setSettings } = useSettings();
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState<TabId>(getDefaultActiveTab(searchParams));
  const navigate = useCustomNavigation();

  const updateSetting = <K extends keyof Settings>(key: K, value: (typeof settings)[K]) =>
    setSettings({
      ...settings,
      [key]: value
    });

  const changeTab = (tabId: TabId) => {
    setActiveTab(tabId);
    setSearchParams({ [SELECTED_TAB_URL_PARAM_KEY]: tabId });
  };

  useEventListener('keydown', (event: KeyboardEvent): void => {
    if (event.code === menuKeybinds.backToMainMenu) {
      navigate(Page.MENU);
      return;
    }

    const activeTabIndex = TABS.findIndex(t => t.id === activeTab);

    const target =
      event.key === 'ArrowRight'
        ? (activeTabIndex + 1) % TABS.length
        : event.key === 'ArrowLeft'
          ? (activeTabIndex - 1 + TABS.length) % TABS.length
          : event.key === 'Home'
            ? 0
            : event.key === 'End'
              ? TABS.length - 1
              : null;

    if (target !== null) {
      event.preventDefault();
      changeTab(TABS[target].id);
    }
  });

  return (
    <main className="settings">
      <h2>Settings</h2>

      <div className="settings-tabs" role="tablist" aria-label="Settings sections">
        {TABS.map(tab => (
          <button
            key={tab.id}
            id={tabElementId(tab.id)}
            type="button"
            role="tab"
            className="settings-tab"
            aria-selected={tab.id === activeTab}
            aria-controls="settings-panel"
            tabIndex={tab.id === activeTab ? 0 : -1}
            onClick={() => changeTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div
        key={activeTab}
        id="settings-panel"
        className="settings-panel glass-scrollbar"
        role="tabpanel"
        aria-labelledby={tabElementId(activeTab)}
      >
        {activeTab === 'game' && (
          <>
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
          </>
        )}

        {activeTab === 'debug' && (
          <>
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
          </>
        )}

        {activeTab === 'controls' && (
          <ControlsTab controls={settings.controls} onChange={controls => updateSetting('controls', controls)} />
        )}
      </div>

      <NavLink className="button settings-back" to={Page.MENU}>
        Save & Back to Menu
      </NavLink>
    </main>
  );
}
