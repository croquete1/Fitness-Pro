import { NextResponse } from 'next/server';
import { tryCreateServerClient } from '@/lib/supabaseServer';
import { requireAdminGuard, isGuardErr } from '@/lib/api-guards';
import { logAudit, AUDIT_KINDS, AUDIT_TARGET_TYPES } from '@/lib/audit';
import { supabaseFallbackJson, supabaseUnavailableResponse } from '@/lib/supabase/responses';

type Ctx = { params: Promise<{ id: string }> };

export async function PATCH(req: Request, ctx: Ctx) {
  const { id } = await ctx.params;
  const guard = await requireAdminGuard();
  if (isGuardErr(guard)) return guard.response;
  const body = await req.json().catch(() => ({}));
  const sb = tryCreateServerClient();
  if (!sb) {
    return supabaseFallbackJson(
      { ok: false, message: 'Servidor não está configurado.' },
      { status: 503 }
    );
  }

  const upd: any = {};
  ['name','email','role','status','approved','active'].forEach(k => {
    if (k in body) upd[k] = body[k];
  });

  if (typeof upd.role === 'string') upd.role = upd.role.toUpperCase();
  if (typeof upd.status === 'string') upd.status = upd.status.toUpperCase();

  if (Object.keys(upd).length === 0) {
    return NextResponse.json({ error: 'Sem alterações.' }, { status: 400 });
  }

  const { data, error } = await sb.from('users').update(upd).eq('id', id).select('*').maybeSingle();
  if (error || !data) return NextResponse.json({ error: error?.message ?? 'Not found' }, { status: 400 });

  await logAudit(sb, {
    kind: AUDIT_KINDS.USER_UPDATE,
    target_type: AUDIT_TARGET_TYPES.USER,
    target_id: id,
    note: 'Utilizador actualizado',
    details: upd,
  });

  return NextResponse.json(data);
}

export async function DELETE(_: Request, ctx: Ctx) {
  const { id } = await ctx.params;
  const guard = await requireAdminGuard();
  if (isGuardErr(guard)) return guard.response;
  const sb = tryCreateServerClient();
  if (!sb) {
    return supabaseFallbackJson(
      { ok: false, message: 'Servidor não está configurado.' },
      { status: 503 }
    );
  }
  const { error } = await sb.from('users').delete().eq('id', id);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  await logAudit(sb, {
    kind: AUDIT_KINDS.USER_DELETE,
    target_type: AUDIT_TARGET_TYPES.USER,
    target_id: id,
    note: 'Utilizador removido',
  });

  return NextResponse.json({ ok: true });
}
