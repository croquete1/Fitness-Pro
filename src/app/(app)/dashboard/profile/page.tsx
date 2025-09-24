// src/app/(app)/dashboard/profile/page.tsx
export const dynamic = 'force-dynamic';

import { redirect } from 'next/navigation';
import { createServerClient } from '@/lib/supabaseServer';
import { getSessionUserSafe } from '@/lib/session-bridge';
import ProfileClient from './profile-client';

export default async function ProfilePage() {
  const session = await getSessionUserSafe();
  const me = session?.user; if (!me?.id) redirect('/login');

  const sb = createServerClient();
  const { data: u } = await sb
    .from('profiles')
    .select('id,name,username,email,avatar_url,role')
    .eq('id', me.id)
    .maybeSingle();

  const model = {
    id: me.id,
    name: u?.name ?? me.name ?? '',
    email: u?.email ?? me.email ?? '',
    username: u?.username ?? '',
    avatar_url: u?.avatar_url ?? (me as any)?.avatar_url ?? '',
    role: u?.role ?? me.role ?? '',
  };

  return <ProfileClient model={model} />;
}
