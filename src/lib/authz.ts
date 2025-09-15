// src/lib/authz.ts
import { getSessionUserSafe } from '@/lib/session-bridge';
import { toAppRole } from '@/lib/roles';

type SessionShape = {
  user?: {
    id?: string;
    role?: string | null;
    email?: string | null;
    name?: string | null;
  } | null;
};

export type SessionUser = {
  id: string;
  role: string | null;
  email?: string | null;
  name?: string | null;
};

export function isAdmin(u?: { role?: string | null }): boolean {
  return (toAppRole(u?.role) ?? 'CLIENT') === 'ADMIN';
}
export function isPT(u?: { role?: string | null }): boolean {
  return (toAppRole(u?.role) ?? 'CLIENT') === 'PT';
}
export function isClient(u?: { role?: string | null }): boolean {
  return (toAppRole(u?.role) ?? 'CLIENT') === 'CLIENT';
}

/** Apenas ADMIN pode gerir o catálogo (ajusta se quiseres permitir PT). */
export function canManageExercises(userOrRole: { role?: string | null } | string | null | undefined): boolean {
  const role = typeof userOrRole === 'string' ? userOrRole : userOrRole?.role;
  return (toAppRole(role) ?? 'CLIENT') === 'ADMIN';
}

/** Requer utilizador autenticado. Lança erro com status 401 se não existir. */
export async function requireUser(): Promise<SessionUser> {
  const session = (await getSessionUserSafe()) as SessionShape;
  const u = session?.user;
  if (!u?.id) {
    const err = new Error('UNAUTHORIZED');
    (err as unknown as { status?: number }).status = 401;
    throw err;
  }
  return { id: String(u.id), role: u.role ?? null, email: u.email ?? null, name: u.name ?? null };
}

/** Requer ADMIN. Lança erro 403 se não for. */
export async function requireAdmin(): Promise<SessionUser> {
  const u = await requireUser();
  if (!isAdmin(u)) {
    const err = new Error('FORBIDDEN');
    (err as unknown as { status?: number }).status = 403;
    throw err;
  }
  return u;
}

/** Requer PT ou ADMIN. */
export async function requirePtOrAdmin(): Promise<SessionUser> {
  const u = await requireUser();
  if (!(isPT(u) || isAdmin(u))) {
    const err = new Error('FORBIDDEN');
    (err as unknown as { status?: number }).status = 403;
    throw err;
  }
  return u;
}
