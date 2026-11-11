import './Menu.css';

type MenuProps = {
  onStartGame: () => void;
};

export default function Menu({ onStartGame }: MenuProps) {
  return (
    <section>
      <button onClick={onStartGame}>Play</button>
    </section>
  );
}
