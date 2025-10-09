"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import KpiCard from "./KpiCard";
import TrendAreaChart, { SeriesPoint } from "./TrendAreaChart";
import ActivityFeed, { ActivityItem } from "./ActivityFeed";
import MiniAgenda, { AgendaItem } from "./MiniAgenda";

type Meta = {
  clients?: number;
  activePlans?: number;
  pendingApprovals?: number;
  weekSessions?: number;
};
type Person = { id: string; role?: string; name?: string };
type SessionItem = { id?: string | number; start?: string; date?: string; when?: string; title?: string; clientName?: string; trainerName?: string };
type ApiResult<T> = { ok?: boolean; data?: T } | T;

async function getJSON<T>(url: string): Promise<T | null> {
  try {
    const res = await fetch(url, { cache: "no-store", credentials: "same-origin" });
    if (!res.ok) return null;
    const j = (await res.json()) as ApiResult<T>;
    // @ts-expect-error – tolerância a {data:…} ou payload direto
    return (j?.data ?? j) as T;
  } catch {
    return null;
  }
}

function startOfDay(d: Date) { const z = new Date(d); z.setHours(0, 0, 0, 0); return z; }
function addDays(d: Date, n: number) { const z = new Date(d); z.setDate(z.getDate() + n); return z; }

export default function TrainerHome() {
  const { data: session } = useSession();
  const firstName =
    session?.user?.name?.split(" ")[0] ??
    session?.user?.email?.split("@")[0] ??
    "Treinador";

  const [rangeDays, setRangeDays] = useState<7 | 14 | 30>(7);

  const [meta, setMeta] = useState<Meta>({});
  const [people, setPeople] = useState<Person[]>([]);
  const [sessions, setSessions] = useState<SessionItem[]>([]);
  const [series, setSeries] = useState<SeriesPoint[]>([]);
  const [agenda, setAgenda] = useState<AgendaItem[]>([]);
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);

      const from = startOfDay(addDays(new Date(), -Math.max(6, rangeDays - 1))).toISOString();
      const to = addDays(new Date(), 7).toISOString();

      const [m, ppl, sess, acts] = await Promise.all([
        getJSON<Meta>("/api/trainer/meta"),
        getJSON<Person[]>("/api/trainer/people"),
        getJSON<SessionItem[]>(
          `/api/trainer/sessions?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`
        ),
        getJSON<ActivityItem[]>("/api/dashboard/activities?limit=8&scope=trainer"),
      ]);

      setMeta(m ?? {});
      setPeople(Array.isArray(ppl) ? ppl : []);
      const list = Array.isArray(sess) ? sess : [];
      setSessions(list);
      setActivities(Array.isArray(acts) ? acts : []);

      // Série (rangeDays)
      const base: SeriesPoint[] = [];
      const start = startOfDay(addDays(new Date(), -(rangeDays - 1)));
      for (let i = 0; i < rangeDays; i++) {
        const d = addDays(start, i);
        base.push({ label: d.toLocaleDateString("pt-PT", { day: "2-digit", month: "2-digit" }), value: 0 });
      }
      list.forEach((x) => {
        const d = startOfDay(new Date(x.start ?? x.date ?? x.when ?? Date.now()));
        const idx = Math.round((+d - +start) / 86400000);
        if (idx >= 0 && idx < base.length) base[idx].value += 1;
      });
      setSeries(base);

      // Mini-agenda (próximos 6)
      const nextItems: AgendaItem[] = list
        .filter((x) => +new Date(x.start ?? x.date ?? x.when ?? 0) >= Date.now())
        .map((x) => {
          const when = new Date(x.start ?? x.date ?? x.when ?? Date.now());
          return {
            id: String(x.id ?? `${when.getTime()}-${Math.random()}`),
            when: when.toISOString(),
            title: x.title ?? `Sessão${x.clientName ? ` · ${x.clientName}` : ""}`,
            meta:
              x.trainerName && x.clientName
                ? `${x.trainerName} → ${x.clientName}`
                : x.clientName ?? "",
            href: "/dashboard/pt/workouts",
          };
        })
        .sort((a, b) => +new Date(a.when) - +new Date(b.when))
        .slice(0, 6);
      setAgenda(nextItems);

      setLoading(false);
    })();
  }, [rangeDays]);

  // KPIs
  const clientsCount =
    meta.clients ?? people.filter((p) => (p.role ?? "").toUpperCase() === "CLIENT").length;
  const withinRange = (d: Date) =>
    +startOfDay(d) >= +startOfDay(addDays(new Date(), -(rangeDays - 1))) &&
    +startOfDay(d) <= +startOfDay(new Date());
  const sessionsInRange =
    sessions.filter((s) => withinRange(new Date(s.start ?? s.date ?? s.when ?? Date.now()))).length;

  const activePlans = meta.activePlans ?? 0;
  const pending = meta.pendingApprovals ?? 0;

  const kpis = useMemo(
    () => [
      { label: "Clientes", value: clientsCount, icon: "👥" },
      { label: `Sessões (${rangeDays}d)`, value: sessionsInRange, icon: "⏱️" },
      { label: "Planos ativos", value: activePlans, icon: "📘" },
      { label: "Pendentes", value: pending, icon: "⏳" },
    ],
    [clientsCount, sessionsInRange, activePlans, pending, rangeDays]
  );

  return (
    <main className="fp-page" aria-labelledby="trainer-title">
      <div style={{ padding: "1rem 1rem 0 1rem" }}>
        <h1 id="trainer-title" style={{ fontSize: "1.75rem", fontWeight: 800, margin: 0 }}>
          Olá, {firstName}
        </h1>
        <p style={{ color: "var(--muted)", marginTop: ".4rem" }}>
          O teu resumo como Personal Trainer.
        </p>

        {/* CTAs */}
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 8 }}>
          <a href="/dashboard/sessions?new=1" className="fp-pill" title="Marcar sessão"><span aria-hidden>🗓️</span><span className="label">Marcar sessão</span></a>
          <a href="/dashboard/pt/workouts/new" className="fp-pill" title="Criar treino"><span aria-hidden>💪</span><span className="label">Criar treino</span></a>
          <a href="/dashboard/pt/plans/new" className="fp-pill" title="Novo plano"><span aria-hidden>📘</span><span className="label">Novo plano</span></a>
        </div>
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

      {/* Chart + Agenda */}
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
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
            <div>
              <h2 style={{ margin: 0, fontSize: "1.05rem" }}>Tendência de sessões</h2>
              <small style={{ color: "var(--muted)" }}>Atualizado em tempo real</small>
            </div>

            {/* Filtros 7 / 14 / 30 */}
            <div className="fp-pill-group" role="tablist" aria-label="Intervalo do gráfico">
              {[7, 14, 30].map((n) => (
                <button
                  key={n}
                  type="button"
                  role="tab"
                  aria-selected={rangeDays === n}
                  className="fp-pill"
                  onClick={() => setRangeDays(n as 7 | 14 | 30)}
                  title={`${n} dias`}
                  style={{
                    background: rangeDays === n ? "var(--chip)" : "transparent",
                    borderColor: rangeDays === n ? "var(--accent)" : "var(--border)",
                  }}
                >
                  <span className="label">{n}d</span>
                </button>
              ))}
            </div>
          </div>

          <TrendAreaChart data={series} height={180} />
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
          <MiniAgenda items={agenda} emptyText="Sem sessões marcadas." />
        </div>
      </section>

      {/* Atividade */}
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
          <ActivityFeed items={activities} emptyText="Sem atividade recente." />
        </div>
      </section>
    </main>
  );
}
