/**
 * Convert Western (0-9) digits to Persian/Farsi digits (۰-۹).
 * Used for consistent RTL display across the app.
 */
const PERSIAN_DIGITS = '۰۱۲۳۴۵۶۷۸۹';

export function toPersianDigits(value) {
  if (value === null || value === undefined) return '';
  const str = String(value);
  return str.replace(/\d/g, (d) => PERSIAN_DIGITS[parseInt(d, 10)]);
}
