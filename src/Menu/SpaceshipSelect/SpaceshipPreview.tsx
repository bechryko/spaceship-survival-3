import { CSSProperties } from 'react';
import { DifficultyLevel, EnginePower, SpaceshipIcon } from 'spaceship-survival-3/components';
import { SpaceshipDefinition } from './spaceship-catalog';

interface Props {
  preview: SpaceshipDefinition | null;
  color: string;
  selectedId: string | null;
}

export default function SpaceshipPreview({ preview, color, selectedId }: Props) {
  return (
    <div className="preview" aria-live="polite">
      {preview ? (
        <>
          <div className="preview-icon" style={{ '--ship-color': color } as CSSProperties}>
            <SpaceshipIcon color={color} shape={preview.shape} flame="animated" />
          </div>

          <div className="preview-details glass-scrollbar">
            <h2>
              {preview.name}
              {preview.id === selectedId && <span className="preview-tag blur-background">Selected</span>}
            </h2>
            <EnginePower level={preview.speedLevel} />
            <DifficultyLevel level={preview.difficultyLevel}></DifficultyLevel>
            <p className="preview-description">{preview.description}</p>

            <ul className="abilities">
              {preview.abilities.map(ability => (
                <li key={ability.key} className="ability">
                  <span className="ability-key blur-background">{ability.key}</span>
                  <div>
                    <span className="ability-name">{ability.name}</span>
                    <span className="ability-cooldown">{ability.cooldown}s cooldown</span>
                    <p className="ability-description">{ability.description}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </>
      ) : (
        <p className="preview-empty">Choose a spaceship</p>
      )}
    </div>
  );
}
