// src/lib/roles.ts

// Papéis tal como usados na App (UI) e na BD
export type DbRole = 'ADMIN' | 'TRAINER' | 'CLIENT';
export type AppRole = 'ADMIN' | 'PT' | 'CLIENT';

// Aliases → role canónica da App
const ROLE_ALIASES: Record<string, AppRole> = {
  // Admin
  ADMIN: 'ADMIN',
  Admin: 'ADMIN',
  admin: 'ADMIN',

  // Trainer/PT
  TRAINER: 'PT',
  Trainer: 'PT',
  trainer: 'PT',
  PT: 'PT',
  Pt: 'PT',
  pt: 'PT',

  // Client
  CLIENT: 'CLIENT',
  Client: 'CLIENT',
  client: 'CLIENT',
};

// Normaliza para AppRole ('TRAINER' → 'PT', etc.)
export function toAppRole(input: unknown): AppRole | null {
  if (input == null) return null;
  const raw = String(input).trim();
  const upper = raw.toUpperCase();
  return ROLE_ALIASES[upper] ?? ROLE_ALIASES[raw] ?? null;
}

// Compatibilidade com código antigo
export const normalizeRole = toAppRole;

// Conversões DB <-> App
export function dbRoleToAppRole(input: DbRole | string | null | undefined): AppRole | null {
  if (input == null) return null;
  const v = String(input).trim().toUpperCase();
  if (v === 'ADMIN') return 'ADMIN';
  if (v === 'CLIENT') return 'CLIENT';
  if (v === 'TRAINER' || v === 'PT') return 'PT';
  return toAppRole(input);
}

export function appRoleToDbRole(input: AppRole | string | null | undefined): DbRole | null {
  if (input == null) return null;
  const v = String(input).trim().toUpperCase();
  if (v === 'ADMIN') return 'ADMIN';
  if (v === 'CLIENT') return 'CLIENT';
  if (v === 'PT' || v === 'TRAINER') return 'TRAINER';
  return null;
}

// Type guards / helpers
export const isAdmin   = (r: unknown) => toAppRole(r) === 'ADMIN';
export const isPT      = (r: unknown) => toAppRole(r) === 'PT';
export const isTrainer = isPT; // alias para compatibilidade
export const isClient  = (r: unknown) => toAppRole(r) === 'CLIENT';
