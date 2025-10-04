import * as React from 'react';
import { createServerClient } from '@/lib/supabaseServer';
import { Grid, Card, CardContent, Typography } from '@mui/material';

function Kpi({ title, value, hint }: { title: string; value: string | number; hint?: string }) {
  return (
    <Card variant="outlined">
      <CardContent>
        <Typography variant="subtitle2" color="text.secondary">{title}</Typography>
        <Typography variant="h5" fontWeight={800} sx={{ mt: .5 }}>{value}</Typography>
        {hint && <Typography variant="caption" color="text.secondary">{hint}</Typography>}
      </CardContent>
    </Card>
  );
}

export default async function PTDashboard() {
  const sb = createServerClient();
  const { data: { user } } = await sb.auth.getUser();

  let clients = 0, sessionsToday = 0, drafts = 0;
  if (user) {
    const start = new Date(); start.setHours(0,0,0,0);
    const end = new Date();   end.setHours(23,59,59,999);

    const { count: c1 } = await sb.from('clients_trainers').select('*', { count: 'exact', head: true }).eq('trainer_id', user.id);
    clients = c1 ?? 0;

    const { count: c2 } = await sb.from('sessions').select('*', { count: 'exact', head: true })
      .eq('trainer_id', user.id).gte('start_at', start.toISOString()).lte('start_at', end.toISOString());
    sessionsToday = c2 ?? 0;

    const { count: c3 } = await sb.from('training_plans').select('*', { count: 'exact', head: true })
      .eq('trainer_id', user.id).eq('status', 'DRAFT');
    drafts = c3 ?? 0;
  }

  return (
    <Grid container spacing={2}>
      <Grid item xs={12} sm={6} lg={3}><Kpi title="Clientes ativos" value={clients} /></Grid>
      <Grid item xs={12} sm={6} lg={3}><Kpi title="Sessões hoje" value={sessionsToday} /></Grid>
      <Grid item xs={12} sm={6} lg={3}><Kpi title="Planos rascunho" value={drafts} /></Grid>
      <Grid item xs={12} sm={6} lg={3}><Kpi title="🎯 Meta da semana" value="—" hint="Define no painel" /></Grid>
    </Grid>
  );
}
