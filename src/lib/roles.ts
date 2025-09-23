// src/lib/roles.ts

export type DbRole = 'ADMIN' | 'TRAINER' | 'CLIENT';
export type AppRole = 'ADMIN' | 'PT' | 'CLIENT';

export const APP_ROLES = ['ADMIN', 'PT', 'CLIENT'] as const;
export const DB_ROLES  = ['ADMIN', 'TRAINER', 'CLIENT'] as const;

// Aliases sempre em MAIÚSCULAS
const UPPER_ALIASES: Record<string, AppRole> = {
  ADMIN: 'ADMIN',
  TRAINER: 'PT',
  PT: 'PT',
  CLIENT: 'CLIENT',
  USER: 'CLIENT',
};

export function toAppRole(input: unknown): AppRole | null {
  if (input == null) return null;
  const key = String(input).trim().toUpperCase();
  return UPPER_ALIASES[key] ?? null;
}

export const normalizeRole = toAppRole;

export function assertAppRole(input: unknown, message?: string): AppRole {
  const role = toAppRole(input);
  if (role) return role;
  throw new Error(message ?? `Invalid role "${String(input)}"`);
}

export function dbRoleToAppRole(input: DbRole | string | null | undefined): AppRole | null {
  return toAppRole(input);
}

export function appRoleToDbRole(input: AppRole | string | null | undefined): DbRole | null {
  if (input == null) return null;
  const app = toAppRole(input);
  if (!app) return null;
  if (app === 'ADMIN') return 'ADMIN';
  if (app === 'CLIENT') return 'CLIENT';
  return 'TRAINER';
}

export const isAdmin   = (r: unknown) => toAppRole(r) === 'ADMIN';
export const isPT      = (r: unknown) => toAppRole(r) === 'PT';
export const isTrainer = isPT;
export const isClient  = (r: unknown) => toAppRole(r) === 'CLIENT';
