export const dynamic = 'force-dynamic';

import { redirect } from 'next/navigation';
import { getSessionUserSafe } from '@/lib/session-bridge';
import { toAppRole } from '@/lib/roles';
import { fetchClientPlanOverview } from '@/lib/client/plans/server';
import { getClientPlanOverviewFallback } from '@/lib/fallback/client-plan-overview';
import type { ClientPlanOverviewResponse } from '@/lib/client/plans/overview/types';
import MyPlanClient from './MyPlanClient';

const DEFAULT_RANGE = 7;

export default async function MyPlanPage() {
  const sessionUser = await getSessionUserSafe();
  const me = sessionUser?.user;
  if (!me?.id) redirect('/login');

  const role = toAppRole(me.role) ?? 'CLIENT';
  if (role !== 'CLIENT' && role !== 'ADMIN') redirect('/dashboard');

  try {
    const overview = await fetchClientPlanOverview(me.id, { rangeDays: DEFAULT_RANGE });
    const payload: ClientPlanOverviewResponse = { ok: true, ...overview, source: 'supabase' };
    return <MyPlanClient initialData={payload} defaultRange={DEFAULT_RANGE} />;
  } catch (error) {
    console.error('[client-plan-overview] falha no carregamento inicial', error);
    const fallback = getClientPlanOverviewFallback(DEFAULT_RANGE);
    const payload: ClientPlanOverviewResponse = { ok: true, ...fallback, source: 'fallback' };
    return <MyPlanClient initialData={payload} defaultRange={DEFAULT_RANGE} />;
  }
}
