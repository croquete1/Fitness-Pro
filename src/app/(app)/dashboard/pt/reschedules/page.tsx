import { redirect } from 'next/navigation';

import { getSessionUserSafe } from '@/lib/session-bridge';
import { toAppRole } from '@/lib/roles';
import { loadTrainerReschedulesDashboard } from '@/lib/trainer/reschedules/server';
import TrainerReschedulesClient from './TrainerReschedulesClient';

export const dynamic = 'force-dynamic';

export default async function TrainerReschedulesPage() {
  const session = await getSessionUserSafe();
  const me = session?.user;
  if (!me?.id) redirect('/login');
  const role = toAppRole(me.role);
  if (role !== 'PT' && role !== 'ADMIN') redirect('/dashboard');

  const dataset = await loadTrainerReschedulesDashboard(me.id);

  return <TrainerReschedulesClient initialData={dataset} />;
}
