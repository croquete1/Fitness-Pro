import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabaseServer';
import { requireAdminGuard, isGuardErr } from '@/lib/api-guards';
import { logAudit, AUDIT_KINDS, AUDIT_TARGET_TYPES } from '@/lib/audit';
import { touchUsers } from '@/lib/revalidate';

type Body = {
  id: string;
  approve?: boolean;
  role?: 'ADMIN' | 'TRAINER' | 'CLIENT' | 'PT';
  status?: string;
};

export async function POST(req: Request) {
  const guard = await requireAdminGuard();
  if (isGuardErr(guard)) return guard.response;

  let body: Body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: 'INVALID_JSON' }, { status: 400 });
  }

  if (!body?.id) {
    return NextResponse.json({ ok: false, error: 'MISSING_ID' }, { status: 400 });
  }

  const sb = createServerClient();
  const { data: target } = await sb.from('users').select('id, role, status, approved').eq('id', body.id).maybeSingle();
  if (!target) {
    return NextResponse.json({ ok: false, error: 'NOT_FOUND' }, { status: 404 });
  }

  const approve = body.approve ?? true;
  const patch: Record<string, any> = {};
  if (typeof approve === 'boolean') {
    patch.approved = approve;
    if (approve) patch.status = body.status ?? 'ACTIVE';
    else if (body.status) patch.status = body.status;
  }

  const targetRole = body.role ? (body.role === 'PT' ? 'TRAINER' : body.role) : undefined;
  if (targetRole) patch.role = targetRole;

  if (!Object.keys(patch).length) {
    return NextResponse.json({ ok: true, id: body.id, updated: false, patch: {} });
  }

  const { error } = await sb.from('users').update(patch).eq('id', body.id);
  if (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 400 });
  }

  await logAudit(sb, {
    kind: approve ? AUDIT_KINDS.USER_APPROVE : AUDIT_KINDS.USER_UPDATE,
    target_type: AUDIT_TARGET_TYPES.USER,
    target_id: body.id,
    note: approve
      ? `Aprovação manual (${patch.role ?? target.role ?? 'CLIENT'})`
      : 'Aprovação revertida',
    details: patch,
  });

  void touchUsers();

  return NextResponse.json({ ok: true, id: body.id, updated: true, patch });
}
