import { createLocalstorageKey } from './localstorage-key';

const LAST_VERSION_STORAGE_KEY = createLocalstorageKey('last-version');

export function loadLastPlayedVersion(): string | null {
  return localStorage.getItem(LAST_VERSION_STORAGE_KEY);
}

export function saveLastPlayedVersion(lastVersion: string): void {
  localStorage.setItem(LAST_VERSION_STORAGE_KEY, lastVersion);
}
