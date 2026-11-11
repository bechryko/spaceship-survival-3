import { BrowserRouter, Route, Routes } from 'react-router';
import './App.css';
import Game from './Game/Game';
import Menu from './Menu/Menu';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Menu></Menu>}></Route>
        <Route path="/menu" element={<Menu></Menu>}></Route>
        <Route path="/play" element={<Game></Game>}></Route>
      </Routes>
    </BrowserRouter>
  );
}
