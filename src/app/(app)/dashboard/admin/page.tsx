import { Card, CardContent, Typography, Box, Grid, Container } from '@mui/material';
import { createServerClient } from '@/lib/supabaseServer';

async function getCounts() {
  const sb = createServerClient();

  const [{ count: users = 0 }, { count: plans = 0 }, { count: users7 = 0 }] = await Promise.all([
    sb.from('users').select('*', { count: 'exact', head: true }),
    sb.from('training_plans').select('*', { count: 'exact', head: true }).eq('active', true),
    sb.from('users').select('*', { count: 'exact', head: true })
      .gte('created_at', new Date(Date.now() - 7*24*3600*1000).toISOString()),
  ]);

  return { users, plans, users7, errors: 0 };
}

function Kpi({ title, value, note }: { title: string; value: number | string; note?: string }) {
  return (
    <Card elevation={0} sx={{
      border: 1, borderColor: 'divider', borderRadius: 3,
      background: (t) => t.palette.mode === 'dark'
        ? 'linear-gradient(180deg, rgba(87,119,255,.18), rgba(87,119,255,.08))'
        : 'linear-gradient(180deg, rgba(59,130,246,.10), rgba(59,130,246,.04))'
    }}>
      <CardContent>
        <Typography variant="overline" color="text.secondary">{title}</Typography>
        <Typography variant="h4" fontWeight={800} sx={{ mt: .5 }}>{value}</Typography>
        {note && <Typography variant="caption" color="text.secondary">{note}</Typography>}
        {/* sparkline “fantasma” */}
        <Box sx={{
          mt: 1.5, height: 28, borderRadius: 10,
          background: (t) => t.palette.mode === 'dark' ? 'rgba(255,255,255,.06)' : 'rgba(0,0,0,.06)'
        }}/>
      </CardContent>
    </Card>
  );
}

export default async function AdminDashboardPage() {
  const { users, plans, users7, errors } = await getCounts();

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      <Typography variant="h5" fontWeight={800} sx={{ mb: 2 }}>Boa tarde 👋</Typography>

      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} lg={3}><Kpi title="Utilizadores" value={users} note="última semana visível no gráfico" /></Grid>
        <Grid item xs={12} sm={6} lg={3}><Kpi title="Planos ativos" value={plans} /></Grid>
        <Grid item xs={12} sm={6} lg={3}><Kpi title="Novos registos" value={users7} note="últimos 7 dias" /></Grid>
        <Grid item xs={12} sm={6} lg={3}><Kpi title="Erros sistema" value={errors} /></Grid>
      </Grid>

      {/* aqui mantens os teus cards (tarefas, etc.) */}
    </Container>
  );
}
