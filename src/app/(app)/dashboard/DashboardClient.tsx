"use client";

import { useCallback, useMemo } from "react";
import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import KpiCard from "@/components/dashboard/KpiCard";
import { useMe } from "@/hooks/useMe";
import { usePoll } from "@/hooks/usePoll";
import { greetingForDate } from "@/lib/time";

type Stats = {
  clients?: number;
  trainers?: number;
  admins?: number;
  sessions7d?: number;
  sessionsUpcoming?: number;
};

export default function DashboardClient() {
  const { user } = useMe();
  const { data: stats } = usePoll<Stats>("/api/dashboard/stats", { intervalMs: 30000 });

  const s: Stats = stats ?? {};
  const hello = useMemo(() => {
    const { label, emoji } = greetingForDate();
    const baseName = user?.name ?? "Admin";
    return `${emoji} ${label}, ${baseName}!`;
  }, [user?.name]);

  const asNumber = useCallback((input: number | string | null | undefined) => {
    if (typeof input === "number" && Number.isFinite(input)) return input;
    if (typeof input === "string") {
      const normalized = input.trim().replace(/\s+/g, "");
      const parsed = Number(normalized);
      if (Number.isFinite(parsed)) return parsed;
    }
    return 0;
  }, []);

  const kpis = useMemo(
    () => [
      {
        label: "Clientes",
        value: asNumber(s.clients),
        icon: "👥",
        variant: "accent" as const,
      },
      {
        label: "Personal Trainers",
        value: asNumber(s.trainers),
        icon: "🏋️",
        variant: "info" as const,
      },
      {
        label: "Admins",
        value: asNumber(s.admins),
        icon: "🛡️",
        variant: "neutral" as const,
      },
      {
        label: "Sessões (próx. 7d)",
        value: asNumber(s.sessions7d ?? s.sessionsUpcoming),
        icon: "🗓️",
        variant: "success" as const,
      },
    ],
    [asNumber, s.admins, s.clients, s.sessions7d, s.sessionsUpcoming, s.trainers]
  );

  const loading = !stats;

  return (
    <Box
      sx={{
        p: { xs: 2, sm: 3 },
        display: "grid",
        gap: { xs: 2, sm: 3 },
      }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1.5,
          flexWrap: "wrap",
        }}
      >
        <Typography component="h1" variant="h4" fontWeight={800} sx={{ m: 0 }}>
          {hello}
        </Typography>
        <Chip label="bem-vindo(a) de volta" size="small" color="primary" variant="outlined" />
      </Box>

      <Box
        sx={{
          display: "grid",
          gap: { xs: 1.5, sm: 2 },
          gridTemplateColumns: {
            xs: "repeat(auto-fit, minmax(220px, 1fr))",
            lg: "repeat(4, minmax(0, 1fr))",
          },
        }}
      >
        {kpis.map((kpi, idx) => (
          <KpiCard
            key={kpi.label}
            label={kpi.label}
            value={kpi.value}
            icon={kpi.icon}
            variant={kpi.variant}
            loading={loading}
            enterDelay={idx * 0.05}
          />
        ))}
      </Box>

      <Box
        sx={{
          display: "grid",
          gap: { xs: 2, sm: 3 },
          gridTemplateColumns: {
            xs: "1fr",
            lg: "2fr 1fr",
          },
        }}
      >
        <Paper variant="outlined" sx={{ p: { xs: 2, sm: 2.5 }, borderRadius: 3 }}>
          <Typography variant="h6" fontWeight={700} gutterBottom>
            Tendência de sessões (7 dias)
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Atualizado em tempo real
          </Typography>
        </Paper>

        <Box sx={{ display: "grid", gap: { xs: 2, sm: 2.5 } }}>
          <Paper variant="outlined" sx={{ p: { xs: 2, sm: 2.5 }, borderRadius: 3 }}>
            <Typography variant="h6" fontWeight={700} gutterBottom>
              Próximas sessões
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Sem sessões marcadas para os próximos dias.
            </Typography>
          </Paper>

          <Paper variant="outlined" sx={{ p: { xs: 2, sm: 2.5 }, borderRadius: 3 }}>
            <Typography variant="h6" fontWeight={700} gutterBottom>
              Notificações
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Sem novas notificações.
            </Typography>
          </Paper>
        </Box>
      </Box>
    </Box>
  );
}
