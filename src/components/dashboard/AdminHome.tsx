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
  sessionsNext7?: number; // próximos 7 dias
};

type ApiResult<T> = { ok?: boolean; data?: T } | T;
type SessionItem = {
  id?: string | number;
  start?: string;
  date?: string;
  when?: string;
  title?: string;
  name?: string;
  clientName?: string;
  trainerName?: string;
};

// Notificação proveniente de audit_logs
type AdminNotification = {
  id: string;
  action: string; // "USER_REGISTERED"
  target: string | null;
  meta?: any;
  createdAt: string;
  user?: {
    id: string;
    email: string | null;
    name: string | null;
    role: string | null;
    status: string | null;
  } | null;
};

async function getJSON<T>(url: string): Promise<T | null> {
  try {
    const res = await fetch(url, { cache: "no-store", credentials: "same-origin" });
    if (!res.ok) return null;
    const j = (await res.json()) as ApiResult<T>;
    // @ts-expect-error — tolerância a {data:…} ou payload direto
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

  const [pendingCount, setPendingCount] = useState<number>(0);
  const [notifications, setNotifications] = useState<AdminNotification[]>([]);

  useEffect(() => {
    let timer: any;
    (async () => {
      await loadAll(); // carga inicial
      // poll leve a cada 30s
      timer = setInterval(loadLight, 30_000);
    })();
    return () => timer && clearInterval(timer);
  }, []);

  async function loadAll() {
    setLoading(true);

    // janela sessões: últimos 6 dias até hoje + próximos 7
    const from = startOfDay(addDays(new Date(), -6)).toISOString();
    const to = addDays(new Date(), 7).toISOString();

    const [s, acts, sess, notif, count] = await Promise.all([
      getJSON<Stats>("/api/dashboard/stats"),
      getJSON<ActivityItem[]>("/api/dashboard/activities?limit=8"),
      getJSON<SessionItem[]>(
        `/api/trainer/sessions?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`
      ),
      getJSON<AdminNotification[]>("/api/admin/notifications?limit=8"),
      getJSON<{ pending: number; active: number; suspended: number; total: number }>(
        "/api/admin/approvals/count"
      ),
    ]);

    setStats(s ?? { clients: 0, trainers: 0, admins: 0, sessionsNext7: 0 });
    setActivities(Array.isArray(acts) ? acts : []);

    const list = Array.isArray(sess) ? sess : [];

    // Agenda (próx 7)
    const upcoming: AgendaItem[] = list
      .filter((x) => +new Date(x.start ?? x.date ?? x.when ?? 0) >= Date.now())
      .map((x) => {
        const when = new Date(x.start ?? x.date ?? x.when ?? Date.now());
        return {
          id: String(x.id ?? `${when.getTime()}-${Math.random()}`),
          when: when.toISOString(),
          title: x.title ?? x.name ?? `Sessão${x.clientName ? ` · ${x.clientName}` : ""}`,
          meta:
            x.trainerName && x.clientName
              ? `${x.trainerName} → ${x.clientName}`
              : x.trainerName ?? x.clientName ?? "",
          href: "/dashboard/sessions",
        };
      })
      .sort((a, b) => +new Date(a.when) - +new Date(b.when))
      .slice(0, 6);
    setAgenda(upcoming);

    // Série (últimos 7)
    const base: SeriesPoint[] = [];
    const start = startOfDay(addDays(new Date(), -6));
    for (let i = 0; i < 7; i++) {
      const d = addDays(start, i);
      base.push({ label: d.toLocaleDateString("pt-PT", { weekday: "short" }), value: 0 });
    }
    list.forEach((x) => {
      const d = startOfDay(new Date(x.start ?? x.date ?? x.when ?? Date.now()));
      const idx = Math.round((+d - +start) / 86400000);
      if (idx >= 0 && idx < base.length) base[idx].value += 1;
    });
    setSeries(base);

    setNotifications(Array.isArray(notif) ? notif : []);
    setPendingCount(Number(count?.pending ?? 0));

    setLoading(false);
  }

  // carga "leve" só para notificações e pendentes
  async function loadLight() {
    const [notif, count] = await Promise.all([
      getJSON<AdminNotification[]>("/api/admin/notifications?limit=8"),
      getJSON<{ pending: number }>(
        "/api/admin/approvals/count"
      ),
    ]);
    if (Array.isArray(notif)) setNotifications(notif);
    if (count && typeof count.pending === "number") setPendingCount(count.pending);
  }

  // KPI: próximos 7 dias
  const sessionsNext7 = useMemo(() => {
    if (typeof stats?.sessionsNext7 === "number") return stats.sessionsNext7;
    return agenda.length;
  }, [stats?.sessionsNext7, agenda.length]);

  const kpis = useMemo(
    () => [
      { label: "Clientes", value: stats?.clients ?? 0, icon: "👥" },
      { label: "Personal Trainers", value: stats?.trainers ?? 0, icon: "🏋️" },
      { label: "Admins", value: stats?.admins ?? 0, icon: "🛡️" },
      { label: "Sessões (próx. 7d)", value: sessionsNext7, icon: "🗓️" },
    ],
    [stats, sessionsNext7]
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

        {/* Badge de pendentes + atalho para aprovações */}
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 8 }}>
          <a href="/dashboard/admin/approvals" className="fp-pill" title="Ver aprovações pendentes">
            <span aria-hidden>🔔</span>
            <span className="label">Novos registos</span>
            <span
              aria-live="polite"
              style={{
                marginLeft: 6,
                minWidth: 22,
                height: 22,
                border: "1px solid var(--border)",
                borderRadius: 999,
                display: "inline-grid",
                placeItems: "center",
                padding: "0 6px",
                fontWeight: 700,
                background: "var(--chip)",
              }}
            >
              {pendingCount}
            </span>
          </a>
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

      {/* Chart + Agenda + Notificações */}
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
            display: "grid",
            gap: 12,
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
            <h2 style={{ margin: 0, fontSize: "1.05rem" }}>Próximas sessões</h2>
            <MiniAgenda items={agenda} emptyText="Sem sessões marcadas para os próximos dias." />
          </div>

          {/* Notificações (novos registos) */}
          <div
            style={{
              border: "1px solid var(--border)",
              borderRadius: 12,
              padding: 14,
              background: "var(--bg)",
            }}
          >
            <h2 style={{ margin: 0, fontSize: "1.05rem" }}>Notificações</h2>
            {notifications.length === 0 ? (
              <p style={{ color: "var(--muted)", margin: "8px 0 0" }}>
                Sem novas notificações.
              </p>
            ) : (
              <ul style={{ listStyle: "none", padding: 0, margin: "8px 0 0", display: "grid", gap: 8 }}>
                {notifications.map((n) => {
                  const created = new Date(n.createdAt);
                  const u = n.user;
                  const label =
                    n.action === "USER_REGISTERED"
                      ? `Novo registo${u?.email ? ` · ${u.email}` : ""}`
                      : n.action;
                  const meta =
                    u?.role && u?.status
                      ? `${u.role} · ${u.status}`
                      : n.meta?.wantsTrainer
                      ? "Pretende ser PT"
                      : "";

                  return (
                    <li
                      key={n.id}
                      style={{
                        display: "grid",
                        gridTemplateColumns: "auto 1fr auto",
                        gap: 8,
                        alignItems: "center",
                        border: "1px solid var(--border)",
                        borderRadius: 10,
                        padding: "8px 10px",
                        background: "transparent",
                      }}
                    >
                      <span aria-hidden>🆕</span>
                      <div style={{ minWidth: 0 }}>
                        <div style={{ fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                          {label}
                        </div>
                        {meta && (
                          <div style={{ color: "var(--muted)", fontSize: ".85rem" }}>{meta}</div>
                        )}
                      </div>
                      <time
                        dateTime={created.toISOString()}
                        title={created.toLocaleString("pt-PT")}
                        style={{ color: "var(--muted)", fontSize: ".85rem", whiteSpace: "nowrap" }}
                      >
                        {created.toLocaleDateString("pt-PT", { day: "2-digit", month: "2-digit" })} {created.toLocaleTimeString("pt-PT", { hour: "2-digit", minute: "2-digit" })}
                      </time>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>
      </section>

      {/* Atividade (mantém, caso uses outras entradas) */}
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
