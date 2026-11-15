import './Menu.css';

import { NavLink } from 'react-router';
import { useLastUrlSegment } from '../hooks';
import { version } from '../version';
import Settings from './Settings/Settings';
import StarBackground from './StarBackground';

const SETTINGS_URL = 'settings';

export default function Menu() {
  const lastUrlSegment = useLastUrlSegment();

  let content;
  if (lastUrlSegment === SETTINGS_URL) {
    content = <Settings></Settings>;
  } else {
    content = (
      <main className="menu">
        <hgroup>
          <h1>Spaceship Survival 3</h1>
          <span className="version">Version: {version}</span>
        </hgroup>
        <section>
          <NavLink className="button" to="/select/1">
            Play
          </NavLink>
          <NavLink className="button" to="menu/settings">
            Settings
          </NavLink>
        </section>
      </main>
    );
  }

  return (
    <div className="menu-screen">
      <StarBackground />
      {content}
    </div>
  );
}
