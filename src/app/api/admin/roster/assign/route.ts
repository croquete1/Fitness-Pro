import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabaseServer';
import { requireAdminGuard, isGuardErr } from '@/lib/api-guards';

type Body = { trainerId: string; clientId: string };

async function readBody<T>(req: Request): Promise<T> {
  return (await req.json().catch(() => ({}))) as T;
}

export async function POST(req: Request): Promise<Response> {
  const guard = await requireAdminGuard();
  if (isGuardErr(guard)) return guard.response;

  const sb = createServerClient();
  const body = await readBody<Body>(req);

  if (!body?.trainerId || !body?.clientId) {
    return new NextResponse('Bad Request', { status: 400 });
  }

  const { error } = await sb
    .from('trainer_clients')
    .upsert({ trainer_id: body.trainerId, client_id: body.clientId });

  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
