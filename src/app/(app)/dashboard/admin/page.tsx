import * as React from 'react';
import {
  Box,
  Card,
  CardContent,
  CardHeader,
  Chip,
  Divider,
  Grid,
  Stack,
  Typography,
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
} from '@mui/material';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import PersonAddAlt1Icon from '@mui/icons-material/PersonAddAlt1';
import PendingActionsIcon from '@mui/icons-material/PendingActions';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import GroupIcon from '@mui/icons-material/Group';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import { tryCreateServerClient } from '@/lib/supabaseServer';
import { getSessionUserSafe } from '@/lib/session-bridge';
import MotivationAdminCard from '@/components/admin/MotivationAdminCard';

async function loadAdminDashboard() {
  const sb = tryCreateServerClient();
  if (!sb) {
    return {
      totals: { users: 0, clients: 0, trainers: 0, sessionsToday: 0, pendingApprovals: 0 },
      recentUsers: [],
      topTrainers: [],
    };
  }

  const now = new Date();
  const startToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startTomorrow = new Date(startToday);
  startTomorrow.setDate(startTomorrow.getDate() + 1);

  const sevenDays = new Date(startToday);
  sevenDays.setDate(sevenDays.getDate() + 7);

  const [usersCount, clientsCount, trainersCount, pendingCount, sessionsToday] = await Promise.all([
    sb.from('users').select('*', { count: 'exact', head: true }),
    sb.from('users').select('*', { count: 'exact', head: true }).eq('role', 'CLIENT'),
    sb.from('users').select('*', { count: 'exact', head: true }).in('role', ['TRAINER', 'PT']),
    sb.from('users').select('*', { count: 'exact', head: true }).eq('status', 'PENDING'),
    sb
      .from('sessions')
      .select('id', { count: 'exact', head: true })
      .gte('start_time', startToday.toISOString())
      .lt('start_time', startTomorrow.toISOString()),
  ]).then((results) => results.map((r) => r.count ?? 0));

  const { data: lastUsers } = await sb
    .from('users')
    .select('id,name,email,created_at')
    .order('created_at', { ascending: false })
    .limit(5);

  const { data: sessionsUpcoming } = await sb
    .from('sessions')
    .select('trainer_id, start_time')
    .gte('start_time', startToday.toISOString())
    .lt('start_time', sevenDays.toISOString());

  const trainerCounts = new Map<string, number>();
  for (const row of sessionsUpcoming ?? []) {
    if (!row?.trainer_id) continue;
    trainerCounts.set(row.trainer_id, (trainerCounts.get(row.trainer_id) ?? 0) + 1);
  }
  const trainerIds = Array.from(trainerCounts.keys());
  const trainerProfiles: Record<string, { name: string }> = {};
  if (trainerIds.length) {
    const { data: trainers } = await sb
      .from('users')
      .select('id,name,email')
      .in('id', trainerIds);
    for (const t of trainers ?? []) {
      if (!t?.id) continue;
      trainerProfiles[String(t.id)] = { name: t.name ?? t.email ?? String(t.id) };
    }
  }

  const topTrainers = Array.from(trainerCounts.entries())
    .map(([id, total]) => ({
      id,
      name: trainerProfiles[id]?.name ?? id,
      total,
    }))
    .sort((a, b) => b.total - a.total)
    .slice(0, 5);

  return {
    totals: {
      users: usersCount,
      clients: clientsCount,
      trainers: trainersCount,
      sessionsToday,
      pendingApprovals: pendingCount,
    },
    recentUsers: (lastUsers ?? []).map((u) => ({
      id: String(u.id),
      name: u.name ?? u.email ?? 'Utilizador',
      email: u.email ?? null,
      createdAt: u.created_at ?? null,
    })),
    topTrainers,
  };
}

function greetingMessage() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Bom dia';
  if (hour < 18) return 'Boa tarde';
  return 'Boa noite';
}

function firstName(full?: string | null) {
  if (!full) return 'Admin';
  const parts = full.trim().split(/\s+/);
  return parts[0] ?? full;
}

export const dynamic = 'force-dynamic';

export default async function AdminDashboardPage() {
  const session = await getSessionUserSafe();
  const name = firstName(session?.user?.name ?? session?.user?.email ?? undefined);
  const data = await loadAdminDashboard();

  const quickMetrics = [
    {
      label: 'Utilizadores',
      value: data.totals.users,
      icon: <GroupIcon fontSize="small" />,
      hint: `${data.totals.clients} clientes • ${data.totals.trainers} PTs`,
    },
    {
      label: 'Sessões hoje',
      value: data.totals.sessionsToday,
      icon: <EventAvailableIcon fontSize="small" />,
      hint: 'próximas 24h',
    },
    {
      label: 'Aprovações pendentes',
      value: data.totals.pendingApprovals,
      icon: <PendingActionsIcon fontSize="small" />,
      hint: 'aguardando revisão',
    },
    {
      label: 'Novos registos',
      value: data.recentUsers.length,
      icon: <PersonAddAlt1Icon fontSize="small" />,
      hint: 'últimos dias',
    },
  ];

  const sessionsNext7 = data.topTrainers.reduce((sum, row) => sum + (row.total ?? 0), 0);
  const pulse = [
    {
      label: 'Clientes activos',
      value: data.totals.clients,
      hint: `${data.totals.users ? Math.round((data.totals.clients / Math.max(data.totals.users, 1)) * 100) : 0}% da base`,
    },
    {
      label: 'PTs com agenda',
      value: data.topTrainers.length,
      hint: `${data.totals.trainers} PTs totais`,
    },
    {
      label: 'Sessões (7 dias)',
      value: sessionsNext7,
      hint: 'inclui próximas 24h',
    },
    {
      label: 'Pendências críticas',
      value: data.totals.pendingApprovals,
      hint: 'a aprovar hoje',
    },
  ];

  return (
    <Stack spacing={3} sx={{ pb: 4 }}>
      <Box
        sx={{
          borderRadius: 4,
          p: { xs: 3, md: 4 },
          background: 'linear-gradient(135deg, rgba(33,150,243,0.85) 0%, rgba(103,58,183,0.9) 100%)',
          color: 'common.white',
          boxShadow: '0 30px 60px -40px rgba(33,150,243,0.8)',
        }}
      >
        <Stack spacing={2}>
          <Typography variant="h4" fontWeight={800}>
            {greetingMessage()}, {name}!
          </Typography>
          <Typography variant="body1" sx={{ opacity: 0.9, maxWidth: 520 }}>
            Mantém o controlo da operação — aprova novos utilizadores, acompanha os treinadores e garante que cada cliente tem um plano actual.
          </Typography>
          <Grid container spacing={2}>
            {quickMetrics.map((metric) => (
              <Grid item xs={6} sm={6} md={3} key={metric.label}>
                <Box
                  sx={{
                    borderRadius: 3,
                    px: 2,
                    py: 2,
                    bgcolor: 'rgba(255,255,255,0.12)',
                    border: '1px solid rgba(255,255,255,0.18)',
                    backdropFilter: 'blur(6px)',
                  }}
                >
                  <Stack direction="row" alignItems="center" spacing={1.5}>
                    <Avatar sx={{ width: 36, height: 36, bgcolor: 'rgba(255,255,255,0.18)' }}>
                      {metric.icon}
                    </Avatar>
                    <Box>
                      <Typography variant="subtitle2" sx={{ opacity: 0.75 }}>
                        {metric.label}
                      </Typography>
                      <Typography variant="h5" fontWeight={700}>
                        {metric.value}
                      </Typography>
                      <Typography variant="caption" sx={{ opacity: 0.7 }}>
                        {metric.hint}
                      </Typography>
                    </Box>
                  </Stack>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Stack>
      </Box>

      <Box
        sx={{
          position: 'relative',
          overflow: 'hidden',
          borderRadius: 4,
          p: { xs: 2.5, md: 3 },
          background:
            'radial-gradient(circle at top left, color-mix(in srgb, var(--mui-palette-primary-main) 32%, transparent), transparent 55%), ' +
            'radial-gradient(circle at 80% 20%, color-mix(in srgb, var(--mui-palette-secondary-main) 24%, transparent), transparent 60%), ' +
            'linear-gradient(120deg, color-mix(in srgb, var(--mui-palette-background-paper) 94%, transparent), color-mix(in srgb, var(--mui-palette-background-default) 92%, transparent))',
          border: '1px solid var(--mui-palette-divider)',
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            pointerEvents: 'none',
            background: 'radial-gradient(120% 120% at 20% 0%, rgba(255,255,255,0.08), transparent 60%)',
            mixBlendMode: 'screen',
          }}
        />
        <Stack spacing={1.5} sx={{ position: 'relative' }}>
          <Typography variant="overline" sx={{ letterSpacing: 2, opacity: 0.7 }}>
            Pulso do sistema
          </Typography>
          <Grid container spacing={2}>
            {pulse.map((metric) => (
              <Grid item xs={6} md={3} key={metric.label}>
                <Box sx={{ display: 'grid', gap: 0.5 }}>
                  <Typography variant="caption" sx={{ opacity: 0.7, letterSpacing: 0.4 }}>
                    {metric.label}
                  </Typography>
                  <Typography variant="h5" fontWeight={800}>
                    {metric.value}
                  </Typography>
                  <Typography variant="caption" sx={{ opacity: 0.6 }}>
                    {metric.hint}
                  </Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Stack>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} md={7}>
          <Card variant="outlined" sx={{ borderRadius: 3 }}>
            <CardHeader
              title="Últimos registos"
              subheader="Acompanha quem acabou de entrar na plataforma"
              action={<Chip label={`${data.recentUsers.length}`} color="primary" variant="outlined" />}
            />
            <CardContent>
              {data.recentUsers.length === 0 ? (
                <Typography variant="body2" color="text.secondary">
                  Ainda não há novos registos.
                </Typography>
              ) : (
                <List disablePadding>
                  {data.recentUsers.map((u) => (
                    <React.Fragment key={u.id}>
                      <ListItem sx={{ px: 0 }}>
                        <ListItemAvatar>
                          <Avatar sx={{ bgcolor: 'primary.main', color: 'primary.contrastText' }}>
                            <PersonAddAlt1Icon fontSize="small" />
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={u.name}
                          secondary={u.createdAt ? new Date(String(u.createdAt)).toLocaleString('pt-PT') : '—'}
                        />
                      </ListItem>
                      <Divider component="li" sx={{ borderColor: 'divider', ml: 7 }} />
                    </React.Fragment>
                  ))}
                </List>
              )}
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={5}>
          <Card variant="outlined" sx={{ borderRadius: 3, height: '100%' }}>
            <CardHeader
              title="PTs mais activos"
              subheader="Sessões marcadas nos próximos 7 dias"
              action={data.topTrainers.length > 0 ? <TrendingUpIcon color="primary" /> : null}
            />
            <CardContent>
              {data.topTrainers.length === 0 ? (
                <Typography variant="body2" color="text.secondary">
                  Sem sessões agendadas nos próximos dias.
                </Typography>
              ) : (
                <Stack spacing={1.5}>
                  {data.topTrainers.map((row) => (
                    <Stack
                      key={row.id}
                      direction="row"
                      alignItems="center"
                      spacing={1.5}
                      sx={{
                        p: 1.5,
                        borderRadius: 2,
                        border: '1px solid',
                        borderColor: 'divider',
                      }}
                    >
                      <Avatar sx={{ bgcolor: 'secondary.light', color: 'secondary.dark' }}>
                        <FitnessCenterIcon fontSize="small" />
                      </Avatar>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="subtitle2" fontWeight={600}>
                          {row.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {row.total} sessões agendadas
                        </Typography>
                      </Box>
                      <Chip label={`+${row.total}`} color="secondary" variant="outlined" />
                    </Stack>
                  ))}
                </Stack>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <MotivationAdminCard />
        </Grid>
        <Grid item xs={12} md={6}>
          <Card variant="outlined" sx={{ borderRadius: 3, height: '100%' }}>
            <CardHeader
              title="Notas rápidas"
              subheader="Assinala tarefas internas ou decisões recentes"
            />
            <CardContent>
              <Typography variant="body2" color="text.secondary">
                Usa este espaço para registar decisões importantes, alinhamentos de equipa ou tópicos a acompanhar na próxima reunião.
              </Typography>
              <Box sx={{ mt: 2, p: 2, borderRadius: 2, bgcolor: 'action.hover', border: '1px dashed', borderColor: 'divider' }}>
                <Typography variant="caption" color="text.secondary">
                  Sugestão
                </Typography>
                <Typography variant="body2">
                  Activar alertas automáticos quando um PT fica sem sessões atribuídas durante mais de 7 dias.
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Stack>
  );
}
