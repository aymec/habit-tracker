export type TargetPeriod = 'day' | 'week' | 'month' | 'year';

export interface HabitTarget {
  value: number;
  period: TargetPeriod;
  unit?: string;       // Full name, e.g., "liters"
  unitShort?: string;  // Abbreviation, e.g., "L"
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
