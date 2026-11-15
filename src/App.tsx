import './App.css';

import { BrowserRouter, Route, Routes } from 'react-router';
import Game from './Game/Game';
import Menu from './Menu/Menu';
import SpaceshipSelect from './Menu/SpaceshipSelect/SpaceshipSelect';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Menu></Menu>}></Route>
        <Route path="/menu/*" element={<Menu></Menu>}></Route>
        <Route path="/select" element={<SpaceshipSelect></SpaceshipSelect>}></Route>
        <Route path="/play" element={<Game></Game>}></Route>
      </Routes>
    </BrowserRouter>
  );
}
