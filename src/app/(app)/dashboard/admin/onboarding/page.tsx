export const dynamic = 'force-dynamic';

import { redirect } from 'next/navigation';
import { getSessionUserSafe } from '@/lib/session-bridge';
import { toAppRole, isAdmin } from '@/lib/roles';
import { createServerClient } from '@/lib/supabaseServer';
import AdminOnboardingListClient from './AdminOnboardingListClient';

export default async function Page() {
  const s = await getSessionUserSafe();
  if (!s?.user?.id) redirect('/login');
  if (!isAdmin(toAppRole(s.user.role) ?? 'CLIENT')) redirect('/dashboard');

  const sb = createServerClient();
  const { data } = await sb
    .from('onboarding_forms')
    .select('id,user_id,status,created_at,updated_at,profiles(name),users(email)')
    .order('updated_at', { ascending: false });

  const rows = (data ?? []).map((r: any) => ({
    id: r.id,
    user: r.profiles?.name ?? r.users?.email ?? r.user_id,
    status: r.status,
    created_at: r.created_at,
    updated_at: r.updated_at,
  }));

  return <AdminOnboardingListClient initialRows={rows} />;
}
