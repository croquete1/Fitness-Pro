import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabaseServer';
import { getSessionUserSafe } from '@/lib/session-bridge';
import { toAppRole } from '@/lib/roles';

type SessionUser = { id?: string; role?: string | null };
type SessionLike = { user?: SessionUser } | null;

export async function GET() {
  const session = (await getSessionUserSafe()) as SessionLike;
  const me = session?.user;
  if (!me?.id) return new NextResponse('Unauthorized', { status: 401 });
  if ((toAppRole(me.role) ?? 'CLIENT') !== 'ADMIN') return new NextResponse('Forbidden', { status: 403 });

  const sb = createServerClient();
  const { data, error } = await sb
    .from('trainer_clients')
    .select('id, trainer_id, client_id, created_at')
    .order('created_at', { ascending: false });
  if (error) return new NextResponse(error.message, { status: 500 });
  return NextResponse.json(data ?? []);
}

export async function POST(req: Request) {
  const session = (await getSessionUserSafe()) as SessionLike;
  const me = session?.user;
  if (!me?.id) return new NextResponse('Unauthorized', { status: 401 });
  if ((toAppRole(me.role) ?? 'CLIENT') !== 'ADMIN') return new NextResponse('Forbidden', { status: 403 });

  const payload = await req.json().catch(() => null) as { trainer_id?: string; client_id?: string } | null;
  if (!payload?.trainer_id || !payload?.client_id) return new NextResponse('Bad request', { status: 400 });

  const sb = createServerClient();
  const { error } = await sb.from('trainer_clients').insert({
    trainer_id: payload.trainer_id,
    client_id: payload.client_id,
  });
  if (error) return new NextResponse(error.message, { status: 500 });
  return NextResponse.json({ ok: true });
}
