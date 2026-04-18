import type { Entry, Option } from '../models/types';

const DAY_MS = 24 * 60 * 60 * 1000;

export type PeriodId = 'thisWeek' | 'past7d' | 'thisMonth' | 'past30d' | 'thisYear' | 'past365d';
export type Agg = 'day' | 'week' | 'month';

export interface PeriodDef {
  id: PeriodId;
  label: string;
}

export interface ResolvedPeriod {
  start: Date;
  end: Date;
  defaultAgg: Agg;
  label: string;
}

export interface TimeBucket {
  label: string;
  fullLabel: string;
  value: number;
  date: Date;
}

export interface OptionBucket {
  id: string;
  label: string;
  value: number;
  count: number;
}

export interface Averages {
  day: number;
  week: number;
  month: number;
  year: number;
  active: number;
  total: number;
  spanDays: number;
  activeDays: number;
}

export const PERIODS: PeriodDef[] = [
  { id: 'thisWeek', label: 'This week' },
  { id: 'past7d', label: 'Past 7d' },
  { id: 'thisMonth', label: 'This month' },
  { id: 'past30d', label: 'Past 30d' },
  { id: 'thisYear', label: 'This year' },
  { id: 'past365d', label: 'Past 365d' },
];

function atStartOfDay(d: Date): Date {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

function atStartOfWeek(d: Date): Date {
  const x = atStartOfDay(d);
  const dow = x.getDay();
  const diff = dow === 0 ? 6 : dow - 1;
  x.setDate(x.getDate() - diff);
  return x;
}

function atStartOfMonth(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

function atStartOfYear(d: Date): Date {
  return new Date(d.getFullYear(), 0, 1);
}

export function resolvePeriod(periodId: PeriodId, now?: Date): ResolvedPeriod {
  const n = now || new Date();
  switch (periodId) {
    case 'thisWeek': {
      const start = atStartOfWeek(n);
      const end = new Date(start);
      end.setDate(end.getDate() + 7);
      return { start, end, defaultAgg: 'day', label: 'This week' };
    }
    case 'past7d': {
      const end = atStartOfDay(n);
      end.setDate(end.getDate() + 1);
      const start = new Date(end);
      start.setDate(start.getDate() - 7);
      return { start, end, defaultAgg: 'day', label: 'Past 7 days' };
    }
    case 'thisMonth': {
      const start = atStartOfMonth(n);
      const end = new Date(start.getFullYear(), start.getMonth() + 1, 1);
      return { start, end, defaultAgg: 'day', label: 'This month' };
    }
    case 'past30d': {
      const end = atStartOfDay(n);
      end.setDate(end.getDate() + 1);
      const start = new Date(end);
      start.setDate(start.getDate() - 30);
      return { start, end, defaultAgg: 'day', label: 'Past 30 days' };
    }
    case 'thisYear': {
      const start = atStartOfYear(n);
      const end = new Date(start.getFullYear() + 1, 0, 1);
      return { start, end, defaultAgg: 'month', label: 'This year' };
    }
    case 'past365d':
    default: {
      const end = atStartOfDay(n);
      end.setDate(end.getDate() + 1);
      const start = new Date(end);
      start.setDate(start.getDate() - 365);
      return { start, end, defaultAgg: 'month', label: 'Past 365 days' };
    }
  }
}

function* iterBuckets(start: Date, end: Date, agg: Agg): Generator<{ bucketStart: Date; bucketEnd: Date }> {
  const cur = new Date(start);
  if (agg === 'day') {
    cur.setHours(0, 0, 0, 0);
  } else if (agg === 'week') {
    const dow = cur.getDay();
    const diff = dow === 0 ? 6 : dow - 1;
    cur.setDate(cur.getDate() - diff);
    cur.setHours(0, 0, 0, 0);
  } else if (agg === 'month') {
    cur.setDate(1);
    cur.setHours(0, 0, 0, 0);
  }
  while (cur < end) {
    const next = new Date(cur);
    if (agg === 'day') next.setDate(next.getDate() + 1);
    else if (agg === 'week') next.setDate(next.getDate() + 7);
    else next.setMonth(next.getMonth() + 1);
    yield { bucketStart: new Date(cur), bucketEnd: new Date(next) };
    cur.setTime(next.getTime());
  }
}

function formatBucketLabel(d: Date, agg: Agg): string {
  const M = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  if (agg === 'day') return `${M[d.getMonth()]} ${d.getDate()}`;
  if (agg === 'week') return `${M[d.getMonth()]} ${d.getDate()}`;
  return `${M[d.getMonth()]} ${String(d.getFullYear()).slice(2)}`;
}

function formatBucketShort(d: Date, agg: Agg): string {
  if (agg === 'day') return String(d.getDate());
  if (agg === 'week') {
    return `${d.getDate()}/${d.getMonth() + 1}`;
  }
  const M = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  return M[d.getMonth()];
}

export function bucketByTime(entries: Entry[], start: Date, end: Date, agg: Agg): TimeBucket[] {
  const filtered = entries.filter((e) => {
    const t = new Date(e.timestamp);
    return t >= start && t < end;
  });
  const buckets: TimeBucket[] = [];
  for (const b of iterBuckets(start, end, agg)) {
    const sum = filtered
      .filter((e) => {
        const t = new Date(e.timestamp);
        return t >= b.bucketStart && t < b.bucketEnd;
      })
      .reduce((acc, e) => acc + e.value, 0);
    buckets.push({
      label: formatBucketShort(b.bucketStart, agg),
      fullLabel: formatBucketLabel(b.bucketStart, agg),
      value: sum,
      date: b.bucketStart,
    });
  }
  return buckets;
}

export function bucketByOption(
  entries: Entry[],
  options: Option[],
  start: Date,
  end: Date
): OptionBucket[] {
  const filtered = entries.filter((e) => {
    const t = new Date(e.timestamp);
    return t >= start && t < end;
  });
  const byLabel: Record<string, OptionBucket> = {};
  for (const o of options) {
    byLabel[o.label] = { label: o.label, id: o.id, value: 0, count: 0 };
  }
  for (const e of filtered) {
    if (!byLabel[e.label]) {
      byLabel[e.label] = { label: e.label, id: e.label, value: 0, count: 0 };
    }
    byLabel[e.label].value += e.value;
    byLabel[e.label].count += 1;
  }
  return Object.values(byLabel);
}

export function computeAverages(entries: Entry[]): Averages {
  if (entries.length === 0) {
    return { day: 0, week: 0, month: 0, year: 0, active: 0, total: 0, spanDays: 0, activeDays: 0 };
  }
  const dates = entries.map((e) => new Date(e.timestamp).getTime()).sort((a, b) => a - b);
  const first = new Date(dates[0]);
  const last = new Date(dates[dates.length - 1]);
  const total = entries.reduce((a, e) => a + e.value, 0);
  const spanDays = Math.max(1, (atStartOfDay(last).getTime() - atStartOfDay(first).getTime()) / DAY_MS + 1);
  const daySet = new Set(entries.map((e) => atStartOfDay(new Date(e.timestamp)).toISOString()));
  return {
    day: total / spanDays,
    week: (total / spanDays) * 7,
    month: (total / spanDays) * 30.44,
    year: (total / spanDays) * 365.25,
    active: total / daySet.size,
    total,
    spanDays,
    activeDays: daySet.size,
  };
}

export function fmt(n: number, digits: number = 1): string {
  if (!isFinite(n)) return '—';
  if (n >= 100) return n.toFixed(0);
  return n.toFixed(digits);
}
