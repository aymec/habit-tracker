import { TargetPeriod, Entry } from '../models/types';

export const getStartOfPeriod = (period: TargetPeriod): Date => {
  const now = new Date();
  switch (period) {
    case 'day':
      return new Date(now.getFullYear(), now.getMonth(), now.getDate());
    case 'week': {
      const dayOfWeek = now.getDay();
      const diff = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // Monday as start of week
      return new Date(now.getFullYear(), now.getMonth(), now.getDate() - diff);
    }
    case 'month':
      return new Date(now.getFullYear(), now.getMonth(), 1);
    case 'year':
      return new Date(now.getFullYear(), 0, 1);
  }
};

export const calculatePeriodCount = (entries: Entry[], period: TargetPeriod): number => {
  const startOfPeriod = getStartOfPeriod(period);
  return entries
    .filter(entry => new Date(entry.timestamp) >= startOfPeriod)
    .reduce((sum, entry) => sum + entry.value, 0);
};
