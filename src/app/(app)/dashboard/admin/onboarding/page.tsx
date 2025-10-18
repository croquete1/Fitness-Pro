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

  const rows = (data ?? []).map((r: any) => {
    const name = r.profiles?.name ?? null;
    const email = r.users?.email ?? null;
    const display = name ?? email ?? r.user_id;
    return {
      id: r.id as string,
      userId: r.user_id as string,
      user: display as string,
      name: name as string | null,
      email: email as string | null,
      status: r.status as string | null,
      created_at: r.created_at as string | null,
      updated_at: r.updated_at as string | null,
    };
  });

  return <AdminOnboardingListClient initialRows={rows} />;
}
