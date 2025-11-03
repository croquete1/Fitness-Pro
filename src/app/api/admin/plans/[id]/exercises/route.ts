import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabaseServer';
import { requireAdminGuard, isGuardErr } from '@/lib/api-guards';

type Ctx = { params: Promise<{ id: string }> };

export const dynamic = 'force-dynamic';

function pick<T extends Record<string, any>>(row: T, keys: string[]) {
  for (const k of keys) if (row[k] != null) return row[k];
  return null;
}

// GET: listar exercícios do plano
export async function GET(_req: Request, ctx: Ctx) {
  const guard = await requireAdminGuard();
  if (isGuardErr(guard)) return guard.response;

  const { id: planId } = await ctx.params;
  const sb = createServerClient();

  // lê pivot
  let pvt = await sb.from('plan_exercises').select('*').eq('plan_id', planId).order('sort', { ascending: true });
  if (pvt.error?.code === '42P01') {
    pvt = await sb.from('program_exercises').select('*').eq('plan_id', planId).order('sort', { ascending: true });
  }

  const links = pvt.data ?? [];

  // juntar info de exercícios (tenta tabela exercises)
  const exIds = links.map((r: any) => r.exercise_id ?? r.ex_id).filter(Boolean);
  let ex = { data: [] as any[] };
  if (exIds.length) {
    ex = await sb.from('exercises').select('*').in('id', exIds);
  }

  const mapById = new Map<string, any>();
  (ex.data ?? []).forEach((e: any) => mapById.set(String(e.id), e));

  const rows = links.map((l: any) => {
    const exId = String(l.exercise_id ?? l.ex_id);
    const e = mapById.get(exId) ?? {};
    return {
      id: String(l.id ?? `${planId}-${exId}`),
      exercise_id: exId,
      sort: l.sort ?? l.position ?? l.order ?? null,
      name: pick(e, ['name', 'title']) ?? '',
      muscle_group: e.muscle_group ?? '',
      difficulty: e.difficulty ?? e.level ?? '',
    };
  });

  return NextResponse.json({ rows });
}

// POST: adicionar exercícios (array de { exercise_id, sort? })
export async function POST(req: Request, ctx: Ctx) {
  const guard = await requireAdminGuard();
  if (isGuardErr(guard)) return guard.response;

  const { id: planId } = await ctx.params;
  const sb = createServerClient();
  const body = await req.json().catch(() => ({}));
  const items = Array.isArray(body?.items) ? body.items : [];

  if (!items.length) return NextResponse.json({ ok: true, inserted: 0 });

  const rows = items.map((it: any, idx: number) => ({
    plan_id: planId,
    exercise_id: it.exercise_id,
    sort: it.sort ?? idx,
  }));

  const ins = async (table: string) => sb.from(table).insert(rows);
  let r = await ins('plan_exercises');
  if (r.error?.code === '42P01') r = await ins('program_exercises');
  if (r.error) return NextResponse.json({ error: r.error.message }, { status: 400 });

  return NextResponse.json({ ok: true, inserted: rows.length });
}

// PATCH: reordenar (array { id, sort })
export async function PATCH(req: Request, ctx: Ctx) {
  const guard = await requireAdminGuard();
  if (isGuardErr(guard)) return guard.response;

  const { id: planId } = await ctx.params;
  const sb = createServerClient();
  const body = await req.json().catch(() => ({}));
  const items = Array.isArray(body?.items) ? body.items : [];

  const upd = async (table: string, row: any) =>
    sb.from(table).update({ sort: row.sort }).eq('id', row.id).eq('plan_id', planId);

  for (const it of items) {
    let r = await upd('plan_exercises', it);
    if (r.error?.code === '42P01') r = await upd('program_exercises', it);
  }
  return NextResponse.json({ ok: true, updated: items.length });
}

// DELETE: remover um exercício (query param exId)
export async function DELETE(req: Request, ctx: Ctx) {
  const guard = await requireAdminGuard();
  if (isGuardErr(guard)) return guard.response;

  const { id: planId } = await ctx.params;
  const sb = createServerClient();
  const url = new URL(req.url);
  const exId = url.searchParams.get('exercise_id');

  if (!exId) return NextResponse.json({ error: 'exercise_id required' }, { status: 400 });

  const del = async (table: string) =>
    sb.from(table).delete().eq('plan_id', planId).eq('exercise_id', exId);

  let r = await del('plan_exercises');
  if (r.error?.code === '42P01') r = await del('program_exercises');
  if (r.error) return NextResponse.json({ error: r.error.message }, { status: 400 });

  return NextResponse.json({ ok: true });
}
