'use client';

import { useState, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import Navigation from '@/components/Navigation';
import { CATEGORIES, GoalCategory, QuarterlyGoal } from '@/types';
import { generateId, getNextQuarter, getQuarterDates, formatDate, formatQuarter } from '@/lib/utils';
import Link from 'next/link';

export default function SelectGoalsPage() {
  const { state, setQuarterlyGoals, startSelectionPeriod, endSelectionPeriod } = useApp();
  const [currentCategory, setCurrentCategory] = useState<GoalCategory | null>(null);
  const [remainingGoals, setRemainingGoals] = useState<typeof state.brainstormGoals>([]);
  const [currentPair, setCurrentPair] = useState<[typeof state.brainstormGoals[0], typeof state.brainstormGoals[0]] | null>(null);
  const [selectedGoals, setSelectedGoals] = useState<Record<GoalCategory, typeof state.brainstormGoals[0] | null>>({
    'Meaning': null,
    'Career': null,
    'Educational/Personal Growth': null,
    'Health': null,
    'Social': null,
    'Romantic': null,
    'Financial': null
  });
  const [isComplete, setIsComplete] = useState(false);

  const nextQuarter = getNextQuarter();
  const selectionPeriod = state.currentSelectionPeriod;
  const isSelectionActive = selectionPeriod?.isActive && selectionPeriod.quarter === nextQuarter;

  // Check if next quarter already has goals
  const nextQuarterGoals = state.quarterlyGoals.filter(g => g.quarter === nextQuarter);
  const hasSelectedGoals = nextQuarterGoals.length > 0;

  useEffect(() => {
    if (currentCategory && !currentPair) {
      const categoryGoals = state.brainstormGoals.filter(g => g.category === currentCategory);
      const remaining = categoryGoals.filter(g => !selectedGoals[currentCategory] || g.id !== selectedGoals[currentCategory]?.id);

      if (remainingGoals.length === 0) {
        // First time selecting for this category
        if (remaining.length === 0) {
          // No goals in this category, move to next
          moveToNextCategory();
        } else if (remaining.length === 1) {
          // Only one goal, auto-select it
          setSelectedGoals(prev => ({ ...prev, [currentCategory]: remaining[0] }));
          moveToNextCategory();
        } else {
          // Start tournament
          setRemainingGoals(remaining);
          setCurrentPair([remaining[0], remaining[1]]);
        }
      } else if (remainingGoals.length === 1) {
        // Tournament complete for this category
        setSelectedGoals(prev => ({ ...prev, [currentCategory]: remainingGoals[0] }));
        moveToNextCategory();
      } else {
        // Continue tournament
        setCurrentPair([remainingGoals[0], remainingGoals[1]]);
      }
    }
  }, [currentCategory, remainingGoals, state.brainstormGoals]);

  const moveToNextCategory = () => {
    if (!currentCategory) return;

    const currentIndex = CATEGORIES.indexOf(currentCategory);
    if (currentIndex < CATEGORIES.length - 1) {
      setCurrentCategory(CATEGORIES[currentIndex + 1]);
      setRemainingGoals([]);
      setCurrentPair(null);
    } else {
      setIsComplete(true);
      setCurrentCategory(null);
      setCurrentPair(null);
    }
  };

  const handleSelectGoal = (selectedGoal: typeof state.brainstormGoals[0]) => {
    if (!currentPair || !currentCategory) return;

    const newRemaining = remainingGoals.filter(g => g.id !== currentPair[0].id && g.id !== currentPair[1].id);
    newRemaining.push(selectedGoal);

    setRemainingGoals(newRemaining);
    setCurrentPair(null);
  };

  const handleStartSelection = () => {
    if (!isSelectionActive) {
      startSelectionPeriod();
    }
    setCurrentCategory(CATEGORIES[0]);
    setRemainingGoals([]);
    setCurrentPair(null);
    setIsComplete(false);
  };

  const handleConfirmSelection = () => {
    const quarterDates = getQuarterDates(nextQuarter);
    const newQuarterlyGoals: QuarterlyGoal[] = Object.entries(selectedGoals)
      .filter(([_, goal]) => goal !== null)
      .map(([category, goal]) => ({
        id: generateId(),
        brainstormGoalId: goal!.id,
        title: goal!.title,
        category: category as GoalCategory,
        quarter: nextQuarter,
        startDate: formatDate(quarterDates.startDate),
        endDate: formatDate(quarterDates.endDate)
      }));

    setQuarterlyGoals(newQuarterlyGoals);
    endSelectionPeriod();
    setIsComplete(false);
    setCurrentCategory(null);
    setSelectedGoals({
      'Meaning': null,
      'Career': null,
      'Educational/Personal Growth': null,
      'Health': null,
      'Social': null,
      'Romantic': null,
      'Financial': null
    });
  };

  const handleRestart = () => {
    setCurrentCategory(CATEGORIES[0]);
    setRemainingGoals([]);
    setCurrentPair(null);
    setIsComplete(false);
    setSelectedGoals({
      'Meaning': null,
      'Career': null,
      'Educational/Personal Growth': null,
      'Health': null,
      'Social': null,
      'Romantic': null,
      'Financial': null
    });
  };

  if (hasSelectedGoals) {
    return (
      <div className="min-h-screen bg-neutral-50">
        <Navigation />
        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
          <div className="p-12 bg-white border border-neutral-200 rounded-lg text-center">
            <h2 className="text-2xl font-light text-neutral-900 mb-4">
              Goals Already Selected
            </h2>
            <p className="text-neutral-600 mb-6">
              You've already selected goals for {formatQuarter(nextQuarter)}.
            </p>
            <Link
              href="/"
              className="inline-block px-6 py-2 bg-neutral-900 text-white text-sm font-light tracking-wide rounded-md hover:bg-neutral-800 transition-colors"
            >
              View Dashboard
            </Link>
          </div>
        </main>
      </div>
    );
  }

  if (!currentCategory && !isComplete) {
    return (
      <div className="min-h-screen bg-neutral-50">
        <Navigation />
        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
          <div className="mb-8">
            <h1 className="text-3xl sm:text-4xl font-light tracking-tight text-neutral-900 mb-2">
              Select Goals
            </h1>
            <p className="text-neutral-600 text-sm">
              Choose one goal per category for {formatQuarter(nextQuarter)}
            </p>
          </div>

          <div className="p-12 bg-white border border-neutral-200 rounded-lg text-center">
            {state.brainstormGoals.length === 0 ? (
              <>
                <p className="text-neutral-600 mb-4">
                  You need to brainstorm some goals first.
                </p>
                <Link
                  href="/brainstorm"
                  className="inline-block px-6 py-2 bg-neutral-900 text-white text-sm font-light tracking-wide rounded-md hover:bg-neutral-800 transition-colors"
                >
                  Brainstorm Goals
                </Link>
              </>
            ) : (
              <>
                <h2 className="text-2xl font-light text-neutral-900 mb-4">
                  Ready to Select Your Goals?
                </h2>
                <p className="text-neutral-600 mb-6">
                  You'll compare goals head-to-head to choose the best one for each category.
                </p>
                <button
                  onClick={handleStartSelection}
                  className="px-6 py-2 bg-neutral-900 text-white text-sm font-light tracking-wide rounded-md hover:bg-neutral-800 transition-colors"
                >
                  Start Selection
                </button>
              </>
            )}
          </div>
        </main>
      </div>
    );
  }

  if (isComplete) {
    const selectedCount = Object.values(selectedGoals).filter(g => g !== null).length;

    return (
      <div className="min-h-screen bg-neutral-50">
        <Navigation />
        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
          <div className="mb-8">
            <h1 className="text-3xl sm:text-4xl font-light tracking-tight text-neutral-900 mb-2">
              Selection Complete
            </h1>
            <p className="text-neutral-600 text-sm">
              Review your selected goals for {formatQuarter(nextQuarter)}
            </p>
          </div>

          <div className="space-y-4 mb-8">
            {Object.entries(selectedGoals)
              .filter(([_, goal]) => goal !== null)
              .map(([category, goal]) => (
                <div key={category} className="p-6 bg-white border border-neutral-200 rounded-lg">
                  <p className="text-xs font-light text-neutral-500 uppercase tracking-wider mb-2">
                    {category}
                  </p>
                  <p className="text-lg font-light text-neutral-900">{goal?.title}</p>
                </div>
              ))}
          </div>

          {selectedCount === 0 ? (
            <div className="p-8 bg-white border border-neutral-200 rounded-lg text-center">
              <p className="text-neutral-600 mb-4">No goals selected. Try again?</p>
              <button
                onClick={handleRestart}
                className="px-6 py-2 bg-neutral-900 text-white text-sm font-light tracking-wide rounded-md hover:bg-neutral-800 transition-colors"
              >
                Restart Selection
              </button>
            </div>
          ) : (
            <div className="flex gap-4">
              <button
                onClick={handleRestart}
                className="flex-1 px-6 py-2 bg-white border border-neutral-200 text-neutral-900 text-sm font-light tracking-wide rounded-md hover:border-neutral-300 transition-colors"
              >
                Start Over
              </button>
              <button
                onClick={handleConfirmSelection}
                className="flex-1 px-6 py-2 bg-neutral-900 text-white text-sm font-light tracking-wide rounded-md hover:bg-neutral-800 transition-colors"
              >
                Confirm Selection
              </button>
            </div>
          )}
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      <Navigation />
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-3xl sm:text-4xl font-light tracking-tight text-neutral-900">
              {currentCategory}
            </h1>
            <span className="text-sm text-neutral-500">
              {CATEGORIES.indexOf(currentCategory!) + 1} / {CATEGORIES.length}
            </span>
          </div>
          <p className="text-neutral-600 text-sm">
            Which goal resonates more with you?
          </p>
        </div>

        {currentPair && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {currentPair.map((goal, index) => (
              <button
                key={goal.id}
                onClick={() => handleSelectGoal(goal)}
                className="p-8 bg-white border-2 border-neutral-200 rounded-lg hover:border-neutral-900 transition-all text-left group"
              >
                <div className="flex items-start justify-between mb-4">
                  <span className="text-sm font-light text-neutral-400">
                    Option {index + 1}
                  </span>
                </div>
                <p className="text-lg font-light text-neutral-900 leading-relaxed">
                  {goal.title}
                </p>
                <div className="mt-6 text-sm text-neutral-500 group-hover:text-neutral-900 transition-colors">
                  Select this goal →
                </div>
              </button>
            ))}
          </div>
        )}

        {!currentPair && currentCategory && (
          <div className="p-12 bg-white border border-neutral-200 rounded-lg text-center">
            <p className="text-neutral-600">Loading next comparison...</p>
          </div>
        )}
      </main>
    </div>
  );
}
