export type GoalCategory =
  | 'Meaning'
  | 'Career'
  | 'Educational/Personal Growth'
  | 'Health'
  | 'Social'
  | 'Romantic'
  | 'Financial';

export const CATEGORIES: GoalCategory[] = [
  'Meaning',
  'Career',
  'Educational/Personal Growth',
  'Health',
  'Social',
  'Romantic',
  'Financial'
];

export interface BrainstormGoal {
  id: string;
  title: string;
  category: GoalCategory;
  createdAt: string;
}

export interface QuarterlyGoal {
  id: string;
  brainstormGoalId: string;
  title: string;
  category: GoalCategory;
  quarter: string; // e.g., "2025-Q1"
  startDate: string;
  endDate: string;
}

export interface MonthlyHabit {
  id: string;
  quarterlyGoalId: string;
  title: string;
  description: string;
  frequency: string; // e.g., "Daily", "3x per week", "Once per month"
  monthYear: string; // e.g., "2025-01"
  startDate: string;
  endDate: string;
  isLocked: boolean;
}

export type CompletionStatus = 'Completed' | 'Partial' | 'Not completed';

export interface WeeklyCheckIn {
  id: string;
  monthlyHabitId: string;
  weekStartDate: string;
  weekEndDate: string;
  completionStatus: CompletionStatus;
  amazingThing: string;
  makeNextWeekBetter: string;
  additionalReflection: string;
  createdAt: string;
}

export interface HabitStreak {
  quarterlyGoalId: string;
  consecutiveWeeks: number;
  totalWeeks: number;
}

export interface AppSettings {
  reflectionQuestions: {
    question1: string;
    question2: string;
    question3: string;
  };
  reminderDay: number; // 0-6 (Sunday-Saturday)
  reminderTime: string; // HH:mm format
  phoneNumber: string;
  twilioAccountSid?: string;
  twilioAuthToken?: string;
  twilioPhoneNumber?: string;
}

export interface AppState {
  brainstormGoals: BrainstormGoal[];
  quarterlyGoals: QuarterlyGoal[];
  monthlyHabits: MonthlyHabit[];
  weeklyCheckIns: WeeklyCheckIn[];
  habitStreaks: HabitStreak[];
  settings: AppSettings;
  currentSelectionPeriod?: {
    quarter: string;
    startDate: string;
    endDate: string;
    isActive: boolean;
  };
}

export const DEFAULT_SETTINGS: AppSettings = {
  reflectionQuestions: {
    question1: "What is an amazing thing that happened this week?",
    question2: "How can I make next week better?",
    question3: "What am I grateful for from this week?"
  },
  reminderDay: 0, // Sunday
  reminderTime: "18:00",
  phoneNumber: "6172512112"
};
