// src/lib/roles.ts

/** Roles do lado da BD (schema) */
export type DbRole = 'ADMIN' | 'TRAINER' | 'CLIENT';

/** Roles canónicos da app (UI/Lógica) */
export type AppRole = 'ADMIN' | 'PT' | 'CLIENT';

/** Conjunto útil para validações/UX */
export const APP_ROLES: Readonly<AppRole[]> = ['ADMIN', 'PT', 'CLIENT'] as const;
export const DB_ROLES: Readonly<DbRole[]> = ['ADMIN', 'TRAINER', 'CLIENT'] as const;

/**
 * Tabela de normalização (sempre em UPPERCASE):
 * - ADMIN   -> ADMIN
 * - TRAINER -> PT
 * - PT      -> PT
 * - CLIENT  -> CLIENT
 */
const ROLE_ALIASES_UPPER: Record<string, AppRole> = {
  ADMIN: 'ADMIN',
  TRAINER: 'PT',
  PT: 'PT',
  CLIENT: 'CLIENT',
};

// -------- Normalização (UI/App) --------

/** Converte qualquer input numa AppRole canónica, ou null se inválido. */
export function toAppRole(input: unknown): AppRole | null {
  const key = String(input ?? '').trim().toUpperCase();
  return ROLE_ALIASES_UPPER[key] ?? null;
}

/** Compatibilidade antiga */
export const normalizeRole = toAppRole;

// -------- Converters DB <-> App --------

/** DB ➜ App: TRAINER vira PT; restantes mantêm. */
export function dbRoleToAppRole(input: DbRole | string): AppRole | null {
  const v = String(input ?? '').trim().toUpperCase();
  return toAppRole(v);
}

/** App ➜ DB: PT vira TRAINER; restantes mantêm. */
export function appRoleToDbRole(input: AppRole | string): DbRole | null {
  const v = String(input ?? '').trim().toUpperCase();
  if (v === 'PT' || v === 'TRAINER') return 'TRAINER';
  if (v === 'ADMIN') return 'ADMIN';
  if (v === 'CLIENT') return 'CLIENT';
  return null;
}

// -------- Type guards / helpers --------

export const isAdmin   = (r: unknown) => toAppRole(r) === 'ADMIN';
export const isPT      = (r: unknown) => toAppRole(r) === 'PT';
export const isTrainer = (r: unknown) => toAppRole(r) === 'PT'; // alias p/ compatibilidade
export const isClient  = (r: unknown) => toAppRole(r) === 'CLIENT';

/** Lança erro se o role não for reconhecido — útil em código de servidor. */
export function assertAppRole(input: unknown): asserts input is AppRole {
  const role = toAppRole(input);
  if (!role) throw new Error('Invalid role');
}

/** Devolve sempre uma AppRole (fallback para CLIENT) — útil em UI. */
export function getAppRoleOrClient(input: unknown): AppRole {
  return toAppRole(input) ?? 'CLIENT';
}
