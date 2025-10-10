import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabaseServer';
import { getSessionUserSafe } from '@/lib/session-bridge';

type SessionUser = { id?: string };
type SessionLike = { user?: SessionUser } | null;

type Body = Partial<{
  measured_at: string;
  weight_kg: number | null;
  height_cm: number | null;
  body_fat_pct: number | null;
}>;

type Ctx = { params: Promise<{ id: string }> };

export async function PUT(req: Request, ctx: Ctx) {
  const { id } = await ctx.params;
  const session = (await getSessionUserSafe()) as SessionLike;
  const user = session?.user;
  if (!user?.id) return new NextResponse('Unauthorized', { status: 401 });

  const payload = (await req.json().catch(() => null)) as Body | null;
  if (!payload) return new NextResponse('Bad request', { status: 400 });

  const sb = createServerClient();
  const { error } = await sb.from('anthropometry').update(payload).eq('id', id).eq('user_id', user.id);
  if (error) return new NextResponse(error.message, { status: 500 });
  return NextResponse.json({ ok: true });
}

export async function DELETE(_: Request, ctx: Ctx) {
  const { id } = await ctx.params;
  const session = (await getSessionUserSafe()) as SessionLike;
  const user = session?.user;
  if (!user?.id) return new NextResponse('Unauthorized', { status: 401 });

  const sb = createServerClient();
  const { error } = await sb.from('anthropometry').delete().eq('id', id).eq('user_id', user.id);
  if (error) return new NextResponse(error.message, { status: 500 });
  return NextResponse.json({ ok: true });
}
