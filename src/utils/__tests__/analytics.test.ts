import {
  resolvePeriod,
  bucketByTime,
  bucketByOption,
  computeAverages,
  fmt,
} from '../analytics';
import type { Entry, Option } from '../../models/types';

function entry(timestamp: string, value: number, label: string = 'x'): Entry {
  return { id: timestamp, habitId: 'h1', label, value, timestamp };
}

function option(id: string, label: string, value: number = 1): Option {
  return { id, habitId: 'h1', label, value };
}

describe('resolvePeriod', () => {
  it('thisWeek starts on Monday', () => {
    const now = new Date('2026-04-15T10:00:00Z');
    const { start } = resolvePeriod('thisWeek', now);
    expect(start.getDay()).toBe(1);
  });

  it('past7d returns a 7-day window ending tomorrow at 00:00', () => {
    const now = new Date('2026-04-15T10:00:00Z');
    const { start, end } = resolvePeriod('past7d', now);
    const diffDays = (end.getTime() - start.getTime()) / (24 * 60 * 60 * 1000);
    expect(Math.round(diffDays)).toBe(7);
    expect(end.getHours()).toBe(0);
    expect(end.getMinutes()).toBe(0);
  });

  it('past30d returns a 30-day window', () => {
    const now = new Date('2026-04-15T10:00:00Z');
    const { start, end } = resolvePeriod('past30d', now);
    const diffDays = (end.getTime() - start.getTime()) / (24 * 60 * 60 * 1000);
    expect(Math.round(diffDays)).toBe(30);
  });

  it('thisYear defaultAgg is month', () => {
    const now = new Date('2026-04-15T10:00:00Z');
    const { defaultAgg } = resolvePeriod('thisYear', now);
    expect(defaultAgg).toBe('month');
  });
});

describe('bucketByTime', () => {
  it('returns a contiguous series covering every day (even zeros)', () => {
    const now = new Date('2026-04-15T10:00:00Z');
    const { start, end } = resolvePeriod('past7d', now);
    const entries: Entry[] = [
      entry('2026-04-10T12:00:00Z', 5),
      entry('2026-04-13T12:00:00Z', 2),
    ];
    const buckets = bucketByTime(entries, start, end, 'day');
    expect(buckets.length).toBe(7);
    const sum = buckets.reduce((a, b) => a + b.value, 0);
    expect(sum).toBe(7);
    expect(buckets.some((b) => b.value === 0)).toBe(true);
  });

  it('sums multiple entries within the same day bucket', () => {
    const now = new Date('2026-04-15T10:00:00Z');
    const { start, end } = resolvePeriod('past7d', now);
    const entries: Entry[] = [
      entry('2026-04-12T08:00:00Z', 3),
      entry('2026-04-12T20:00:00Z', 2),
    ];
    const buckets = bucketByTime(entries, start, end, 'day');
    const total = buckets.reduce((a, b) => a + b.value, 0);
    expect(total).toBe(5);
  });
});

describe('bucketByOption', () => {
  it('covers all known options (even 0-count)', () => {
    const start = new Date('2026-04-01T00:00:00Z');
    const end = new Date('2026-05-01T00:00:00Z');
    const options: Option[] = [option('o1', '🍎', 1), option('o2', '🥦', 1)];
    const entries: Entry[] = [entry('2026-04-10T12:00:00Z', 1, '🍎')];
    const buckets = bucketByOption(entries, options, start, end);
    expect(buckets).toHaveLength(2);
    const apple = buckets.find((b) => b.label === '🍎');
    const broccoli = buckets.find((b) => b.label === '🥦');
    expect(apple?.value).toBe(1);
    expect(apple?.count).toBe(1);
    expect(broccoli?.value).toBe(0);
    expect(broccoli?.count).toBe(0);
  });

  it('adds a fallback entry for unknown labels', () => {
    const start = new Date('2026-04-01T00:00:00Z');
    const end = new Date('2026-05-01T00:00:00Z');
    const options: Option[] = [option('o1', '🍎', 1)];
    const entries: Entry[] = [entry('2026-04-10T12:00:00Z', 5, '🌮')];
    const buckets = bucketByOption(entries, options, start, end);
    expect(buckets).toHaveLength(2);
    const taco = buckets.find((b) => b.label === '🌮');
    expect(taco).toBeDefined();
    expect(taco?.value).toBe(5);
  });
});

describe('computeAverages', () => {
  it('single entry on a single day gives day = value', () => {
    const entries: Entry[] = [entry('2026-04-10T12:00:00Z', 4)];
    const avgs = computeAverages(entries);
    expect(avgs.day).toBe(4);
    expect(avgs.week).toBe(28);
    expect(avgs.total).toBe(4);
    expect(avgs.activeDays).toBe(1);
    expect(avgs.spanDays).toBe(1);
  });

  it('empty returns zeros', () => {
    const avgs = computeAverages([]);
    expect(avgs.day).toBe(0);
    expect(avgs.total).toBe(0);
  });
});

describe('fmt', () => {
  it('returns "—" for non-finite', () => {
    expect(fmt(NaN)).toBe('—');
    expect(fmt(Infinity)).toBe('—');
  });

  it('fixes to 0 digits at >= 100', () => {
    expect(fmt(125.6)).toBe('126');
  });

  it('fixes to 1 digit below 100', () => {
    expect(fmt(12.345)).toBe('12.3');
  });

  it('rounds up to 100 without a fractional digit', () => {
    expect(fmt(99.95)).toBe('100');
  });
});
