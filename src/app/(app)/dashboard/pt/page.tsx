// src/app/(app)/dashboard/pt/page.tsx
import * as React from 'react';
import Link from 'next/link';
import {
  Alert, AlertTitle, Button, Grid, Paper, Stack, Typography,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import CalendarMonthOutlined from '@mui/icons-material/CalendarMonthOutlined';
import BoltOutlined from '@mui/icons-material/BoltOutlined';

import KpiCard from '@/components/ui/KpiCard';
import PTAgendaCard, { type PTSess } from '@/components/dashboard/PTAgendaCard';
import TaskListPT from '@/components/dashboard/TaskListPT';
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

export default async function PTDashboardPage() {
  const sb = createServerClient();

  let sessions: PTSess[] = [];
  let trainerName: string | null = null;
  let presencialCount = 0;

  try {
    const { data: { user } } = await sb.auth.getUser();

    if (user) {
      // nome do PT (opcional)
      const prof = await sb.from('profiles').select('full_name').eq('id', user.id).maybeSingle();
      trainerName = (prof.data as any)?.full_name ?? null;

      // janela do dia de hoje
      const start = new Date(); start.setHours(0, 0, 0, 0);
      const end = new Date();   end.setHours(23, 59, 59, 999);

      const { data, error } = await sb
        .from('sessions')
        .select(`
          id, title, start_at, end_at, kind, status,
          client:profiles!sessions_client_id_fkey(full_name)
        `)
        .eq('trainer_id', user.id)
        .gte('start_at', start.toISOString())
        .lte('start_at', end.toISOString())
        .order('start_at', { ascending: true });

      if (!error && Array.isArray(data)) {
        sessions = data.map((d: any) => ({
          id: String(d.id),
          title: d.title ?? 'Sessão',
          client: d.client?.full_name ?? null,
          start_at: d.start_at,
          end_at: d.end_at ?? null,
          kind: d.kind ?? null,
          status: d.status ?? null,
        }));
        presencialCount = sessions.reduce((n, s) => n + (isPresencial(s.kind) ? 1 : 0), 0);
      }
    }
  } catch {
    // silencioso
  }

  return (
    <Stack spacing={3}>
      {/* Greeting */}
      <Paper elevation={0} sx={{ p: 2, border: 1, borderColor: 'divider', borderRadius: 2, bgcolor: 'background.paper' }}>
        <Typography variant="h6" fontWeight={800}>
          {greeting()} {trainerName ? `, ${trainerName}` : '🧑‍🏫'}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Eis o teu resumo de hoje. Bons treinos! 💪
        </Typography>
      </Paper>

      {/* Aviso de sessões presenciais */}
      {presencialCount > 0 && (
        <Alert severity="info" icon={<BoltOutlined />}>
          <AlertTitle>🔔 Sessões presenciais hoje</AlertTitle>
          Tens <strong>{presencialCount}</strong> sessão(ões) presenciais agendadas para hoje. Confirma materiais/tempo de deslocação.
        </Alert>
      )}

      {/* KPIs */}
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6} lg={3}>
          <KpiCard title="Clientes ativos" value={23} delta={2.4} sparkData={[18,19,19,20,21,22,23]} />
        </Grid>
        <Grid item xs={12} sm={6} lg={3}>
          <KpiCard title="Sessões esta semana" value={31} delta={-3.1} sparkData={[36,35,34,33,32,31,31]} />
        </Grid>
        <Grid item xs={12} sm={6} lg={3}>
          <KpiCard title="Planos em rascunho" value={5} />
        </Grid>
        <Grid item xs={12} sm={6} lg={3}>
          <KpiCard title="Feedbacks pendentes" value={7} />
        </Grid>
      </Grid>

      {/* Agenda do dia */}
      <PTAgendaCard sessions={sessions} />

      {/* Ações rápidas */}
      <Stack direction="row" gap={1} flexWrap="wrap">
        <Button component={Link} href="/dashboard/pt/sessions/new" variant="contained" startIcon={<AddIcon />}>
          Marcar sessão
        </Button>
        <Button component={Link} href="/dashboard/pt/sessions" variant="outlined" startIcon={<CalendarMonthOutlined />}>
          Ver todas
        </Button>
      </Stack>

      {/* Tarefas do dia (interativo + persistência) */}
      <TaskListPT />
    </Stack>
  );
}
