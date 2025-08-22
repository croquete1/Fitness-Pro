export type RoleKey = 'admin' | 'pt' | 'client';

export function normalizeRole(input?: string | null): RoleKey {
  if (!input) return 'client';
  const v = input.toUpperCase();
  if (v === 'ADMIN') return 'admin';
  if (v === 'TRAINER' || v === 'PT') return 'pt';
  return 'client';
}

export function isBillingAllowedForPT(user?: { id?: string | null; email?: string | null }): boolean {
  if (!user) return false;
  const allowedId = process.env.NEXT_PUBLIC_BILLING_PT_ID;
  const allowedEmail = process.env.NEXT_PUBLIC_BILLING_PT_EMAIL;
  return (!!allowedId && user.id === allowedId) || (!!allowedEmail && user.email === allowedEmail);
}
