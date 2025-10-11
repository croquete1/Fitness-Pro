import { NextResponse } from 'next/server';
import { getSessionUserSafe } from '@/lib/session-bridge';
import { toAppRole } from '@/lib/roles';
import { createServerClient } from '@/lib/supabaseServer';
import { ExerciseFormSchema } from '@/lib/exercises/schema';

type Ctx = { params: Promise<{ id: string }> };

export async function PATCH(req: Request, ctx: Ctx) {
  const session = await getSessionUserSafe();
  const me = session?.user;
  if (!me?.id) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  const role = toAppRole(me.role) ?? 'CLIENT';
  if (role !== 'PT' && role !== 'ADMIN') return NextResponse.json({ error: 'forbidden' }, { status: 403 });

  const { id } = await ctx.params;
  const body = await req.json().catch(() => ({}));

  const parsed = ExerciseFormSchema.partial({
    name: true,
    muscle_group: true,
    equipment: true,
    difficulty: true,
    description: true,
    video_url: true,
  }).safeParse(body ?? {});

  if (!parsed.success) {
    const msg = parsed.error.issues[0]?.message ?? 'Dados inválidos';
    return NextResponse.json({ error: msg }, { status: 400 });
  }

  const sb = createServerClient();
  const { data: existing, error: fetchErr } = await sb
    .from('exercises')
    .select('id, owner_id, is_global')
    .eq('id', id)
    .maybeSingle();

  if (fetchErr) return NextResponse.json({ error: fetchErr.message }, { status: 400 });
  if (!existing) return NextResponse.json({ error: 'not_found' }, { status: 404 });
  if (existing.owner_id !== me.id && role !== 'ADMIN') {
    return NextResponse.json({ error: 'forbidden' }, { status: 403 });
  }
  if (existing.is_global && role !== 'ADMIN') {
    return NextResponse.json({ error: 'catálogo global não pode ser editado aqui' }, { status: 403 });
  }

  const payload = parsed.data;
  const update = {
    ...(payload.name !== undefined ? { name: payload.name } : {}),
    ...(payload.muscle_group !== undefined ? { muscle_group: payload.muscle_group ?? null } : {}),
    ...(payload.equipment !== undefined ? { equipment: payload.equipment ?? null } : {}),
    ...(payload.difficulty !== undefined ? { difficulty: payload.difficulty ?? null } : {}),
    ...(payload.description !== undefined ? { description: payload.description ?? null } : {}),
    ...(payload.video_url !== undefined ? { video_url: payload.video_url ?? null } : {}),
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await sb
    .from('exercises')
    .update(update)
    .eq('id', id)
    .select('id,name,muscle_group,equipment,difficulty,description,video_url,is_global,is_published,owner_id,updated_at')
    .maybeSingle();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json(data);
}

export async function DELETE(_req: Request, ctx: Ctx) {
  const session = await getSessionUserSafe();
  const me = session?.user;
  if (!me?.id) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  const role = toAppRole(me.role) ?? 'CLIENT';
  if (role !== 'PT' && role !== 'ADMIN') return NextResponse.json({ error: 'forbidden' }, { status: 403 });

  const { id } = await ctx.params;
  const sb = createServerClient();

  const { data: existing, error: fetchErr } = await sb
    .from('exercises')
    .select('id, owner_id, is_global')
    .eq('id', id)
    .maybeSingle();

  if (fetchErr) return NextResponse.json({ error: fetchErr.message }, { status: 400 });
  if (!existing) return NextResponse.json({ error: 'not_found' }, { status: 404 });
  if (existing.owner_id !== me.id && role !== 'ADMIN') {
    return NextResponse.json({ error: 'forbidden' }, { status: 403 });
  }
  if (existing.is_global && role !== 'ADMIN') {
    return NextResponse.json({ error: 'catálogo global não pode ser removido aqui' }, { status: 403 });
  }

  const { error } = await sb.from('exercises').delete().eq('id', id);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ ok: true });
}
