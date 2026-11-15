const HULL_POINTS = '0,-26 6,-12 8,2 22,14 22,22 9,16 6,24 -6,24 -9,16 -22,22 -22,14 -8,2 -6,-12';

type Props = {
  color: string;
  flame?: 'none' | 'static' | 'animated';
};

export default function SpaceshipIcon({ color, flame = 'none' }: Props) {
  return (
    <svg viewBox="-28 -32 56 80" aria-hidden="true" focusable="false">
      {flame !== 'none' && (
        <polygon
          className={flame === 'animated' ? 'spaceship-flame' : undefined}
          points="-4,24 0,40 4,24"
          fill="#ffb703"
          opacity="0.9"
        />
      )}
      <polygon points={HULL_POINTS} fill={color} stroke="rgba(0, 0, 0, 0.4)" strokeWidth="1.2" strokeLinejoin="round" />
      <line x1="0" y1="-22" x2="0" y2="20" stroke="rgba(255, 255, 255, 0.25)" strokeWidth="1" />
      <ellipse cx="0" cy="-6" rx="3.5" ry="7" fill="#bde0fe" />
    </svg>
  );
}
