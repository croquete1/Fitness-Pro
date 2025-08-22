// src/lib/roles.ts

/** Papel canónico usado na app (igual ao enum da BD/Prisma) */
export type AppRole = 'ADMIN' | 'TRAINER' | 'CLIENT';

/** Entradas possíveis vindas de sessão/clients (minúsculas, PT, etc) */
export type SessionRole =
  | 'admin' | 'pt' | 'client'
  | 'ADMIN' | 'TRAINER' | 'CLIENT'
  | string | undefined | null;

/**
 * Normaliza qualquer valor de role para o formato canónico da app.
 * - 'admin'  -> 'ADMIN'
 * - 'pt'     -> 'TRAINER'
 * - 'trainer'-> 'TRAINER'
 * - 'client' -> 'CLIENT'
 * - undefined/null/qualquer outro -> 'CLIENT'
 */
export function toAppRole(input: SessionRole): AppRole {
  if (!input) return 'CLIENT';
  const v = String(input).trim().toUpperCase();
  if (v === 'ADMIN') return 'ADMIN';
  if (v === 'TRAINER' || v === 'PT') return 'TRAINER';
  return 'CLIENT';
}

/** Helpers convenientes */
export const isAdmin   = (r?: SessionRole) => toAppRole(r) === 'ADMIN';
export const isTrainer = (r?: SessionRole) => toAppRole(r) === 'TRAINER';
export const isClient  = (r?: SessionRole) => toAppRole(r) === 'CLIENT';

/** Extrai e normaliza a role a partir de um objecto qualquer (ex.: session.user) */
export function ensureRole(obj: any): AppRole {
  return toAppRole(obj?.role);
}
