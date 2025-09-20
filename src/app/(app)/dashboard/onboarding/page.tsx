// src/app/(app)/dashboard/onboarding/page.tsx
export const dynamic = 'force-dynamic';

import { redirect } from 'next/navigation';
import { getSessionUserSafe } from '@/lib/session-bridge';
import ClientOnboardingFormClient from '@/components/onboarding/ClientOnboardingFormClient';
import { createServerClient } from '@/lib/supabaseServer';

export default async function Page() {
  const s = await getSessionUserSafe();
  if (!s?.user?.id) redirect('/login');

  const sb = createServerClient();
  const { data } = await sb.from('onboarding_forms').select('*').eq('user_id', s.user.id).maybeSingle();

  return <ClientOnboardingFormClient initial={data ?? null} />;
}
