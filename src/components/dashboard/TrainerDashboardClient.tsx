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
  LinearProgress,
} from '@mui/material';
import { keyframes } from '@mui/material/styles';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import PeopleAltIcon from '@mui/icons-material/PeopleAlt';
import PendingActionsIcon from '@mui/icons-material/PendingActions';
import PlaylistAddCheckIcon from '@mui/icons-material/PlaylistAddCheck';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import PersonAddAlt1Icon from '@mui/icons-material/PersonAddAlt1';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import AutorenewIcon from '@mui/icons-material/Autorenew';
import NextLink from 'next/link';
import { greetingForDate } from '@/lib/time';
import { startOfWeek, addDays } from 'date-fns';

const emojiFloat = keyframes`
  0% { transform: translateY(0) scale(1); }
  50% { transform: translateY(-4px) scale(1.08); }
  100% { transform: translateY(0) scale(1); }
`;

const cardFade = keyframes`
  0% { opacity: 0; transform: translateY(16px); }
  100% { opacity: 1; transform: translateY(0); }
`;

const spin = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`;

type AgendaSession = {
  id: string;
  title: string;
  start_at: string | null;
  kind?: string | null;
  client?: string | null;
  location?: string | null;
};

type AgendaDay = {
  date: Date;
  iso: string;
  label: string;
  sessions: AgendaSession[];
};

const emojiFloat = keyframes`
  0% { transform: translateY(0) scale(1); }
  50% { transform: translateY(-4px) scale(1.08); }
  100% { transform: translateY(0) scale(1); }
`;

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

function buildWeekDays(base: Date): AgendaDay[] {
  return Array.from({ length: 7 }, (_, index) => {
    const date = addDays(base, index);
    const iso = date.toISOString().slice(0, 10);
    const label = date
      .toLocaleDateString('pt-PT', { weekday: 'short', day: '2-digit', month: 'short' })
      .replace('.', '')
      .toUpperCase();
    return {
      date,
      iso,
      label,
      sessions: [],
    } satisfies AgendaDay;
  });
}

function formatAgendaTime(value: string | null | undefined) {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' });
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
  const isLightMode = theme.palette.mode === 'light';
  const [weeklyAgenda, setWeeklyAgenda] = React.useState<AgendaDay[]>(() =>
    buildWeekDays(startOfWeek(new Date(), { weekStartsOn: 1 })),
  );
  const [weeklyLoading, setWeeklyLoading] = React.useState(false);

  const refreshWeeklyAgenda = React.useCallback(async () => {
    const base = startOfWeek(new Date(), { weekStartsOn: 1 });
    const days = buildWeekDays(base);
    setWeeklyAgenda(days);
    setWeeklyLoading(true);
    try {
      const from = `${days[0].iso}T00:00:00.000Z`;
      const to = `${days[days.length - 1].iso}T23:59:59.999Z`;
      const res = await fetch(
        `/api/pt/plans?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`,
        { cache: 'no-store' },
      );
      if (!res.ok) throw new Error(await res.text());
      const json = await res.json();
      const items: any[] = Array.isArray(json?.items)
        ? json.items
        : Array.isArray(json?.data)
        ? json.data
        : Array.isArray(json?.sessions)
        ? json.sessions
        : [];
      const grouped: Record<string, AgendaSession[]> = Object.fromEntries(days.map((day) => [day.iso, []]));
      for (const item of items) {
        const startRaw =
          (typeof item?.start_at === 'string' && item.start_at) ||
          (typeof item?.start_time === 'string' && item.start_time) ||
          (typeof item?.start === 'string' && item.start) ||
          (typeof item?.scheduled_for === 'string' && item.scheduled_for) ||
          (typeof item?.starts_at === 'string' && item.starts_at) ||
          null;
        if (!startRaw) continue;
        const iso = startRaw.slice(0, 10);
        if (!grouped[iso]) continue;
        const session: AgendaSession = {
          id: String(item?.id ?? item?.session_id ?? `${iso}-${grouped[iso].length}`),
          title: String(item?.title ?? item?.name ?? item?.label ?? 'Sessão'),
          start_at: startRaw,
          kind: item?.kind ?? item?.mode ?? item?.type ?? null,
          client: item?.client_name ?? item?.client ?? item?.client_id ?? null,
          location: item?.location ?? item?.place ?? item?.room ?? null,
        };
        grouped[iso].push(session);
      }
      Object.keys(grouped).forEach((iso) => {
        grouped[iso].sort((a, b) => {
          const aDate = a.start_at ?? '';
          const bDate = b.start_at ?? '';
          return aDate.localeCompare(bDate);
        });
      });
      setWeeklyAgenda(days.map((day) => ({ ...day, sessions: grouped[day.iso] ?? [] })));
    } catch (error) {
      console.error('weekly agenda load failed', error);
      setWeeklyAgenda((prev) => prev.map((day) => ({ ...day, sessions: [] })));
    } finally {
      setWeeklyLoading(false);
    }
  }, []);

  React.useEffect(() => {
    void refreshWeeklyAgenda();
  }, [refreshWeeklyAgenda]);
  const greetingInfo = React.useMemo(() => greetingForDate(), []);
  const greetingLabel = React.useMemo(
    () => `${greetingInfo.label}${name ? `, ${name}` : ''}!`,
    [greetingInfo.label, name],
  );

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

  const metricCards = [
    {
      label: 'Clientes activos',
      value: data.stats.totalClients,
      icon: <PeopleAltIcon />,
      color: 'primary' as const,
      hint: `${data.clients.length} na tua carteira`,
      href: '/dashboard/pt/clients',
    },
    {
      label: 'Sessões (7 dias)',
      value: data.stats.sessionsThisWeek,
      icon: <EventAvailableIcon />,
      color: 'success' as const,
      hint: 'inclui passadas e confirmadas',
      href: '/dashboard/pt/schedule',
    },
    {
      label: 'Planos activos',
      value: data.stats.activePlans,
      icon: <PlaylistAddCheckIcon />,
      color: 'info' as const,
      hint: 'em acompanhamento',
      href: '/dashboard/pt/plans',
    },
    {
      label: 'Pedidos pendentes',
      value: data.stats.pendingRequests,
      icon: <PendingActionsIcon />,
      color: 'warning' as const,
      hint: data.stats.pendingRequests > 0 ? 'precisam da tua revisão' : 'nenhum por agora',
      href: '/dashboard/pt/clients',
    },
  ];

  return (
    <Stack spacing={3} sx={{ pb: 6 }}>
      <Box
        sx={{
          borderRadius: 4,
          p: { xs: 3, md: 4 },
          background: isLightMode
            ? 'linear-gradient(135deg, rgba(59,130,246,0.14) 0%, rgba(16,185,129,0.12) 55%, rgba(255,255,255,0.96) 100%)'
            : 'linear-gradient(135deg, rgba(37,99,235,0.35) 0%, rgba(16,185,129,0.22) 100%)',
          color: isLightMode ? theme.palette.text.primary : theme.palette.getContrastText(theme.palette.primary.dark),
          boxShadow: isLightMode ? '0 28px 60px -45px rgba(15,118,110,0.55)' : '0 32px 110px -60px rgba(8,20,45,0.9)',
          position: 'relative',
          overflow: 'hidden',
          border: '1px solid',
          borderColor: isLightMode ? 'rgba(148,163,184,0.38)' : 'rgba(59,130,246,0.25)',
          backdropFilter: isLightMode ? 'blur(16px)' : undefined,
          animation: `${cardFade} 0.7s ease-out both`,
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            background: isLightMode
              ? 'radial-gradient(circle at top left, rgba(37,99,235,0.25), transparent 55%)'
              : 'radial-gradient(circle at top left, rgba(59,130,246,0.18), transparent 45%)',
            pointerEvents: 'none',
            opacity: isLightMode ? 0.7 : 0.6,
          }}
        />
        <Stack spacing={2} sx={{ position: 'relative' }}>
          <Typography variant="overline" sx={{ letterSpacing: 1.5, opacity: 0.7 }}>
            {supabase ? 'Agenda sincronizada' : 'Modo offline'}
          </Typography>
          <Typography variant="h4" fontWeight={800}>
            <Box
              component="span"
              sx={{
                display: 'inline-flex',
                mr: 1.5,
                animation: `${emojiFloat} 4s ease-in-out infinite`,
                transformOrigin: 'center',
              }}
              aria-hidden
            >
              {greetingInfo.emoji}
            </Box>
            {greetingLabel}
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
        {metricCards.map((metric, index) => (
          <Grid item xs={12} sm={6} md={3} key={metric.label} sx={{ display: 'flex' }}>
            <Box
              component={NextLink}
              href={metric.href}
              sx={{
                textDecoration: 'none',
                display: 'flex',
                flexGrow: 1,
              }}
            >
              <Card
                variant="outlined"
                sx={{
                  borderRadius: 3,
                  flexGrow: 1,
                  height: '100%',
                  display: 'flex',
                  borderColor: isLightMode ? 'rgba(148,163,184,0.45)' : 'divider',
                  background: isLightMode
                    ? 'linear-gradient(135deg, rgba(255,255,255,0.92), rgba(224,242,254,0.9))'
                    : 'transparent',
                  boxShadow: isLightMode ? '0 22px 45px -36px rgba(14,116,144,0.7)' : theme.shadows[1],
                  animation: `${cardFade} 0.65s ease-out both`,
                  transition: theme.transitions.create(['transform', 'box-shadow'], {
                    duration: theme.transitions.duration.shorter,
                    easing: theme.transitions.easing.easeOut,
                  }),
                  '&:hover': {
                    transform: 'translateY(-6px)',
                    boxShadow: isLightMode ? theme.shadows[6] : theme.shadows[8],
                  },
                  '&:hover .metric-avatar': {
                    transform: 'translateY(-3px) scale(1.05)',
                  },
                }}
                style={{ animationDelay: `${index * 0.08}s` }}
              >
                <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <Avatar
                    className="metric-avatar"
                    sx={{
                      bgcolor: `${metric.color}.main`,
                      color: `${metric.color}.contrastText`,
                      width: 40,
                      height: 40,
                      boxShadow: isLightMode ? '0 10px 20px -12px rgba(59,130,246,0.75)' : 'none',
                      transition: theme.transitions.create(['transform'], {
                        duration: theme.transitions.duration.short,
                      }),
                    }}
                  >
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
                </CardContent>
              </Card>
            </Box>
          </Grid>
        ))}
      </Grid>

      <Card
        variant="outlined"
        sx={{
          borderRadius: 3,
          borderColor: isLightMode ? 'rgba(148,163,184,0.45)' : 'divider',
          background: isLightMode
            ? 'linear-gradient(135deg, rgba(255,255,255,0.95), rgba(236,253,245,0.9))'
            : 'transparent',
          boxShadow: isLightMode ? '0 28px 54px -40px rgba(16,185,129,0.65)' : theme.shadows[1],
          animation: `${cardFade} 0.7s ease-out both`,
        }}
      >
        <CardContent sx={{ display: 'grid', gap: 2 }}>
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={1.5}
            alignItems={{ xs: 'flex-start', sm: 'center' }}
            justifyContent="space-between"
          >
            <Stack spacing={0.5}>
              <Typography variant="h6" fontWeight={700}>
                Agenda semanal
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Visualiza as sessões desta semana de forma rápida. Usa o planeador para gerir arrastar &amp; largar.
              </Typography>
            </Stack>
            <Stack direction="row" spacing={1} alignItems="center">
              <Button
                href="/dashboard/pt/plans"
                variant="contained"
                color="primary"
                endIcon={<ArrowForwardIcon fontSize="small" />}
              >
                Abrir planeador
              </Button>
              <Button
                variant="outlined"
                size="small"
                onClick={() => refreshWeeklyAgenda()}
                disabled={weeklyLoading}
                startIcon={
                  <AutorenewIcon
                    fontSize="small"
                    sx={{ animation: weeklyLoading ? `${spin} 1s linear infinite` : 'none' }}
                  />
                }
              >
                Atualizar
              </Button>
            </Stack>
          </Stack>
          {weeklyLoading && <LinearProgress sx={{ borderRadius: 999 }} />}
          <Box
            sx={{
              display: 'grid',
              gap: 1.5,
              gridTemplateColumns: {
                xs: 'repeat(1, minmax(0, 1fr))',
                sm: 'repeat(2, minmax(0, 1fr))',
                md: 'repeat(3, minmax(0, 1fr))',
                lg: 'repeat(4, minmax(0, 1fr))',
                xl: 'repeat(7, minmax(0, 1fr))',
              },
            }}
          >
            {weeklyAgenda.map((day, index) => (
              <Box
                key={day.iso}
                sx={{
                  borderRadius: 2,
                  border: '1px solid',
                  borderColor: isLightMode ? 'rgba(148,163,184,0.45)' : 'divider',
                  backgroundColor: isLightMode ? 'rgba(255,255,255,0.92)' : theme.palette.background.paper,
                  display: 'grid',
                  gap: 1,
                  p: 1.5,
                  minHeight: 160,
                  animation: `${cardFade} 0.6s ease-out both`,
                }}
                style={{ animationDelay: `${0.06 * index + 0.15}s` }}
              >
                <Stack direction="row" alignItems="center" justifyContent="space-between">
                  <Typography fontWeight={700}>{day.label}</Typography>
                  <Chip
                    label={String(day.sessions.length)}
                    size="small"
                    color={day.sessions.length > 0 ? 'primary' : 'default'}
                    variant={day.sessions.length > 0 ? 'filled' : 'outlined'}
                  />
                </Stack>
                <Box sx={{ display: 'grid', gap: 1 }}>
                  {day.sessions.length === 0 ? (
                    <Typography variant="caption" color="text.secondary">
                      {weeklyLoading ? 'A carregar…' : 'Sem sessões agendadas.'}
                    </Typography>
                  ) : (
                    day.sessions.slice(0, 3).map((session) => (
                      <Box
                        key={session.id}
                        sx={{
                          borderRadius: 2,
                          border: '1px solid',
                          borderColor: isLightMode ? 'rgba(59,130,246,0.18)' : 'rgba(59,130,246,0.35)',
                          background: isLightMode
                            ? 'linear-gradient(135deg, rgba(59,130,246,0.08), rgba(16,185,129,0.05))'
                            : 'rgba(59,130,246,0.12)',
                          p: 1,
                          display: 'grid',
                          gap: 0.5,
                        }}
                      >
                        <Typography variant="body2" fontWeight={700} sx={{ wordBreak: 'break-word' }}>
                          {formatAgendaTime(session.start_at)} · {session.title}
                        </Typography>
                        {session.client && (
                          <Typography variant="caption" color="text.secondary">
                            Cliente: {session.client}
                          </Typography>
                        )}
                        <Stack direction="row" spacing={0.5} flexWrap="wrap">
                          {session.kind && (
                            <Chip label={session.kind} size="small" variant="outlined" color="primary" />
                          )}
                          {session.location && (
                            <Chip label={session.location} size="small" variant="outlined" />
                          )}
                        </Stack>
                      </Box>
                    ))
                  )}
                  {day.sessions.length > 3 && (
                    <Typography variant="caption" color="text.secondary">
                      +{day.sessions.length - 3} sessões adicionais
                    </Typography>
                  )}
                </Box>
              </Box>
            ))}
          </Box>
        </CardContent>
      </Card>

      <Card
        variant="outlined"
        sx={{
          borderRadius: 3,
          borderColor: isLightMode ? 'rgba(148,163,184,0.45)' : 'divider',
          background: isLightMode
            ? 'linear-gradient(135deg, rgba(255,255,255,0.95), rgba(219,234,254,0.88))'
            : 'transparent',
          boxShadow: isLightMode ? '0 24px 52px -42px rgba(37,99,235,0.55)' : theme.shadows[1],
          animation: `${cardFade} 0.75s ease-out both`,
        }}
      >
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
                      borderColor:
                        insight.tone === 'positive'
                          ? isLightMode
                            ? 'rgba(16,185,129,0.35)'
                            : 'rgba(16,185,129,0.5)'
                          : isLightMode
                          ? 'rgba(148,163,184,0.4)'
                          : 'divider',
                      p: 1.5,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1,
                      bgcolor:
                        insight.tone === 'positive'
                          ? isLightMode
                            ? 'rgba(16,185,129,0.15)'
                            : 'rgba(16,185,129,0.25)'
                          : isLightMode
                          ? 'rgba(255,255,255,0.92)'
                          : 'background.paper',
                      animation: `${cardFade} 0.75s ease-out both`,
                    }}
                    style={{ animationDelay: `${0.1 * index + 0.2}s` }}
                  >
                    <Avatar
                      sx={{
                        width: 32,
                        height: 32,
                        bgcolor: insight.tone === 'positive' ? 'success.main' : 'primary.main',
                        color: 'primary.contrastText',
                        boxShadow: isLightMode ? '0 10px 20px -16px rgba(14,116,144,0.8)' : 'none',
                      }}
                    >
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
          <Card
            variant="outlined"
            sx={{
              borderRadius: 3,
              height: '100%',
              borderColor: isLightMode ? 'rgba(148,163,184,0.45)' : 'divider',
              background: isLightMode
                ? 'linear-gradient(135deg, rgba(255,255,255,0.96), rgba(191,219,254,0.88))'
                : 'transparent',
              boxShadow: isLightMode ? '0 26px 56px -40px rgba(59,130,246,0.45)' : theme.shadows[1],
              animation: `${cardFade} 0.8s ease-out both`,
            }}
          >
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
          <Card
            variant="outlined"
            sx={{
              borderRadius: 3,
              borderColor: isLightMode ? 'rgba(148,163,184,0.45)' : 'divider',
              background: isLightMode
                ? 'linear-gradient(135deg, rgba(255,255,255,0.96), rgba(226,232,240,0.88))'
                : 'transparent',
              boxShadow: isLightMode ? '0 22px 46px -38px rgba(30,64,175,0.45)' : theme.shadows[1],
              animation: `${cardFade} 0.85s ease-out both`,
            }}
          >
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
