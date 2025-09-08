// src/lib/authz.ts
import type { AppRole } from './roles';

type RoleLike = AppRole | string | null | undefined;
const norm = (r: RoleLike) => (typeof r === 'string' ? r.toUpperCase() : (r as string) ?? '');

export const isAdmin   = (r: RoleLike) => ['ADMIN', 'ADM', 'ADMINISTRATOR'].includes(norm(r));
export const isTrainer = (r: RoleLike) => ['PT', 'TRAINER', 'TREINADOR'].includes(norm(r));

/** Permissão para gerir exercícios: Admin e PT */
export function canManageExercises(role: RoleLike): boolean {
  return isAdmin(role) || isTrainer(role);
}
