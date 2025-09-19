export const dynamic = 'force-dynamic';

import { redirect } from 'next/navigation';
import { createServerClient } from '@/lib/supabaseServer';
import { getSessionUserSafe } from '@/lib/session-bridge';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import ProfileForm from '@/components/profile/ProfileForm';
import MetricsChart from '@/components/profile/MetricsChart';
import MetricsTable from '@/components/profile/MetricsTable';
import Box from '@mui/material/Box';

export default async function ProfilePage() {
  const session = await getSessionUserSafe();
  if (!session?.user?.id) redirect('/login');
  const sb = createServerClient();

  const { data: profile } = await sb
    .from('profiles')
    .select('name, email, avatar_url, gender, birthdate, role')
    .eq('id', session.user.id)
    .maybeSingle();

  const { data: metrics } = await sb
    .from('profile_metrics')
    .select('height_cm, weight_kg, bodyfat_pct, updated_at')
    .eq('user_id', session.user.id)
    .maybeSingle();

  // histórico — tentamos 3 tabelas conhecidas
  async function history() {
    const candidates = [
      ['profile_metrics_history', 'measured_at'],
      ['metrics_history', 'measured_at'],
      ['metrics_log', 'created_at'],
    ] as const;
    for (const [t, dt] of candidates) {
      try {
        const { data } = await sb.from(t as any).select(`user_id, ${dt}, weight_kg, bodyfat_pct`).eq('user_id', session.user.id).order(dt as any, { ascending: true }).limit(180);
        if (data?.length) return data.map((r:any)=>({ date: r[dt], weight: r.weight_kg ?? null, bodyfat_pct: r.bodyfat_pct ?? null }));
      } catch {}
    }
    // fallback: valor atual apenas
    return metrics?.weight_kg
      ? [{ date: metrics.updated_at ?? new Date().toISOString(), weight: metrics.weight_kg, bodyfat_pct: metrics.bodyfat_pct ?? null }]
      : [];
  }
  const points = await history();

  return (
    <Paper elevation={0} sx={{ p: 2 }}>
      <Typography variant="h6" fontWeight={800} sx={{ mb: 2 }}>Meu perfil</Typography>
      <ProfileForm initial={{
        name: profile?.name || '',
        email: profile?.email || '',
        avatar_url: profile?.avatar_url || '',
        gender: profile?.gender || '',
        birthdate: profile?.birthdate || '',
        role: profile?.role || '',
        height_cm: metrics?.height_cm ?? '',
        weight_kg: metrics?.weight_kg ?? '',
        bodyfat_pct: metrics?.bodyfat_pct ?? '',
      }} />

      <Box sx={{ mt: 3, display: 'grid', gap: 2, gridTemplateColumns: { xs: '1fr', md: '2fr 1fr' } }}>
        <MetricsChart points={points} />
        <MetricsTable points={points} />
      </Box>
    </Paper>
  );
}
