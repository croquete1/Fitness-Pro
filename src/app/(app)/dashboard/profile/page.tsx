export const dynamic = 'force-dynamic';

import { redirect } from 'next/navigation';
import { getSessionUserSafe } from '@/lib/session-bridge';
import { createServerClient } from '@/lib/supabaseServer';
import ProfileClient from '@/components/profile/ProfileClient';

export default async function Page() {
  const s = await getSessionUserSafe();
  if (!s?.user?.id) redirect('/login');

  const sb = createServerClient();

  // Perfil base
  const { data: prof } = await sb
    .from('profiles')
    .select('id,name,avatar_url,username,gender,height_cm,weight_kg')
    .eq('id', s.user.id)
    .maybeSingle();

  // Antropometria (últimos 90 registos)
  const { data: anthro } = await sb
    .from('anthropometrics')
    .select('id,measured_at,weight_kg,body_fat_pct,height_cm,chest_cm,waist_cm,hip_cm,notes')
    .eq('user_id', s.user.id)
    .order('measured_at', { ascending: false })
    .limit(90);

  return (
    <ProfileClient
      initialProfile={{
        id: s.user.id,
        email: s.user.email ?? null,
        name: prof?.name ?? s.user.name ?? '',
        username: prof?.username ?? '',
        avatar_url: prof?.avatar_url ?? null,
        gender: prof?.gender ?? null,
        height_cm: prof?.height_cm ?? null,
        weight_kg: prof?.weight_kg ?? null,
      }}
      initialAnthro={anthro ?? []}
    />
  );
}
