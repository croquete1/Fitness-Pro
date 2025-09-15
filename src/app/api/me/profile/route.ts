import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabaseServer';
import { getSessionUserSafe } from '@/lib/session-bridge';

type SessionUser = { id?: string };
type SessionLike = { user?: SessionUser } | null;

type Body = {
  name?: string | null;
  phone?: string | null;
  birth_date?: string | null; // yyyy-mm-dd
};

export async function PUT(req: Request) {
  const session = (await getSessionUserSafe()) as SessionLike;
  const user = session?.user;
  if (!user?.id) return new NextResponse('Unauthorized', { status: 401 });

  const payload = (await req.json().catch(() => null)) as Body | null;
  if (!payload) return new NextResponse('Bad request', { status: 400 });

  const sb = createServerClient();
  const update = {
    name: payload.name ?? undefined,
    phone: payload.phone ?? undefined,
    birth_date: payload.birth_date ?? undefined,
  };

  const { data, error } = await sb.from('profiles').upsert({ id: user.id, ...update }).select('id').maybeSingle();
  if (error) return new NextResponse(error.message, { status: 500 });
  return NextResponse.json({ ok: true, id: data?.id ?? user.id });
}
