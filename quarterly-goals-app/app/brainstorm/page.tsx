'use client';

import { useState } from 'react';
import { useApp } from '@/context/AppContext';
import Navigation from '@/components/Navigation';
import { CATEGORIES, GoalCategory } from '@/types';
import { generateId } from '@/lib/utils';

export default function BrainstormPage() {
  const { state, addBrainstormGoal, deleteBrainstormGoal } = useApp();
  const [newGoal, setNewGoal] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<GoalCategory>(CATEGORIES[0]);
  const [filterCategory, setFilterCategory] = useState<GoalCategory | 'All'>('All');

  const handleAddGoal = (e: React.FormEvent) => {
    e.preventDefault();
    if (newGoal.trim()) {
      addBrainstormGoal({
        id: generateId(),
        title: newGoal.trim(),
        category: selectedCategory,
        createdAt: new Date().toISOString()
      });
      setNewGoal('');
    }
  };

  const filteredGoals =
    filterCategory === 'All'
      ? state.brainstormGoals
      : state.brainstormGoals.filter(g => g.category === filterCategory);

  const goalsByCategory = CATEGORIES.reduce((acc, category) => {
    acc[category] = state.brainstormGoals.filter(g => g.category === category);
    return acc;
  }, {} as Record<GoalCategory, typeof state.brainstormGoals>);

  return (
    <div className="min-h-screen bg-neutral-50">
      <Navigation />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-light tracking-tight text-neutral-900 mb-2">
            Brainstorm Goals
          </h1>
          <p className="text-neutral-600 text-sm">
            Add potential goals to any category. You can refine and select them later.
          </p>
        </div>

        {/* Add Goal Form */}
        <form onSubmit={handleAddGoal} className="mb-8 p-6 bg-white border border-neutral-200 rounded-lg">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-light text-neutral-700 mb-2">
                Category
              </label>
              <select
                value={selectedCategory}
                onChange={e => setSelectedCategory(e.target.value as GoalCategory)}
                className="w-full px-4 py-2 border border-neutral-200 rounded-md text-sm font-light focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-transparent"
              >
                {CATEGORIES.map(category => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-light text-neutral-700 mb-2">
                Goal
              </label>
              <input
                type="text"
                value={newGoal}
                onChange={e => setNewGoal(e.target.value)}
                placeholder="Enter a potential goal..."
                className="w-full px-4 py-2 border border-neutral-200 rounded-md text-sm font-light focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-transparent"
              />
            </div>

            <button
              type="submit"
              className="w-full sm:w-auto px-6 py-2 bg-neutral-900 text-white text-sm font-light tracking-wide rounded-md hover:bg-neutral-800 transition-colors"
            >
              Add Goal
            </button>
          </div>
        </form>

        {/* Filter */}
        <div className="mb-6">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setFilterCategory('All')}
              className={`px-3 py-1.5 text-xs font-light tracking-wide rounded-md transition-colors ${
                filterCategory === 'All'
                  ? 'bg-neutral-900 text-white'
                  : 'bg-white text-neutral-600 border border-neutral-200 hover:border-neutral-300'
              }`}
            >
              All ({state.brainstormGoals.length})
            </button>
            {CATEGORIES.map(category => (
              <button
                key={category}
                onClick={() => setFilterCategory(category)}
                className={`px-3 py-1.5 text-xs font-light tracking-wide rounded-md transition-colors ${
                  filterCategory === category
                    ? 'bg-neutral-900 text-white'
                    : 'bg-white text-neutral-600 border border-neutral-200 hover:border-neutral-300'
                }`}
              >
                {category} ({goalsByCategory[category].length})
              </button>
            ))}
          </div>
        </div>

        {/* Goals List */}
        {filteredGoals.length > 0 ? (
          <div className="space-y-3">
            {filteredGoals.map(goal => (
              <div
                key={goal.id}
                className="p-4 bg-white border border-neutral-200 rounded-lg flex items-start justify-between group hover:border-neutral-300 transition-colors"
              >
                <div className="flex-1">
                  <p className="text-xs font-light text-neutral-500 uppercase tracking-wider mb-1">
                    {goal.category}
                  </p>
                  <p className="text-sm text-neutral-900">{goal.title}</p>
                </div>
                <button
                  onClick={() => deleteBrainstormGoal(goal.id)}
                  className="ml-4 text-neutral-400 hover:text-red-600 transition-colors opacity-0 group-hover:opacity-100"
                  aria-label="Delete goal"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-12 bg-white border border-neutral-200 rounded-lg text-center">
            <p className="text-neutral-600">
              {filterCategory === 'All'
                ? 'No goals yet. Start brainstorming!'
                : `No goals in ${filterCategory} yet.`}
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
