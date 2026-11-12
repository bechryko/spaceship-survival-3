import './Menu.css';

import { NavLink } from 'react-router';
import { useLastUrlSegment } from '../hooks';
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
        <h1>Spaceship Survival 3</h1>
        <section>
          <NavLink className="button" to="/play">
            Play
          </NavLink>
          <NavLink className="button" to="./settings">
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
