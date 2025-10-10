import { NextResponse } from 'next/server';
import { tryCreateServerClient } from '@/lib/supabaseServer';
import { requireAdminGuard, isGuardErr } from '@/lib/api-guards';
import { logAudit, AUDIT_KINDS, AUDIT_TARGET_TYPES } from '@/lib/audit';
import { supabaseFallbackJson, supabaseUnavailableResponse } from '@/lib/supabase/responses';

type AllowedStatus = 'ACTIVE' | 'SUSPENDED' | 'PENDING';
type IncomingStatus = AllowedStatus | 'DISABLED';

type Ctx = { params: Promise<{ id: string }> };

async function updateStatus(req: Request, ctx: Ctx) {
  const { id } = await ctx.params;
  const guard = await requireAdminGuard();
  if (isGuardErr(guard)) return guard.response;

  const { status } = (await req.json().catch(() => ({}))) as { status?: string };
  if (typeof status !== 'string') {
    return NextResponse.json({ error: 'Estado obrigatório.' }, { status: 400 });
  }

  const normalized = status.toUpperCase() as IncomingStatus;
  const allowed: IncomingStatus[] = ['ACTIVE', 'SUSPENDED', 'PENDING', 'DISABLED'];
  if (!allowed.includes(normalized)) {
    return NextResponse.json({ error: 'Estado inválido.' }, { status: 400 });
  }

  const sb = tryCreateServerClient();
  if (!sb) {
    return supabaseFallbackJson(
      { ok: false, error: 'SUPABASE_UNCONFIGURED' },
      { status: 503 }
    );
  }
  const finalStatus: AllowedStatus = normalized === 'DISABLED' ? 'SUSPENDED' : normalized;
  const approved = finalStatus === 'ACTIVE' ? true : finalStatus === 'PENDING' ? null : false;
  const { error } = await sb
    .from('users')
    .update({ status: finalStatus, approved })
    .eq('id', id);

  if (error) {
    const code = typeof error === 'object' && error && 'code' in error ? (error as any).code : 'unknown';
    console.warn('[admin/users] status update failed', { code });
    return NextResponse.json({ error: 'REQUEST_FAILED' }, { status: 400 });
  }

  await logAudit(sb, {
    kind: finalStatus === 'ACTIVE'
    ? AUDIT_KINDS.USER_APPROVE
    : finalStatus === 'SUSPENDED'
      ? AUDIT_KINDS.USER_SUSPEND
      : AUDIT_KINDS.USER_UPDATE,
    target_type: AUDIT_TARGET_TYPES.USER,
    target_id: id,
    note: `Estado alterado para ${finalStatus}`,
  });

  return NextResponse.json({ ok: true });
}

export async function POST(req: Request, ctx: Ctx) {
  return updateStatus(req, ctx);
}

export async function PATCH(req: Request, ctx: Ctx) {
  return updateStatus(req, ctx);
}
