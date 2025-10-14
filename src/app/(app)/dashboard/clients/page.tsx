import { Suspense } from "react";
import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import Link from "next/link";
import KpiCard from "@/components/dashboard/KpiCard";
import ClientQuickActions from "@/components/client/ClientQuickActions";
import { getSessionUserSafe } from "@/lib/session-bridge";
import { greetingForDate } from "@/lib/time";
import { getClientDashboardStats } from "@/lib/stats";
import { redirect } from "next/navigation";
import ClientUpcomingTable from "./_parts/ClientUpcomingTable";

export const dynamic = "force-dynamic";

function firstName(full?: string | null) {
  if (!full) return "Cliente";
  const parts = full.trim().split(/\s+/);
  return parts[0] || full;
}

export default async function ClientDashboardPage() {
  const session = await getSessionUserSafe();
  const me = session?.user;
  if (!me?.id) redirect("/login");

  const stats = await getClientDashboardStats(me.id);
  const { label, emoji } = greetingForDate();
  const name = firstName(me.name ?? me.email ?? undefined);

  const weekTrend = stats.weekTrend ?? null;
  const kpis = [
    {
      label: "Planos de treino",
      value: stats.myPlans ?? 0,
      icon: "📘",
      variant: "accent" as const,
      href: "/dashboard/my-plan",
    },
    {
      label: "Sessões (próx. 7 dias)",
      value: stats.myUpcoming ?? 0,
      icon: "🗓️",
      variant: "success" as const,
      href: "/dashboard/sessions",
      trend: weekTrend?.dir,
      trendValue: weekTrend?.sign,
      trendLabel: "vs. semana anterior",
    },
    {
      label: "Notificações por ler",
      value: stats.unread ?? 0,
      icon: "🔔",
      variant: "warning" as const,
      href: "/dashboard/notifications",
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
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1.5,
          flexWrap: "wrap",
        }}
      >
        <Typography component="h1" variant="h4" fontWeight={800} sx={{ m: 0 }}>
          {emoji} {label}, {name}!
        </Typography>
        <Chip label="dashboard do cliente" size="small" color="primary" variant="outlined" />
      </Box>

      <ClientQuickActions />

      <Box
        sx={{
          display: "grid",
          gap: { xs: 1.5, sm: 2 },
          gridTemplateColumns: {
            xs: "repeat(auto-fit, minmax(220px, 1fr))",
            lg: "repeat(3, minmax(0, 1fr))",
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
            enterDelay={idx * 0.05}
            href={kpi.href}
            trend={kpi.trend}
            trendValue={kpi.trendValue}
            trendLabel={kpi.trendLabel}
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
        <Suspense
          fallback={
            <Paper variant="outlined" sx={{ p: { xs: 2, sm: 2.5 }, borderRadius: 3 }}>
              <Typography variant="subtitle2" fontWeight={700}>
                A carregar sessões próximas…
              </Typography>
            </Paper>
          }
        >
          <ClientUpcomingTable />
        </Suspense>

        <Paper
          variant="outlined"
          sx={{
            p: { xs: 2, sm: 2.5 },
            borderRadius: 3,
            display: "grid",
            gap: 1,
          }}
        >
          <Typography variant="subtitle2" fontWeight={800}>
            Sugestões úteis
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Mantém os teus dados atualizados para que o teu PT ajuste os planos às tuas necessidades.
          </Typography>
          <Box component="ul" sx={{ m: 0, pl: 2.5, display: "grid", gap: 0.75 }}>
            <li>
              <Link href="/dashboard/profile">Revê o teu perfil e objetivos</Link>
            </li>
            <li>
              <Link href="/dashboard/checkins">Regista o teu check-in semanal</Link>
            </li>
            <li>
              <Link href="/dashboard/messages">Fala com o teu PT para ajustar o plano</Link>
            </li>
          </Box>
        </Paper>
      </Box>
    </Box>
  );
}
