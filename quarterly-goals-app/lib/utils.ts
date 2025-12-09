import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Quarter utilities
export function getCurrentQuarter(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;
  const quarter = Math.ceil(month / 3);
  return `${year}-Q${quarter}`;
}

export function getNextQuarter(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;
  const quarter = Math.ceil(month / 3);

  if (quarter === 4) {
    return `${year + 1}-Q1`;
  }
  return `${year}-Q${quarter + 1}`;
}

export function getQuarterDates(quarter: string): { startDate: Date; endDate: Date } {
  const [year, q] = quarter.split('-Q');
  const yearNum = parseInt(year);
  const quarterNum = parseInt(q);

  const startMonth = (quarterNum - 1) * 3;
  const startDate = new Date(yearNum, startMonth, 1);

  const endMonth = quarterNum * 3;
  const endDate = new Date(yearNum, endMonth, 0); // Last day of the quarter

  return { startDate, endDate };
}

export function getSelectionPeriodDates(quarter: string): { startDate: Date; endDate: Date } {
  const { startDate } = getQuarterDates(quarter);

  // Selection period starts 3 weeks (21 days) before the quarter
  const selectionStartDate = new Date(startDate);
  selectionStartDate.setDate(selectionStartDate.getDate() - 21);

  // Ends 1 day before the quarter starts
  const selectionEndDate = new Date(startDate);
  selectionEndDate.setDate(selectionEndDate.getDate() - 1);

  return { startDate: selectionStartDate, endDate: selectionEndDate };
}

export function isInSelectionPeriod(quarter: string): boolean {
  const now = new Date();
  const { startDate, endDate } = getSelectionPeriodDates(quarter);
  return now >= startDate && now <= endDate;
}

export function shouldShowSelectionForNextQuarter(): boolean {
  const nextQuarter = getNextQuarter();
  return isInSelectionPeriod(nextQuarter);
}

export function formatDate(date: Date): string {
  return date.toISOString().split('T')[0];
}

export function formatQuarter(quarter: string): string {
  const [year, q] = quarter.split('-Q');
  return `Q${q} ${year}`;
}

// Get the current month in YYYY-MM format
export function getCurrentMonth(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = (now.getMonth() + 1).toString().padStart(2, '0');
  return `${year}-${month}`;
}

// Get week start and end dates (week starts on Sunday)
export function getWeekDates(date: Date = new Date()): { start: Date; end: Date } {
  const start = new Date(date);
  const day = start.getDay();
  const diff = start.getDate() - day;
  start.setDate(diff);
  start.setHours(0, 0, 0, 0);

  const end = new Date(start);
  end.setDate(end.getDate() + 6);
  end.setHours(23, 59, 59, 999);

  return { start, end };
}

// Check if a month has started (useful for locking habits)
export function hasMonthStarted(monthYear: string): boolean {
  const [year, month] = monthYear.split('-');
  const monthStart = new Date(parseInt(year), parseInt(month) - 1, 1);
  return new Date() >= monthStart;
}

// Check if a quarter has started (useful for locking goals)
export function hasQuarterStarted(quarter: string): boolean {
  const { startDate } = getQuarterDates(quarter);
  return new Date() >= startDate;
}

// Generate a unique ID
export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}
