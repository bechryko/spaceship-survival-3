import { NavLink } from 'react-router';
import './Menu.css';

export default function Menu() {
  return (
    <main className="menu">
      <h1>Spaceship Survival 3</h1>
      <section>
        <NavLink to="/play">Play Singleplayer</NavLink>
      </section>
    </main>
  );
}
