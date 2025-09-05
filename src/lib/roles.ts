// src/lib/roles.ts
export type DbRole = 'ADMIN' | 'TRAINER' | 'CLIENT';
export type AppRole = 'ADMIN' | 'PT' | 'CLIENT';

// Aliases aceites em runtime → role canónica da App
const ROLE_ALIASES: Record<string, AppRole> = {
  // Admin
  ADMIN: 'ADMIN', Admin: 'ADMIN', admin: 'ADMIN',

  // Trainer/PT
  TRAINER: 'PT', Trainer: 'PT', trainer: 'PT',
  PT: 'PT', Pt: 'PT', pt: 'PT',

  // Client
  CLIENT: 'CLIENT', Client: 'CLIENT', client: 'CLIENT',
};

// ---- Normalização (UI/App) ----
export function toAppRole(input: unknown): AppRole | null {
  if (input == null) return null;
  const key = String(input).trim();
  return ROLE_ALIASES[key] ?? null;
}

// Compatibilidade: alguns módulos usam "normalizeRole"
export const normalizeRole = toAppRole;

// ---- Converters DB <-> App ----
export function dbRoleToAppRole(input: DbRole | string): AppRole | null {
  if (input == null) return null;
  const v = String(input).trim().toUpperCase();
  if (v === 'TRAINER') return 'PT';
  if (v === 'ADMIN') return 'ADMIN';
  if (v === 'CLIENT') return 'CLIENT';
  return toAppRole(input);
}

export function appRoleToDbRole(input: AppRole | string): DbRole | null {
  if (input == null) return null;
  const v = String(input).trim().toUpperCase();
  if (v === 'ADMIN') return 'ADMIN';
  if (v === 'CLIENT') return 'CLIENT';
  if (v === 'PT' || v === 'TRAINER') return 'TRAINER';
  return null;
}

// ---- Type guards ----
export const isAdmin   = (r: unknown) => toAppRole(r) === 'ADMIN';
export const isPT      = (r: unknown) => toAppRole(r) === 'PT';
export const isTrainer = (r: unknown) => toAppRole(r) === 'PT';   // alias para compatibilidade
export const isClient  = (r: unknown) => toAppRole(r) === 'CLIENT';
