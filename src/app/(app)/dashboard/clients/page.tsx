export const dynamic = 'force-dynamic';

import { redirect } from 'next/navigation';
import { getSessionUserSafe } from '@/lib/session-bridge';
import { toAppRole } from '@/lib/roles';
import { createServerClient } from '@/lib/supabaseServer';

import GreetingBanner from '@/components/GreetingBanner';
import LiveBanners from '@/components/dashboard/LiveBanners';
import PushBootstrap from '@/components/dashboard/PushBootstrap';
import KpiCard from '@/components/dashboard/KpiCard';
import MotivationCard from '@/components/dashboard/MotivationCard';
import ProgressMini from '@/components/dashboard/ProgressMini';

import {
  Box, Container, Grid, Paper, Typography,
  Table, TableHead, TableBody, TableRow, TableCell, Button,
} from '@mui/material';
import Link from 'next/link';

type SB = ReturnType<typeof createServerClient>;

async function safeCount(sb: SB, table: string, build?: (q: any) => any) {
  try {
    let q: any = sb.from(table).select('*', { count: 'exact', head: true });
    if (build) q = build(q);
    const { count } = await q;
    return count ?? 0;
  } catch { return 0; }
}

function fmtDate(iso?: string | null) {
  try { return iso ? new Date(iso).toLocaleString('pt-PT') : '—'; }
  catch { return '—'; }
}

export default async function ClientDashboard() {
  const sessionUser = await getSessionUserSafe();
  if (!sessionUser?.user?.id) redirect('/login');

  const role = toAppRole(sessionUser.user.role) ?? 'CLIENT';
  if (role !== 'CLIENT' && role !== 'ADMIN') redirect('/dashboard');

  const sb = createServerClient();

  const { data: prof } = await sb
    .from('profiles')
    .select('name, avatar_url')
    .eq('id', sessionUser.user.id)
    .maybeSingle();

  const now = new Date();
  const in7 = new Date(now); in7.setDate(now.getDate() + 7);

  const [myPlans, myUpcoming, unread, upcomingRows] = await Promise.all([
    safeCount(sb, 'training_plans', (q) => q.eq('client_id', sessionUser.user.id)),
    safeCount(sb, 'sessions', (q) =>
      q.eq('client_id', sessionUser.user.id)
       .gte('scheduled_at', now.toISOString())
       .lt('scheduled_at', in7.toISOString())
    ),
    safeCount(sb, 'notifications', (q) =>
      q.eq('user_id', sessionUser.user.id).eq('read', false)
    ),
    sb.from('sessions')
      .select('id, scheduled_at, location, status, trainer_id')
      .eq('client_id', sessionUser.user.id)
      .gte('scheduled_at', now.toISOString())
      .order('scheduled_at', { ascending: true })
      .limit(6)
      .then(({ data }) => data ?? []),
  ]);

  async function loadHistory() {
    const candidates = [
      ['profile_metrics_history', 'measured_at'],
      ['metrics_history', 'measured_at'],
      ['metrics_log', 'created_at'],
    ] as const;
    for (const [table, dateCol] of candidates) {
      try {
        const { data } = await sb
          .from(table as any)
          .select(`user_id, ${dateCol}, weight_kg`)
          .eq('user_id', sessionUser.user.id)
          .order(dateCol as any, { ascending: true })
          .limit(24);
        if (data?.length) return (data as any[]).map((r) => ({
          date: r[dateCol], weight: r.weight_kg ?? null,
        }));
      } catch {}
    }
    try {
      const { data } = await sb
        .from('profile_metrics')
        .select('weight_kg, updated_at')
        .eq('user_id', sessionUser.user.id)
        .maybeSingle();
      if (data) return [{ date: data.updated_at ?? new Date().toISOString(), weight: data.weight_kg ?? null }];
    } catch {}
    return [];
  }
  const points = await loadHistory();
  const name = prof?.name ?? sessionUser.user.name ?? sessionUser.user.email ?? 'Utilizador';

  return (
    <Box sx={{ py: 2 }}>
      <Container maxWidth="lg">
        <Box sx={{ mb: 2 }}>
          <GreetingBanner name={name} />
        </Box>
        <LiveBanners />
        <PushBootstrap />

        <Grid container spacing={2} sx={{ mt: 0 }}>
          <Grid item xs={12} sm={6} md={4}>
            <KpiCard label="Os meus planos" value={myPlans} variant="accent" icon="📝" />
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <KpiCard label="Sessões (7d)" value={myUpcoming} variant="success" icon="📅" />
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <KpiCard
              label="Notificações"
              value={unread}
              variant="warning"
              icon="🔔"
              footer={<Typography variant="caption" color="text.secondary">por ler</Typography>}
            />
          </Grid>
        </Grid>

        <Grid container spacing={2} sx={{ mt: 0 }}>
          <Grid item xs={12} md={6}><MotivationCard /></Grid>
          <Grid item xs={12} md={6}><ProgressMini points={points} /></Grid>
        </Grid>

        <Paper variant="outlined" sx={{ mt: 2, p: 2, borderRadius: 3 }}>
          <Typography variant="subtitle2" fontWeight={800} sx={{ mb: 1 }}>
            Próximas sessões
          </Typography>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Data</TableCell>
                <TableCell>Local</TableCell>
                <TableCell>Estado</TableCell>
                <TableCell>PT</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {upcomingRows.map((s: any) => (
                <TableRow key={s.id}>
                  <TableCell>{fmtDate(s.scheduled_at)}</TableCell>
                  <TableCell>{s.location ?? '—'}</TableCell>
                  <TableCell>{s.status ?? '—'}</TableCell>
                  <TableCell>{s.trainer_id ?? '—'}</TableCell>
                </TableRow>
              ))}
              {upcomingRows.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} align="center">Sem sessões marcadas.</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
          <Box sx={{ mt: 1, display: 'flex', justifyContent: 'flex-end' }}>
            <Button component={Link} href="/dashboard/sessions" size="small" variant="text">
              ver todas
            </Button>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
}
