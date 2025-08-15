"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import KpiCard from "./KpiCard";
import TrendAreaChart, { SeriesPoint } from "./TrendAreaChart";
import ActivityFeed, { ActivityItem } from "./ActivityFeed";
import MiniAgenda, { AgendaItem } from "./MiniAgenda";

type Stats = {
  clients?: number;
  trainers?: number;
  admins?: number;
  sessionsNext7?: number;
};

type ApiResult<T> = { ok?: boolean; data?: T } | T;

async function getJSON<T>(url: string): Promise<T | null> {
  try {
    const res = await fetch(url, { cache: "no-store", credentials: "same-origin" });
    if (!res.ok) return null;
    const j = (await res.json()) as ApiResult<T>;
    // Normaliza {data:…} ou o payload direto
    // @ts-expect-error - tolerância a formatos diversos
    return (j?.data ?? j) as T;
  } catch {
    return null;
  }
}

function startOfDay(d: Date) {
  const z = new Date(d);
  z.setHours(0, 0, 0, 0);
  return z;
}
function addDays(d: Date, n: number) {
  const z = new Date(d);
  z.setDate(z.getDate() + n);
  return z;
}

export default function AdminHome() {
  const { data: session } = useSession();
  const firstName =
    session?.user?.name?.split(" ")[0] ??
    session?.user?.email?.split("@")[0] ??
    "Admin";

  const [stats, setStats] = useState<Stats | null>(null);
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [agenda, setAgenda] = useState<AgendaItem[]>([]);
  const [series, setSeries] = useState<SeriesPoint[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);

      const [s, acts, sessions] = await Promise.all([
        getJSON<Stats>("/api/dashboard/stats"),
        getJSON<ActivityItem[]>("/api/dashboard/activities?limit=8"),
        // Próximos 7 dias
        getJSON<any[]>(
          `/api/trainer/sessions?from=${encodeURIComponent(
            new Date().toISOString()
          )}&to=${encodeURIComponent(addDays(new Date(), 7).toISOString())}`
        ),
      ]);

      setStats(s ?? { clients: 0, trainers: 0, admins: 0, sessionsNext7: 0 });
      setActivities(Array.isArray(acts) ? acts : []);

      // Mini-agenda: normaliza
      const agendaItems: AgendaItem[] = Array.isArray(sessions)
        ? sessions
            .map((x) => {
              const when = new Date(x.start ?? x.date ?? x.when ?? Date.now());
              return {
                id: String(x.id ?? `${when.getTime()}-${Math.random()}`),
                when: when.toISOString(),
                title:
                  x.title ??
                  x.name ??
                  `Sessão${x.clientName ? ` · ${x.clientName}` : ""}`,
                meta:
                  x.trainerName && x.clientName
                    ? `${x.trainerName} → ${x.clientName}`
                    : x.trainerName ?? x.clientName ?? "",
                href: "/dashboard/sessions",
              };
            })
            .sort((a, b) => +new Date(a.when) - +new Date(b.when))
            .slice(0, 6)
        : [];
      setAgenda(agendaItems);

      // Série (7 dias): agrega sessões por dia
      const base: SeriesPoint[] = [];
      const start = startOfDay(addDays(new Date(), -6));
      for (let i = 0; i < 7; i++) {
        const d = addDays(start, i);
        base.push({ label: d.toLocaleDateString("pt-PT", { weekday: "short" }), value: 0 });
      }
      if (Array.isArray(sessions)) {
        sessions.forEach((x) => {
          const d = startOfDay(new Date(x.start ?? x.date ?? x.when ?? Date.now()));
          const idx = Math.round((+d - +start) / 86400000);
          if (idx >= 0 && idx < base.length) base[idx].value += 1;
        });
      }
      setSeries(base);

      setLoading(false);
    })();
  }, []);

  const kpis = useMemo(
    () => [
      { label: "Clientes", value: stats?.clients ?? 0, icon: "👥" },
      { label: "Treinadores", value: stats?.trainers ?? 0, icon: "🏋️" },
      { label: "Admins", value: stats?.admins ?? 0, icon: "🛡️" },
      { label: "Sessões (7d)", value: stats?.sessionsNext7 ?? agenda.length, icon: "🗓️" },
    ],
    [stats, agenda.length]
  );

  return (
    <main className="fp-page" aria-labelledby="dash-title">
      <div style={{ padding: "1rem 1rem 0 1rem" }}>
        <h1 id="dash-title" style={{ fontSize: "1.75rem", fontWeight: 800, margin: 0 }}>
          Olá, {firstName} (Admin)
        </h1>
        <p style={{ color: "var(--muted)", marginTop: ".4rem" }}>
          Aqui tens um resumo do teu dia e atalhos rápidos.
        </p>
      </div>

      {/* KPIs */}
      <section
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, minmax(0,1fr))",
          gap: "12px",
          padding: "1rem",
        }}
      >
        {kpis.map((k) => (
          <KpiCard key={k.label} label={k.label} value={k.value} icon={k.icon} loading={loading} />
        ))}
      </section>

      {/* Chart + Agenda + Activity */}
      <section
        style={{
          display: "grid",
          gridTemplateColumns: "2fr 1fr",
          gap: "12px",
          padding: "0 1rem 1rem",
          alignItems: "start",
        }}
      >
        <div
          style={{
            border: "1px solid var(--border)",
            borderRadius: 12,
            padding: 14,
            background: "var(--bg)",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
            <h2 style={{ margin: 0, fontSize: "1.05rem" }}>Tendência de sessões (7 dias)</h2>
            <small style={{ color: "var(--muted)" }}>Atualizado em tempo real</small>
          </div>
          <TrendAreaChart data={series} height={160} />
        </div>

        <div
          style={{
            border: "1px solid var(--border)",
            borderRadius: 12,
            padding: 14,
            background: "var(--bg)",
          }}
        >
          <h2 style={{ margin: 0, fontSize: "1.05rem" }}>Próximas sessões</h2>
          <MiniAgenda items={agenda} emptyText="Sem sessões marcadas para os próximos dias." />
        </div>
      </section>

      <section style={{ padding: "0 1rem 1rem" }}>
        <div
          style={{
            border: "1px solid var(--border)",
            borderRadius: 12,
            padding: 14,
            background: "var(--bg)",
          }}
        >
          <h2 style={{ margin: 0, fontSize: "1.05rem" }}>Atividade recente</h2>
          <ActivityFeed
            items={activities}
            emptyText="Sem atividade recente."
          />
        </div>
      </section>
    </main>
  );
}
