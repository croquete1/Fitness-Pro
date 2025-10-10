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
import { alpha } from '@mui/material/styles';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import PersonAddAlt1Icon from '@mui/icons-material/PersonAddAlt1';
import PendingActionsIcon from '@mui/icons-material/PendingActions';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import GroupIcon from '@mui/icons-material/Group';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import PlaceOutlinedIcon from '@mui/icons-material/PlaceOutlined';
import { tryCreateServerClient } from '@/lib/supabaseServer';
import { getSessionUserSafe } from '@/lib/session-bridge';
import MotivationAdminCard from '@/components/admin/MotivationAdminCard';
import AdminQuickNotesCard from '@/components/admin/AdminQuickNotesCard';
import { getSampleAdminDashboard } from '@/lib/fallback/users';

type AgendaRow = {
  id: string;
  start_time: string | null;
  trainer_id: string | null;
  trainer_name: string;
  client_id: string | null;
  client_name: string;
  location?: string | null;
};

type AdminDashboardData = {
  totals: {
    users: number;
    clients: number;
    trainers: number;
    sessionsToday: number;
    pendingApprovals: number;
  };
  recentUsers: Array<{ id: string; name: string; email: string | null; createdAt: string | null }>;
  topTrainers: Array<{ id: string; name: string; total: number }>;
  agenda: AgendaRow[];
};

async function loadAdminDashboard(): Promise<AdminDashboardData> {
  const sb = tryCreateServerClient();
  if (!sb) {
    const sample = getSampleAdminDashboard();
    return {
      totals: sample.totals,
      recentUsers: sample.recentUsers,
      topTrainers: sample.topTrainers,
      agenda: sample.agenda,
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
    .select('id, trainer_id, client_id, start_time, location')
    .gte('start_time', startToday.toISOString())
    .lt('start_time', sevenDays.toISOString())
    .order('start_time', { ascending: true });

  const trainerCounts = new Map<string, number>();
  const trainerIds = new Set<string>();
  const clientIds = new Set<string>();
  for (const row of sessionsUpcoming ?? []) {
    if (!row?.trainer_id) continue;
    const trainerId = String(row.trainer_id);
    trainerCounts.set(trainerId, (trainerCounts.get(trainerId) ?? 0) + 1);
    trainerIds.add(trainerId);
    if (row?.client_id) clientIds.add(String(row.client_id));
  }
  const trainerProfiles: Record<string, { name: string }> = {};
  if (trainerIds.size) {
    const { data: trainers } = await sb
      .from('users')
      .select('id,name,email')
      .in('id', Array.from(trainerIds));
    for (const t of trainers ?? []) {
      if (!t?.id) continue;
      trainerProfiles[String(t.id)] = { name: t.name ?? t.email ?? String(t.id) };
    }
  }

  const clientProfiles: Record<string, { name: string }> = {};
  if (clientIds.size) {
    const { data: clients } = await sb
      .from('users')
      .select('id,name,email')
      .in('id', Array.from(clientIds));
    for (const c of clients ?? []) {
      if (!c?.id) continue;
      clientProfiles[String(c.id)] = { name: c.name ?? c.email ?? String(c.id) };
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

  const agenda: AgendaRow[] = (sessionsUpcoming ?? []).map((session, index) => ({
    id: session?.id ? String(session.id) : `session-${index}`,
    start_time: session.start_time ?? null,
    trainer_id: session.trainer_id ? String(session.trainer_id) : null,
    trainer_name:
      (session.trainer_id && trainerProfiles[String(session.trainer_id)]?.name) ||
      (session.trainer_id ? String(session.trainer_id) : '—'),
    client_id: session.client_id ? String(session.client_id) : null,
    client_name:
      (session.client_id && clientProfiles[String(session.client_id)]?.name) ||
      (session.client_id ? String(session.client_id) : '—'),
    location: session.location ?? null,
  }));

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
    agenda,
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

  const agendaRows = data.agenda.slice(0, 6);

  const formatAgenda = (value: AgendaRow) => {
    if (!value.start_time) {
      return { day: 'Agendar', time: '—' };
    }
    const date = new Date(value.start_time);
    const day = date.toLocaleDateString('pt-PT', { weekday: 'short', day: '2-digit', month: 'short' });
    const time = date.toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' });
    return { day, time };
  };

  return (
    <Stack spacing={3} sx={{ pb: 4 }}>
      <Box
        sx={(theme) => ({
          borderRadius: 4,
          p: { xs: 3, md: 4 },
          background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, theme.palette.mode === 'dark' ? 0.92 : 0.82)} 0%, ${alpha(theme.palette.secondary.main, theme.palette.mode === 'dark' ? 0.88 : 0.76)} 100%)`,
          color: theme.palette.getContrastText(theme.palette.mode === 'dark' ? theme.palette.primary.dark : theme.palette.primary.main),
          boxShadow:
            theme.palette.mode === 'dark'
              ? '0 36px 90px -48px rgba(8,15,35,0.95)'
              : '0 40px 90px -50px rgba(10,22,51,0.35)',
          position: 'relative',
          overflow: 'hidden',
          '&::after': {
            content: "''",
            position: 'absolute',
            inset: 0,
            background:
              'radial-gradient(circle at 15% 10%, rgba(255,255,255,0.25), transparent 55%),' +
              'radial-gradient(circle at 80% 0%, rgba(255,255,255,0.18), transparent 50%)',
            opacity: theme.palette.mode === 'dark' ? 0.35 : 0.28,
            pointerEvents: 'none',
          },
        })}
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
                  sx={(theme) => ({
                    borderRadius: 3,
                    px: 2,
                    py: 2,
                    bgcolor:
                      theme.palette.mode === 'dark'
                        ? 'rgba(255,255,255,0.08)'
                        : alpha(theme.palette.common.white, 0.82),
                    border: '1px solid',
                    borderColor:
                      theme.palette.mode === 'dark'
                        ? alpha('#FFFFFF', 0.18)
                        : alpha(theme.palette.primary.main, 0.18),
                    boxShadow:
                      theme.palette.mode === 'dark'
                        ? 'inset 0 1px 0 rgba(255,255,255,0.04)'
                        : 'inset 0 1px 0 rgba(255,255,255,0.6)',
                    backdropFilter: 'blur(14px)',
                  })}
                >
                  <Stack direction="row" alignItems="center" spacing={1.5}>
                    <Avatar
                      sx={(theme) => ({
                        width: 36,
                        height: 36,
                        bgcolor:
                          theme.palette.mode === 'dark'
                            ? alpha('#FFFFFF', 0.18)
                            : alpha(theme.palette.primary.main, 0.12),
                        color:
                          theme.palette.mode === 'dark'
                            ? alpha('#FFFFFF', 0.9)
                            : theme.palette.primary.main,
                      })}
                    >
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
        sx={(theme) => ({
          position: 'relative',
          overflow: 'hidden',
          borderRadius: 4,
          p: { xs: 2.5, md: 3 },
          background:
            theme.palette.mode === 'dark'
              ? 'linear-gradient(140deg, rgba(56,189,248,0.16) 0%, rgba(124,58,237,0.18) 100%)'
              : 'linear-gradient(140deg, rgba(33,150,243,0.08) 0%, rgba(156,39,176,0.08) 100%)',
          border: `1px solid ${alpha(theme.palette.primary.main, theme.palette.mode === 'dark' ? 0.25 : 0.16)}`,
        })}
      >
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            pointerEvents: 'none',
            background: (theme) =>
              theme.palette.mode === 'dark'
                ? 'radial-gradient(120% 120% at 20% 0%, rgba(255,255,255,0.12), transparent 60%)'
                : 'radial-gradient(120% 120% at 20% 0%, rgba(255,255,255,0.2), transparent 60%)',
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
        <Grid item xs={12} lg={7}>
          <Card variant="outlined" sx={{ borderRadius: 3, height: '100%' }}>
            <CardHeader
              title="Agenda PTs"
              subheader="Próximas sessões nos próximos 7 dias"
              action={<Chip label={`${data.totals.sessionsToday} hoje`} size="small" color="primary" variant="outlined" />}
            />
            <CardContent sx={{ pt: 0 }}>
              {agendaRows.length === 0 ? (
                <Typography variant="body2" color="text.secondary">
                  Sem sessões agendadas para os próximos dias.
                </Typography>
              ) : (
                <List disablePadding>
                  {agendaRows.map((item, index) => {
                    const { day, time } = formatAgenda(item);
                    return (
                      <React.Fragment key={item.id}>
                        <ListItem alignItems="flex-start" sx={{ px: 0 }}>
                          <ListItemAvatar>
                            <Avatar sx={{ bgcolor: 'primary.main', color: 'primary.contrastText' }}>
                              <AccessTimeIcon fontSize="small" />
                            </Avatar>
                          </ListItemAvatar>
                          <Box sx={{ flex: 1, display: 'grid', gap: 0.5 }}>
                            <Stack
                              direction={{ xs: 'column', sm: 'row' }}
                              spacing={1}
                              alignItems={{ xs: 'flex-start', sm: 'center' }}
                            >
                              <Chip
                                label={`${day.toUpperCase()} · ${time}`}
                                size="small"
                                color="primary"
                                variant="outlined"
                                sx={{ fontWeight: 600 }}
                              />
                              <Typography variant="subtitle2" fontWeight={600}>
                                {item.client_name}
                              </Typography>
                            </Stack>
                            <Stack
                              direction={{ xs: 'column', sm: 'row' }}
                              spacing={1}
                              alignItems={{ xs: 'flex-start', sm: 'center' }}
                            >
                              <Typography variant="caption" color="text.secondary">
                                PT: {item.trainer_name}
                              </Typography>
                              {item.location ? (
                                <Chip
                                  icon={<PlaceOutlinedIcon fontSize="small" />}
                                  label={item.location}
                                  size="small"
                                  variant="outlined"
                                />
                              ) : null}
                            </Stack>
                          </Box>
                        </ListItem>
                        {index < agendaRows.length - 1 && (
                          <Divider component="li" sx={{ borderColor: 'divider', ml: 7 }} />
                        )}
                      </React.Fragment>
                    );
                  })}
                </List>
              )}
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} lg={5}>
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
                        transition: (theme) => theme.transitions.create('transform'),
                        '&:hover': { transform: 'translateY(-2px)' },
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
        <Grid item xs={12}>
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
                  {data.recentUsers.map((u, index) => (
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
                      {index < data.recentUsers.length - 1 && (
                        <Divider component="li" sx={{ borderColor: 'divider', ml: 7 }} />
                      )}
                    </React.Fragment>
                  ))}
                </List>
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
          <AdminQuickNotesCard />
        </Grid>
      </Grid>
    </Stack>
  );
}
