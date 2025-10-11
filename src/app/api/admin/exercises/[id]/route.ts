import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabaseServer';

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_: Request, ctx: Ctx) {
  const { id } = await ctx.params;
  const sb = createServerClient();
  const { data, error } = await sb
    .from('exercises')
    .select(
      'id,name,muscle_group,equipment,difficulty,description,video_url,is_global,is_published,published_at,owner_id,created_at,updated_at',
    )
    .eq('id', id)
    .maybeSingle();
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
    is_published: typeof body.is_published === 'boolean' ? body.is_published : undefined,
    is_global: typeof body.is_global === 'boolean' ? body.is_global : undefined,
    published_at:
      typeof body.is_published === 'boolean'
        ? body.is_published
          ? new Date().toISOString()
          : null
        : undefined,
    updated_at: new Date().toISOString(),
  };
  const clean = Object.fromEntries(Object.entries(upd).filter(([, v]) => v !== undefined));
  const { data, error } = await sb
    .from('exercises')
    .update(clean)
    .eq('id', id)
    .select(
      'id,name,muscle_group,equipment,difficulty,description,video_url,is_global,is_published,published_at,owner_id,created_at,updated_at',
    )
    .maybeSingle();
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
