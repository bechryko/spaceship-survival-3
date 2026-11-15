import './App.css';

import { useEffect } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router';
import Game from './Game/Game';
import Menu from './Menu/Menu';
import SpaceshipSelect from './Menu/SpaceshipSelect/SpaceshipSelect';
import SpecialAbilitySelect from './Menu/SpecialAbilitySelect/SpecialAbilitySelect';
import { version } from './version';

export default function App() {
  useEffect(() => {
    if (version.toLowerCase().startsWith('beta')) {
      document.title = 'Spaceship Survival 3 (Beta)';
    }
  }, []);

  return (
    <BrowserRouter basename="/spaceship-survival-3">
      <Routes>
        <Route path="/" element={<Menu></Menu>}></Route>
        <Route path="/menu/*" element={<Menu></Menu>}></Route>
        <Route path="/select/1" element={<SpaceshipSelect></SpaceshipSelect>}></Route>
        <Route path="/select/2" element={<SpecialAbilitySelect></SpecialAbilitySelect>}></Route>
        <Route path="/play" element={<Game></Game>}></Route>
      </Routes>
    </BrowserRouter>
  );
}
