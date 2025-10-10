import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabaseServer';

type Ctx = { params: Promise<{ id: string }> };

export const dynamic = 'force-dynamic';

export async function PATCH(req: Request, ctx: Ctx) {
  const { id } = await ctx.params;
  const sb = createServerClient();
  const b = await req.json().catch(() => ({}));
  const payload: any = {};
  if (typeof b.read === 'boolean') payload.read = b.read;

  const upd = async (t: string) => sb.from(t).update(payload).eq('id', id).select('*').maybeSingle();
  let r = await upd('notifications'); if ((r.error && r.error.code === '42P01') || (!r.data && !r.error)) r = await upd('user_notifications');
  if (r.error) return NextResponse.json({ error: r.error.message }, { status: 400 });
  if (!r.data) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json({ ok: true, row: r.data });
}

export async function DELETE(_req: Request, ctx: Ctx) {
  const { id } = await ctx.params;
  const sb = createServerClient();
  const del = async (t: string) => sb.from(t).delete().eq('id', id);
  let r = await del('notifications'); if (r.error?.code === '42P01') r = await del('user_notifications');
  if (r.error) return NextResponse.json({ error: r.error.message }, { status: 400 });
  return NextResponse.json({ ok: true });
}
