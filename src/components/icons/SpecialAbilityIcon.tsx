import { SpecialAbilityName } from '../../Game/spaceships/ability-almanac';

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
    </svg>
  );
}
