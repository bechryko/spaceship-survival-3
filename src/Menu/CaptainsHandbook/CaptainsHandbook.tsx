import './CaptainsHandbook.css';

import { useState, type CSSProperties } from 'react';
import { NavLink } from 'react-router';
import { EnginePower, SpaceshipIcon, SpecialAbilityIcon } from '../../components';
import { getSpaceshipDefinition } from '../SpaceshipSelect/spaceship-catalog';
import StarBackground from '../StarBackground';
import { HANDBOOK_ENTRIES, HANDBOOK_GROUPS, HandbookEntry } from './handbook-entries';
import { getEntryStats } from './handbook-stats';

/** The picture for an entry, or nothing if it has none (asteroids, for now). */
function EntryIcon({ entry, color }: { entry: HandbookEntry; color: string }) {
  if (entry.group === 'spaceships') {
    return <SpaceshipIcon color={color} shape={getSpaceshipDefinition(entry.iconId).shape} flame="static" />;
  }

  if (entry.group === 'special-abilities' && entry.iconId) {
    return <SpecialAbilityIcon id={entry.iconId} />;
  }

  return null;
}

const SPACESHIP_COLOR = '#525252';

export default function CaptainsHandbook() {
  const [selectedId, setSelectedId] = useState(HANDBOOK_ENTRIES[0].id);

  const selected = HANDBOOK_ENTRIES.find(entry => entry.id === selectedId) ?? HANDBOOK_ENTRIES[0];
  const selectedGroup = HANDBOOK_GROUPS.find(group => group.id === selected.group);
  const stats = getEntryStats(selected);
  const hasIcon = selectedGroup?.icons;
  const borderlessIcons = selectedGroup?.borderlessIcons;
  const color = SPACESHIP_COLOR;

  return (
    <div className="handbook-screen">
      <StarBackground />

      <NavLink className="button handbook-back" to="/menu">
        Back to Menu
      </NavLink>

      <nav className="handbook-list glass-scrollbar" aria-label="handbook entries">
        {HANDBOOK_GROUPS.map(group => {
          const entries = HANDBOOK_ENTRIES.filter(entry => entry.group === group.id);
          if (entries.length === 0) {
            return null;
          }

          return (
            <section key={group.id} className="handbook-group">
              <h3 className="handbook-group-title">{group.title}</h3>

              <div className={group.icons ? 'handbook-icons' : 'handbook-names'}>
                {entries.map(entry => (
                  <button
                    key={entry.id}
                    type="button"
                    className={group.icons ? 'handbook-slot' : 'handbook-chip'}
                    aria-label={entry.name}
                    title={entry.name}
                    aria-pressed={entry.id === selected.id}
                    onClick={() => setSelectedId(entry.id)}
                  >
                    {group.icons ? <EntryIcon entry={entry} color={color} /> : entry.name}
                  </button>
                ))}
              </div>
            </section>
          );
        })}
      </nav>

      {/* Remounted for each entry (the key), so the scroll position starts at the top every time */}
      <article key={selected.id} className="handbook-detail glass-scrollbar">
        <header className="handbook-detail-header">
          {hasIcon &&
            (borderlessIcons ? (
              <div className="borderless-icon">
                <EntryIcon entry={selected} color={color} />
              </div>
            ) : (
              <div
                className={selected.group === 'spaceships' ? 'handbook-detail-ship' : 'handbook-detail-ability'}
                style={{ '--ship-color': color } as CSSProperties}
              >
                <EntryIcon entry={selected} color={color} />
              </div>
            ))}

          <div>
            <p className="handbook-detail-group">{selectedGroup?.title}</p>
            <h2>{selected.name}</h2>
          </div>
        </header>

        <p className="handbook-summary">{selected.summary}</p>

        {stats.length > 0 && (
          <dl className="handbook-stats">
            {stats.map(stat => (
              <div key={stat.label} className="handbook-stat">
                <dt>{stat.label}</dt>
                <dd>{stat.isEnginePower ? <EnginePower level={Number(stat.value)} label={false} /> : stat.value}</dd>
              </div>
            ))}
          </dl>
        )}

        {selected.sections
          .filter(section => section.paragraphs.length > 0)
          .map(section => (
            <section key={section.heading} className="handbook-section">
              <h3>{section.heading}</h3>
              {section.isList ? (
                <ul>
                  {section.paragraphs.map((paragraph, index) => (
                    <li key={index}>{paragraph}</li>
                  ))}
                </ul>
              ) : (
                section.paragraphs.map((paragraph, index) => <p key={index}>{paragraph}</p>)
              )}
            </section>
          ))}
      </article>
    </div>
  );
}
