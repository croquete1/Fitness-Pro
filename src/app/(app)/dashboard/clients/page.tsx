import * as React from 'react';
import { createServerClient } from '@/lib/supabaseServer';
import { Grid, Card, CardContent, Typography } from '@mui/material';

const Kpi = ({ title, value, hint }: { title: string; value: string | number; hint?: string }) => (
  <Card variant="outlined">
    <CardContent>
      <Typography variant="subtitle2" color="text.secondary">{title}</Typography>
      <Typography variant="h5" fontWeight={800} sx={{ mt: .5 }}>{value}</Typography>
      {hint && <Typography variant="caption" color="text.secondary">{hint}</Typography>}
    </CardContent>
  </Card>
);

export default async function ClientDashboard() {
  const sb = createServerClient();
  const { data: { user } } = await sb.auth.getUser();

  let weeks = 0, sessionsDone = 0, upcoming = 0, plans = 0;
  if (user) {
    const { count: w } = await sb.from('checkins').select('*', { count: 'exact', head: true }).eq('user_id', user.id);
    weeks = w ?? 0;

    const { count: s } = await sb.from('sessions').select('*', { count: 'exact', head: true })
      .eq('client_id', user.id).eq('status', 'DONE');
    sessionsDone = s ?? 0;

    const now = new Date().toISOString();
    const { count: u } = await sb.from('sessions').select('*', { count: 'exact', head: true })
      .eq('client_id', user.id).gt('start_at', now);
    upcoming = u ?? 0;

    const { count: p } = await sb.from('training_plans').select('*', { count: 'exact', head: true })
      .eq('client_id', user.id);
    plans = p ?? 0;
  }

  return (
    <Grid container spacing={2}>
      <Grid item xs={12} sm={6} lg={3}><Kpi title="Semanas de treino" value={weeks} /></Grid>
      <Grid item xs={12} sm={6} lg={3}><Kpi title="Sessões concluídas" value={sessionsDone} /></Grid>
      <Grid item xs={12} sm={6} lg={3}><Kpi title="Próximas sessões" value={upcoming} /></Grid>
      <Grid item xs={12} sm={6} lg={3}><Kpi title="Planos ativos" value={plans} /></Grid>
    </Grid>
  );
}
