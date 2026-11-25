import './Menu.css';

import { NavLink } from 'react-router';
import { HandbookIcon } from 'spaceship-survival-3/components';
import { Page, useLastUrlSegment } from 'spaceship-survival-3/hooks';
import { appVersion } from 'spaceship-survival-3/version';
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
            <span className="version">Version: {appVersion}</span>
          </hgroup>
          <section>
            <NavLink className="button blur-background" to={Page.GAME} state={{ players: 1, quickPlay: true }}>
              Quick Play
            </NavLink>
            <NavLink className="button blur-background" to={Page.SPACESHIP_SELECTION}>
              Play
            </NavLink>
            <NavLink className="button blur-background highlighted" to={Page.HANDBOOK}>
              Captain's Handbook
            </NavLink>
            <NavLink className="button blur-background separator" to={Page.SETTINGS}>
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
