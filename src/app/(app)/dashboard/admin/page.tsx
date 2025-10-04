// src/app/(app)/dashboard/admin/page.tsx
import { Card, CardContent, CardHeader, Grid, Typography, LinearProgress, Box } from '@mui/material';
import { createServerClient } from '@/lib/supabaseServer';

async function kpi() {
  const sb = createServerClient();

  // Ajusta nomes das tabelas/colunas ao teu schema real
  const [{ count: users }, { count: plans }, { count: exercises }, { count: sessions }] = await Promise.all([
    sb.from('users').select('*', { count: 'exact', head: true }),
    sb.from('training_plans').select('*', { count: 'exact', head: true }),
    sb.from('exercises').select('*', { count: 'exact', head: true }),
    sb.from('sessions').select('*', { count: 'exact', head: true }),
  ]);

  return {
    users: users ?? 0,
    plans: plans ?? 0,
    exercises: exercises ?? 0,
    sessions: sessions ?? 0,
  };
}

function KpiCard({ title, value, hint, icon }: { title: string; value: number | string; hint?: string; icon?: string }) {
  return (
    <Card variant="outlined" sx={{ borderRadius: 3 }}>
      <CardHeader
        title={
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <span aria-hidden>{icon ?? '📈'}</span>
            <Typography variant="subtitle2" color="text.secondary">{title}</Typography>
          </Box>
        }
      />
      <CardContent sx={{ pt: 0 }}>
        <Typography variant="h4" fontWeight={800}>{value}</Typography>
        {hint && (
          <Typography variant="caption" color="text.secondary">{hint}</Typography>
        )}
        <LinearProgress variant="determinate" value={100} sx={{ mt: 1.5 }} />
      </CardContent>
    </Card>
  );
}

export default async function AdminDashboardPage() {
  const data = await kpi();

  return (
    <Grid container spacing={2}>
      <Grid item xs={12} sm={6} lg={3}>
        <KpiCard title="Utilizadores" value={data.users} icon="🧑‍🤝‍🧑" />
      </Grid>
      <Grid item xs={12} sm={6} lg={3}>
        <KpiCard title="Planos" value={data.plans} icon="🗂️" />
      </Grid>
      <Grid item xs={12} sm={6} lg={3}>
        <KpiCard title="Exercícios" value={data.exercises} icon="🏋️" />
      </Grid>
      <Grid item xs={12} sm={6} lg={3}>
        <KpiCard title="Sessões" value={data.sessions} icon="📅" />
      </Grid>
    </Grid>
  );
}
