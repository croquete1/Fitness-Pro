// src/app/(app)/dashboard/onboarding/page.tsx
export const dynamic = 'force-dynamic';

import { redirect } from 'next/navigation';
import { getSessionUserSafe } from '@/lib/session-bridge';
import FitnessQuestionnaireForm from '@/components/questionnaire/FitnessQuestionnaireForm';
import { createServerClient } from '@/lib/supabaseServer';

export default async function Page() {
  const s = await getSessionUserSafe();
  if (!s?.user?.id) redirect('/login');

  const sb = createServerClient();
  const { data } = await sb
    .from('fitness_questionnaire')
    .select('*')
    .eq('user_id', s.user.id)
    .maybeSingle();

  const viewerName = s?.name ?? s?.user?.name ?? null;

  return <FitnessQuestionnaireForm initial={data ?? null} viewerName={viewerName} mode="client" />;
}
