import './ControlsTab.css';

import { useEffect, useRef, useState } from 'react';
import { ControlsSettings, useSettings } from 'spaceship-survival-3/context';
import { useEventListener } from 'spaceship-survival-3/hooks';
import { displayKeyCode } from 'spaceship-survival-3/utility';
import { ALL_CONTROLS, CONTROL_GROUPS, SettingsControlGroup } from './controls';

interface Props {
  controls: ControlsSettings;
  onChange: (controls: ControlsSettings) => void;
}

export default function ControlsTab({ controls, onChange }: Props) {
  const [listeningId, setListeningId] = useState<string | null>(null);
  const { settings } = useSettings();

  // The key that was just assigned (or cancelled with) is still held down. Its release must not click the button again.
  const swallowKeyUp = useRef<string | null>(null);

  useEventListener(
    'keyup',
    (event: KeyboardEvent) => {
      if (swallowKeyUp.current === event.code) {
        event.preventDefault();
        swallowKeyUp.current = null;
      }
    },
    true
  );

  // While a row is waiting for a key, the next key press goes to it
  useEffect(() => {
    const listening = ALL_CONTROLS.find(control => control.id === listeningId);
    if (!listening) {
      return;
    }

    const onKeyDown = (event: KeyboardEvent) => {
      event.preventDefault();
      event.stopPropagation();
      if (event.repeat || !event.code) {
        return;
      }

      swallowKeyUp.current = event.code;
      if (event.code !== 'Escape') {
        onChange(listening.set(controls, event.code));
      }
      setListeningId(null);
    };

    const onPointerDown = (event: PointerEvent) => {
      if (!(event.target instanceof Element) || !event.target.closest('[data-listening="true"]')) {
        setListeningId(null);
      }
    };

    window.addEventListener('keydown', onKeyDown, true);
    window.addEventListener('pointerdown', onPointerDown, true);
    return () => {
      window.removeEventListener('keydown', onKeyDown, true);
      window.removeEventListener('pointerdown', onPointerDown, true);
    };
  }, [listeningId, controls, onChange]);

  const isControlGroupVisible = (groupId: SettingsControlGroup) => {
    switch (groupId) {
      case SettingsControlGroup.DEBUG:
        return settings.debugControls;
      default:
        return true;
    }
  };

  // Keys that are used by more than one control, so the clash can be shown
  const usedBy = new Map<string, string[]>();
  for (const control of ALL_CONTROLS) {
    if (!isControlGroupVisible(control.groupId)) {
      continue;
    }

    const code = control.get(controls);
    usedBy.set(code, [...(usedBy.get(code) ?? []), `${control.label} (${control.group})`]);
  }

  const listening = ALL_CONTROLS.find(control => control.id === listeningId);

  return (
    <div className="controls-tab">
      <p className="controls-hint">Click a key to change it, then press the new key. Escape cancels.</p>

      {/* Read out by screen readers when a row starts waiting for a key */}
      <p className="controls-sr" role="status">
        {listening ? `Press a key for ${listening.label}, or Escape to cancel.` : ''}
      </p>

      {CONTROL_GROUPS.filter(group => isControlGroupVisible(group.id)).map(group => (
        <section key={group.title} className="controls-group">
          <h3 className="controls-group-title">{group.title}</h3>

          {group.controls.map(control => {
            const code = control.get(controls);
            const isListening = control.id === listeningId;
            const others = (usedBy.get(code) ?? []).filter(name => name !== `${control.label} (${group.title})`);

            return (
              <div key={control.id} className="controls-row">
                <span className="controls-label">{control.label}</span>
                <button
                  type="button"
                  className="controls-key"
                  data-listening={isListening}
                  data-conflict={others.length > 0}
                  title={others.length > 0 ? `Also used by: ${others.join(', ')}` : undefined}
                  aria-label={`${group.title}, ${control.label}: ${isListening ? 'waiting for a key' : code}`}
                  onClick={() => setListeningId(isListening ? null : control.id)}
                >
                  {isListening ? 'Press a key…' : displayKeyCode(code)}
                </button>
              </div>
            );
          })}
        </section>
      ))}
    </div>
  );
}
