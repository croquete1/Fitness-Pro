export type PostgrestErrorLike = {
  code?: string | null;
  message?: string | null;
  details?: string | null;
  hint?: string | null;
};

const SKIPPABLE_SCHEMA_CODES = new Set(['PGRST205', '42P01', '42703', '42704', '42501', 'PGRST301']);

function normalise(value: string | null | undefined): string {
  return (value ?? '').toLowerCase();
}

export function isSkippableSchemaError(error: unknown): boolean {
  if (!error || typeof error !== 'object') return false;
  const candidate = error as PostgrestErrorLike;
  if (candidate.code && SKIPPABLE_SCHEMA_CODES.has(candidate.code)) {
    return true;
  }
  const message = normalise(candidate.message);
  const details = normalise(candidate.details);
  const hint = normalise(candidate.hint);
  const haystack = `${message} ${details} ${hint}`;
  if (!haystack.trim()) return false;
  if (haystack.includes('does not exist')) return true;
  if (haystack.includes('not exist')) return true;
  if (haystack.includes('undefined column')) return true;
  if (haystack.includes('permission denied')) return true;
  if (haystack.includes('not allowed')) return true;
  return false;
}
