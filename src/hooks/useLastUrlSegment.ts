import { useLocation } from 'react-router';

export function useLastUrlSegment() {
  const { pathname } = useLocation();

  return pathname.split('/').filter(Boolean).pop() ?? '';
}
