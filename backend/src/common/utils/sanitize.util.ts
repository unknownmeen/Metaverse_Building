/**
 * Input sanitization utilities.
 * Strips HTML tags to prevent stored XSS attacks.
 */

/**
 * Removes all HTML tags from a string, preserving text content.
 * Example: '<script>alert(1)</script>Hello' → 'alert(1)Hello'
 */
export function stripHtmlTags(value: string): string {
  if (typeof value !== 'string') return value;
  return value.replace(/<[^>]*>/g, '');
}

/**
 * Sanitizes a string by stripping HTML tags and trimming whitespace.
 */
export function sanitizeString(value: string): string {
  if (typeof value !== 'string') return value;
  return stripHtmlTags(value).trim();
}
