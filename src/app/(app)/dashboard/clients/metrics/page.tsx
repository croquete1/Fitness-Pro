// src/app/(app)/dashboard/clients/metrics/page.tsx
export const dynamic = 'force-dynamic';

import { redirect } from 'next/navigation';
import { getSessionUserSafe } from '@/lib/session-bridge';
import { createServerClient } from '@/lib/supabaseServer';
import MetricsClient from './metricsClient';

export default async function Page(){
  const s = await getSessionUserSafe(); if(!s?.user?.id) redirect('/login');
  const sb = createServerClient();
  const { data } = await sb
    .from('anthropometrics')
    .select('id,measured_at,weight_kg,height_cm,body_fat_pct,bmi,notes')
    .eq('user_id', s.user.id)
    .order('measured_at', { ascending:false })
    .limit(200);
  return <MetricsClient initial={data ?? []} />;
}
