import { NavigateOptions, useNavigate } from 'react-router';
import { basename } from '../basename';

export enum Page {
  MENU = '/menu',
  HANDBOOK = '/handbook',
  SETTINGS = '/menu/settings',
  SPACESHIP_SELECTION = '/select/1',
  SPECIAL_ABILITY_SELECTION = '/select/2',
  GAME = '/play'
}

export function useCustomNavigation() {
  const navigate = useNavigate();

  const customNavigate = (
    page: Page,
    navigationState?: Record<string, unknown>,
    options?: Omit<NavigateOptions, 'state'>
  ) => {
    navigate(page, { ...(options ?? {}), state: navigationState });
  };

  return customNavigate;
}

export function forceRedirect(page: Page): void {
  const path = window.location.pathname;
  const basenameIndex = path.indexOf(basename);
  const basePart = path.substring(0, basenameIndex + basename.length);

  window.location.replace(basePart + page);
}
