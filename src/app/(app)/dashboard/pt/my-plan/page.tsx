export const dynamic = 'force-dynamic';

import { redirect } from 'next/navigation';
import { getSessionUserSafe } from '@/lib/session-bridge';
import { toAppRole, isPT, isAdmin } from '@/lib/roles';
import PTPlansClient from './PTPlansClient';
import { loadTrainerPlansDashboard } from '@/lib/trainer/plans/server';

export default async function PTPlansPage() {
  const session = await getSessionUserSafe();
  if (!session?.user?.id) redirect('/login');
  const role = toAppRole(session.user.role) ?? 'CLIENT';
  if (!isPT(role) && !isAdmin(role)) redirect('/dashboard');
  const userMeta = (session.user as { user_metadata?: { full_name?: string | null; name?: string | null } }).user_metadata;
  const viewerName = userMeta?.full_name ?? userMeta?.name ?? session.user.email ?? null;

  const result = await loadTrainerPlansDashboard(session.user.id);
  return <PTPlansClient initialData={result} viewerName={viewerName} />;
}
