/**
 * Israeli phone number handling — deliberately forgiving.
 *
 * Guests type numbers in every shape imaginable: 050-123-4567, 0501234567,
 * +972 50 123 4567, (052) 1234567. All of those are the same person, so we
 * strip the noise, normalise to the local 0-prefixed form, and only reject
 * things that genuinely cannot be a phone number.
 *
 * This module is imported by both the browser form and the server route so
 * that the two can never disagree about what counts as valid.
 */

export const MIN_NAME_LENGTH = 2;
export const MAX_NAME_LENGTH = 60;

/**
 * Strips separators and converts an international prefix to the local one.
 * Returns digits only, e.g. "0501234567".
 */
export function normalizePhone(raw: string): string {
  // Keep only digits and a leading plus. This also removes the invisible
  // RTL/LTR marks that Hebrew mobile keyboards like to insert.
  let value = (raw ?? '').replace(/[^\d+]/g, '');

  // +972501234567 / 00972501234567 / 972501234567  ->  0501234567
  value = value.replace(/^(?:\+|00)?972/, '0');

  // Anything else non-numeric (a stray plus mid-string) goes now.
  value = value.replace(/\D/g, '');

  // Someone who wrote 972 and dropped the subscriber's leading zero leaves us
  // with 9 digits that don't start with 0 — put it back.
  if (value.length === 9 && !value.startsWith('0')) {
    value = '0' + value;
  }

  return value;
}

/**
 * Accepts Israeli mobiles (10 digits, e.g. 050-1234567) and landlines
 * (9 digits, e.g. 09-1234567). Anything else is rejected.
 */
export function isValidPhone(raw: string): boolean {
  const value = normalizePhone(raw);
  return /^0\d{8,9}$/.test(value);
}

export function isValidName(raw: string): boolean {
  const value = (raw ?? '').trim();
  return value.length >= MIN_NAME_LENGTH && value.length <= MAX_NAME_LENGTH;
}

export function normalizeName(raw: string): string {
  return (raw ?? '').trim().replace(/\s+/g, ' ').slice(0, MAX_NAME_LENGTH);
}
