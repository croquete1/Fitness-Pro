import { NextResponse } from 'next/server';
import { getSessionUserSafe } from '@/lib/session-bridge';
import { toAppRole, type AppRole, isAdmin as isAdminRole, isPT as isPTRole } from '@/lib/roles';

/** Resultado dos guards */
export type GuardOk = {
  ok: true;
  me: { id: string; role: AppRole };
};
export type GuardErr = {
  ok: false;
  /** Resposta HTTP para devolver diretamente do handler */
  response: Response;
};
export type GuardResult = GuardOk | GuardErr;

/** Type guard para facilitar uso: if (isGuardErr(guard)) return guard.response */
export const isGuardErr = (g: GuardResult): g is GuardErr => !g.ok;

/** Garante que existe um utilizador autenticado. */
export async function requireUserGuard(): Promise<GuardResult> {
  const sessionUser = await getSessionUserSafe();
  if (!sessionUser?.id) {
    return { ok: false, response: new NextResponse('Unauthorized', { status: 401 }) };
  }
  const role = toAppRole(sessionUser.role) ?? 'CLIENT';
  return { ok: true, me: { id: sessionUser.id, role } };
}

/** Apenas ADMIN. */
export async function requireAdminGuard(): Promise<GuardResult> {
  const base = await requireUserGuard();
  if (!base.ok) return base;
  if (!isAdminRole(base.me.role)) {
    return { ok: false, response: new NextResponse('Forbidden', { status: 403 }) };
  }
  return base;
}

/** PT ou ADMIN. */
export async function requirePtOrAdminGuard(): Promise<GuardResult> {
  const base = await requireUserGuard();
  if (!base.ok) return base;
  if (!(isPTRole(base.me.role) || isAdminRole(base.me.role))) {
    return { ok: false, response: new NextResponse('Forbidden', { status: 403 }) };
  }
  return base;
}

/** Apenas PT. (se precisares noutros endpoints) */
export async function requirePtGuard(): Promise<GuardResult> {
  const base = await requireUserGuard();
  if (!base.ok) return base;
  if (!isPTRole(base.me.role)) {
    return { ok: false, response: new NextResponse('Forbidden', { status: 403 }) };
  }
  return base;
}