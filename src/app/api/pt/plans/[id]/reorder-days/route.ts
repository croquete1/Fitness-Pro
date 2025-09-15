import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabaseServer';
import { getSessionUserSafe } from '@/lib/session-bridge';
import { toAppRole } from '@/lib/roles';

export async function POST(req: Request, { params }: { params: { id: string } }): Promise<Response> {
  const me = await getSessionUserSafe();
  if (!me?.id) return new NextResponse('Unauthorized', { status: 401 });
  const role = toAppRole(me.role);
  if (role !== 'ADMIN' && role !== 'PT' && role !== 'TRAINER') return new NextResponse('Forbidden', { status: 403 });

  const { order } = await req.json().catch(() => ({ order: [] as Array<{ id: string; day_index: number }> }));
  if (!Array.isArray(order)) return NextResponse.json({ ok: false, error: 'BAD_BODY' }, { status: 400 });

  const sb = createServerClient();

  // Se for PT/Trainer, garantir que o plano é dele
  if (role !== 'ADMIN') {
    const { data: plan } = await sb.from('training_plans').select('trainer_id').eq('id', params.id).maybeSingle();
    if (!plan || plan.trainer_id !== me.id) return new NextResponse('Forbidden', { status: 403 });
  }

  // Atualizar índices (um a um – simples e robusto)
  await Promise.all(
    order.map((o) => sb.from('plan_days').update({ day_index: o.day_index }).eq('id', o.id))
  );

  return NextResponse.json({ ok: true });
}
