export const dynamic = 'force-dynamic';

import { redirect } from 'next/navigation';
import { getSessionUserSafe } from '@/lib/session-bridge';
import { toAppRole } from '@/lib/roles';
import { createServerClient } from '@/lib/supabaseServer';
import PlansClient from './PlansClient';

export default async function ClientPlansPage() {
  const sessionUser = await getSessionUserSafe();
  if (!sessionUser?.user?.id) redirect('/login');

  const role = toAppRole(sessionUser.user.role) ?? 'CLIENT';
  if (role !== 'CLIENT' && role !== 'ADMIN') redirect('/dashboard');

  const sb = createServerClient();
  const { data } = await sb
    .from('training_plans')
    .select('id,title,status,updated_at,trainer_id')
    .eq('client_id', sessionUser.user.id)
    .order('updated_at', { ascending: false });

  return <PlansClient rows={(data ?? []) as any[]} />;
}
