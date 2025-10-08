import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabaseServer';

export const dynamic = 'force-dynamic';

export async function POST(_req: Request, { params }: { params: { id: string } }) {
  const sb = createServerClient();
  const id = params.id;

  // 1) ler plano (plans → programs fallback)
  let src: any | null = null;
  let r = await sb.from('plans').select('*').eq('id', id).maybeSingle();
  if (r.data) src = r.data; else {
    const r2 = await sb.from('programs').select('*').eq('id', id).maybeSingle();
    if (r2.data) src = r2.data;
  }
  if (!src) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const payload = {
    name: (src.name ?? src.title ?? 'Plano') + ' (cópia)',
    description: src.description ?? src.details ?? null,
    difficulty: src.difficulty ?? src.level ?? null,
    duration_weeks: src.duration_weeks ?? src.duration ?? null,
    is_public: false, // o clone começa privado
  };

  // 2) criar clone
  const insertPlan = async (table: string) => sb.from(table).insert(payload).select('id').single();
  let created = await insertPlan('plans');
  if (created.error?.code === '42P01' || created.error?.message?.includes('relation')) {
    created = await insertPlan('programs');
  }
  if (created.error || !created.data) {
    return NextResponse.json({ error: created.error?.message || 'Clone failed' }, { status: 400 });
  }
  const newId = created.data.id;

  // 3) copiar ligações de exercises (se existir tabela pivot)
  const readPivot = async (table: string) => sb.from(table).select('*').eq('plan_id', id);
  let pivot = await readPivot('plan_exercises');
  if (!pivot.data && !pivot.error) pivot = await readPivot('program_exercises');

  if (pivot.data && pivot.data.length) {
    const rows = pivot.data.map((px: any) => ({
      plan_id: newId,
      exercise_id: px.exercise_id ?? px.ex_id ?? px.exercise ?? null,
      sort: px.sort ?? px.position ?? px.order ?? null,
    })).filter((r: any) => r.exercise_id);

    if (rows.length) {
      const insPivot = async (table: string) => sb.from(table).insert(rows);
      let ip = await insPivot('plan_exercises');
      if (ip.error?.code === '42P01') ip = await insPivot('program_exercises');
      // mesmo que falhe, o plano clonado está criado — não bloqueamos
    }
  }

  return NextResponse.json({ ok: true, id: newId });
}
