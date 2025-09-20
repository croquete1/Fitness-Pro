export const dynamic = 'force-dynamic';

import { redirect } from 'next/navigation';
import { getSessionUserSafe } from '@/lib/session-bridge';
import { toAppRole, isPT, isAdmin } from '@/lib/roles';
import { createServerClient } from '@/lib/supabaseServer';
import PlansPTClient from './PlansPTClient';

export default async function PTPlansPage() {
  const sessionUser = await getSessionUserSafe();
  if (!sessionUser?.user?.id) redirect('/login');

  const role = toAppRole(sessionUser.user.role) ?? 'CLIENT';
  if (!isPT(role) && !isAdmin(role)) redirect('/dashboard');

  const sb = createServerClient();
  const { data } = await sb
    .from('training_plans')
    .select('id,title,status,updated_at,client_id')
    .eq('trainer_id', sessionUser.user.id)
    .order('updated_at', { ascending: false });

  return <PlansPTClient rows={(data ?? []) as any[]} />;
}
