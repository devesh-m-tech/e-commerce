/**
 * Phone Number Utilities for WhatsApp E.164 formatting & sanitization
 * Default country: India (+91)
 */

export const normalizePhoneNumber = (rawPhone, defaultCountryCode = '91') => {
  if (!rawPhone || typeof rawPhone !== 'string') return null;

  // Strip all non-numeric characters except leading '+'
  let cleaned = rawPhone.trim().replace(/[^\d+]/g, '');

  if (!cleaned) return null;

  // Remove leading '+' for initial parsing
  if (cleaned.startsWith('+')) {
    cleaned = cleaned.substring(1);
  }

  // Remove leading zeros (common in Indian domestic numbers like 09876543210)
  cleaned = cleaned.replace(/^0+/, '');

  // If 10 digits starting with 6-9, prepend default country code (91)
  if (/^[6-9]\d{9}$/.test(cleaned)) {
    return `+${defaultCountryCode}${cleaned}`;
  }

  // If 12 digits starting with 91 followed by 6-9
  if (/^91[6-9]\d{9}$/.test(cleaned)) {
    return `+${cleaned}`;
  }

  // International standard E.164 check (between 10 and 15 digits)
  if (/^\d{10,15}$/.test(cleaned)) {
    return `+${cleaned}`;
  }

  return null;
};

/**
 * Validate whether a phone number is an Indian or international mobile number suitable for WhatsApp
 */
export const isValidWhatsAppNumber = (phone) => {
  const normalized = normalizePhoneNumber(phone);
  if (!normalized) return false;
  // Must be between + and 10 to 15 digits
  return /^\+\d{11,15}$/.test(normalized);
};

/**
 * Sanitize phone number for security logging (e.g. +91 ••••• ••1234)
 */
export const maskPhoneNumber = (phone) => {
  if (!phone) return '—';
  const str = String(phone).trim();
  if (str.length < 6) return '••••••';
  const prefix = str.slice(0, 3);
  const suffix = str.slice(-4);
  return `${prefix} ••••• ••${suffix}`;
};

export default {
  normalizePhoneNumber,
  isValidWhatsAppNumber,
  maskPhoneNumber,
};
