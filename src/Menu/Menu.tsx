import './Menu.css';

import { NavLink } from 'react-router';
import { HandbookIcon } from '../components';
import { Page, useLastUrlSegment } from '../hooks';
import { version } from '../version';
import Settings from './Settings/Settings';
import StarBackground from './StarBackground';

function NewsPanel() {
  return (
    <aside className="news-panel main-panel">
      <h2>Your handbook is here!</h2>
      <HandbookIcon></HandbookIcon>
      <p>Captain's Handbook is available for you to browse the game's mechanics in Beta v0.4!</p>
    </aside>
  );
}

const SETTINGS_URL = 'settings';

export default function Menu() {
  const lastUrlSegment = useLastUrlSegment();

  let content;
  if (lastUrlSegment === SETTINGS_URL) {
    content = <Settings></Settings>;
  } else {
    content = (
      <>
        <main className="menu">
          <hgroup>
            <h1>Spaceship Survival 3</h1>
            <span className="version">Version: {version}</span>
          </hgroup>
          <section>
            <NavLink className="button" to={Page.GAME} state={{ quickPlay: true }}>
              Quick Play
            </NavLink>
            <NavLink className="button" to={Page.SPACESHIP_SELECTION}>
              Play
            </NavLink>
            <NavLink className="button highlighted" to={Page.HANDBOOK}>
              Captain's Handbook
            </NavLink>
            <NavLink className="button separator" to={Page.SETTINGS}>
              Settings
            </NavLink>
          </section>
        </main>

        <NewsPanel></NewsPanel>
      </>
    );
  }

  return (
    <div className="menu-screen">
      <StarBackground />
      {content}
    </div>
  );
}
