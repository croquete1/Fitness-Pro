import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabaseServer';
import { getSessionUserSafe } from '@/lib/session-bridge';

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const session = await getSessionUserSafe();
  const user = (session as any)?.user as { id: string } | null;
  if (!user?.id) return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });

  const sb = createServerClient();

  const { data: plan, error: e1 } = await sb
    .from('training_plans')
    .select('id, title, status, trainer_id, client_id')
    .eq('id', params.id)
    .maybeSingle();

  if (e1) return NextResponse.json({ ok: false, error: e1.message }, { status: 500 });
  if (!plan) return NextResponse.json({ ok: false, error: 'Not found' }, { status: 404 });

  const { data: days, error: e2 } = await sb
    .from('training_plan_days')
    .select('id, title, day_of_week, day_index')
    .eq('plan_id', plan.id)
    .order('day_index', { ascending: true });

  if (e2) return NextResponse.json({ ok: false, error: e2.message }, { status: 500 });

  const dayIds = (days ?? []).map(d => d.id);
  let exercises: any[] = [];
  if (dayIds.length) {
    const { data: tpe, error: e3 } = await sb
      .from('training_plan_exercises')
      .select('id, day_id, exercise_id, name, order_index, prescription, notes')
      .in('day_id', dayIds)
      .order('order_index', { ascending: true });

    if (e3) return NextResponse.json({ ok: false, error: e3.message }, { status: 500 });
    exercises = tpe ?? [];
  }

  const byDay = new Map<string, any[]>();
  dayIds.forEach(id => byDay.set(id, []));
  exercises.forEach(ex => {
    if (!byDay.has(ex.day_id)) byDay.set(ex.day_id, []);
    byDay.get(ex.day_id)!.push(ex);
  });

  const result = {
    plan,
    days: (days ?? []).map(d => ({
      ...d,
      exercises: byDay.get(d.id) ?? []
    }))
  };

  return NextResponse.json({ ok: true, ...result });
}
