import { NextResponse, type NextRequest } from 'next/server';
import { createServerClient } from '@/lib/supabaseServer';
import { getSessionUserSafe } from '@/lib/session-bridge';

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const planId = params.id;
  const sb = createServerClient();

  // auth básica
  const session = await getSessionUserSafe();
  const user = (session as any)?.user;
  if (!user?.id) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  const { days } = (await req.json()) as {
    days: Array<{ id: string; position: number; exercises: Array<{ id: string; day_id: string; position: number }> }>;
  };

  // 1) atualizar ordem dos dias
  for (const d of days) {
    const { error } = await sb
      .from('plan_days')
      .update({ position: d.position })
      .eq('id', d.id)
      .eq('plan_id', planId);
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  }

  // 2) atualizar order/mudança de dia dos exercícios
  for (const d of days) {
    for (const ex of d.exercises) {
      const { error } = await sb
        .from('plan_exercises')
        .update({ day_id: ex.day_id, position: ex.position })
        .eq('id', ex.id)
        .eq('plan_id', planId);
      if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    }
  }

  return NextResponse.json({ ok: true });
}
