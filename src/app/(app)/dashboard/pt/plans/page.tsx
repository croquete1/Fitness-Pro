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

  const dashboard = await loadTrainerPlansDashboard(session.user.id);
  const rows = dashboard.rows.map((row) => ({
    id: row.id,
    title: row.title,
    status: row.statusLabel,
    updated_at: row.updatedAt,
    client_id: row.clientId,
  }));

  return <PlansPTClient rows={rows} />;
}
