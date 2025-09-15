import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabaseServer';
import { getSessionUserSafe } from '@/lib/session-bridge';
import { toAppRole } from '@/lib/roles';

type SessionUser = { id?: string; role?: string | null };
type SessionLike = { user?: SessionUser } | null;

export async function POST(_: Request, { params }: { params: { id: string } }) {
  const session = (await getSessionUserSafe()) as SessionLike;
  const me = session?.user;
  if (!me?.id) return new NextResponse('Unauthorized', { status: 401 });
  const role = toAppRole(me.role) ?? 'CLIENT';
  if (role !== 'ADMIN') return new NextResponse('Forbidden', { status: 403 });

  const sb = createServerClient();
  const { data, error } = await sb.from('exercises').update({ published: false }).eq('id', params.id).select('id, published').maybeSingle();
  if (error) return new NextResponse(error.message, { status: 500 });
  if (!data) return new NextResponse('Not found', { status: 404 });
  return NextResponse.json({ ok: true, ...data });
}
