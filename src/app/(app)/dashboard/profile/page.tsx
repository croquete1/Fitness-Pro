// src/app/(app)/dashboard/profile/page.tsx
export const dynamic = 'force-dynamic';

import { redirect } from 'next/navigation';
import { tryCreateServerClient } from '@/lib/supabaseServer';
import { getSessionUserSafe } from '@/lib/session-bridge';
import ProfileClient from './ProfileClient';

export default async function ProfilePage() {
  const session = await getSessionUserSafe();
  const me = session?.user;
  if (!me?.id) redirect('/login');

  const sb = tryCreateServerClient();
  const [userRow, profileRow, privateRow] = sb
    ? await Promise.all([
        sb
          .from('users')
          .select('email,name,username,avatar_url,role')
          .eq('id', me.id)
          .maybeSingle(),
        sb
          .from('profiles')
          .select('name,username,bio,avatar_url,birthdate')
          .eq('id', me.id)
          .maybeSingle(),
        sb
          .from('profile_private')
          .select('phone')
          .eq('user_id', me.id)
          .maybeSingle(),
      ])
    : [{ data: null }, { data: null }, { data: null }];

  const user = userRow.data ?? null;
  const profile = profileRow.data ?? null;
  const priv = (privateRow.data ?? null) as { phone?: string | null } | null;

  const initialProfile = {
    id: me.id,
    email: user?.email ?? session?.email ?? me.email ?? '',
    name: profile?.name ?? user?.name ?? session?.name ?? '',
    username: profile?.username ?? user?.username ?? '',
    avatarUrl: profile?.avatar_url ?? user?.avatar_url ?? (me as { avatar_url?: string | null })?.avatar_url ?? '',
    role: user?.role ?? me.role ?? null,
    phone: priv?.phone ?? null,
    birthDate: profile?.birthdate ?? null,
    bio: profile?.bio ?? null,
  };

  return <ProfileClient initialProfile={initialProfile} />;
}
