// src/lib/guards.ts
import { NextResponse } from 'next/server';
import { getSessionUserSafe } from '@/lib/session-bridge';
import { toAppRole, type AppRole } from '@/lib/roles';

export type GuardOk = { ok: true; me: { id: string; role: AppRole | null } };
export type GuardErr = { ok: false; response: Response };
export type GuardResult = GuardOk | GuardErr;

export const isGuardErr = (g: GuardResult): g is GuardErr => !g.ok;

/** Apenas autenticado (qualquer role) */
export async function requireUserGuard(): Promise<GuardResult> {
  const me = await getSessionUserSafe();
  if (!me?.id) {
    return { ok: false, response: new NextResponse('Unauthorized', { status: 401 }) };
  }
  return { ok: true, me: { id: me.id, role: toAppRole(me.role) } };
}

/** Admin */
export async function requireAdminGuard(): Promise<GuardResult> {
  const res = await requireUserGuard();
  if (!res.ok) return res;
  const role = toAppRole(res.me.role);
  if (role !== 'ADMIN') {
    return { ok: false, response: new NextResponse('Forbidden', { status: 403 }) };
  }
  return { ok: true, me: { id: res.me.id, role } };
}

/** PT ou Admin (alias para compatibilidade com código existente) */
export async function requirePtOrAdminGuard(): Promise<GuardResult> {
  const res = await requireUserGuard();
  if (!res.ok) return res;
  const role = toAppRole(res.me.role);
  if (role !== 'PT' && role !== 'ADMIN') {
    return { ok: false, response: new NextResponse('Forbidden', { status: 403 }) };
  }
  return { ok: true, me: { id: res.me.id, role } };
}

/* ======== Legado (se algum módulo antigo ainda usar) ======== */

/** Versão que "atira" erro — não recomendado, mas evita crashes silenciosos em código legado */
export async function requireAdmin(): Promise<void> {
  const me = await getSessionUserSafe();
  const role = toAppRole(me?.role);
  if (!me?.id) throw new Error('UNAUTHORIZED');
  if (role !== 'ADMIN') throw new Error('FORBIDDEN');
}