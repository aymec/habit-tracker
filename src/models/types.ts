export interface Habit {
  id: string;
  name: string;
  icon?: string;
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
  value: number;
  timestamp: string;
}
