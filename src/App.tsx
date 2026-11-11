import { useState } from 'react';
import './App.css';
import Game from './Game/Game';
import Menu from './Menu/Menu';

export default function App() {
  const [inGame, setInGame] = useState<boolean>(false);

  function startGame() {
    setInGame(true);
  }

  const renderedPage = !inGame ? <Menu onStartGame={startGame}></Menu> : <Game></Game>;

  return (
    <>
      <h1>Spaceship Survival 3</h1>
      {renderedPage}
    </>
  );
}
