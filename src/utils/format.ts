/**
 * Narrow No-Break Space (U+202F) used as thousand separator
 */
const NARROW_NO_BREAK_SPACE = '\u202F';

/**
 * Formats a number with thousand separators using Narrow No-Break Space (U+202F).
 * Handles integers and decimals, preserving up to 2 decimal places when needed.
 * @param value - The number to format
 * @returns Formatted string with thousand separators
 */
export const formatNumber = (value: number): string => {
  // Round to 2 decimal places to avoid floating point issues
  const rounded = Math.round(value * 100) / 100;

  // Split into integer and decimal parts
  const isNegative = rounded < 0;
  const absoluteValue = Math.abs(rounded);
  const integerPart = Math.floor(absoluteValue);
  const decimalPart = absoluteValue - integerPart;

  // Format integer part with thousand separators
  const integerString = integerPart.toString();
  const formattedInteger = integerString.replace(
    /\B(?=(\d{3})+(?!\d))/g,
    NARROW_NO_BREAK_SPACE
  );

  // Handle decimal part
  let result = formattedInteger;
  if (decimalPart > 0) {
    // Get decimal digits, removing trailing zeros but keeping up to 2 digits
    const decimalString = decimalPart.toFixed(2).slice(2).replace(/0+$/, '');
    if (decimalString) {
      result += '.' + decimalString;
    }
  }

  return isNegative ? '-' + result : result;
};

/**
 * Formats a number with thousand separators and adds a + prefix for positive numbers.
 * Used for displaying values that can be positive or negative (like entry values).
 * @param value - The number to format
 * @returns Formatted string with sign prefix and thousand separators
 */
export const formatNumberWithSign = (value: number): string => {
  const formatted = formatNumber(value);
  return value > 0 ? `+${formatted}` : formatted;
};

/**
 * Compact notation formatter for tight UI surfaces (e.g. the 90 px habit ring).
 * Passes through to {@link formatNumber} below 10 000; above, uses k/M/B/T
 * suffixes with up to 3 significant figures, trailing zeros stripped.
 * Coefficient rollover (e.g. 999 500 → 1M) is handled explicitly.
 */
export const formatNumberCompact = (value: number): string => {
  if (Math.abs(value) < 10_000) return formatNumber(value);

  const sign = value < 0 ? '-' : '';
  const abs = Math.abs(value);

  const suffixes: { threshold: number; suffix: string }[] = [
    { threshold: 1e12, suffix: 'T' },
    { threshold: 1e9, suffix: 'B' },
    { threshold: 1e6, suffix: 'M' },
    { threshold: 1e3, suffix: 'k' },
  ];

  const roundToThreeSigFigs = (coeff: number): number => {
    if (coeff >= 100) return Math.round(coeff);
    if (coeff >= 10) return Math.round(coeff * 10) / 10;
    return Math.round(coeff * 100) / 100;
  };

  for (let i = 0; i < suffixes.length; i++) {
    const { threshold, suffix } = suffixes[i];
    if (abs < threshold) continue;

    const rounded = roundToThreeSigFigs(abs / threshold);

    // Rollover: if rounding pushes us to 1000, step one suffix up.
    // (i === 0 means we are already at T — no suffix above, so stay.)
    if (rounded >= 1000 && i > 0) {
      const next = suffixes[i - 1];
      const nextRounded = roundToThreeSigFigs(abs / next.threshold);
      return `${sign}${nextRounded}${next.suffix}`;
    }

    return `${sign}${rounded}${suffix}`;
  }

  // Unreachable when |value| >= 10_000, but keep a safe fallback.
  return formatNumber(value);
};
