'use client';

import { useApp } from '@/context/AppContext';
import Navigation from '@/components/Navigation';
import { getCurrentQuarter, formatQuarter, getQuarterDates, formatDate } from '@/lib/utils';
import { getRandomQuote } from '@/lib/quotes';
import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function Dashboard() {
  const { state } = useApp();
  const [quote, setQuote] = useState(getRandomQuote());
  const currentQuarter = getCurrentQuarter();

  const currentGoals = state.quarterlyGoals.filter(g => g.quarter === currentQuarter);

  useEffect(() => {
    setQuote(getRandomQuote());
  }, []);

  const getGoalProgress = (goalId: string) => {
    const habits = state.monthlyHabits.filter(h => h.quarterlyGoalId === goalId);
    const checkIns = state.weeklyCheckIns.filter(ci =>
      habits.some(h => h.id === ci.monthlyHabitId)
    );
    const streak = state.habitStreaks.find(s => s.quarterlyGoalId === goalId);

    return {
      totalCheckIns: checkIns.length,
      completed: checkIns.filter(ci => ci.completionStatus === 'Completed').length,
      partial: checkIns.filter(ci => ci.completionStatus === 'Partial').length,
      streak: streak || { consecutiveWeeks: 0, totalWeeks: 0 }
    };
  };

  const quarterDates = getQuarterDates(currentQuarter);
  const daysInQuarter = Math.ceil(
    (quarterDates.endDate.getTime() - quarterDates.startDate.getTime()) / (1000 * 60 * 60 * 24)
  );
  const daysElapsed = Math.max(
    0,
    Math.min(
      daysInQuarter,
      Math.ceil((new Date().getTime() - quarterDates.startDate.getTime()) / (1000 * 60 * 60 * 24))
    )
  );
  const quarterProgress = Math.round((daysElapsed / daysInQuarter) * 100);

  return (
    <div className="min-h-screen bg-neutral-50">
      <Navigation />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Header with Quote */}
        <div className="mb-12">
          <h1 className="text-3xl sm:text-4xl font-light tracking-tight text-neutral-900 mb-2">
            {formatQuarter(currentQuarter)}
          </h1>
          <div className="mt-6 p-6 bg-white border border-neutral-200 rounded-lg">
            <p className="text-sm sm:text-base text-neutral-700 italic leading-relaxed">
              "{quote.text}"
            </p>
            <p className="text-sm text-neutral-500 mt-3">— {quote.author}</p>
          </div>
        </div>

        {/* Quarter Progress */}
        <div className="mb-8 p-6 bg-white border border-neutral-200 rounded-lg">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-light text-neutral-600">Quarter Progress</span>
            <span className="text-sm font-light text-neutral-900">{quarterProgress}%</span>
          </div>
          <div className="w-full bg-neutral-100 rounded-full h-2">
            <div
              className="bg-neutral-900 h-2 rounded-full transition-all duration-500"
              style={{ width: `${quarterProgress}%` }}
            />
          </div>
          <p className="text-xs text-neutral-500 mt-2">
            {formatDate(quarterDates.startDate)} — {formatDate(quarterDates.endDate)}
          </p>
        </div>

        {/* Current Goals */}
        {currentGoals.length > 0 ? (
          <div className="space-y-6">
            <h2 className="text-xl font-light text-neutral-900">Your Goals</h2>
            {currentGoals.map(goal => {
              const progress = getGoalProgress(goal.id);
              return (
                <div key={goal.id} className="p-6 bg-white border border-neutral-200 rounded-lg">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <p className="text-xs font-light text-neutral-500 uppercase tracking-wider mb-1">
                        {goal.category}
                      </p>
                      <h3 className="text-lg font-light text-neutral-900">{goal.title}</h3>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-neutral-100">
                    <div>
                      <p className="text-2xl font-light text-neutral-900">
                        {progress.streak.consecutiveWeeks}
                      </p>
                      <p className="text-xs text-neutral-500 mt-1">Consecutive Weeks</p>
                    </div>
                    <div>
                      <p className="text-2xl font-light text-neutral-900">
                        {progress.streak.totalWeeks}
                      </p>
                      <p className="text-xs text-neutral-500 mt-1">Total Weeks</p>
                    </div>
                  </div>

                  {progress.totalCheckIns > 0 && (
                    <div className="mt-4 pt-4 border-t border-neutral-100">
                      <div className="flex gap-4 text-xs">
                        <span className="text-neutral-600">
                          Completed: <span className="text-neutral-900">{progress.completed}</span>
                        </span>
                        <span className="text-neutral-600">
                          Partial: <span className="text-neutral-900">{progress.partial}</span>
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-12 bg-white border border-neutral-200 rounded-lg text-center">
            <p className="text-neutral-600 mb-4">No goals set for this quarter yet.</p>
            <Link
              href="/brainstorm"
              className="inline-block px-6 py-2 bg-neutral-900 text-white text-sm font-light tracking-wide rounded-md hover:bg-neutral-800 transition-colors"
            >
              Start Brainstorming
            </Link>
          </div>
        )}

        {/* Quick Actions */}
        <div className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Link
            href="/brainstorm"
            className="p-6 bg-white border border-neutral-200 rounded-lg hover:border-neutral-300 transition-colors text-center"
          >
            <h3 className="text-sm font-light text-neutral-900">Add Ideas</h3>
            <p className="text-xs text-neutral-500 mt-1">Brainstorm goals</p>
          </Link>
          <Link
            href="/habits"
            className="p-6 bg-white border border-neutral-200 rounded-lg hover:border-neutral-300 transition-colors text-center"
          >
            <h3 className="text-sm font-light text-neutral-900">Set Habits</h3>
            <p className="text-xs text-neutral-500 mt-1">Monthly actions</p>
          </Link>
          <Link
            href="/check-in"
            className="p-6 bg-white border border-neutral-200 rounded-lg hover:border-neutral-300 transition-colors text-center"
          >
            <h3 className="text-sm font-light text-neutral-900">Weekly Review</h3>
            <p className="text-xs text-neutral-500 mt-1">Track progress</p>
          </Link>
        </div>
      </main>
    </div>
  );
}
