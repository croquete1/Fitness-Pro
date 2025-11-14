import type { Metadata } from 'next';
import { redirect } from 'next/navigation';

import { getSessionUserSafe } from '@/lib/session-bridge';
import { loadProfileDashboard } from '@/lib/profile/server';
import type { ProfileDashboardResponse } from '@/lib/profile/types';
import { createServerClient } from '@/lib/supabaseServer';
import type { FitnessQuestionnaireRow } from '@/lib/questionnaire';
import { buildClientPlansDashboard } from '@/lib/plans/dashboard';
import { getClientPlansFallback } from '@/lib/fallback/plans';
import type { ClientPlan, PlansDashboardPayload } from '@/lib/plans/types';
import { loadMessagesDashboard } from '@/lib/messages/server';
import type { MessagesDashboardResponse } from '@/lib/messages/server';

import ProfileClient from './ProfileClient';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = { title: 'Perfil' };

export default async function ProfilePage() {
  const session = await getSessionUserSafe();
  if (!session?.id) redirect('/login');

  const dashboardResult = await loadProfileDashboard(session.id, {
    email: session.email,
    name: session.name,
    role: session.role,
  });

  const sb = createServerClient();
  const { data: questionnaireData, error: questionnaireError } = await sb
    .from('fitness_questionnaire')
    .select('*')
    .eq('user_id', session.id)
    .maybeSingle<FitnessQuestionnaireRow>();

  const { data: plansData, error: plansError } = await sb
    .from('training_plans')
    .select(
      `id,title,status,created_at,updated_at,start_date,end_date,trainer_id,
      trainer:users!training_plans_trainer_id_fkey(id,name,email)`,
    )
    .eq('client_id', session.id)
    .order('updated_at', { ascending: false })
    .order('created_at', { ascending: false })
    .limit(32);

  const initialDashboard: ProfileDashboardResponse = {
    ok: true,
    source: dashboardResult.source,
    ...dashboardResult.data,
  };

  const initialQuestionnaire = questionnaireError
    ? { ok: false as const, error: 'Não foi possível carregar o questionário.' }
    : { ok: true as const, data: questionnaireData ?? null };

  let initialPlans: PlansDashboardPayload;
  if (plansError) {
    console.error('[profile] falha ao carregar planos do cliente', plansError);
    const fallback = getClientPlansFallback();
    initialPlans = { ...fallback, ok: true, source: 'fallback' };
  } else {
    const plans: ClientPlan[] = (plansData ?? []).map((plan: any) => ({
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
    const dashboardPlans = buildClientPlansDashboard(plans, { supabase: true });
    initialPlans = { ...dashboardPlans, ok: true, source: 'supabase' };
  }

  const initialMessages: MessagesDashboardResponse = await loadMessagesDashboard(session.id, 14);

  return (
    <main className="profile-dashboard-page">
      <ProfileClient
        initialDashboard={initialDashboard}
        initialQuestionnaire={initialQuestionnaire}
        initialPlans={initialPlans}
        initialMessages={initialMessages}
      />
    </main>
  );
}
