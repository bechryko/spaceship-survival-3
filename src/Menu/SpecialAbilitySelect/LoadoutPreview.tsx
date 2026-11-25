import { CSSProperties } from 'react';
import { SpaceshipIcon, SpecialAbilityIcon } from 'spaceship-survival-3/components';
import { SpaceshipDefinition } from '../SpaceshipSelect/spaceship-catalog';
import { SpecialAbilityDefinition } from './special-abilities';

interface Props {
  specialAbilityPreview?: SpecialAbilityDefinition;
  color: string;
  spaceship: SpaceshipDefinition;
  selectedId: string | null;
}

export default function LoadoutPreview({ specialAbilityPreview, color, spaceship, selectedId }: Props) {
  return (
    <div className="loadout">
      <div className="loadout-ship">
        <div className="loadout-ship-icon" style={{ '--ship-color': color } as CSSProperties}>
          <SpaceshipIcon color={color} shape={spaceship.shape} flame="animated" />
        </div>
        <h2>{spaceship.name}</h2>
      </div>

      <div className="loadout-ability glass-scrollbar" aria-live="polite">
        {specialAbilityPreview ? (
          <>
            <div className="loadout-ability-icon blur-background">
              <SpecialAbilityIcon id={specialAbilityPreview.id} />
            </div>

            <div>
              <h2>
                {specialAbilityPreview.id}
                {specialAbilityPreview.id === selectedId && <span className="preview-tag">Selected</span>}
              </h2>
              <p className="loadout-ability-meta">
                {specialAbilityPreview.kind === 'passive'
                  ? 'Passive'
                  : `Press R · ${specialAbilityPreview.cooldown}s cooldown`}
              </p>
              <p className="loadout-ability-description">{specialAbilityPreview.shortDescription}</p>
            </div>
          </>
        ) : (
          <p className="preview-empty">Choose a special ability</p>
        )}
      </div>
    </div>
  );
}
