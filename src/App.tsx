import './App.css';

import { useEffect } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router';
import Game from './Game/Game';
import { loadLastPlayedVersion, saveHighscore, saveLastPlayedVersion } from './localstorage';
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
    <BrowserRouter basename="/spaceship-survival-3">
      <Routes>
        <Route path="/menu/*" element={<Menu></Menu>}></Route>
        <Route path="/select/1" element={<SpaceshipSelect></SpaceshipSelect>}></Route>
        <Route path="/select/2" element={<SpecialAbilitySelect></SpecialAbilitySelect>}></Route>
        <Route path="/play" element={<Game></Game>}></Route>
        <Route path="*" element={<Navigate to={'/menu'}></Navigate>} />
      </Routes>
    </BrowserRouter>
  );
}
