// src/lib/api-guards.ts
import { NextResponse } from 'next/server';
import { getSessionUserSafe } from '@/lib/session-bridge';
import { toAppRole, type AppRole } from '@/lib/roles';

export type GuardOk = {
  ok: true;
  me: { id: string; role: AppRole };
};

export type GuardErr = {
  ok: false;
  /** Resposta de erro (mantemos ambos para retrocompatibilidade) */
  response: Response;
  res: Response;
  code: 'UNAUTHORIZED' | 'FORBIDDEN';
};

export type GuardResult = GuardOk | GuardErr;

export function isGuardErr(g: GuardResult): g is GuardErr {
  return !g.ok;
}

function isAdmin(role: AppRole) {
  return role === 'ADMIN';
}
function isPT(role: AppRole) {
  return role === 'PT' || role === 'TRAINER';
}

export async function requireUserGuard(): Promise<GuardResult> {
  const u = await getSessionUserSafe().catch(() => null);
  if (!u?.id) {
    const r = new NextResponse('Unauthorized', { status: 401 });
    return { ok: false, response: r, res: r, code: 'UNAUTHORIZED' };
  }
  const role = toAppRole((u as any).role) ?? 'CLIENT';
  return { ok: true, me: { id: String(u.id), role } };
}

export async function requireAdminGuard(): Promise<GuardResult> {
  const base = await requireUserGuard();
  if (!base.ok) return base;
  if (!isAdmin(base.me.role)) {
    const r = new NextResponse('Forbidden', { status: 403 });
    return { ok: false, response: r, res: r, code: 'FORBIDDEN' };
  }
  return base;
}

export async function requirePtOrAdminGuard(): Promise<GuardResult> {
  const base = await requireUserGuard();
  if (!base.ok) return base;
  if (isAdmin(base.me.role) || isPT(base.me.role)) return base;
  const r = new NextResponse('Forbidden', { status: 403 });
  return { ok: false, response: r, res: r, code: 'FORBIDDEN' };
}
