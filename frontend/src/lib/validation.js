/**
 * Shared validation constants and helpers.
 * Must stay in sync with backend DTO constraints.
 */

export const LIMITS = {
  TITLE_MAX: 200,
  DESCRIPTION_MAX: 2000,
  CHAT_MESSAGE_MAX: 5000,
  NAME_MAX: 100,
  PASSWORD_MIN: 6,
  PASSWORD_MAX: 128,
  FILE_NAME_MAX: 255,
  STEP_TITLE_MAX: 200,
};

export const AVATAR_RANGE = { min: 1, max: 20 };

/**
 * Checks if a date string is today or in the future.
 */
export function isFutureOrToday(dateStr) {
  if (!dateStr) return false;
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return date >= today;
}

/**
 * Returns remaining character count.
 * Negative means over-limit.
 */
export function charsRemaining(value, max) {
  return max - (value?.length || 0);
}
