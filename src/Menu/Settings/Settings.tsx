import { NavLink } from 'react-router';
import './Settings.css';

export default function Settings() {
  return (
    <main className="settings">
      <h2>Settings</h2>
      <section>
        <p>resolution</p>
        <NavLink className="button" to="/menu">
          Back to Menu
        </NavLink>
      </section>
    </main>
  );
}
