// src/components/dashboard/TrainerHome.tsx
import * as React from 'react';
import {
  Box,
  Card,
  CardContent,
  CardHeader,
  Chip,
  Grid,
  Stack,
  Typography,
  Avatar,
  Button,
  Divider,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
} from '@mui/material';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import PeopleAltIcon from '@mui/icons-material/PeopleAlt';
import PendingActionsIcon from '@mui/icons-material/PendingActions';
import PlaylistAddCheckIcon from '@mui/icons-material/PlaylistAddCheck';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import PersonAddAlt1Icon from '@mui/icons-material/PersonAddAlt1';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { alpha } from '@mui/material/styles';
import { tryCreateServerClient } from '@/lib/supabaseServer';
import { getSessionUserSafe } from '@/lib/session-bridge';
import { toAppRole } from '@/lib/roles';
import { getSampleTrainerDashboard } from '@/lib/fallback/users';

export const dynamic = 'force-dynamic';

type TrainerDashboard = {
  stats: {
    totalClients: number;
    activePlans: number;
    sessionsThisWeek: number;
    pendingRequests: number;
  };
  clients: Array<{ id: string; name: string; status?: string | null }>;
  upcoming: Array<{
    id: string;
    start_time: string | null;
    client_id: string | null;
    client_name: string;
    location?: string | null;
    status?: string | null;
  }>;
};

function greetingMessage() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Bom dia';
  if (hour < 18) return 'Boa tarde';
  return 'Boa noite';
}

function firstName(full?: string | null) {
  if (!full) return 'Treinador';
  const parts = full.trim().split(/\s+/);
  return parts[0] ?? full;
}

function formatSessionTime(value: string | null) {
  if (!value) {
    return { day: 'Data por agendar', time: '—' };
  }
  const date = new Date(value);
  return {
    day: date.toLocaleDateString('pt-PT', { weekday: 'short', day: '2-digit', month: 'short' }),
    time: date.toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' }),
  };
}

export default async function TrainerHome() {
  const session = await getSessionUserSafe();
  const trainerId = session?.user?.id ?? session?.id ?? null;
  const role = toAppRole(session?.role) ?? toAppRole(session?.user?.role) ?? 'CLIENT';
  const sb = tryCreateServerClient();

  const fallback = getSampleTrainerDashboard(trainerId ?? '1002');
  let dashboard: TrainerDashboard = {
    stats: fallback.stats,
    clients: fallback.clients.map((client) => ({ ...client, status: 'ACTIVE' })),
    upcoming: fallback.upcoming.map((session) => ({
      id: session.id,
      start_time: session.start_time,
      client_id: session.client_id,
      client_name: session.client_name,
      location: session.location,
      status: 'CONFIRMED',
    })),
  };

  if (sb && trainerId) {
    try {
      // Clientes associados
      const { data: linkRows, error: linkError } = await sb
        .from('trainer_clients')
        .select('client_id,status')
        .eq('trainer_id', trainerId)
        .limit(200);

      if (linkError) throw linkError;

      const clientIds = (linkRows ?? []).map((row) => row?.client_id).filter(Boolean) as string[];
      let clientProfiles: Array<{ id: string; name: string; email?: string | null; status?: string | null }> = [];
      if (clientIds.length) {
        const { data: profiles, error: profileError } = await sb
          .from('users')
          .select('id,name,email,status')
          .in('id', clientIds);
        if (profileError) throw profileError;
        clientProfiles = (profiles ?? []).map((p) => ({
          id: String(p.id),
          name: p.name ?? p.email ?? String(p.id),
          email: p.email ?? null,
          status: p.status ?? null,
        }));
      }

      // Sessões próximas (últimos 7 dias e próximos 14)
      const now = new Date();
      const startWindow = new Date(now);
      startWindow.setDate(startWindow.getDate() - 7);
      const endWindow = new Date(now);
      endWindow.setDate(endWindow.getDate() + 14);

      const { data: sessionsData, error: sessionsError } = await sb
        .from('sessions')
        .select('id,client_id,start_time,location,status')
        .eq('trainer_id', trainerId)
        .gte('start_time', startWindow.toISOString())
        .lt('start_time', endWindow.toISOString())
        .order('start_time', { ascending: true });

      if (sessionsError) throw sessionsError;

      const sessions = (sessionsData ?? []).map((session) => ({
        id: session.id ? String(session.id) : `session-${Math.random().toString(16).slice(2)}`,
        start_time: session.start_time ?? null,
        client_id: session.client_id ? String(session.client_id) : null,
        client_name:
          (session.client_id && clientProfiles.find((client) => client.id === String(session.client_id))?.name) ||
          fallback.clients.find((client) => client.id === session.client_id)?.name ||
          'Cliente',
        location: session.location ?? null,
        status: session.status ?? null,
      }));

      const sessionsThisWeek = sessions.filter((session) => {
        if (!session.start_time) return false;
        const date = new Date(session.start_time);
        return date >= startWindow && date <= now;
      }).length;

      // Planos activos
      let activePlans = fallback.stats.activePlans;
      try {
        const { data: planRows } = await sb
          .from('training_plans')
          .select('id,status')
          .eq('trainer_id', trainerId);
        if (Array.isArray(planRows)) {
          activePlans = planRows.filter((plan) => {
            const status = String(plan?.status ?? '').toUpperCase();
            return ['ACTIVE', 'APPROVED', 'IN_PROGRESS', 'LIVE'].includes(status);
          }).length;
        }
      } catch {
        activePlans = fallback.stats.activePlans;
      }

      // Pedidos pendentes (se existir tabela approvals)
      let pendingRequests = 0;
      try {
        const { count, error: approvalsError } = await sb
          .from('approvals')
          .select('id', { head: true, count: 'exact' })
          .eq('trainer_id', trainerId)
          .eq('status', 'pending');
        if (approvalsError) throw approvalsError;
        pendingRequests = count ?? 0;
      } catch {
        pendingRequests = fallback.stats.pendingRequests;
      }

      dashboard = {
        stats: {
          totalClients: clientProfiles.length,
          activePlans,
          sessionsThisWeek,
          pendingRequests,
        },
        clients: clientProfiles.map((profile) => ({
          id: profile.id,
          name: profile.name,
          status: profile.status ?? 'ACTIVE',
        })),
        upcoming: sessions,
      };
    } catch {
      // fallback silencioso para garantir dashboard funcional
      dashboard = {
        stats: fallback.stats,
        clients: fallback.clients.map((client) => ({ ...client, status: 'ACTIVE' })),
        upcoming: fallback.upcoming.map((session) => ({
          id: session.id,
          start_time: session.start_time,
          client_id: session.client_id,
          client_name: session.client_name,
          location: session.location,
          status: 'CONFIRMED',
        })),
      };
    }
  }

  const name = firstName(session?.user?.name ?? session?.user?.email ?? undefined);
  const upcomingSessions = dashboard.upcoming
    .filter((session) => !session.start_time || new Date(session.start_time) >= new Date())
    .slice(0, 6);

  const insights: Array<{ icon: React.ReactNode; message: string; tone: 'info' | 'warning' | 'positive' }>
    = [];
  if (dashboard.stats.pendingRequests > 0) {
    insights.push({
      icon: <PendingActionsIcon fontSize="small" />,
      message: `${dashboard.stats.pendingRequests} pedido(s) de cliente aguardam a tua aprovação.`,
      tone: 'warning',
    });
  }
  if (dashboard.stats.sessionsThisWeek === 0) {
    insights.push({
      icon: <CalendarMonthIcon fontSize="small" />,
      message: 'A tua agenda está livre esta semana — aproveita para planear ações com os clientes.',
      tone: 'info',
    });
  }
  if (dashboard.stats.activePlans < dashboard.stats.totalClients) {
    insights.push({
      icon: <PlaylistAddCheckIcon fontSize="small" />,
      message: 'Existem clientes sem plano activo. Revê os planos para garantir consistência. ',
      tone: 'warning',
    });
  }
  if (insights.length === 0) {
    insights.push({
      icon: <AutoAwesomeIcon fontSize="small" />,
      message: 'Tudo alinhado! Mantém o foco e continua a potenciar os teus clientes.',
      tone: 'positive',
    });
  }

  return (
    <Stack spacing={3} sx={{ pb: 4 }}>
      <Box
        sx={(theme) => ({
          borderRadius: 4,
          p: { xs: 3, md: 4 },
          background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, theme.palette.mode === 'dark' ? 0.9 : 0.78)} 0%, ${alpha(theme.palette.success.main, theme.palette.mode === 'dark' ? 0.85 : 0.7)} 100%)`,
          color: theme.palette.getContrastText(theme.palette.mode === 'dark' ? theme.palette.primary.dark : theme.palette.primary.main),
          boxShadow:
            theme.palette.mode === 'dark'
              ? '0 28px 80px -48px rgba(8,20,45,0.9)'
              : '0 30px 80px -48px rgba(18,38,64,0.25)',
        })}
      >
        <Stack spacing={2}>
          <Typography variant="h4" fontWeight={800}>
            {greetingMessage()}, {name}!
          </Typography>
          <Typography variant="body1" sx={{ maxWidth: 520, opacity: 0.85 }}>
            Aqui tens o panorama das tuas sessões, clientes e planos activos. Utiliza os atalhos para criar novas ações rapidamente.
          </Typography>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
            <Button href="/dashboard/pt/schedule" variant="contained" color="primary" endIcon={<ArrowForwardIcon />}>
              Marcar nova sessão
            </Button>
            <Button href="/dashboard/pt/plans" variant="outlined" color="inherit" startIcon={<PlaylistAddCheckIcon />}>
              Criar plano
            </Button>
            <Button href="/dashboard/pt/clients" variant="outlined" color="inherit" startIcon={<PersonAddAlt1Icon />}>
              Adicionar cliente
            </Button>
          </Stack>
        </Stack>
      </Box>

      <Grid container spacing={2}>
        {[
          {
            label: 'Clientes activos',
            value: dashboard.stats.totalClients,
            icon: <PeopleAltIcon />,
            color: 'primary' as const,
            hint: `${dashboard.clients.length} na tua carteira`,
          },
          {
            label: 'Sessões (7 dias)',
            value: dashboard.stats.sessionsThisWeek,
            icon: <EventAvailableIcon />,
            color: 'success' as const,
            hint: 'inclui passadas e confirmadas',
          },
          {
            label: 'Planos activos',
            value: dashboard.stats.activePlans,
            icon: <PlaylistAddCheckIcon />,
            color: 'info' as const,
            hint: 'em acompanhamento',
          },
          {
            label: 'Pedidos pendentes',
            value: dashboard.stats.pendingRequests,
            icon: <PendingActionsIcon />,
            color: 'warning' as const,
            hint: dashboard.stats.pendingRequests > 0 ? 'precisam da tua revisão' : 'nenhum por agora',
          },
        ].map((metric) => (
          <Grid item xs={12} sm={6} md={3} key={metric.label}>
            <Card variant="outlined" sx={{ borderRadius: 3 }}>
              <CardContent>
                <Stack direction="row" spacing={1.5} alignItems="center">
                  <Avatar sx={{ bgcolor: `${metric.color}.main`, color: `${metric.color}.contrastText`, width: 40, height: 40 }}>
                    {metric.icon}
                  </Avatar>
                  <Box>
                    <Typography variant="subtitle2" sx={{ opacity: 0.7 }}>
                      {metric.label}
                    </Typography>
                    <Typography variant="h5" fontWeight={800}>
                      {metric.value}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {metric.hint}
                    </Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={3}>
        <Grid item xs={12} lg={7}>
          <Card variant="outlined" sx={{ borderRadius: 3, height: '100%' }}>
            <CardHeader
              title="Próximas sessões"
              subheader="Visualiza o que tens agendado"
              action={<Chip label={`${upcomingSessions.length}`} color="primary" variant="outlined" size="small" />}
            />
            <CardContent sx={{ pt: 0 }}>
              {upcomingSessions.length === 0 ? (
                <Typography variant="body2" color="text.secondary">
                  Não existem sessões marcadas. Cria uma nova sessão para manter os clientes activos.
                </Typography>
              ) : (
                <List disablePadding>
                  {upcomingSessions.map((session, index) => {
                    const { day, time } = formatSessionTime(session.start_time);
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
                                {session.status && (
                                  <Chip label={String(session.status).toUpperCase()} size="small" variant="outlined" />
                                )}
                              </Stack>
                            }
                          />
                        </ListItem>
                        {index < upcomingSessions.length - 1 && (
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
              title="Carteira de clientes"
              subheader="Resumo rápido dos clientes activos"
              action={<Chip label={`${dashboard.clients.length}`} size="small" variant="outlined" />}
            />
            <CardContent sx={{ pt: 0 }}>
              {dashboard.clients.length === 0 ? (
                <Typography variant="body2" color="text.secondary">
                  Ainda não tens clientes atribuídos. Quando adicionares, aparecerão aqui.
                </Typography>
              ) : (
                <List disablePadding>
                  {dashboard.clients.slice(0, 6).map((client, index) => (
                    <React.Fragment key={client.id}>
                      <ListItem sx={{ px: 0 }}>
                        <ListItemAvatar>
                          <Avatar sx={{ bgcolor: 'secondary.light', color: 'secondary.dark' }}>
                            {client.name.slice(0, 2).toUpperCase()}
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={client.name}
                          secondary={client.status ? `Estado: ${String(client.status).toUpperCase()}` : null}
                        />
                      </ListItem>
                      {index < Math.min(dashboard.clients.length, 6) - 1 && (
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

      <Card variant="outlined" sx={{ borderRadius: 3 }}>
        <CardHeader title="Insights rápidos" subheader="Sugestões automáticas para o teu dia" />
        <CardContent sx={{ pt: 0 }}>
          <Stack spacing={1.5}>
            {insights.map((item, index) => (
              <Stack key={index} direction="row" spacing={1.5} alignItems="center">
                <Avatar
                  sx={{
                    width: 32,
                    height: 32,
                    bgcolor:
                      item.tone === 'warning'
                        ? 'warning.light'
                        : item.tone === 'positive'
                          ? 'success.light'
                          : 'info.light',
                    color:
                      item.tone === 'warning'
                        ? 'warning.dark'
                        : item.tone === 'positive'
                          ? 'success.dark'
                          : 'info.dark',
                  }}
                >
                  {item.icon}
                </Avatar>
                <Typography variant="body2" sx={{ flex: 1 }}>
                  {item.message}
                </Typography>
              </Stack>
            ))}
          </Stack>
        </CardContent>
      </Card>

      {role === 'ADMIN' && (
        <Card variant="outlined" sx={{ borderRadius: 3 }}>
          <CardHeader title="Modo administrador" subheader="Estás a visualizar a experiência do treinador como admin." />
          <CardContent>
            <Typography variant="body2" color="text.secondary">
              Algumas ações podem estar limitadas quando actuas em nome de outro utilizador. Alterna para uma conta de treinador para interagir directamente.
            </Typography>
          </CardContent>
        </Card>
      )}
    </Stack>
  );
}
