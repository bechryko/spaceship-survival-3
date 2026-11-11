import { NavLink } from 'react-router';
import './Menu.css';
import StarBackground from './StarBackground';

export default function Menu() {
  return (
    <div className="menu-screen">
      <StarBackground />
      <main className="menu">
        <h1>Spaceship Survival 3</h1>
        <section>
          <NavLink to="/play">Play</NavLink>
        </section>
      </main>
    </div>
  );
}
