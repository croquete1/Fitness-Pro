export const dynamic = 'force-dynamic';

import { redirect } from 'next/navigation';
import { getSessionUserSafe } from '@/lib/session-bridge';
import { toAppRole } from '@/lib/roles';
import TrainerDashboardClient from './TrainerDashboardClient';
import { loadTrainerDashboard } from '@/lib/trainer/dashboard/server';
import { getTrainerDashboardFallback } from '@/lib/fallback/trainer-dashboard';

export default async function TrainerDashboardPage() {
  const session = await getSessionUserSafe();
  if (!session?.user?.id) redirect('/login');

  const role = toAppRole(session.user.role) ?? toAppRole((session as any)?.role) ?? 'CLIENT';
  if (role !== 'PT' && role !== 'ADMIN') redirect('/dashboard');

  const trainerId = role === 'PT' ? session.user.id ?? (session as any)?.id ?? null : null;
  const viewerName =
    session.user.name ??
    (session.user as any)?.full_name ??
    (session.user as any)?.user_metadata?.full_name ??
    session.user.email ??
    null;

  if (!trainerId) {
    const fallback = getTrainerDashboardFallback('trainer-fallback', viewerName);
    return <TrainerDashboardClient initialData={{ ok: true, ...fallback }} viewerName={viewerName} />;
  }

  const dashboard = await loadTrainerDashboard(trainerId, viewerName);
  return <TrainerDashboardClient initialData={{ ok: true, ...dashboard }} viewerName={viewerName} />;
}
