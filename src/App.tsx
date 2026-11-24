import './App.css';

import { useEffect } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router';
import { basename } from './basename';
import Game from './Game/Game';
import { Page } from './hooks';
import { loadLastPlayedVersion, saveHighscore, saveLastPlayedVersion } from './localstorage';
import CaptainsHandbook from './Menu/CaptainsHandbook/CaptainsHandbook';
import Menu from './Menu/Menu';
import SpaceshipSelect from './Menu/SpaceshipSelect/SpaceshipSelect';
import SpecialAbilitySelect from './Menu/SpecialAbilitySelect/SpecialAbilitySelect';
import { version } from './version';

export default function App() {
  useEffect(() => {
    if (version.toLowerCase().startsWith('beta')) {
      document.title = 'Spaceship Survival 3 (Beta)';
    }

    if (loadLastPlayedVersion() !== version) {
      saveHighscore(0);
      console.warn('Highscore reset due to new version!');
      saveLastPlayedVersion(version);
    }
  }, []);

  return (
    <BrowserRouter basename={basename}>
      <Routes>
        <Route path={Page.MENU + '/*'} element={<Menu></Menu>}></Route>
        <Route path={Page.SPACESHIP_SELECTION} element={<SpaceshipSelect></SpaceshipSelect>}></Route>
        <Route path={Page.SPECIAL_ABILITY_SELECTION} element={<SpecialAbilitySelect></SpecialAbilitySelect>}></Route>
        <Route path={Page.GAME} element={<Game></Game>}></Route>
        <Route path={Page.HANDBOOK} element={<CaptainsHandbook></CaptainsHandbook>}></Route>
        <Route path="*" element={<Navigate to={Page.MENU}></Navigate>} />
      </Routes>
    </BrowserRouter>
  );
}
