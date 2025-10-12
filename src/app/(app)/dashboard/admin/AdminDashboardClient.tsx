'use client';

import * as React from 'react';
import {
  Box,
  Grid,
  Stack,
  Typography,
  Avatar,
  Card,
  CardContent,
  CardHeader,
  Chip,
  Divider,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  useTheme,
} from '@mui/material';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import PersonAddAlt1Icon from '@mui/icons-material/PersonAddAlt1';
import PendingActionsIcon from '@mui/icons-material/PendingActions';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import GroupIcon from '@mui/icons-material/Group';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import PlaceOutlinedIcon from '@mui/icons-material/PlaceOutlined';
import AdminQuickNotesCard from '@/components/admin/AdminQuickNotesCard';
import MotivationAdminCard from '@/components/admin/MotivationAdminCard';
import { greetingForDate } from '@/lib/time';

export type AgendaRow = {
  id: string;
  start_time: string | null;
  trainer_id: string | null;
  trainer_name: string;
  client_id: string | null;
  client_name: string;
  location?: string | null;
};

export type AdminDashboardData = {
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

type Props = {
  name: string;
  data: AdminDashboardData;
  supabase: boolean;
};

function formatAgenda(value: AgendaRow) {
  if (!value.start_time) {
    return { day: 'Agendar', time: '—' };
  }
  const date = new Date(value.start_time);
  const day = date.toLocaleDateString('pt-PT', { weekday: 'short', day: '2-digit', month: 'short' });
  const time = date.toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' });
  return { day, time };
}

export default function AdminDashboardClient({ name, data, supabase }: Props) {
  const theme = useTheme();
  const greeting = React.useMemo(() => {
    const { label, emoji } = greetingForDate();
    return `${emoji} ${label}${name ? `, ${name}` : ''}!`;
  }, [name]);

  const quickMetrics = [
    {
      label: 'Utilizadores',
      value: data.totals.users,
      icon: <GroupIcon fontSize="small" />,
      hint: `${data.totals.clients} clientes • ${data.totals.trainers} Personal Trainers`,
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
      hint: 'aguardam revisão',
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
      label: 'Personal Trainers com agenda',
      value: data.topTrainers.length,
      hint: `${data.totals.trainers} Personal Trainers totais`,
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

  return (
    <Stack spacing={3} sx={{ pb: 6 }}>
      <Box
        sx={{
          borderRadius: 4,
          p: { xs: 3, md: 4 },
          background:
            theme.palette.mode === 'dark'
              ? `linear-gradient(135deg, rgba(77,124,255,0.38) 0%, rgba(16,185,129,0.25) 100%)`
              : `linear-gradient(135deg, rgba(77,124,255,0.22) 0%, rgba(16,185,129,0.18) 100%)`,
          color: theme.palette.getContrastText(
            theme.palette.mode === 'dark' ? theme.palette.primary.dark : theme.palette.primary.main,
          ),
          boxShadow:
            theme.palette.mode === 'dark'
              ? '0 40px 120px -60px rgba(8,20,45,0.85)'
              : '0 35px 110px -70px rgba(10,22,51,0.35)',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            pointerEvents: 'none',
            background:
              theme.palette.mode === 'dark'
                ? 'radial-gradient(circle at 20% 20%, rgba(255,255,255,0.12), transparent 60%)'
                : 'radial-gradient(circle at 20% 20%, rgba(255,255,255,0.36), transparent 60%)',
            opacity: 0.65,
          }}
        />
        <Stack spacing={2} sx={{ position: 'relative' }}>
          <Typography variant="overline" sx={{ letterSpacing: 1.5, opacity: 0.7 }}>
            {supabase ? 'Dados em directo' : 'Modo offline'}
          </Typography>
          <Typography variant="h4" fontWeight={800}>{greeting}</Typography>
          <Typography variant="body1" sx={{ opacity: 0.9, maxWidth: 520 }}>
            Mantém o controlo da operação — aprova novos utilizadores, acompanha os Personal Trainers e garante que cada cliente tem um plano actual.
          </Typography>
          <Grid container spacing={2}>
            {quickMetrics.map((metric) => (
              <Grid item xs={6} sm={6} md={3} key={metric.label}>
                <Box
                  sx={{
                    borderRadius: 3,
                    px: 2,
                    py: 2,
                    bgcolor:
                      theme.palette.mode === 'dark'
                        ? 'rgba(255,255,255,0.08)'
                        : 'rgba(255,255,255,0.82)',
                    border: '1px solid',
                    borderColor:
                      theme.palette.mode === 'dark'
                        ? 'rgba(255,255,255,0.18)'
                        : 'rgba(29,78,216,0.18)',
                    backdropFilter: 'blur(14px)',
                  }}
                >
                  <Stack direction="row" alignItems="center" spacing={1.5}>
                    <Avatar
                      sx={{
                        width: 36,
                        height: 36,
                        bgcolor:
                          theme.palette.mode === 'dark'
                            ? 'rgba(255,255,255,0.16)'
                            : 'rgba(29,78,216,0.18)',
                        color:
                          theme.palette.mode === 'dark'
                            ? 'rgba(255,255,255,0.88)'
                            : theme.palette.primary.main,
                      }}
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
        sx={{
          position: 'relative',
          overflow: 'hidden',
          borderRadius: 4,
          p: { xs: 2.5, md: 3 },
          background:
            theme.palette.mode === 'dark'
              ? 'linear-gradient(140deg, rgba(56,189,248,0.16) 0%, rgba(124,58,237,0.18) 100%)'
              : 'linear-gradient(140deg, rgba(33,150,243,0.08) 0%, rgba(156,39,176,0.08) 100%)',
          border: `1px solid rgba(99,102,241,${theme.palette.mode === 'dark' ? 0.25 : 0.16})`,
        }}
      >
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
          <Card variant="outlined" sx={{ borderRadius: 3, height: '100%' }}>
            <CardHeader
              title="Próximas sessões"
              subheader={supabase ? 'Agenda em directo' : 'Amostra local'}
              action={<Chip label={`${agendaRows.length}`} color="primary" variant="outlined" size="small" />}
            />
            <CardContent sx={{ pt: 0 }}>
              {agendaRows.length === 0 ? (
                <Typography variant="body2" color="text.secondary">
                  Não existem sessões marcadas. Cria uma nova sessão para manter os clientes activos.
                </Typography>
              ) : (
                <List disablePadding>
                  {agendaRows.map((session, index) => {
                    const { day, time } = formatAgenda(session);
                    return (
                      <React.Fragment key={session.id}>
                        <ListItem sx={{ px: 0 }}>
                          <ListItemAvatar>
                            <Avatar sx={{ bgcolor: 'primary.light', color: 'primary.dark' }}>
                              <AccessTimeIcon fontSize="small" />
                            </Avatar>
                          </ListItemAvatar>
                          <ListItemText
                            primary={
                              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} alignItems={{ xs: 'flex-start', sm: 'center' }}>
                                <Chip label={`${day.toUpperCase()} · ${time}`} size="small" color="primary" variant="outlined" />
                                <Typography variant="subtitle2" fontWeight={600}>
                                  {session.client_name}
                                </Typography>
                              </Stack>
                            }
                            secondary={
                              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} alignItems={{ xs: 'flex-start', sm: 'center' }}>
                                <Typography variant="caption" color="text.secondary">
                                  {session.location ? `Local: ${session.location}` : 'Local a definir'}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  PT: {session.trainer_name}
                                </Typography>
                              </Stack>
                            }
                          />
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

        <Grid item xs={12} md={5}>
          <Stack spacing={3}>
            <Card variant="outlined" sx={{ borderRadius: 3 }}>
              <CardHeader
                title="Trainers em destaque"
                subheader="Top sessões na última semana"
                avatar={<Avatar sx={{ bgcolor: 'primary.main', color: 'primary.contrastText' }}><TrendingUpIcon /></Avatar>}
              />
              <CardContent sx={{ pt: 0 }}>
                {data.topTrainers.length === 0 ? (
                  <Typography variant="body2" color="text.secondary">
                    Sem dados suficientes para destacar Personal Trainers.
                  </Typography>
                ) : (
                  <List disablePadding>
                    {data.topTrainers.map((trainer, index) => (
                      <React.Fragment key={trainer.id}>
                        <ListItem sx={{ px: 0 }}>
                          <ListItemAvatar>
                            <Avatar>{trainer.name.slice(0, 2).toUpperCase()}</Avatar>
                          </ListItemAvatar>
                          <ListItemText
                            primary={trainer.name}
                            secondary={`Sessões: ${trainer.total}`}
                          />
                        </ListItem>
                        {index < data.topTrainers.length - 1 && <Divider component="li" sx={{ borderColor: 'divider', ml: 7 }} />}
                      </React.Fragment>
                    ))}
                  </List>
                )}
              </CardContent>
            </Card>

            <Card variant="outlined" sx={{ borderRadius: 3 }}>
              <CardHeader
                title="Novos utilizadores"
                subheader="Últimas entradas"
                avatar={<Avatar sx={{ bgcolor: 'secondary.main', color: 'secondary.contrastText' }}><FitnessCenterIcon /></Avatar>}
              />
              <CardContent sx={{ pt: 0 }}>
                {data.recentUsers.length === 0 ? (
                  <Typography variant="body2" color="text.secondary">
                    Ainda não existem registos recentes.
                  </Typography>
                ) : (
                  <List disablePadding>
                    {data.recentUsers.map((user, index) => (
                      <React.Fragment key={user.id}>
                        <ListItem sx={{ px: 0 }}>
                          <ListItemAvatar>
                            <Avatar>{user.name.slice(0, 2).toUpperCase()}</Avatar>
                          </ListItemAvatar>
                          <ListItemText
                            primary={user.name}
                            secondary={user.email ?? undefined}
                          />
                        </ListItem>
                        {index < data.recentUsers.length - 1 && <Divider component="li" sx={{ borderColor: 'divider', ml: 7 }} />}
                      </React.Fragment>
                    ))}
                  </List>
                )}
              </CardContent>
            </Card>
          </Stack>
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
