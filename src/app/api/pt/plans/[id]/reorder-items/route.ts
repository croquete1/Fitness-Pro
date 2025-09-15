import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabaseServer';
import { getSessionUserSafe } from '@/lib/session-bridge';
import { toAppRole } from '@/lib/roles';

export async function POST(req: Request, { params }: { params: { id: string } }): Promise<Response> {
  const me = await getSessionUserSafe();
  if (!me?.id) return new NextResponse('Unauthorized', { status: 401 });
  const role = toAppRole(me.role);
  if (role !== 'ADMIN' && role !== 'PT' && role !== 'TRAINER') return new NextResponse('Forbidden', { status: 403 });

  const { moves } = await req.json().catch(() => ({ moves: [] as Array<{ id: string; day_id: string; idx: number }> }));
  if (!Array.isArray(moves)) return NextResponse.json({ ok: false, error: 'BAD_BODY' }, { status: 400 });

  const sb = createServerClient();

  // Validar dias pertencem ao plano
  const { data: days } = await sb.from('plan_days').select('id').eq('plan_id', params.id);
  const daySet = new Set((days ?? []).map((d) => d.id));

  // Se for PT/Trainer, garantir ownership do plano
  if (role !== 'ADMIN') {
    const { data: plan } = await sb.from('training_plans').select('trainer_id').eq('id', params.id).maybeSingle();
    if (!plan || plan.trainer_id !== me.id) return new NextResponse('Forbidden', { status: 403 });
  }

  // Só aplicar movimentos válidos
  const valid = moves.filter((m) => daySet.has(m.day_id));

  await Promise.all(
    valid.map((m) =>
      sb.from('plan_exercises').update({ day_id: m.day_id, idx: m.idx }).eq('id', m.id)
    )
  );

  return NextResponse.json({ ok: true, applied: valid.length });
}
