import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabaseServer';
import { getSessionUserSafe } from '@/lib/session-bridge';
import { toAppRole } from '@/lib/roles';

type PlanStatus = 'DRAFT' | 'ACTIVE' | 'ARCHIVED';

type Body = {
  title?: string;
  clientId?: string;
  status?: PlanStatus;
};

export async function POST(req: Request) {
  const session = await getSessionUserSafe();
  const user = (session as any)?.user as { id: string; role?: string } | null;
  if (!user?.id) return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });

  const role = toAppRole(user.role) ?? 'CLIENT';
  if (role !== 'PT' && role !== 'ADMIN') {
    return NextResponse.json({ ok: false, error: 'Forbidden' }, { status: 403 });
  }

  let payload: Body;
  try {
    payload = (await req.json()) as Body;
  } catch {
    return NextResponse.json({ ok: false, error: 'Invalid JSON' }, { status: 400 });
  }

  const title = (payload.title ?? '').trim();
  const status: PlanStatus = payload.status ?? 'DRAFT';
  const clientId = payload.clientId;

  if (title.length < 3) {
    return NextResponse.json({ ok: false, error: 'Título demasiado curto' }, { status: 400 });
  }

  const sb = createServerClient();

  const { data, error } = await sb
    .from('training_plans')
    .insert({
      title,
      status,
      trainer_id: user.id,
      client_id: clientId ?? null,
    })
    .select('id')
    .maybeSingle();

  if (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, id: data?.id });
}
