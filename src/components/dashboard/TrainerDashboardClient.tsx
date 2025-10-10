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
  Chip,
  Button,
  Divider,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  useTheme,
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

export type TrainerDashboardData = {
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

type Props = {
  name: string;
  data: TrainerDashboardData;
  supabase: boolean;
};

function greetingMessage() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Bom dia';
  if (hour < 18) return 'Boa tarde';
  return 'Boa noite';
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

export default function TrainerDashboardClient({ name, data, supabase }: Props) {
  const theme = useTheme();

  const insights: Array<{ icon: React.ReactNode; message: string; tone: 'info' | 'warning' | 'positive' }> = [];
  if (data.stats.pendingRequests > 0) {
    insights.push({
      icon: <PendingActionsIcon fontSize="small" />,
      message: `${data.stats.pendingRequests} pedido(s) de cliente aguardam a tua aprovação.`,
      tone: 'warning',
    });
  }
  if (data.stats.sessionsThisWeek === 0) {
    insights.push({
      icon: <CalendarMonthIcon fontSize="small" />,
      message: 'A tua agenda está livre esta semana — planeia novas sessões ou revisita os planos activos.',
      tone: 'info',
    });
  }
  if (data.stats.activePlans < data.stats.totalClients) {
    insights.push({
      icon: <PlaylistAddCheckIcon fontSize="small" />,
      message: 'Existem clientes sem plano activo. Revisa os planos para manter todos alinhados.',
      tone: 'warning',
    });
  }
  if (insights.length === 0) {
    insights.push({
      icon: <AutoAwesomeIcon fontSize="small" />,
      message: 'Tudo alinhado! Mantém o ritmo e surpreende os teus clientes.',
      tone: 'positive',
    });
  }

  const upcomingSessions = data.upcoming
    .filter((session) => !session.start_time || new Date(session.start_time) >= new Date())
    .slice(0, 6);

  return (
    <Stack spacing={3} sx={{ pb: 6 }}>
      <Box
        sx={{
          borderRadius: 4,
          p: { xs: 3, md: 4 },
          background:
            theme.palette.mode === 'dark'
              ? `linear-gradient(135deg, rgba(37,99,235,0.35) 0%, rgba(16,185,129,0.22) 100%)`
              : `linear-gradient(135deg, rgba(59,130,246,0.18) 0%, rgba(16,185,129,0.16) 100%)`,
          color: theme.palette.getContrastText(
            theme.palette.mode === 'dark' ? theme.palette.primary.dark : theme.palette.primary.main,
          ),
          boxShadow:
            theme.palette.mode === 'dark'
              ? '0 32px 110px -60px rgba(8,20,45,0.9)'
              : '0 30px 90px -55px rgba(18,38,64,0.25)',
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
                : 'radial-gradient(circle at 20% 20%, rgba(255,255,255,0.32), transparent 60%)',
            opacity: 0.6,
          }}
        />
        <Stack spacing={2} sx={{ position: 'relative' }}>
          <Typography variant="overline" sx={{ letterSpacing: 1.5, opacity: 0.7 }}>
            {supabase ? 'Agenda sincronizada' : 'Modo offline'}
          </Typography>
          <Typography variant="h4" fontWeight={800}>
            {greetingMessage()}, {name}!
          </Typography>
          <Typography variant="body1" sx={{ maxWidth: 520, opacity: 0.85 }}>
            Aqui tens o panorama das tuas sessões, clientes e planos activos. Utiliza os atalhos para agir rapidamente.
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
            value: data.stats.totalClients,
            icon: <PeopleAltIcon />,
            color: 'primary' as const,
            hint: `${data.clients.length} na tua carteira`,
          },
          {
            label: 'Sessões (7 dias)',
            value: data.stats.sessionsThisWeek,
            icon: <EventAvailableIcon />,
            color: 'success' as const,
            hint: 'inclui passadas e confirmadas',
          },
          {
            label: 'Planos activos',
            value: data.stats.activePlans,
            icon: <PlaylistAddCheckIcon />,
            color: 'info' as const,
            hint: 'em acompanhamento',
          },
          {
            label: 'Pedidos pendentes',
            value: data.stats.pendingRequests,
            icon: <PendingActionsIcon />,
            color: 'warning' as const,
            hint: data.stats.pendingRequests > 0 ? 'precisam da tua revisão' : 'nenhum por agora',
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

      <Card variant="outlined" sx={{ borderRadius: 3 }}>
        <CardContent>
          <Stack spacing={1.5}>
            <Typography variant="subtitle1" fontWeight={700}>
              Resumo inteligente
            </Typography>
            <Grid container spacing={1.5}>
              {insights.map((insight, index) => (
                <Grid item xs={12} md={4} key={index}>
                  <Box
                    sx={{
                      borderRadius: 2,
                      border: '1px solid',
                      borderColor: 'divider',
                      p: 1.5,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1,
                      bgcolor: insight.tone === 'positive' ? 'success.light' : 'background.paper',
                      opacity: insight.tone === 'positive' ? 0.92 : 1,
                    }}
                  >
                    <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main', color: 'primary.contrastText' }}>
                      {insight.icon}
                    </Avatar>
                    <Typography variant="body2" sx={{ opacity: 0.9 }}>
                      {insight.message}
                    </Typography>
                  </Box>
                </Grid>
              ))}
            </Grid>
          </Stack>
        </CardContent>
      </Card>

      <Grid container spacing={3}>
        <Grid item xs={12} lg={7}>
          <Card variant="outlined" sx={{ borderRadius: 3, height: '100%' }}>
            <CardContent>
              <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
                <Typography variant="h6" fontWeight={700}>
                  Próximas sessões
                </Typography>
                <Chip label={`${upcomingSessions.length}`} size="small" color="primary" variant="outlined" />
              </Stack>
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
          <Card variant="outlined" sx={{ borderRadius: 3 }}>
            <CardContent>
              <Typography variant="h6" fontWeight={700} sx={{ mb: 1.5 }}>
                Clientes activos
              </Typography>
              <List disablePadding sx={{ display: 'grid', gap: 1 }}>
                {data.clients.length === 0 && (
                  <Typography variant="body2" color="text.secondary">
                    Ainda não tens clientes associados.
                  </Typography>
                )}
                {data.clients.map((client) => (
                  <ListItem
                    key={client.id}
                    sx={{
                      border: '1px solid',
                      borderColor: 'divider',
                      borderRadius: 2,
                      px: 1.5,
                      py: 1,
                    }}
                  >
                    <ListItemText
                      primaryTypographyProps={{ fontWeight: 600 }}
                      primary={client.name}
                      secondary={client.status ? String(client.status).toUpperCase() : undefined}
                    />
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Stack>
  );
}
