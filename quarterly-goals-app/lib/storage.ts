import { AppState, DEFAULT_SETTINGS } from '@/types';

const STORAGE_KEY = 'quarterly-goals-app-state';

export function loadState(): AppState | null {
  if (typeof window === 'undefined') return null;

  try {
    const serializedState = localStorage.getItem(STORAGE_KEY);
    if (serializedState === null) {
      return getInitialState();
    }
    return JSON.parse(serializedState);
  } catch (err) {
    console.error('Error loading state from localStorage:', err);
    return getInitialState();
  }
}

export function saveState(state: AppState): void {
  if (typeof window === 'undefined') return;

  try {
    const serializedState = JSON.stringify(state);
    localStorage.setItem(STORAGE_KEY, serializedState);
  } catch (err) {
    console.error('Error saving state to localStorage:', err);
  }
}

export function clearState(): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (err) {
    console.error('Error clearing state from localStorage:', err);
  }
}

function getInitialState(): AppState {
  return {
    brainstormGoals: [],
    quarterlyGoals: [],
    monthlyHabits: [],
    weeklyCheckIns: [],
    habitStreaks: [],
    settings: DEFAULT_SETTINGS,
    currentSelectionPeriod: undefined
  };
}
