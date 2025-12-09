'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import {
  AppState,
  BrainstormGoal,
  QuarterlyGoal,
  MonthlyHabit,
  WeeklyCheckIn,
  AppSettings,
  HabitStreak
} from '@/types';
import { loadState, saveState } from '@/lib/storage';
import { getNextQuarter, shouldShowSelectionForNextQuarter, getSelectionPeriodDates, formatDate } from '@/lib/utils';

interface AppContextType {
  state: AppState;
  addBrainstormGoal: (goal: BrainstormGoal) => void;
  deleteBrainstormGoal: (id: string) => void;
  updateBrainstormGoal: (id: string, updates: Partial<BrainstormGoal>) => void;
  setQuarterlyGoals: (goals: QuarterlyGoal[]) => void;
  addMonthlyHabit: (habit: MonthlyHabit) => void;
  updateMonthlyHabit: (id: string, updates: Partial<MonthlyHabit>) => void;
  addWeeklyCheckIn: (checkIn: WeeklyCheckIn) => void;
  updateSettings: (settings: Partial<AppSettings>) => void;
  updateHabitStreak: (streak: HabitStreak) => void;
  startSelectionPeriod: () => void;
  endSelectionPeriod: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // Load state from localStorage on mount
  useEffect(() => {
    const loadedState = loadState();
    if (loadedState) {
      setState(loadedState);
    }
    setIsInitialized(true);
  }, []);

  // Save state to localStorage whenever it changes
  useEffect(() => {
    if (state && isInitialized) {
      saveState(state);
    }
  }, [state, isInitialized]);

  // Check if we should auto-start selection period
  useEffect(() => {
    if (!state || !isInitialized) return;

    if (shouldShowSelectionForNextQuarter() && !state.currentSelectionPeriod) {
      const nextQuarter = getNextQuarter();
      const { startDate, endDate } = getSelectionPeriodDates(nextQuarter);

      setState(prev => prev ? {
        ...prev,
        currentSelectionPeriod: {
          quarter: nextQuarter,
          startDate: formatDate(startDate),
          endDate: formatDate(endDate),
          isActive: true
        }
      } : prev);
    }
  }, [state, isInitialized]);

  if (!isInitialized || !state) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  const addBrainstormGoal = (goal: BrainstormGoal) => {
    setState(prev => prev ? ({
      ...prev,
      brainstormGoals: [...prev.brainstormGoals, goal]
    }) : prev);
  };

  const deleteBrainstormGoal = (id: string) => {
    setState(prev => prev ? ({
      ...prev,
      brainstormGoals: prev.brainstormGoals.filter(g => g.id !== id)
    }) : prev);
  };

  const updateBrainstormGoal = (id: string, updates: Partial<BrainstormGoal>) => {
    setState(prev => prev ? ({
      ...prev,
      brainstormGoals: prev.brainstormGoals.map(g =>
        g.id === id ? { ...g, ...updates } : g
      )
    }) : prev);
  };

  const setQuarterlyGoals = (goals: QuarterlyGoal[]) => {
    setState(prev => prev ? ({
      ...prev,
      quarterlyGoals: [...prev.quarterlyGoals, ...goals],
      // Initialize habit streaks for new goals
      habitStreaks: [
        ...prev.habitStreaks,
        ...goals.map(g => ({
          quarterlyGoalId: g.id,
          consecutiveWeeks: 0,
          totalWeeks: 0
        }))
      ]
    }) : prev);
  };

  const addMonthlyHabit = (habit: MonthlyHabit) => {
    setState(prev => prev ? ({
      ...prev,
      monthlyHabits: [...prev.monthlyHabits, habit]
    }) : prev);
  };

  const updateMonthlyHabit = (id: string, updates: Partial<MonthlyHabit>) => {
    setState(prev => prev ? ({
      ...prev,
      monthlyHabits: prev.monthlyHabits.map(h =>
        h.id === id ? { ...h, ...updates } : h
      )
    }) : prev);
  };

  const addWeeklyCheckIn = (checkIn: WeeklyCheckIn) => {
    setState(prev => {
      if (!prev) return prev;

      // Update habit streak
      const habit = prev.monthlyHabits.find(h => h.id === checkIn.monthlyHabitId);
      if (!habit) return prev;

      const streak = prev.habitStreaks.find(s => s.quarterlyGoalId === habit.quarterlyGoalId);
      if (!streak) return prev;

      const newStreak = { ...streak };

      if (checkIn.completionStatus === 'Completed') {
        newStreak.consecutiveWeeks += 1;
        newStreak.totalWeeks += 1;
      } else if (checkIn.completionStatus === 'Partial') {
        newStreak.totalWeeks += 1;
        // Partial completion breaks the streak
        newStreak.consecutiveWeeks = 0;
      } else {
        // Not completed breaks the streak
        newStreak.consecutiveWeeks = 0;
      }

      return {
        ...prev,
        weeklyCheckIns: [...prev.weeklyCheckIns, checkIn],
        habitStreaks: prev.habitStreaks.map(s =>
          s.quarterlyGoalId === habit.quarterlyGoalId ? newStreak : s
        )
      };
    });
  };

  const updateSettings = (settings: Partial<AppSettings>) => {
    setState(prev => prev ? ({
      ...prev,
      settings: { ...prev.settings, ...settings }
    }) : prev);
  };

  const updateHabitStreak = (streak: HabitStreak) => {
    setState(prev => prev ? ({
      ...prev,
      habitStreaks: prev.habitStreaks.map(s =>
        s.quarterlyGoalId === streak.quarterlyGoalId ? streak : s
      )
    }) : prev);
  };

  const startSelectionPeriod = () => {
    const nextQuarter = getNextQuarter();
    const { startDate, endDate } = getSelectionPeriodDates(nextQuarter);

    setState(prev => prev ? ({
      ...prev,
      currentSelectionPeriod: {
        quarter: nextQuarter,
        startDate: formatDate(startDate),
        endDate: formatDate(endDate),
        isActive: true
      }
    }) : prev);
  };

  const endSelectionPeriod = () => {
    setState(prev => prev ? ({
      ...prev,
      currentSelectionPeriod: undefined
    }) : prev);
  };

  const value: AppContextType = {
    state,
    addBrainstormGoal,
    deleteBrainstormGoal,
    updateBrainstormGoal,
    setQuarterlyGoals,
    addMonthlyHabit,
    updateMonthlyHabit,
    addWeeklyCheckIn,
    updateSettings,
    updateHabitStreak,
    startSelectionPeriod,
    endSelectionPeriod
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
