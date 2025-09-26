import * as React from 'react';
import { Alert, AlertTitle, Grid, Paper, Stack, Typography } from '@mui/material';
import BoltOutlined from '@mui/icons-material/BoltOutlined';
import KpiCard from '@/components/ui/KpiCard';
import ClientDailyCard from '@/components/dashboard/ClientDailyCard';
import ClientCheckinCard from '@/components/checkins/ClientCheckinCard';
import ClientCheckinHistoryCard from '@/components/checkins/ClientCheckinHistoryCard';
import { createServerClient } from '@/lib/supabaseServer';

function greeting(now = new Date()) {
  const h = now.getHours();
  if (h < 6) return 'Boa madrugada';
  if (h < 12) return 'Bom dia';
  if (h < 20) return 'Boa tarde';
  return 'Boa noite';
}
function isPresencial(kind: unknown) {
  if (!kind) return false;
  const k = String(kind).toLowerCase();
  return k === 'in_person' || k === 'presencial' || k === 'presença' || k === 'presenca';
}

export default async function ClientsDashboardPage() {
  const sb = createServerClient();

  let name: string | null = null;
  let todaySession: any | null = null;
  let presencialToday = false;

  try {
    const { data: { user } } = await sb.auth.getUser();
    if (user) {
      const prof = await sb.from('profiles').select('full_name').eq('id', user.id).maybeSingle();
      name = (prof.data as any)?.full_name ?? null;

      const start = new Date(); start.setHours(0, 0, 0, 0);
      const end = new Date();   end.setHours(23, 59, 59, 999);

      const { data: sess } = await sb
        .from('sessions')
        .select('id, title, start_at, end_at, kind, status, trainer:profiles!sessions_trainer_id_fkey(full_name)')
        .eq('client_id', user.id)
        .gte('start_at', start.toISOString())
        .lte('start_at', end.toISOString())
        .order('start_at', { ascending: true })
        .limit(1);

      if (sess && sess.length > 0) {
        const rawTrainer = (sess[0] as any)?.trainer;
        // ✅ robusto a objeto OU array
        const trainerName = Array.isArray(rawTrainer)
          ? rawTrainer[0]?.full_name ?? null
          : rawTrainer?.full_name ?? null;

        todaySession = {
          id: String(sess[0].id),
          title: (sess[0] as any).title ?? 'Sessão',
          start_at: (sess[0] as any).start_at,
          end_at: (sess[0] as any).end_at ?? null,
          kind: (sess[0] as any).kind ?? null,
          status: (sess[0] as any).status ?? null,
          trainer: trainerName,
        };
        presencialToday = isPresencial(todaySession.kind);
      }
    }
  } catch {}

  return (
    <Stack spacing={3}>
      <Paper elevation={0} sx={{ p: 2, border: 1, borderColor: 'divider', borderRadius: 2, bgcolor: 'background.paper' }}>
        <Typography variant="h6" fontWeight={800}>
          {greeting()} {name ? `, ${name}` : '💪'}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Aqui tens o teu “treino do dia” e a pergunta rápida para registares como te sentes.
        </Typography>
      </Paper>

      {presencialToday && (
        <Alert severity="info" icon={<BoltOutlined />}>
          <AlertTitle>🔔 Sessão presencial hoje</AlertTitle>
          Tens uma sessão presencial marcada para hoje. Confere horário e material necessário.
        </Alert>
      )}

      <Grid container spacing={2}>
        <Grid item xs={12} sm={6} lg={3}>
          <KpiCard title="Semanas de treino" value={12} delta={2.1} sparkData={[8,9,9,10,11,11,12]} />
        </Grid>
        <Grid item xs={12} sm={6} lg={3}>
          <KpiCard title="Sessões concluídas" value={37} delta={4.0} sparkData={[30,31,33,34,35,36,37]} />
        </Grid>
        <Grid item xs={12} sm={6} lg={3}>
          <KpiCard title="Dias de descanso" value={2} />
        </Grid>
        <Grid item xs={12} sm={6} lg={3}>
          <KpiCard title="Séries totais (semana)" value={148} />
        </Grid>
      </Grid>

      <ClientDailyCard session={todaySession} />
      <ClientCheckinCard />
      <ClientCheckinHistoryCard />
    </Stack>
  );
}
