import type { Metadata } from 'next';
import { redirect } from 'next/navigation';

import { getSessionUserSafe } from '@/lib/session-bridge';
import { loadProfileDashboard } from '@/lib/profile/server';
import type { ProfileDashboardResponse } from '@/lib/profile/types';
import { createServerClient } from '@/lib/supabaseServer';
import type { FitnessQuestionnaireRow } from '@/lib/questionnaire';

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

  const initialDashboard: ProfileDashboardResponse = {
    ok: true,
    source: dashboardResult.source,
    ...dashboardResult.data,
  };

  const initialQuestionnaire = questionnaireError
    ? { ok: false as const, error: 'Não foi possível carregar o questionário.' }
    : { ok: true as const, data: questionnaireData ?? null };

  return (
    <main className="profile-dashboard-page">
      <ProfileClient initialDashboard={initialDashboard} initialQuestionnaire={initialQuestionnaire} />
    </main>
  );
}
