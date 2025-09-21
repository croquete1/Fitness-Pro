// src/types/auth.ts
export type AppRole = 'ADMIN' | 'PT' | 'TRAINER' | 'CLIENT' | string | undefined;

export const roleToHomePath = (role: AppRole): string => {
  const R = String(role ?? '').toUpperCase();
  if (R === 'ADMIN') return '/dashboard/admin';
  if (R === 'PT' || R === 'TRAINER') return '/dashboard/pt';
  return '/dashboard/clients';
};
