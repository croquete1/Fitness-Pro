export const dynamic = 'force-dynamic';

import { redirect, notFound } from 'next/navigation';
import { getSessionUserSafe } from '@/lib/session-bridge';
import { toAppRole } from '@/lib/roles';
import { getClientPlanDetail } from '@/lib/client/plans/detail/server';
import { getClientPlanDetailFallback } from '@/lib/fallback/client-plan-detail';
import type { ClientPlanDetail } from '@/lib/client/plans/detail/types';
import PlanDetailClient from './client';

export default async function PlanDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getSessionUserSafe();
  const me = session?.user;
  if (!me?.id) redirect('/login');

  const appRole = toAppRole(me.role) ?? 'CLIENT';

  try {
    const plan = await getClientPlanDetail(id, me.id, appRole);
    if (!plan) {
      return notFound();
    }
    return <PlanDetailClient meId={me.id} role={appRole} plan={plan} fallback={false} />;
  } catch (error) {
    console.error('[client-plan-detail] falha a carregar plano', error);
    const fallback: ClientPlanDetail = getClientPlanDetailFallback(id);
    return <PlanDetailClient meId={me.id} role={appRole} plan={fallback} fallback />;
  }
}
