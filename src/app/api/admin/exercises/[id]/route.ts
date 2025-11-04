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

const CASCADE_TABLES: Array<{ table: string; columns: string[] }> = [
  { table: 'plan_exercises', columns: ['exercise_id', 'ex_id'] },
  { table: 'program_exercises', columns: ['exercise_id', 'ex_id'] },
  { table: 'training_plan_exercises', columns: ['exercise_id', 'ex_id'] },
  { table: 'session_exercises', columns: ['exercise_id'] },
  { table: 'exercise_notes', columns: ['exercise_id'] },
  { table: 'exercise_logs', columns: ['exercise_id'] },
];

function isMissingTable(error: { code?: string | null } | null): boolean {
  if (!error?.code) return false;
  return error.code === '42P01' || error.code === 'PGRST205';
}

function isMissingColumn(error: { code?: string | null } | null): boolean {
  if (!error?.code) return false;
  return error.code === '42703' || error.code === 'PGRST204';
}

export async function DELETE(_: Request, ctx: Ctx) {
  const { id } = await ctx.params;
  const sb = createServerClient();

  for (const target of CASCADE_TABLES) {
    let cleared = false;
    for (const column of target.columns) {
      const { error } = await sb.from(target.table).delete().eq(column, id);
      if (!error) {
        cleared = true;
        break;
      }

      if (isMissingTable(error)) {
        cleared = true;
        break;
      }

      if (isMissingColumn(error)) {
        continue;
      }

      console.warn(`[admin/exercises] falha ao limpar dependências`, {
        table: target.table,
        column,
        error,
      });
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    if (!cleared) {
      console.warn(`[admin/exercises] tabela ${target.table} não pôde ser limpa`);
    }
  }

  const { error } = await sb.from('exercises').delete().eq('id', id);
  if (error) {
    console.error('[admin/exercises] falha ao remover exercício', error);
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}
