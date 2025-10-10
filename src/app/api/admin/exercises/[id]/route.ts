import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabaseServer';

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_: Request, ctx: Ctx) {
  const { id } = await ctx.params;
  const sb = createServerClient();
  const { data, error } = await sb.from('exercises').select('*').eq('id', id).maybeSingle();
  if (error || !data) return NextResponse.json({ error: error?.message ?? 'Not found' }, { status: 404 });
  return NextResponse.json(data);
}

export async function PATCH(req: Request, ctx: Ctx) {
  const { id } = await ctx.params;
  const sb = createServerClient();
  const body = await req.json().catch(() => ({}));
  const upd = {
    name: body.name,
    muscle_group: body.muscle_group ?? null,
    equipment: body.equipment ?? null,
    difficulty: body.difficulty ?? null,
    description: body.description ?? null,
    video_url: body.video_url ?? null,
  };
  const { data, error } = await sb.from('exercises').update(upd).eq('id', id).select('*').maybeSingle();
  if (error || !data) return NextResponse.json({ error: error?.message ?? 'Not found' }, { status: 400 });
  return NextResponse.json(data);
}

export async function DELETE(_: Request, ctx: Ctx) {
  const { id } = await ctx.params;
  const sb = createServerClient();
  const { error } = await sb.from('exercises').delete().eq('id', id);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ ok: true });
}
