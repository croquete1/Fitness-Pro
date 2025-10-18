import { NextResponse } from 'next/server';
import { getSessionUserSafe } from '@/lib/session-bridge';
import { tryCreateServerClient } from '@/lib/supabaseServer';
import { buildClientPlansDashboard } from '@/lib/plans/dashboard';
import { getClientPlansFallback } from '@/lib/fallback/plans';
import type { ClientPlan } from '@/lib/plans/types';

export async function GET() {
  const session = await getSessionUserSafe();
  const uid = session?.user?.id;
  if (!uid) {
    return NextResponse.json({ ok: false, message: 'Sessão inválida.' }, { status: 401 });
  }

  const sb = tryCreateServerClient();
  if (!sb) {
    const fallback = getClientPlansFallback();
    return NextResponse.json({ ok: true, ...fallback, source: 'fallback' as const });
  }

  const { data, error } = await sb
    .from('training_plans')
    .select(
      `id,title,status,created_at,updated_at,start_date,end_date,trainer_id,
      trainer:users!training_plans_trainer_id_fkey(id,name,email)`,
    )
    .eq('client_id', uid)
    .order('updated_at', { ascending: false })
    .order('created_at', { ascending: false });

  if (error) {
    console.error('[client-plans] erro ao refrescar planos', error);
    const fallback = getClientPlansFallback();
    return NextResponse.json({ ok: true, ...fallback, source: 'fallback' as const });
  }

  const plans: ClientPlan[] = (data ?? []).map((plan: any) => ({
    id: String(plan.id),
    title: plan.title ?? null,
    status: plan.status ?? null,
    createdAt: plan.created_at ?? null,
    updatedAt: plan.updated_at ?? plan.created_at ?? null,
    startDate: plan.start_date ?? null,
    endDate: plan.end_date ?? null,
    trainerId: plan.trainer?.id ?? plan.trainer_id ?? null,
    trainerName: plan.trainer?.name ?? null,
    trainerEmail: plan.trainer?.email ?? null,
  }));

  const dashboard = buildClientPlansDashboard(plans, { supabase: true });

  return NextResponse.json({ ok: true, ...dashboard, source: 'supabase' as const });
}
