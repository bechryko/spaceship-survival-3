import './ToggleSwitch.css';

import { useId } from 'react';

type Props = {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
};

export function ToggleSwitch({ label, checked, onChange }: Props) {
  const labelId = useId();

  return (
    <div className="toggle">
      <span id={labelId} className="toggle-label">
        {label}
      </span>

      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-labelledby={labelId}
        className="toggle-track"
        onClick={() => onChange(!checked)}
      >
        <span className="toggle-knob" />
      </button>
    </div>
  );
}
