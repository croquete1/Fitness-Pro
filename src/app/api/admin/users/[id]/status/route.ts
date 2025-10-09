import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabaseServer';
import { requireAdminGuard, isGuardErr } from '@/lib/api-guards';

type AllowedStatus = 'ACTIVE' | 'SUSPENDED' | 'PENDING';
type IncomingStatus = AllowedStatus | 'DISABLED';

async function updateStatus(req: Request, { params }: { params: { id: string } }) {
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

  const sb = createServerClient();
  const finalStatus: AllowedStatus = normalized === 'DISABLED' ? 'SUSPENDED' : normalized;
  const approved = finalStatus === 'ACTIVE' ? true : finalStatus === 'PENDING' ? null : false;
  const { error } = await sb
    .from('users')
    .update({ status: finalStatus, approved })
    .eq('id', params.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}

export async function POST(req: Request, ctx: { params: { id: string } }) {
  return updateStatus(req, ctx);
}

export async function PATCH(req: Request, ctx: { params: { id: string } }) {
  return updateStatus(req, ctx);
}
