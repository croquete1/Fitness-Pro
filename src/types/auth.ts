// src/types/auth.ts
export type AppRole = 'ADMIN' | 'PT' | 'TRAINER' | 'CLIENT' | string | undefined;

/**
 * Mapeia o role da app para a rota inicial correta.
 * Aceita valores "PT" e "TRAINER" como equivalentes (área do PT).
 */
export const roleToHomePath = (role: AppRole): string => {
  const R = String(role ?? '').toUpperCase();
  if (R === 'ADMIN') return '/dashboard/admin';
  if (R === 'PT' || R === 'TRAINER') return '/dashboard/pt';
  return '/dashboard/clients';
};
