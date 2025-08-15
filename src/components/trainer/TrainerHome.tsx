// src/components/trainer/TrainerHome.tsx
"use client";

import * as React from "react";
import { useSession } from "next-auth/react";
import KpiCard from "@/components/dashboard/KpiCard";
import TrendAreaChart, { SeriesPoint } from "@/components/dashboard/TrendAreaChart";
import MiniAgenda, { AgendaItem } from "@/components/dashboard/MiniAgenda";

type Meta = {
  clients?: number;
  sessionsNext7?: number;
  pending?: number;   // pedidos pendentes (se aplicável)
};

type SessionDTO = {
  id?: string;
  start?: string | Date;
  date?: string | Date;
  when?: string | Date;
  title?: string;
  name?: string;
  trainerName?: string;
  clientName?: string;
};

async function getJSON<T>(url: string): Promise<T | null> {
  try {
    const res = await fetch(url, { cache: "no-store", credentials: "same-origin" });
    if (!res.ok) return null;
    const j = await res.json();
    return (j?.data ?? j) as T;
  } catch { return null; }
}

function startOfDay(d: Date) { const z = new Date(d); z.setHours(0,0,0,0); return z; }
function addDays(d: Date, n: number) { const z = new Date(d); z.setDate(z.getDate()+n); return z; }

export default function TrainerHome() {
  const { data: session } = useSession();
  const firstName = session?.user?.name?.split(" ")[0] ?? session?.user?.email?.split("@")[0] ?? "Treinador";

  const [meta, setMeta] = React.useState<Meta>({ clients: 0, sessionsNext7: 0, pending: 0 });
  const [agenda, setAgenda] = React.useState<AgendaItem[]>([]);
  const [series, setSeries] = React.useState<SeriesPoint[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    (async () => {
      setLoading(true);

      const [m, sessions] = await Promise.all([
        getJSON<Meta>("/api/trainer/meta"),
        getJSON<SessionDTO[]>(`/api/trainer/sessions?from=${encodeURIComponent(new Date().toISOString())}&to=${encodeURIComponent(addDays(new Date(), 7).toISOString())}`),
      ]);

      setMeta({ clients: m?.clients ?? 0, sessionsNext7: m?.sessionsNext7 ?? (sessions?.length ?? 0), pending: m?.pending ?? 0 });

      const items: AgendaItem[] = Array.isArray(sessions) ? sessions
        .map((x) => {
          const when = new Date(x.start ?? x.date ?? x.when ?? Date.now());
          return {
            id: String(x.id ?? `${when.getTime()}-${Math.random()}`),
            when: when.toISOString(),
            title: x.title ?? x.name ?? (x.clientName ? `Sessão · ${x.clientName}` : "Sessão"),
            meta: x.clientName ?? "",
            href: "/dashboard/sessions",
          };
        })
        .sort((a,b) => +new Date(a.when) - +new Date(b.when))
        .slice(0, 8) : [];
      setAgenda(items);

      const base: SeriesPoint[] = [];
      const start = startOfDay(addDays(new Date(), -6));
      for (let i=0;i<7;i++) {
        const d = addDays(start, i);
        base.push({ label: d.toLocaleDateString("pt-PT", { weekday: "short" }), value: 0 });
      }
      (sessions ?? []).forEach((s) => {
        const d = startOfDay(new Date(s.start ?? s.date ?? s.when ?? Date.now()));
        const idx = Math.round((+d - +start)/86400000);
        if (idx>=0 && idx<base.length) base[idx].value += 1;
      });
      setSeries(base);

      setLoading(false);
    })();
  }, []);

  const kpis = [
    { label: "Clientes", value: meta.clients ?? 0, icon: "👥" },
    { label: "Sessões (7d)", value: meta.sessionsNext7 ?? agenda.length, icon: "🗓️" },
    { label: "Pendentes", value: meta.pending ?? 0, icon: "⏳" },
    { label: "Produtividade", value: (series.reduce((a,b)=>a+b.value,0)) , icon: "📈" },
  ];

  return (
    <main className="fp-page" aria-labelledby="pt-title">
      <div style={{ padding: "1rem 1rem 0" }}>
        <h1 id="pt-title" style={{ fontSize: "1.75rem", fontWeight: 800, margin: 0 }}>
          Olá, {firstName}
        </h1>
        <p style={{ color: "var(--muted)", marginTop: ".4rem" }}>
          Aqui tens um resumo rápido da tua semana.
        </p>
      </div>

      <section style={{
        display: "grid",
        gridTemplateColumns: "repeat(4, minmax(0,1fr))",
        gap: 12,
        padding: "1rem",
      }}>
        {kpis.map((k) => (
          <KpiCard key={k.label} label={k.label} value={k.value} icon={k.icon} loading={loading} />
        ))}
      </section>

      <section style={{
        display: "grid",
        gridTemplateColumns: "2fr 1fr",
        gap: 12,
        padding: "0 1rem 1rem",
        alignItems: "start",
      }}>
        <div style={{ border: "1px solid var(--border)", borderRadius: 12, padding: 14, background: "var(--bg)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
            <h2 style={{ margin: 0, fontSize: "1.05rem" }}>Tendência de sessões (7 dias)</h2>
            <small style={{ color: "var(--muted)" }}>Atualizado em tempo real</small>
          </div>
          <TrendAreaChart data={series} height={160} />
        </div>

        <div style={{ border: "1px solid var(--border)", borderRadius: 12, padding: 14, background: "var(--bg)" }}>
          <h2 style={{ margin: 0, fontSize: "1.05rem" }}>Próximas sessões</h2>
          <MiniAgenda items={agenda} emptyText="Sem sessões marcadas para os próximos dias." />
        </div>
      </section>

      <section style={{ padding: "0 1rem 1rem" }}>
        <div style={{ border: "1px solid var(--border)", borderRadius: 12, padding: 14, background: "var(--bg)" }}>
          <h2 style={{ margin: 0, fontSize: "1.05rem" }}>Atalhos</h2>
          <div style={{ display: "flex", gap: 8, marginTop: 10, flexWrap: "wrap" }}>
            <a className="fp-pill" href="/dashboard/pt/plans">📄 <span className="label" style={{ marginLeft: 6 }}>Criar plano</span></a>
            <a className="fp-pill" href="/dashboard/sessions">🗓️ <span className="label" style={{ marginLeft: 6 }}>Nova sessão</span></a>
            <a className="fp-pill" href="/dashboard/messages">✉️ <span className="label" style={{ marginLeft: 6 }}>Mensagens</span></a>
            <a className="fp-pill" href="/dashboard/pt/clients">👤 <span className="label" style={{ marginLeft: 6 }}>Os meus clientes</span></a>
          </div>
        </div>
      </section>
    </main>
  );
}
