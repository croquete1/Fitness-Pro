export const dynamic = 'force-dynamic';

import { redirect } from 'next/navigation';
import { getSessionUserSafe } from '@/lib/session-bridge';
import { toAppRole, isPT, isAdmin } from '@/lib/roles';
import { loadTrainerPlansDashboard } from '@/lib/trainer/plans/server';
import PlansPTClient from './PlansPTClient';

export default async function TrainerPlansPage() {
  const session = await getSessionUserSafe();
  if (!session?.user?.id) redirect('/login');
  const role = toAppRole(session.user.role) ?? 'CLIENT';
  if (!isPT(role) && !isAdmin(role)) redirect('/dashboard');

  const userMeta = (session.user as { user_metadata?: { full_name?: string | null; name?: string | null } }).user_metadata;
  const viewerName = userMeta?.full_name ?? userMeta?.name ?? session.user.email ?? null;

  const dashboard = await loadTrainerPlansDashboard(session.user.id);

  return <PlansPTClient initialData={dashboard} viewerName={viewerName} />;
}
