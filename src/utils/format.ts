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
