/**
 * Convert Western (0-9) digits to Persian/Farsi digits (۰-۹).
 * Used for consistent RTL display across the app.
 */
const PERSIAN_DIGITS = '۰۱۲۳۴۵۶۷۸۹';
const ARABIC_DIGITS = '٠١٢٣٤٥٦٧٨٩';

export function toPersianDigits(value) {
  if (value === null || value === undefined) return '';
  const str = toEnglishDigits(value);
  return str.replace(/\d/g, (d) => PERSIAN_DIGITS[parseInt(d, 10)]);
}

export function toEnglishDigits(value) {
  if (value === null || value === undefined) return '';
  return String(value)
    .replace(/[۰-۹]/g, (digit) => String(PERSIAN_DIGITS.indexOf(digit)))
    .replace(/[٠-٩]/g, (digit) => String(ARABIC_DIGITS.indexOf(digit)));
}
