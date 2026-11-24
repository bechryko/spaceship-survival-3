import './ColorPicker.css';

import { CSSProperties } from 'react';
import { SpaceshipColor } from './spaceship-colors';

interface Props {
  label?: string;
  colors: readonly SpaceshipColor[];
  value: string;
  onChange: (value: string) => void;
}

export default function ColorPicker({ label = 'Color', colors, value, onChange }: Props) {
  return (
    <div className="color-picker">
      <span className="color-picker-label" aria-hidden="true">
        {label}
      </span>

      <div className="swatches" role="group" aria-label={label}>
        {colors.map(color => (
          <button
            key={color.value}
            title={color.name}
            type="button"
            className="swatch"
            style={{ '--swatch-color': color.value } as CSSProperties}
            aria-label={color.name}
            aria-pressed={color.value === value}
            onClick={() => onChange(color.value)}
          />
        ))}
      </div>
    </div>
  );
}
