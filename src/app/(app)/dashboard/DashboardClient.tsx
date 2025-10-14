"use client";

import { useMemo } from "react";
import Link from "next/link";
import useSWR from "swr";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid2";
import Paper from "@mui/material/Paper";
import Chip from "@mui/material/Chip";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import Divider from "@mui/material/Divider";
import Button from "@mui/material/Button";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemAvatar from "@mui/material/ListItemAvatar";
import ListItemText from "@mui/material/ListItemText";
import Avatar from "@mui/material/Avatar";
import Skeleton from "@mui/material/Skeleton";
import Tooltip from "@mui/material/Tooltip";
import Alert from "@mui/material/Alert";
import FitnessCenterIcon from "@mui/icons-material/FitnessCenter";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import NotificationsNoneIcon from "@mui/icons-material/NotificationsNone";
import InsightsIcon from "@mui/icons-material/Insights";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import KpiCard from "@/components/dashboard/KpiCard";
import { useMe } from "@/hooks/useMe";
import { usePoll } from "@/hooks/usePoll";
import { greetingForDate } from "@/lib/time";

type DashboardStatsResponse = {
  ok: boolean;
  role: string;
  stats: Record<string, number>;
};

type OverviewResponse = {
  ok: true;
  stats: {
    totalPlans: number;
    activePlans: number;
    sessionsUpcoming: number;
    unreadNotifications: number;
  };
  activePlan: {
    id: string;
    title: string | null;
    status: string | null;
    start_date: string | null;
    end_date: string | null;
    trainer_id: string | null;
    trainer_name?: string;
  } | null;
  upcomingSessions: Array<{
    id: string;
    scheduled_at: string | null;
    location: string | null;
    status: string | null;
    trainer_id: string | null;
    trainer_name?: string;
  }>;
  lastMeasurement: {
    measured_at: string | null;
    weight_kg: number | null;
    height_cm: number | null;
    body_fat_pct: number | null;
    bmi: number | null;
    notes?: string | null;
  } | null;
  previousMeasurement: OverviewResponse["lastMeasurement"];
  recommendations: string[];
};

const fetcher = async <T,>(url: string): Promise<T> => {
  const res = await fetch(url, { credentials: "include" });
  if (!res.ok) {
    throw new Error(`Erro ${res.status}`);
  }
  return res.json();
};

function formatDate(iso: string | null | undefined, options?: Intl.DateTimeFormatOptions) {
  if (!iso) return "—";
  try {
    return new Intl.DateTimeFormat("pt-PT", options ?? {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(iso));
  } catch {
    return "—";
  }
}

function formatMetric(value: number | null | undefined, suffix = "") {
  if (typeof value !== "number" || Number.isNaN(value)) return "—";
  return `${value.toFixed(1)}${suffix}`;
}

export default function DashboardClient() {
  const { user } = useMe();
  const { data: statsResponse } = usePoll<DashboardStatsResponse>("/api/dashboard/stats", {
    intervalMs: 45000,
  });

  const { data: overview, error: overviewError, isLoading: overviewLoading } = useSWR<OverviewResponse>(
    "/api/dashboard/client/overview",
    fetcher<OverviewResponse>,
    {
      refreshInterval: 60000,
      revalidateOnFocus: true,
    },
  );

  const greeting = useMemo(() => {
    const { label, emoji } = greetingForDate();
    const baseName = user?.name?.trim() || "Cliente";
    return `${emoji} ${label}, ${baseName}!`;
  }, [user?.name]);

  const loadingKpis = !statsResponse || overviewLoading;
  const baseStats = statsResponse?.stats ?? {};
  const overviewStats = overview?.stats ?? {
    totalPlans: 0,
    activePlans: 0,
    sessionsUpcoming: 0,
    unreadNotifications: 0,
  };

  const weightDelta = useMemo(() => {
    const current = overview?.lastMeasurement?.weight_kg;
    const previous = overview?.previousMeasurement?.weight_kg;
    if (typeof current !== "number" || typeof previous !== "number") return null;
    const diff = current - previous;
    if (!Number.isFinite(diff) || diff === 0) return 0;
    return Number(diff.toFixed(1));
  }, [overview?.lastMeasurement?.weight_kg, overview?.previousMeasurement?.weight_kg]);

  const kpis = [
    {
      label: "Planos activos",
      value: overviewStats.activePlans ?? baseStats.myPlans ?? 0,
      icon: "🏋️",
      variant: "accent" as const,
      href: "/dashboard/my-plan",
    },
    {
      label: "Sessões nesta semana",
      value: overviewStats.sessionsUpcoming ?? baseStats.myUpcoming ?? baseStats.sessions7d ?? 0,
      icon: "🗓️",
      variant: "success" as const,
      href: "/dashboard/sessions",
    },
    {
      label: "Notificações por ler",
      value: overviewStats.unreadNotifications ?? baseStats.unread ?? 0,
      icon: "🔔",
      variant: "warning" as const,
      href: "/dashboard/notifications",
      tooltip: "Mantém-te a par das últimas novidades do teu PT.",
    },
    {
      label: "Total de planos",
      value: overviewStats.totalPlans ?? baseStats.myPlans ?? 0,
      icon: "📚",
      variant: "info" as const,
      href: "/dashboard/my-plan",
    },
  ];

  return (
    <Box
      sx={{
        p: { xs: 2, sm: 3 },
        display: "grid",
        gap: { xs: 2, sm: 3 },
      }}
    >
      <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5} alignItems={{ xs: "flex-start", sm: "center" }}>
        <Typography component="h1" variant="h4" fontWeight={800} sx={{ m: 0 }}>
          {greeting}
        </Typography>
        <Chip label="bem-vindo(a) de volta" size="small" color="primary" variant="outlined" />
      </Stack>

      {overviewError && (
        <Alert severity="error" variant="outlined">
          Não foi possível carregar o resumo do teu painel. Tenta novamente dentro de alguns segundos.
        </Alert>
      )}

      <Grid container spacing={2} columns={{ xs: 4, sm: 8, md: 12 }}>
        {kpis.map((kpi, idx) => (
          <Grid key={kpi.label} size={{ xs: 4, sm: 4, md: 3 }}>
            <KpiCard
              label={kpi.label}
              value={kpi.value}
              icon={kpi.icon}
              variant={kpi.variant}
              loading={loadingKpis}
              enterDelay={idx * 0.05}
              href={kpi.href}
              tooltip={kpi.tooltip}
            />
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={3} columns={{ xs: 6, lg: 12 }}>
        <Grid size={{ xs: 6, lg: 7 }}>
          <Paper
            variant="outlined"
            sx={{
              borderRadius: 4,
              p: { xs: 2, sm: 3 },
              display: "grid",
              gap: { xs: 2, sm: 2.5 },
              minHeight: 220,
            }}
          >
            <Stack direction="row" spacing={1} alignItems="center" justifyContent="space-between">
              <Typography variant="h6" fontWeight={800}>
                Plano activo
              </Typography>
              <Tooltip title="Ver todos os planos">
                <Button
                  LinkComponent={Link}
                  href="/dashboard/my-plan"
                  size="small"
                  endIcon={<ChevronRightIcon fontSize="small" />}
                >
                  Ver planos
                </Button>
              </Tooltip>
            </Stack>

            {overviewLoading ? (
              <Stack spacing={1.5}>
                <Skeleton variant="rounded" height={36} />
                <Skeleton variant="rounded" height={20} />
                <Skeleton variant="rounded" height={20} />
              </Stack>
            ) : overview?.activePlan ? (
              <Stack spacing={2}>
                <Stack direction={{ xs: "column", sm: "row" }} spacing={1} alignItems={{ sm: "center" }}>
                  <Chip
                    size="small"
                    color={(overview.activePlan.status ?? "").toUpperCase() === "ACTIVE" ? "success" : "default"}
                    label={(overview.activePlan.status ?? "Ativo").toString()}
                  />
                  <Typography variant="subtitle1" fontWeight={700} sx={{ flexGrow: 1 }}>
                    {overview.activePlan.title ?? "Plano de treino"}
                  </Typography>
                </Stack>
                <Stack direction={{ xs: "column", md: "row" }} spacing={2} divider={<Divider flexItem orientation="vertical" />}
                  sx={{ color: "text.secondary", fontSize: 14 }}
                >
                  <span>Início: {formatDate(overview.activePlan.start_date, { day: "2-digit", month: "short" })}</span>
                  <span>Fim: {formatDate(overview.activePlan.end_date, { day: "2-digit", month: "short" })}</span>
                  <span>PT responsável: {overview.activePlan.trainer_name ?? overview.activePlan.trainer_id ?? "—"}</span>
                </Stack>
                <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
                  <Button
                    LinkComponent={Link}
                    href={`/dashboard/my-plan/${overview.activePlan.id}`}
                    variant="contained"
                    startIcon={<FitnessCenterIcon />}
                  >
                    Abrir plano
                  </Button>
                  <Button
                    LinkComponent={Link}
                    href="/dashboard/sessions"
                    variant="outlined"
                    startIcon={<CalendarTodayIcon />}
                  >
                    Ver sessões
                  </Button>
                </Stack>
              </Stack>
            ) : (
              <Stack spacing={2}>
                <Typography variant="body1" fontWeight={600}>
                  Ainda não tens um plano activo.
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Quando o teu Personal Trainer publicar um plano, ele aparecerá aqui com os detalhes e próximos passos.
                </Typography>
                <Button
                  LinkComponent={Link}
                  href="/dashboard/messages"
                  variant="contained"
                  startIcon={<NotificationsNoneIcon />}
                >
                  Contactar o PT
                </Button>
              </Stack>
            )}
          </Paper>

          <Paper
            variant="outlined"
            sx={{
              borderRadius: 4,
              p: { xs: 2, sm: 3 },
              mt: { xs: 2, sm: 3 },
              display: "grid",
              gap: 2,
            }}
          >
            <Stack direction="row" spacing={1} alignItems="center" justifyContent="space-between">
              <Typography variant="h6" fontWeight={800}>
                Próximas sessões
              </Typography>
              <Button LinkComponent={Link} href="/dashboard/sessions" size="small" endIcon={<ChevronRightIcon fontSize="small" />}>
                Agenda
              </Button>
            </Stack>

            {overviewLoading ? (
              <Stack spacing={1.5}>
                {Array.from({ length: 3 }).map((_, idx) => (
                  <Skeleton key={idx} variant="rounded" height={56} />
                ))}
              </Stack>
            ) : overview?.upcomingSessions?.length ? (
              <List disablePadding>
                {overview.upcomingSessions.map((session) => (
                  <ListItem
                    key={session.id}
                    sx={{
                      px: 0,
                      py: 1,
                      borderBottom: "1px solid",
                      borderColor: "divider",
                      '&:last-of-type': { borderBottom: "none" },
                    }}
                    secondaryAction={
                      <Tooltip title="Ver detalhes">
                        <Button
                          LinkComponent={Link}
                          href="/dashboard/sessions"
                          size="small"
                          endIcon={<ChevronRightIcon fontSize="small" />}
                        >
                          Abrir
                        </Button>
                      </Tooltip>
                    }
                  >
                    <ListItemAvatar>
                      <Avatar variant="rounded" sx={{ bgcolor: "primary.main", color: "primary.contrastText" }}>
                        <CalendarTodayIcon fontSize="small" />
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primaryTypographyProps={{ fontWeight: 600 }}
                      primary={formatDate(session.scheduled_at)}
                      secondary={`${session.location ?? "Local a confirmar"} • ${(session.trainer_name ?? session.trainer_id ?? "PT por atribuir")}`}
                    />
                  </ListItem>
                ))}
              </List>
            ) : (
              <Stack spacing={1}>
                <Typography variant="body1" fontWeight={600}>
                  Sem sessões marcadas nos próximos 7 dias.
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Mantém a consistência agendando a próxima sessão ou revendo o teu plano semanal.
                </Typography>
                <Button LinkComponent={Link} href="/dashboard/sessions" variant="contained" startIcon={<CalendarTodayIcon />}>
                  Marcar sessão
                </Button>
              </Stack>
            )}
          </Paper>
        </Grid>

        <Grid size={{ xs: 6, lg: 5 }} display="grid" gap={3}>
          <Paper
            variant="outlined"
            sx={{
              borderRadius: 4,
              p: { xs: 2, sm: 3 },
              display: "grid",
              gap: 2,
            }}
          >
            <Stack direction="row" spacing={1} alignItems="center" justifyContent="space-between">
              <Typography variant="h6" fontWeight={800}>
                Evolução física
              </Typography>
              <Button LinkComponent={Link} href="/dashboard/clients/metrics" size="small" endIcon={<ChevronRightIcon fontSize="small" />}>
                Ver métricas
              </Button>
            </Stack>

            {overviewLoading ? (
              <Stack spacing={1.5}>
                <Skeleton variant="rounded" height={32} />
                <Skeleton variant="rounded" height={20} />
              </Stack>
            ) : overview?.lastMeasurement ? (
              <Stack spacing={1.5}>
                <Stack direction="row" spacing={1} alignItems="center">
                  <Avatar sx={{ bgcolor: "secondary.main", color: "secondary.contrastText" }}>
                    <InsightsIcon />
                  </Avatar>
                  <Box>
                    <Typography variant="subtitle1" fontWeight={700}>
                      Peso actual: {formatMetric(overview.lastMeasurement.weight_kg, " kg")}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Registado em {formatDate(overview.lastMeasurement.measured_at, { day: "2-digit", month: "long" })}
                    </Typography>
                  </Box>
                </Stack>

                <Stack direction={{ xs: "column", sm: "row" }} spacing={2} divider={<Divider flexItem orientation="vertical" />}>
                  <Typography variant="body2" color="text.secondary">
                    Altura: {formatMetric(overview.lastMeasurement.height_cm, " cm")}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Massa gorda: {formatMetric(overview.lastMeasurement.body_fat_pct, "%")}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    IMC: {formatMetric(overview.lastMeasurement.bmi)}
                  </Typography>
                </Stack>

                {typeof weightDelta === "number" && (
                  <Typography
                    variant="body2"
                    color={weightDelta > 0 ? "warning.main" : weightDelta < 0 ? "success.main" : "text.secondary"}
                    fontWeight={600}
                  >
                    {weightDelta > 0
                      ? `+${weightDelta} kg vs. última medição`
                      : weightDelta < 0
                      ? `${weightDelta} kg vs. última medição`
                      : "Peso estável desde a medição anterior"}
                  </Typography>
                )}

                {overview.lastMeasurement.notes && (
                  <Typography variant="body2" color="text.secondary">
                    Nota: {overview.lastMeasurement.notes}
                  </Typography>
                )}
              </Stack>
            ) : (
              <Stack spacing={1.5}>
                <Typography variant="body1" fontWeight={600}>
                  Ainda não existem registos de métricas.
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Guarda o teu peso, altura e notas para acompanhares a evolução junto do teu Personal Trainer.
                </Typography>
                <Button LinkComponent={Link} href="/dashboard/clients/metrics" variant="contained" startIcon={<InsightsIcon />}>
                  Registar métricas
                </Button>
              </Stack>
            )}
          </Paper>

          <Paper
            variant="outlined"
            sx={{
              borderRadius: 4,
              p: { xs: 2, sm: 3 },
              display: "grid",
              gap: 2,
            }}
          >
            <Typography variant="h6" fontWeight={800}>
              Ações rápidas
            </Typography>
            <Stack spacing={1.5}>
              <Button LinkComponent={Link} href="/dashboard/messages" variant="outlined" startIcon={<NotificationsNoneIcon />}>
                Conversar com o PT
              </Button>
              <Button LinkComponent={Link} href="/dashboard/notifications" variant="outlined" startIcon={<AccessTimeIcon />}>
                Rever notificações
              </Button>
              <Button LinkComponent={Link} href="/dashboard/history" variant="outlined" startIcon={<FitnessCenterIcon />}>
                Histórico de treinos
              </Button>
            </Stack>
          </Paper>

          <Paper
            variant="outlined"
            sx={{
              borderRadius: 4,
              p: { xs: 2, sm: 3 },
              display: "grid",
              gap: 1.5,
            }}
          >
            <Typography variant="h6" fontWeight={800}>
              Recomendações personalizadas
            </Typography>
            {overviewLoading ? (
              <Stack spacing={1}>
                {Array.from({ length: 3 }).map((_, idx) => (
                  <Skeleton key={idx} variant="rounded" height={18} />
                ))}
              </Stack>
            ) : overview?.recommendations?.length ? (
              <List disablePadding>
                {overview.recommendations.map((rec, idx) => (
                  <ListItem key={idx} sx={{ px: 0, py: 0.75 }}>
                    <ListItemAvatar>
                      <Avatar sx={{ bgcolor: "success.main", color: "success.contrastText", width: 32, height: 32 }}>
                        ✅
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText primaryTypographyProps={{ variant: "body2" }} primary={rec} />
                  </ListItem>
                ))}
              </List>
            ) : (
              <Typography variant="body2" color="text.secondary">
                Tudo em dia! Continua a seguir o plano e mantém o contacto com o teu PT para potenciares os resultados.
              </Typography>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}

