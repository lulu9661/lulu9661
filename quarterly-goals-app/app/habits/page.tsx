'use client';

import { useState } from 'react';
import { useApp } from '@/context/AppContext';
import Navigation from '@/components/Navigation';
import { getCurrentQuarter, getCurrentMonth, generateId, hasMonthStarted } from '@/lib/utils';
import { MonthlyHabit } from '@/types';

export default function HabitsPage() {
  const { state, addMonthlyHabit, updateMonthlyHabit } = useApp();
  const currentQuarter = getCurrentQuarter();
  const currentMonth = getCurrentMonth();

  const [selectedGoalId, setSelectedGoalId] = useState<string | null>(null);
  const [habitTitle, setHabitTitle] = useState('');
  const [habitDescription, setHabitDescription] = useState('');
  const [habitFrequency, setHabitFrequency] = useState('');
  const [editingHabit, setEditingHabit] = useState<MonthlyHabit | null>(null);

  const currentGoals = state.quarterlyGoals.filter(g => g.quarter === currentQuarter);
  const currentMonthHabits = state.monthlyHabits.filter(h => h.monthYear === currentMonth);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedGoalId || !habitTitle.trim() || !habitFrequency.trim()) return;

    const monthStart = new Date();
    monthStart.setDate(1);
    const monthEnd = new Date(monthStart);
    monthEnd.setMonth(monthEnd.getMonth() + 1);
    monthEnd.setDate(0);

    if (editingHabit) {
      updateMonthlyHabit(editingHabit.id, {
        title: habitTitle.trim(),
        description: habitDescription.trim(),
        frequency: habitFrequency.trim()
      });
      setEditingHabit(null);
    } else {
      const newHabit: MonthlyHabit = {
        id: generateId(),
        quarterlyGoalId: selectedGoalId,
        title: habitTitle.trim(),
        description: habitDescription.trim(),
        frequency: habitFrequency.trim(),
        monthYear: currentMonth,
        startDate: monthStart.toISOString().split('T')[0],
        endDate: monthEnd.toISOString().split('T')[0],
        isLocked: false
      };

      addMonthlyHabit(newHabit);
    }

    // Reset form
    setHabitTitle('');
    setHabitDescription('');
    setHabitFrequency('');
    setSelectedGoalId(null);
  };

  const handleEdit = (habit: MonthlyHabit) => {
    if (hasMonthStarted(habit.monthYear)) return;

    setEditingHabit(habit);
    setSelectedGoalId(habit.quarterlyGoalId);
    setHabitTitle(habit.title);
    setHabitDescription(habit.description);
    setHabitFrequency(habit.frequency);
  };

  const cancelEdit = () => {
    setEditingHabit(null);
    setHabitTitle('');
    setHabitDescription('');
    setHabitFrequency('');
    setSelectedGoalId(null);
  };

  const monthHasStarted = hasMonthStarted(currentMonth);

  return (
    <div className="min-h-screen bg-neutral-50">
      <Navigation />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-light tracking-tight text-neutral-900 mb-2">
            Monthly Habits
          </h1>
          <p className="text-neutral-600 text-sm">
            Set specific, actionable habits for this month to work toward your quarterly goals
          </p>
        </div>

        {currentGoals.length === 0 ? (
          <div className="p-12 bg-white border border-neutral-200 rounded-lg text-center">
            <p className="text-neutral-600">No quarterly goals set yet.</p>
          </div>
        ) : (
          <>
            {/* Add/Edit Habit Form */}
            {!monthHasStarted && (
              <form onSubmit={handleSubmit} className="mb-8 p-6 bg-white border border-neutral-200 rounded-lg">
                <h2 className="text-lg font-light text-neutral-900 mb-4">
                  {editingHabit ? 'Edit Habit' : 'Add New Habit'}
                </h2>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-light text-neutral-700 mb-2">
                      Goal
                    </label>
                    <select
                      value={selectedGoalId || ''}
                      onChange={e => setSelectedGoalId(e.target.value)}
                      className="w-full px-4 py-2 border border-neutral-200 rounded-md text-sm font-light focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-transparent"
                      required
                    >
                      <option value="">Select a goal...</option>
                      {currentGoals.map(goal => (
                        <option key={goal.id} value={goal.id}>
                          {goal.category}: {goal.title}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-light text-neutral-700 mb-2">
                      Habit
                    </label>
                    <input
                      type="text"
                      value={habitTitle}
                      onChange={e => setHabitTitle(e.target.value)}
                      placeholder="e.g., Go for a run, Read for 30 minutes, Call a friend"
                      className="w-full px-4 py-2 border border-neutral-200 rounded-md text-sm font-light focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-transparent"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-light text-neutral-700 mb-2">
                      Description (Optional)
                    </label>
                    <textarea
                      value={habitDescription}
                      onChange={e => setHabitDescription(e.target.value)}
                      placeholder="Add more details about this habit..."
                      rows={2}
                      className="w-full px-4 py-2 border border-neutral-200 rounded-md text-sm font-light focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-transparent resize-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-light text-neutral-700 mb-2">
                      Frequency
                    </label>
                    <input
                      type="text"
                      value={habitFrequency}
                      onChange={e => setHabitFrequency(e.target.value)}
                      placeholder="e.g., Daily, 3x per week, Once per week, Once this month"
                      className="w-full px-4 py-2 border border-neutral-200 rounded-md text-sm font-light focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-transparent"
                      required
                    />
                  </div>

                  <div className="flex gap-4">
                    {editingHabit && (
                      <button
                        type="button"
                        onClick={cancelEdit}
                        className="flex-1 px-6 py-2 bg-white border border-neutral-200 text-neutral-900 text-sm font-light tracking-wide rounded-md hover:border-neutral-300 transition-colors"
                      >
                        Cancel
                      </button>
                    )}
                    <button
                      type="submit"
                      className="flex-1 px-6 py-2 bg-neutral-900 text-white text-sm font-light tracking-wide rounded-md hover:bg-neutral-800 transition-colors"
                    >
                      {editingHabit ? 'Update Habit' : 'Add Habit'}
                    </button>
                  </div>
                </div>
              </form>
            )}

            {monthHasStarted && currentMonthHabits.length === 0 && (
              <div className="mb-8 p-6 bg-amber-50 border border-amber-200 rounded-lg">
                <p className="text-sm text-amber-800">
                  The month has started and you haven't set any habits yet. Set your habits before the month begins next time!
                </p>
              </div>
            )}

            {/* Current Month Habits */}
            {currentMonthHabits.length > 0 && (
              <div className="space-y-4 mb-8">
                <h2 className="text-lg font-light text-neutral-900">
                  This Month's Habits
                </h2>
                {currentMonthHabits.map(habit => {
                  const goal = currentGoals.find(g => g.id === habit.quarterlyGoalId);
                  const isLocked = hasMonthStarted(habit.monthYear);

                  return (
                    <div key={habit.id} className="p-6 bg-white border border-neutral-200 rounded-lg">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <p className="text-xs font-light text-neutral-500 uppercase tracking-wider mb-1">
                            {goal?.category}
                          </p>
                          <h3 className="text-lg font-light text-neutral-900">{habit.title}</h3>
                          {habit.description && (
                            <p className="text-sm text-neutral-600 mt-2">{habit.description}</p>
                          )}
                        </div>
                        {!isLocked && (
                          <button
                            onClick={() => handleEdit(habit)}
                            className="text-sm text-neutral-500 hover:text-neutral-900 transition-colors"
                          >
                            Edit
                          </button>
                        )}
                      </div>

                      <div className="mt-4 pt-4 border-t border-neutral-100">
                        <div className="flex items-center gap-2 text-sm">
                          <span className="text-neutral-600">Frequency:</span>
                          <span className="text-neutral-900">{habit.frequency}</span>
                        </div>
                        {isLocked && (
                          <div className="mt-2 text-xs text-neutral-500">
                            🔒 Locked (month has started)
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Past Habits */}
            {(() => {
              const pastHabits = state.monthlyHabits.filter(h => h.monthYear < currentMonth);
              if (pastHabits.length === 0) return null;

              return (
                <div className="space-y-4">
                  <h2 className="text-lg font-light text-neutral-900">Past Habits</h2>
                  {pastHabits.slice(-3).reverse().map(habit => {
                    const goal = state.quarterlyGoals.find(g => g.id === habit.quarterlyGoalId);
                    const checkIns = state.weeklyCheckIns.filter(c => c.monthlyHabitId === habit.id);

                    return (
                      <div key={habit.id} className="p-6 bg-neutral-100 border border-neutral-200 rounded-lg opacity-75">
                        <p className="text-xs font-light text-neutral-500 uppercase tracking-wider mb-1">
                          {goal?.category} • {habit.monthYear}
                        </p>
                        <h3 className="text-base font-light text-neutral-900">{habit.title}</h3>
                        <div className="mt-2 text-xs text-neutral-600">
                          {checkIns.length} check-ins
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })()}
          </>
        )}
      </main>
    </div>
  );
}
