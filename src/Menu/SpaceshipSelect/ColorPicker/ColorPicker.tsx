import './ColorPicker.css';

import { CSSProperties } from 'react';
import { SpaceshipColor } from './spaceship-colors';

interface Props {
  className?: string;
  label?: string;
  colors: readonly SpaceshipColor[];
  disabledColorNames: string[];
  value: string;
  onChange: (value: string) => void;
}

export default function ColorPicker({
  className = '',
  label = 'Color',
  colors,
  disabledColorNames,
  value,
  onChange
}: Props) {
  const isDisabled = (color: SpaceshipColor) => disabledColorNames.includes(color.value);

  const onClick = (color: SpaceshipColor) => {
    if (!isDisabled(color)) {
      onChange(color.value);
    }
  };

  return (
    <div className={'color-picker blur-background ' + className}>
      <span className="color-picker-label" aria-hidden="true">
        {label}
      </span>

      <div className="swatches" role="group" aria-label={label}>
        {colors.map(color => (
          <button
            key={color.value}
            title={color.name + (isDisabled(color) ? ' (Unavailable)' : '')}
            type="button"
            className="swatch"
            disabled={isDisabled(color)}
            style={{ '--swatch-color': color.value } as CSSProperties}
            aria-label={color.name}
            aria-pressed={color.value === value}
            onClick={() => onClick(color)}
          />
        ))}
      </div>
    </div>
  );
}
