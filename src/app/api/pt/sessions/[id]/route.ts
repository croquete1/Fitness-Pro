import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabaseServer';

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, ctx: Ctx) {
  const { id } = await ctx.params;
  const sb = createServerClient();
  const { data, error } = await sb.from('sessions').select('*').eq('id', id).single();
  if (error || !data) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json({ item: data });
}

export async function PATCH(req: NextRequest, ctx: Ctx) {
  const { id } = await ctx.params;
  const sb = createServerClient();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Auth' }, { status: 401 });

  const b = await req.json().catch(()=>({}));
  const upd: any = {};
  if ('title' in b) upd.title = b.title ? String(b.title) : null;
  if ('kind' in b) upd.kind = b.kind ? String(b.kind) : null;
  if ('start_at' in b) upd.start_at = b.start_at ? new Date(b.start_at).toISOString() : null;
  if ('end_at' in b) upd.end_at = b.end_at ? new Date(b.end_at).toISOString() : null;
  if ('client_id' in b) upd.client_id = b.client_id || null;
  if ('exercises' in b) upd.exercises = Array.isArray(b.exercises) ? b.exercises : null;

  const { error } = await sb.from('sessions').update(upd).eq('id', id).eq('trainer_id', user.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ ok: true });
}

export async function DELETE(_req: NextRequest, ctx: Ctx) {
  const { id } = await ctx.params;
  const sb = createServerClient();
  const { error } = await sb.from('sessions').delete().eq('id', id);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ ok: true });
}
