import { NextResponse } from 'next/server';
import { getSessionUserSafe } from '@/lib/session-bridge';
import { createServerClient } from '@/lib/supabaseServer';
import { toAppRole, isAdmin, isPT } from '@/lib/roles';

export async function POST(req: Request) {
  const s = await getSessionUserSafe();
  if (!s?.user?.id) return NextResponse.json({ ok: false }, { status: 401 });
  const role = toAppRole(s.user.role) ?? 'CLIENT';
  if (!(isPT(role) || isAdmin(role))) return NextResponse.json({ ok: false }, { status: 403 });

  const body = await req.json();
  const id = body.id as string | undefined;
  const clientId = typeof body.client_id === 'string' && body.client_id.trim() ? body.client_id.trim() : null;
  const payload = {
    name: String(body.name ?? '').slice(0, 200),
    client_id: clientId,
    trainer_id: s.user.id,
    status: (body.status as string) ?? 'draft',
    updated_at: new Date().toISOString(),
  };

  const sb = createServerClient();
  let res;
  if (id) {
    res = await sb.from('training_plans').update(payload).eq('id', id).eq('trainer_id', s.user.id).select('id').maybeSingle();
  } else {
    res = await sb.from('training_plans').insert({ ...payload, created_at: new Date().toISOString() }).select('id').maybeSingle();
  }
  if ((res as any)?.error) return NextResponse.json({ ok: false, error: (res as any).error.message }, { status: 500 });

  return NextResponse.json({ ok: true, id: (res as any)?.data?.id ?? id });
}
