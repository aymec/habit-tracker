export type TargetPeriod = 'day' | 'week' | 'month' | 'year';

export interface HabitTarget {
  value: number;
  period: TargetPeriod;
}

export interface Habit {
  id: string;
  name: string;
  icon?: string;
  target?: HabitTarget;
  totalCount: number;
  createdAt: string;
}

export interface Option {
  id: string;
  habitId: string;
  label: string;
  value: number;
}

export interface Entry {
  id: string;
  habitId: string;
  label: string;
  value: number;
  timestamp: string;
}
