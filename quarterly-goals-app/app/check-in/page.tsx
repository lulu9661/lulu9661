'use client';

import { useState } from 'react';
import { useApp } from '@/context/AppContext';
import Navigation from '@/components/Navigation';
import { getCurrentMonth, getWeekDates, formatDate, generateId } from '@/lib/utils';
import { CompletionStatus, WeeklyCheckIn } from '@/types';
import { getRandomQuote } from '@/lib/quotes';

export default function CheckInPage() {
  const { state, addWeeklyCheckIn } = useApp();
  const currentMonth = getCurrentMonth();
  const weekDates = getWeekDates();

  const [selectedHabitId, setSelectedHabitId] = useState<string | null>(null);
  const [completionStatus, setCompletionStatus] = useState<CompletionStatus>('Completed');
  const [amazingThing, setAmazingThing] = useState('');
  const [makeNextWeekBetter, setMakeNextWeekBetter] = useState('');
  const [additionalReflection, setAdditionalReflection] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);

  const currentMonthHabits = state.monthlyHabits.filter(h => h.monthYear === currentMonth);
  const quote = getRandomQuote();

  // Get check-ins for current week
  const weekStart = formatDate(weekDates.start);
  const weekEnd = formatDate(weekDates.end);
  const existingCheckIns = state.weeklyCheckIns.filter(
    c => c.weekStartDate === weekStart && c.weekEndDate === weekEnd
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedHabitId) return;

    const newCheckIn: WeeklyCheckIn = {
      id: generateId(),
      monthlyHabitId: selectedHabitId,
      weekStartDate: weekStart,
      weekEndDate: weekEnd,
      completionStatus,
      amazingThing: amazingThing.trim(),
      makeNextWeekBetter: makeNextWeekBetter.trim(),
      additionalReflection: additionalReflection.trim(),
      createdAt: new Date().toISOString()
    };

    addWeeklyCheckIn(newCheckIn);

    // Reset form
    setSelectedHabitId(null);
    setCompletionStatus('Completed');
    setAmazingThing('');
    setMakeNextWeekBetter('');
    setAdditionalReflection('');
    setShowSuccess(true);

    setTimeout(() => setShowSuccess(false), 3000);
  };

  const getHabitGoal = (habitId: string) => {
    const habit = state.monthlyHabits.find(h => h.id === habitId);
    if (!habit) return null;
    return state.quarterlyGoals.find(g => g.id === habit.quarterlyGoalId);
  };

  return (
    <div className="min-h-screen bg-neutral-50">
      <Navigation />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-light tracking-tight text-neutral-900 mb-2">
            Weekly Check-In
          </h1>
          <p className="text-neutral-600 text-sm">
            Week of {formatDate(weekDates.start)} — {formatDate(weekDates.end)}
          </p>
        </div>

        {/* Quote */}
        <div className="mb-8 p-6 bg-white border border-neutral-200 rounded-lg">
          <p className="text-sm text-neutral-700 italic leading-relaxed">
            "{quote.text}"
          </p>
          <p className="text-sm text-neutral-500 mt-3">— {quote.author}</p>
        </div>

        {/* Success Message */}
        {showSuccess && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-sm text-green-800">✓ Check-in saved successfully!</p>
          </div>
        )}

        {currentMonthHabits.length === 0 ? (
          <div className="p-12 bg-white border border-neutral-200 rounded-lg text-center">
            <p className="text-neutral-600">No habits set for this month yet.</p>
          </div>
        ) : (
          <>
            {/* Check-in Form */}
            <form onSubmit={handleSubmit} className="mb-8 p-6 bg-white border border-neutral-200 rounded-lg">
              <h2 className="text-lg font-light text-neutral-900 mb-6">Record Your Progress</h2>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-light text-neutral-700 mb-2">
                    Which habit are you checking in on?
                  </label>
                  <select
                    value={selectedHabitId || ''}
                    onChange={e => setSelectedHabitId(e.target.value)}
                    className="w-full px-4 py-2 border border-neutral-200 rounded-md text-sm font-light focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-transparent"
                    required
                  >
                    <option value="">Select a habit...</option>
                    {currentMonthHabits.map(habit => {
                      const goal = getHabitGoal(habit.id);
                      const hasCheckedIn = existingCheckIns.some(c => c.monthlyHabitId === habit.id);

                      return (
                        <option key={habit.id} value={habit.id}>
                          {goal?.category}: {habit.title}
                          {hasCheckedIn ? ' ✓' : ''}
                        </option>
                      );
                    })}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-light text-neutral-700 mb-3">
                    How did you do this week?
                  </label>
                  <div className="space-y-2">
                    {(['Completed', 'Partial', 'Not completed'] as CompletionStatus[]).map(status => (
                      <label
                        key={status}
                        className="flex items-center p-3 border border-neutral-200 rounded-md cursor-pointer hover:bg-neutral-50 transition-colors"
                      >
                        <input
                          type="radio"
                          name="completionStatus"
                          value={status}
                          checked={completionStatus === status}
                          onChange={e => setCompletionStatus(e.target.value as CompletionStatus)}
                          className="mr-3 text-neutral-900 focus:ring-neutral-900"
                        />
                        <span className="text-sm text-neutral-900">{status}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="pt-6 border-t border-neutral-200">
                  <h3 className="text-base font-light text-neutral-900 mb-4">Weekly Reflection</h3>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-light text-neutral-700 mb-2">
                        {state.settings.reflectionQuestions.question1}
                      </label>
                      <textarea
                        value={amazingThing}
                        onChange={e => setAmazingThing(e.target.value)}
                        rows={3}
                        className="w-full px-4 py-2 border border-neutral-200 rounded-md text-sm font-light focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-transparent resize-none"
                        placeholder="Reflect on the highlights of your week..."
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-light text-neutral-700 mb-2">
                        {state.settings.reflectionQuestions.question2}
                      </label>
                      <textarea
                        value={makeNextWeekBetter}
                        onChange={e => setMakeNextWeekBetter(e.target.value)}
                        rows={3}
                        className="w-full px-4 py-2 border border-neutral-200 rounded-md text-sm font-light focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-transparent resize-none"
                        placeholder="Think about what you can improve..."
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-light text-neutral-700 mb-2">
                        {state.settings.reflectionQuestions.question3}
                      </label>
                      <textarea
                        value={additionalReflection}
                        onChange={e => setAdditionalReflection(e.target.value)}
                        rows={3}
                        className="w-full px-4 py-2 border border-neutral-200 rounded-md text-sm font-light focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-transparent resize-none"
                        placeholder="Additional thoughts..."
                      />
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full px-6 py-3 bg-neutral-900 text-white text-sm font-light tracking-wide rounded-md hover:bg-neutral-800 transition-colors"
                >
                  Submit Check-In
                </button>
              </div>
            </form>

            {/* Recent Check-ins */}
            {existingCheckIns.length > 0 && (
              <div className="space-y-4">
                <h2 className="text-lg font-light text-neutral-900">This Week's Check-Ins</h2>
                {existingCheckIns.map(checkIn => {
                  const habit = state.monthlyHabits.find(h => h.id === checkIn.monthlyHabitId);
                  const goal = habit ? getHabitGoal(habit.id) : null;

                  return (
                    <div key={checkIn.id} className="p-6 bg-white border border-neutral-200 rounded-lg">
                      <div className="mb-4">
                        <p className="text-xs font-light text-neutral-500 uppercase tracking-wider mb-1">
                          {goal?.category}
                        </p>
                        <h3 className="text-base font-light text-neutral-900">{habit?.title}</h3>
                      </div>

                      <div className="mb-4">
                        <span
                          className={`inline-block px-3 py-1 text-xs rounded-full ${
                            checkIn.completionStatus === 'Completed'
                              ? 'bg-green-100 text-green-800'
                              : checkIn.completionStatus === 'Partial'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {checkIn.completionStatus}
                        </span>
                      </div>

                      {(checkIn.amazingThing || checkIn.makeNextWeekBetter || checkIn.additionalReflection) && (
                        <div className="pt-4 border-t border-neutral-100 space-y-3 text-sm">
                          {checkIn.amazingThing && (
                            <div>
                              <p className="text-neutral-500 mb-1">Amazing thing:</p>
                              <p className="text-neutral-900">{checkIn.amazingThing}</p>
                            </div>
                          )}
                          {checkIn.makeNextWeekBetter && (
                            <div>
                              <p className="text-neutral-500 mb-1">Make next week better:</p>
                              <p className="text-neutral-900">{checkIn.makeNextWeekBetter}</p>
                            </div>
                          )}
                          {checkIn.additionalReflection && (
                            <div>
                              <p className="text-neutral-500 mb-1">Additional reflection:</p>
                              <p className="text-neutral-900">{checkIn.additionalReflection}</p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
