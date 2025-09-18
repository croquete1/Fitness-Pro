// src/app/(app)/dashboard/profile/page.tsx
export const dynamic = 'force-dynamic';

import { redirect } from 'next/navigation';
import { createServerClient } from '@/lib/supabaseServer';
import { getSessionUserSafe } from '@/lib/session-bridge';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import ProfileForm from '@/components/profile/ProfileForm';

export default async function ProfilePage() {
  const session = await getSessionUserSafe();
  if (!session?.user?.id) redirect('/login');
  const sb = createServerClient();

  const { data: profile } = await sb
    .from('profiles')
    .select('name, email, avatar_url, gender, birthdate')
    .eq('id', session.user.id)
    .maybeSingle();

  const { data: metrics } = await sb
    .from('profile_metrics')
    .select('height_cm, weight_kg, bodyfat_pct')
    .eq('user_id', session.user.id)
    .maybeSingle();

  return (
    <Paper elevation={0} sx={{ p: 2 }}>
      <Typography variant="h6" fontWeight={800} sx={{ mb: 2 }}>
        Meu perfil
      </Typography>
      <ProfileForm
        initial={{
          name: profile?.name || '',
          email: profile?.email || '',
          avatar_url: profile?.avatar_url || '',
          gender: profile?.gender || '',
          birthdate: profile?.birthdate || '',
          height_cm: metrics?.height_cm ?? '',
          weight_kg: metrics?.weight_kg ?? '',
          bodyfat_pct: metrics?.bodyfat_pct ?? '',
        }}
      />
    </Paper>
  );
}
