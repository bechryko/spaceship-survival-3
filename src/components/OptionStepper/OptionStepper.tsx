import './OptionStepper.css';

import { useId } from 'react';

export interface StepperOption<T> {
  value: T;
  label: string;
}

interface Props<T> {
  label: string;
  options: readonly StepperOption<T>[];
  value: T;
  onChange: (value: T) => void;
  loop?: boolean;
}

export function OptionStepper<T>({ label, options, value, onChange, loop = false }: Props<T>) {
  const labelId = useId();
  const index = Math.max(
    0,
    options.findIndex(option => option.value === value)
  );
  const atStart = !loop && index === 0;
  const atEnd = !loop && index === options.length - 1;

  const step = (delta: number) => {
    const next = loop
      ? (index + delta + options.length) % options.length
      : Math.min(options.length - 1, Math.max(0, index + delta));

    if (next !== index) {
      onChange(options[next].value);
    }
  };

  return (
    <div className="stepper blur-background" role="group" aria-labelledby={labelId}>
      <span id={labelId} className="stepper-label">
        {label}
      </span>

      <div className="stepper-control">
        {/* aria-disabled (not disabled) so keyboard focus isn't lost when you hit an end */}
        <button type="button" aria-label={`Previous ${label}`} aria-disabled={atStart} onClick={() => step(-1)}>
          <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
            <path
              d="M15 5l-7 7 7 7"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>

        {/* <output> is announced by screen readers when its text changes */}
        <output className="stepper-value">{options[index].label}</output>

        <button type="button" aria-label={`Next ${label}`} aria-disabled={atEnd} onClick={() => step(1)}>
          <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
            <path
              d="M9 5l7 7-7 7"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>
    </div>
  );
}
