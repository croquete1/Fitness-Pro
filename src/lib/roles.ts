// src/lib/roles.ts

// Papéis tal como usados na App (UI) e na BD
export type DbRole = 'ADMIN' | 'TRAINER' | 'CLIENT';
export type AppRole = 'ADMIN' | 'PT' | 'CLIENT';

export const APP_ROLES = ['ADMIN', 'PT', 'CLIENT'] as const;
export const DB_ROLES  = ['ADMIN', 'TRAINER', 'CLIENT'] as const;

// Aliases (sempre em MAIÚSCULAS) → role canónica da App
// Mantém compatibilidade com dados antigos/fuentes externas.
const UPPER_ALIASES: Record<string, AppRole> = {
  // Admin
  ADMIN: 'ADMIN',
  // Trainer/PT
  TRAINER: 'PT',
  PT: 'PT',
  // Client
  CLIENT: 'CLIENT',
  USER: 'CLIENT', // compat com seeds/providers que usam "USER"
};

/**
 * Normaliza para AppRole ('TRAINER' → 'PT', 'USER' → 'CLIENT', etc.).
 * @returns AppRole ou null se não reconhecido
 */
export function toAppRole(input: unknown): AppRole | null {
  if (input == null) return null;
  const key = String(input).trim().toUpperCase();
  return UPPER_ALIASES[key] ?? null;
}

// Compat com código antigo
export const normalizeRole = toAppRole;

/**
 * Versão "estrita": devolve o AppRole ou lança erro se inválido.
 * Útil em camadas públicas (API routes, server actions) para falhar cedo.
 */
export function assertAppRole(input: unknown, message?: string): AppRole {
  const role = toAppRole(input);
  if (role) return role;
  throw new Error(message ?? `Invalid role "${String(input)}"`);
}

/**
 * Conversão DB → App
 */
export function dbRoleToAppRole(input: DbRole | string | null | undefined): AppRole | null {
  return toAppRole(input);
}

/**
 * Conversão App → DB
 * 'PT' na App corresponde a 'TRAINER' na BD.
 */
export function appRoleToDbRole(input: AppRole | string | null | undefined): DbRole | null {
  if (input == null) return null;
  const app = toAppRole(input);
  if (!app) return null;
  if (app === 'ADMIN') return 'ADMIN';
  if (app === 'CLIENT') return 'CLIENT';
  return 'TRAINER'; // app 'PT'
}

// Type helpers
export const isAdmin   = (r: unknown) => toAppRole(r) === 'ADMIN';
export const isPT      = (r: unknown) => toAppRole(r) === 'PT';
export const isTrainer = isPT; // alias para compatibilidade
export const isClient  = (r: unknown) => toAppRole(r) === 'CLIENT';
