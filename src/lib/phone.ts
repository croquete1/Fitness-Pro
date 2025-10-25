export const PHONE_MIN_DIGITS = 9;
export const PHONE_MAX_DIGITS = 15;

function sanitizeWhitespace(value: string) {
  return value.replace(/\u00a0/g, ' ').replace(/\s+/g, ' ').trim();
}

export function normalizePhone(value: string) {
  if (!value) return '';

  const trimmed = sanitizeWhitespace(value.replace(/[()\[\].-]/g, ' '));
  if (!trimmed) return '';

  const hasPlus = trimmed.startsWith('+');
  const body = sanitizeWhitespace((hasPlus ? trimmed.slice(1) : trimmed).replace(/\+/g, '').replace(/[^\d ]+/g, ' '));

  if (!body) {
    return hasPlus ? '+' : '';
  }

  return hasPlus ? `+${body}` : body;
}

export function phoneDigitCount(value: string) {
  if (!value) return 0;
  return value.replace(/\D+/g, '').length;
}

export function validatePhone(
  value: unknown,
  { minDigits = PHONE_MIN_DIGITS, maxDigits = PHONE_MAX_DIGITS } = {},
) {
  if (value == null) {
    return { ok: true as const, value: null as null };
  }

  const normalized = normalizePhone(String(value));
  if (!normalized) {
    return { ok: true as const, value: null as null };
  }

  const digits = phoneDigitCount(normalized);
  if (digits < minDigits) {
    return { ok: false as const, error: 'PHONE_TOO_SHORT' as const };
  }
  if (digits > maxDigits) {
    return { ok: false as const, error: 'PHONE_TOO_LONG' as const };
  }

  return { ok: true as const, value: normalized };
}
