import { SpecialAbilityName } from 'spaceship-survival-3/Game/spaceships';

interface Props {
  id: string;
}

export function SpecialAbilityIcon({ id }: Props) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      {id === SpecialAbilityName.STRONGER_ENGINES && (
        <>
          <path d="M6 11l6-6 6 6" />
          <path d="M6 18l6-6 6 6" />
        </>
      )}

      {id === SpecialAbilityName.BOMB && (
        <>
          <circle cx="10.5" cy="14" r="6" />
          <path d="M15 9.5l2.2-2.2c1-1 2.4-1 3.2-.3" />
          <path d="M20.5 3.5v1.8M23 5.5h-1.8M22.3 3.7l-1.2 1.2" />
        </>
      )}

      {id === SpecialAbilityName.SHIELD_GENERATOR && (
        <path d="M12 3l7 3v5.5c0 4.4-2.9 7.6-7 9.5-4.1-1.9-7-5.1-7-9.5V6z" />
      )}

      {id === SpecialAbilityName.URGENT_ORDERS && (
        <>
          <circle cx="12" cy="12" r="8.5" />
          <path d="M12 7v5l3.2 2" />
        </>
      )}

      {id === SpecialAbilityName.ROCKET_SUPPORT && (
        <>
          <path d="M10 11.5v3.5l-9 -9h3.5c0.5 -2 4.5 -5 9.5 -5c0 0 0.5 0 1 0c0 -0.5 0 0.5 0 1c0 5 -3 9 -5 9.5" />
          <path d="M4 12l-1 1" />
          <path d="M5.5 13.5l-1 1" />
          <path d="M2.5 10.5l-1 1" />

          <path d="M18 19.5v3.5l-9 -9h3.5c0.5 -2 4.5 -5 9.5 -5c0 0 0.5 0 1 0c0 -0.5 0 0.5 0 1c0 5 -3 9 -5 9.5" />
          <path d="M12 20l-1 1" />
          <path d="M13.5 21.5l-1 1" />
          <path d="M10.5 18.5l-1 1" />
        </>
      )}

      {id === SpecialAbilityName.REBUILD && (
        <path d="M22,8.5A6.5,6.5,0,0,1,15.5,15a6.38,6.38,0,0,1-2-.3L6.62,21.62,2.38,17.38,9.3,10.46a6.38,6.38,0,0,1-.3-2,6.49,6.49,0,0,1,9.34-5.84L14,7l3,3,4.34-4.34A6.45,6.45,0,0,1,22,8.5Z"></path>
      )}

      {id === SpecialAbilityName.SHIELD_TUNNEL && (
        <>
          <rect x="2" y="7" width="20" height="10" rx="5" />
          <path d="M9 9.3l2.34 1.35v2.7L9 14.7l-2.34-1.35v-2.7z" />
          <path d="M13.68 9.3l2.34 1.35v2.7l-2.34 1.35-2.34-1.35v-2.7z" />
          <path d="M18 9.6l1.4 4.8" />
        </>
      )}
    </svg>
  );
}
