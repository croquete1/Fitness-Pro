export const dynamic = 'force-dynamic';

import { redirect } from 'next/navigation';
import { getSessionUserSafe } from '@/lib/session-bridge';
import { isAdmin, isPT, toAppRole } from '@/lib/roles';
import PTWorkoutsClient from './PTWorkoutsClient';
import { loadTrainerWorkoutsDashboard } from '@/lib/trainer/workouts/server';

export default async function PTWorkoutsPage() {
  const session = await getSessionUserSafe();
  if (!session?.user?.id) redirect('/login');

  const role = toAppRole(session.user.role ?? null);
  if (!isPT(role) && !isAdmin(role)) redirect('/dashboard');

  const userMeta = (session.user as { user_metadata?: { full_name?: string | null; name?: string | null } }).user_metadata;
  const viewerName = userMeta?.full_name ?? userMeta?.name ?? session.user.email ?? null;

  const result = await loadTrainerWorkoutsDashboard(session.user.id);
  return <PTWorkoutsClient initialData={result} viewerName={viewerName} />;
}
