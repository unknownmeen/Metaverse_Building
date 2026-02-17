import fa from '../locales/fa.json';
import { toPersianDigits } from '../lib/persianNumbers';

const translations = fa;

/**
 * Get a translated string by dot-notation key.
 * Supports interpolation with {{param}} syntax.
 *
 * @example
 *   t('errors.auth.unauthorized')
 *   t('time.minutes_ago', { count: 5 })  // "5 دقیقه پیش"
 *
 * @param {string} key - Dot-separated translation key
 * @param {Record<string, string|number>} [params] - Interpolation parameters
 * @returns {string} The translated string, or the key itself if not found
 */
export function t(key, params) {
  const keys = key.split('.');
  let result = translations;

  for (const k of keys) {
    if (result && typeof result === 'object' && k in result) {
      result = result[k];
    } else {
      return key;
    }
  }

  if (typeof result !== 'string') return key;

  if (params) {
    return result.replace(/\{\{(\w+)\}\}/g, (_, name) => {
      if (!(name in params)) return `{{${name}}}`;
      const val = params[name];
      return typeof val === 'number' ? toPersianDigits(val) : String(val);
    });
  }

  return result;
}
