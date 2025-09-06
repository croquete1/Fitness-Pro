import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { toAppRole } from '@/lib/roles';
import { createServerClient } from '@/lib/supabaseServer';
import { notifyPlanUpdated, notifyPlanDayNotesUpdated } from '@/lib/notify';

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  const user = (session as any)?.user;
  if (!user?.id) return new NextResponse('Unauthorized', { status: 401 });
  const role = toAppRole(user.role) || 'CLIENT';
  if (role !== 'PT' && role !== 'ADMIN') return new NextResponse('Forbidden', { status: 403 });

  const sb = createServerClient();
  const body = await req.json();

  // 1) obter client_id do plano
  const { data: plan, error: e1 } = await sb.from('training_plans').select('id,client_id,trainer_id').eq('id', params.id).single();
  if (e1 || !plan) return new NextResponse('Plan not found', { status: 404 });
  if (role === 'PT' && plan.trainer_id !== user.id) return new NextResponse('Forbidden', { status: 403 });

  // 2) decidir se é update geral ou notas do dia
  const isDayNotes = typeof body?.dayIso === 'string' && typeof body?.dayNotes === 'string';

  if (isDayNotes) {
    // exemplo: guardar notas num JSONB separado (ajusta à tua estrutura real)
    const { error } = await sb
      .from('training_plans_days')
      .upsert({ plan_id: plan.id, day_iso: body.dayIso, notes: body.dayNotes }, { onConflict: 'plan_id,day_iso' });
    if (error) return new NextResponse(error.message, { status: 500 });

    await notifyPlanDayNotesUpdated(sb, plan.client_id, plan.id, body.dayIso);
    return NextResponse.json({ ok: true });
  }

  // update normal
  const { error } = await sb
    .from('training_plans')
    .update({
      title: body.title ?? undefined,
      notes: body.notes ?? undefined,
      status: body.status ?? undefined
    })
    .eq('id', plan.id);
  if (error) return new NextResponse(error.message, { status: 500 });

  await notifyPlanUpdated(sb, plan.client_id, plan.id);
  return NextResponse.json({ ok: true });
}
