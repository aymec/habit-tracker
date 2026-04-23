import { Entry, Habit, TargetPeriod } from '../models/types';

export type DayStatus = 'complete' | 'partial' | 'missed';

export function getPeriodKey(date: Date, period: TargetPeriod): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');

  switch (period) {
    case 'day':
      return `${y}-${m}-${d}`;
    case 'week': {
      const dayOfWeek = date.getDay();
      const diff = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
      const monday = new Date(date.getFullYear(), date.getMonth(), date.getDate() - diff);
      const my = monday.getFullYear();
      const mm = String(monday.getMonth() + 1).padStart(2, '0');
      const md = String(monday.getDate()).padStart(2, '0');
      return `${my}-${mm}-${md}`;
    }
    case 'month':
      return `${y}-${m}`;
    case 'year':
      return `${y}`;
  }
}

function getPeriodStart(date: Date, period: TargetPeriod): Date {
  switch (period) {
    case 'day':
      return new Date(date.getFullYear(), date.getMonth(), date.getDate());
    case 'week': {
      const dayOfWeek = date.getDay();
      const diff = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
      return new Date(date.getFullYear(), date.getMonth(), date.getDate() - diff);
    }
    case 'month':
      return new Date(date.getFullYear(), date.getMonth(), 1);
    case 'year':
      return new Date(date.getFullYear(), 0, 1);
  }
}

function nextPeriodStart(date: Date, period: TargetPeriod): Date {
  switch (period) {
    case 'day':
      return new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1);
    case 'week':
      return new Date(date.getFullYear(), date.getMonth(), date.getDate() + 7);
    case 'month':
      return new Date(date.getFullYear(), date.getMonth() + 1, 1);
    case 'year':
      return new Date(date.getFullYear() + 1, 0, 1);
  }
}

function buildPeriodSums(entries: Entry[], period: TargetPeriod): Map<string, number> {
  const map = new Map<string, number>();
  for (const entry of entries) {
    const key = getPeriodKey(new Date(entry.timestamp), period);
    map.set(key, (map.get(key) ?? 0) + entry.value);
  }
  return map;
}

function classifyStatus(sum: number, targetValue?: number): DayStatus {
  if (sum === 0) return 'missed';
  if (targetValue === undefined || sum >= targetValue) return 'complete';
  return 'partial';
}

export interface StreakResult {
  current: number;
  best: number;
}

/**
 * Computes current and best streaks for a habit given its entries.
 *
 * Grace rules:
 * - 1 completely missed period does not break the streak
 * - 2 consecutive partial periods (entries but below target) do not break the streak
 * - Grace resets after a fully completed period
 */
export function computeStreaks(entries: Entry[], habit: Habit): StreakResult {
  if (entries.length === 0) return { current: 0, best: 0 };

  const period: TargetPeriod = habit.target?.period ?? 'day';
  const targetValue = habit.target?.value;
  const sums = buildPeriodSums(entries, period);

  const startDate = getPeriodStart(new Date(habit.createdAt), period);
  const todayStart = getPeriodStart(new Date(), period);

  const statuses: DayStatus[] = [];
  let cursor = startDate;
  while (cursor <= todayStart) {
    const sum = sums.get(getPeriodKey(cursor, period)) ?? 0;
    statuses.push(classifyStatus(sum, targetValue));
    cursor = nextPeriodStart(cursor, period);
  }

  let currentCount = 0;
  let best = 0;
  let graceUsed = false;
  let consecutivePartials = 0;

  for (const status of statuses) {
    if (status === 'complete') {
      currentCount++;
      best = Math.max(best, currentCount);
      graceUsed = false;
      consecutivePartials = 0;
    } else if (status === 'missed') {
      if (!graceUsed && consecutivePartials === 0) {
        graceUsed = true;
      } else {
        currentCount = 0;
        graceUsed = false;
        consecutivePartials = 0;
      }
    } else {
      consecutivePartials++;
      if (consecutivePartials > 2 || graceUsed) {
        currentCount = 0;
        graceUsed = false;
        consecutivePartials = 0;
      }
    }
  }

  return { current: currentCount, best };
}

/**
 * Returns a map of "YYYY-MM-DD" → DayStatus for calendar display.
 * For daily-target habits: classifies each day against the target.
 * For other habits: 'complete' if any entries that day, 'missed' otherwise.
 */
export function getDayStatuses(entries: Entry[], habit: Habit): Map<string, DayStatus> {
  const map = new Map<string, DayStatus>();
  const daySums = buildPeriodSums(entries, 'day');
  const isDaily = habit.target?.period === 'day';

  for (const [key, sum] of daySums) {
    map.set(key, classifyStatus(sum, isDaily ? habit.target?.value : undefined));
  }

  return map;
}
