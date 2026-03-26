import { AppState, DEFAULT_STATE } from '@/types';

const STORAGE_KEY = 'job-search-app-state';

export function loadState(): AppState | null {
  if (typeof window === 'undefined') return null;

  try {
    const serialized = localStorage.getItem(STORAGE_KEY);
    if (serialized === null) return DEFAULT_STATE;
    return { ...DEFAULT_STATE, ...JSON.parse(serialized) };
  } catch {
    return DEFAULT_STATE;
  }
}

export function saveState(state: AppState): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    console.error('Failed to save state to localStorage');
  }
}
