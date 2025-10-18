export const dynamic = 'force-dynamic';

import { redirect } from 'next/navigation';
import { getSessionUserSafe } from '@/lib/session-bridge';
import { toAppRole } from '@/lib/roles';
import { createServerClient } from '@/lib/supabaseServer';
import PlansClient from './PlansClient';
import { getClientPlansFallback } from '@/lib/fallback/plans';
import { buildClientPlansDashboard } from '@/lib/plans/dashboard';
import type { ClientPlan } from '@/lib/plans/types';

export default async function ClientPlansPage() {
  const sessionUser = await getSessionUserSafe();
  if (!sessionUser?.user?.id) redirect('/login');

  const role = toAppRole(sessionUser.user.role) ?? 'CLIENT';
  if (role !== 'CLIENT' && role !== 'ADMIN') redirect('/dashboard');

  const sb = createServerClient();
  const { data, error } = await sb
    .from('training_plans')
    .select(
      `id,title,status,created_at,updated_at,start_date,end_date,trainer_id,
      trainer:users!training_plans_trainer_id_fkey(id,name,email)`,
    )
    .eq('client_id', sessionUser.user.id)
    .order('updated_at', { ascending: false })
    .order('created_at', { ascending: false });

  if (error) {
    console.error('[client-plans] falha ao carregar planos', error);
    const fallback = getClientPlansFallback();
    return <PlansClient initialData={fallback} />;
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

  return <PlansClient initialData={dashboard} />;
}
