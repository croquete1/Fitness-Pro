// src/app/api/admin/users/[id]/role/route.ts
import { NextResponse } from 'next/server';
import { tryCreateServerClient } from '@/lib/supabaseServer';
import { toAppRole, appRoleToDbRole } from '@/lib/roles';
import { touchUsers } from '@/lib/revalidate';
import { logAudit, AUDIT_KINDS, AUDIT_TARGET_TYPES } from '@/lib/audit';
import { supabaseUnavailableResponse } from '@/lib/supabase/responses';
import { requireAdminGuard, isGuardErr } from '@/lib/api-guards';

type Ctx = { params: Promise<{ id: string }> };

export async function PATCH(req: Request, ctx: Ctx) {
  const { id } = await ctx.params;
  if (!id) return NextResponse.json({ ok: false, error: 'MISSING_ID' }, { status: 400 });

  const guard = await requireAdminGuard();
  if (isGuardErr(guard)) return guard.response;

  const sb = tryCreateServerClient();
  if (!sb) {
    return supabaseUnavailableResponse();
  }

  // novo role (apenas CLIENT ou PT)
  let body: any;
  try { body = await req.json(); } catch { return NextResponse.json({ ok: false, error: 'INVALID_JSON' }, { status: 400 }); }
  const nextAppRole = toAppRole(body?.role);
  if (!nextAppRole || (nextAppRole !== 'CLIENT' && nextAppRole !== 'PT')) {
    return NextResponse.json({ ok: false, error: 'ROLE_NOT_ALLOWED' }, { status: 400 });
  }

  // não permitir des/promover ADMIN por aqui
  const { data: targetUser } =
    await sb.from('users').select('role').eq('id', id).maybeSingle();
  const currentAppRole = toAppRole(targetUser?.role) ?? null;
  if (currentAppRole === 'ADMIN') {
    return NextResponse.json({ ok: false, error: 'ADMIN_LOCKED' }, { status: 409 });
  }

  // gravar em users
  const dbRole = appRoleToDbRole(nextAppRole) ?? 'TRAINER';
  const { error } = await sb.from('users').update({ role: dbRole }).eq('id', id);
  if (error) {
    const code = typeof error === 'object' && error && 'code' in error ? (error as any).code : 'unknown';
    console.warn('[admin/users] role update failed', { code });
    return NextResponse.json({ ok: false, error: 'REQUEST_FAILED' }, { status: 400 });
  }

  await logAudit(sb, {
    kind: AUDIT_KINDS.USER_UPDATE,
    target_type: AUDIT_TARGET_TYPES.USER,
    target_id: id,
    actor_id: guard.me.id,
    note: `Role alterado para ${nextAppRole}`,
  });

  void touchUsers();

  return NextResponse.json({ ok: true, id, role: nextAppRole });
}

export async function POST(req: Request, ctx: Ctx) {
  return PATCH(req, ctx);
}
