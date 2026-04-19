import { formatNumber, formatNumberCompact } from '../format';

const NNBSP = '\u202F';

describe('formatNumberCompact', () => {
  describe('below threshold (passthrough to formatNumber)', () => {
    it('returns "0" for 0', () => {
      expect(formatNumberCompact(0)).toBe('0');
    });

    it('returns "18" for 18', () => {
      expect(formatNumberCompact(18)).toBe('18');
    });

    it('preserves decimals', () => {
      expect(formatNumberCompact(1234.5)).toBe(`1${NNBSP}234.5`);
    });

    it('returns "9 999" for 9999 (one below threshold)', () => {
      expect(formatNumberCompact(9999)).toBe(`9${NNBSP}999`);
    });

    it('passes through negative values below threshold', () => {
      expect(formatNumberCompact(-1234)).toBe(`-1${NNBSP}234`);
    });

    it('matches formatNumber exactly below threshold', () => {
      for (const v of [0, 1, 42, 999, 1000, 5432.1, -99, -9999.99]) {
        expect(formatNumberCompact(v)).toBe(formatNumber(v));
      }
    });
  });

  describe('k suffix (≥ 10 000, < 1 000 000)', () => {
    it('formats 10 000 as "10k"', () => {
      expect(formatNumberCompact(10000)).toBe('10k');
    });

    it('formats 12 500 as "12.5k"', () => {
      expect(formatNumberCompact(12500)).toBe('12.5k');
    });

    it('formats 999 499 as "999k"', () => {
      expect(formatNumberCompact(999499)).toBe('999k');
    });

    it('rolls 999 500 up to "1M"', () => {
      expect(formatNumberCompact(999500)).toBe('1M');
    });

    it('strips trailing zeros (10 000 is "10k" not "10.0k")', () => {
      expect(formatNumberCompact(10000)).not.toContain('.');
    });
  });

  describe('M suffix (≥ 1 000 000, < 1 000 000 000)', () => {
    it('formats 1 000 000 as "1M"', () => {
      expect(formatNumberCompact(1000000)).toBe('1M');
    });

    it('formats 1 052 806.4 as "1.05M"', () => {
      expect(formatNumberCompact(1052806.4)).toBe('1.05M');
    });

    it('formats 999 999 999 as "1B" (rolls up)', () => {
      expect(formatNumberCompact(999999999)).toBe('1B');
    });
  });

  describe('B suffix (≥ 1 000 000 000, < 1 000 000 000 000)', () => {
    it('formats 3 200 000 000 as "3.2B"', () => {
      expect(formatNumberCompact(3200000000)).toBe('3.2B');
    });

    it('formats 999 999 999 999 as "1T" (rolls up)', () => {
      expect(formatNumberCompact(999999999999)).toBe('1T');
    });
  });

  describe('T suffix (≥ 1 000 000 000 000)', () => {
    it('formats 5 000 000 000 000 as "5T"', () => {
      expect(formatNumberCompact(5000000000000)).toBe('5T');
    });

    it('does not roll up past T', () => {
      expect(formatNumberCompact(5e15)).toMatch(/^\d+T$/);
    });
  });

  describe('negatives above threshold', () => {
    it('formats -12 500 as "-12.5k"', () => {
      expect(formatNumberCompact(-12500)).toBe('-12.5k');
    });

    it('formats -1 052 806.4 as "-1.05M"', () => {
      expect(formatNumberCompact(-1052806.4)).toBe('-1.05M');
    });
  });
});
