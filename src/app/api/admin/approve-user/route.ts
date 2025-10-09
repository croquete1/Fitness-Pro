import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabaseServer';
import { requireAdminGuard, isGuardErr } from '@/lib/api-guards';
import { logAudit, AUDIT_KINDS, AUDIT_TARGET_TYPES } from '@/lib/audit';
import { touchUsers } from '@/lib/revalidate';

type Body = {
  userId?: string;
  email?: string;
  approve?: boolean;
  role?: 'CLIENT' | 'TRAINER' | 'ADMIN';
};

export async function POST(req: Request) {
  const guard = await requireAdminGuard();
  if (isGuardErr(guard)) return guard.response;

  const payload = (await req.json().catch(() => null)) as Body | null;
  if (!payload) return NextResponse.json({ error: 'Invalid body' }, { status: 400 });

  const approve = payload.approve ?? true;
  const wantedRole = payload.role ?? 'CLIENT';
  const targetRaw = (payload.userId || payload.email || '').toString().trim();
  if (!targetRaw) return NextResponse.json({ error: 'Missing user identifier' }, { status: 400 });

  const sb = createServerClient();

  let user: any = null;
  if (payload.userId) {
    const { data } = await sb.from('users').select('*').eq('id', payload.userId).maybeSingle();
    user = data ?? null;
  }

  if (!user && payload.email) {
    const { data } = await sb.from('users').select('*').ilike('email', payload.email).maybeSingle();
    user = data ?? null;
  }

  if (!user && targetRaw.includes('@')) {
    const { data } = await sb.from('users').select('*').ilike('email', targetRaw).maybeSingle();
    user = data ?? null;
  }

  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  if (!approve) {
    await logAudit(sb, {
      kind: AUDIT_KINDS.USER_UPDATE,
      target_type: AUDIT_TARGET_TYPES.USER,
      target_id: user.id,
      note: 'Solicitação rejeitada',
    });
    return NextResponse.json({ ok: true, rejected: true });
  }

  const patch: Record<string, any> = {
    status: 'ACTIVE',
    approved: true,
  };
  if (wantedRole === 'TRAINER') patch.role = 'TRAINER';
  if (wantedRole === 'CLIENT') patch.role = 'CLIENT';
  if (wantedRole === 'ADMIN') patch.role = 'ADMIN';

  const { error } = await sb.from('users').update(patch).eq('id', user.id);
  if (error) {
    return NextResponse.json({ error: 'Falha ao aprovar utilizador.' }, { status: 500 });
  }

  await logAudit(sb, {
    kind: AUDIT_KINDS.USER_APPROVE,
    target_type: AUDIT_TARGET_TYPES.USER,
    target_id: user.id,
    note: `Aprovado como ${patch.role ?? user.role ?? 'CLIENT'}`,
  });

  void touchUsers();

  return NextResponse.json({ ok: true });
}
