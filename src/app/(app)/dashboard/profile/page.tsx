export const dynamic = 'force-dynamic';

import { redirect } from 'next/navigation';
import { getSessionUserSafe } from '@/lib/session-bridge';
import { toAppRole } from '@/lib/roles';
import { createServerClient } from '@/lib/supabaseServer';
import ProfileForm from '@/components/profile/ProfileForm';

export default async function ProfilePage() {
  const session = await getSessionUserSafe();
  if (!session?.user?.id) redirect('/login');

  const role = toAppRole(session.user.role) ?? 'CLIENT';
  const sb = createServerClient();
  const uid = session.user.id;

  const [{ data: u }, { data: p }] = await Promise.all([
    sb.from('users').select('id,username,name,email,role').eq('id', uid).maybeSingle(),
    sb.from('profiles').select('avatar_url,gender,dob,height_cm,weight_kg').eq('id', uid).maybeSingle(),
  ]);

  const initial = {
    username: u?.username ?? '',
    name: u?.name ?? '',
    email: u?.email ?? '',
    role,
    avatar_url: p?.avatar_url ?? '',
    gender: p?.gender ?? '',
    dob: p?.dob ?? '',
    height_cm: p?.height_cm ?? null,
    weight_kg: p?.weight_kg ?? null,
  };

  return <ProfileForm initial={initial} />;
}
