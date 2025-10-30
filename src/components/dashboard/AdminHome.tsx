"use client";

import { useEffect, useMemo, useState, useCallback, useRef } from "react";
import { useSession } from "next-auth/react";
import KpiCard from "./KpiCard";
import TrendAreaChart, { SeriesPoint } from "./TrendAreaChart";
import ActivityFeed, { ActivityItem } from "./ActivityFeed";
import MiniAgenda, { AgendaItem } from "./MiniAgenda";
import { supabaseBrowser } from "@/lib/supabaseBrowser";
import styles from "./AdminHome.module.css";
import clsx from "clsx";

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

async function getJSON<T>(url: string, signal?: AbortSignal): Promise<T | null> {
  try {
    const res = await fetch(url, {
      cache: "no-store",
      credentials: "same-origin",
      signal,
    });
    if (!res.ok) return null;
    const j = (await res.json()) as ApiResult<T>;
    // @ts-expect-error — tolerância a {data:…} ou payload direto
    return (j?.data ?? j) as T;
  } catch (error) {
    if (signal?.aborted) return null;
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
  const supabaseRef = useRef<ReturnType<typeof supabaseBrowser> | null>(null);
  const realtimeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pollTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const loadAbortRef = useRef<AbortController | null>(null);
  const lightAbortRef = useRef<AbortController | null>(null);
  const refreshAbortRef = useRef<AbortController | null>(null);
  const isMountedRef = useRef(true);

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
      loadAbortRef.current?.abort();
      lightAbortRef.current?.abort();
      refreshAbortRef.current?.abort();
      if (pollTimerRef.current) {
        clearInterval(pollTimerRef.current);
        pollTimerRef.current = null;
      }
      if (realtimeTimerRef.current) {
        clearTimeout(realtimeTimerRef.current);
        realtimeTimerRef.current = null;
      }
    };
  }, []);

  const loadAll = useCallback(async () => {
    const controller = new AbortController();
    loadAbortRef.current?.abort();
    loadAbortRef.current = controller;

    setLoading(true);

    try {
      // janela sessões: últimos 6 dias até hoje + próximos 7
      const from = startOfDay(addDays(new Date(), -6)).toISOString();
      const to = addDays(new Date(), 7).toISOString();

      const [s, acts, sess, notif, count] = await Promise.all([
        getJSON<Stats>("/api/dashboard/stats", controller.signal),
        getJSON<ActivityItem[]>("/api/dashboard/activities?limit=8", controller.signal),
        getJSON<SessionItem[]>(
          `/api/trainer/sessions?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`,
          controller.signal
        ),
        getJSON<AdminNotification[]>("/api/admin/notifications?limit=8", controller.signal),
        getJSON<{ pending: number; active: number; suspended: number; total: number }>(
          "/api/admin/approvals/count",
          controller.signal
        ),
      ]);

      if (!isMountedRef.current || controller.signal.aborted) {
        return;
      }

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
    } finally {
      if (loadAbortRef.current === controller) {
        loadAbortRef.current = null;
      }
      if (isMountedRef.current && !controller.signal.aborted) {
        setLoading(false);
      }
    }
  }, []);

  // carga "leve" só para notificações e pendentes
  const loadLight = useCallback(async () => {
    const controller = new AbortController();
    lightAbortRef.current?.abort();
    lightAbortRef.current = controller;

    try {
      const [notif, count] = await Promise.all([
        getJSON<AdminNotification[]>("/api/admin/notifications?limit=8", controller.signal),
        getJSON<{ pending: number }>("/api/admin/approvals/count", controller.signal),
      ]);

      if (!isMountedRef.current || controller.signal.aborted) {
        return;
      }

      if (Array.isArray(notif)) setNotifications(notif);
      if (count && typeof count.pending === "number") setPendingCount(count.pending);
    } finally {
      if (lightAbortRef.current === controller) {
        lightAbortRef.current = null;
      }
    }
  }, []);

  const refreshStats = useCallback(async () => {
    const controller = new AbortController();
    refreshAbortRef.current?.abort();
    refreshAbortRef.current = controller;

    try {
      const next = await getJSON<Stats>("/api/dashboard/stats", controller.signal);
      if (!isMountedRef.current || controller.signal.aborted) {
        return;
      }
      if (next) {
        setStats(next);
      }
    } finally {
      if (refreshAbortRef.current === controller) {
        refreshAbortRef.current = null;
      }
    }
  }, []);

  const scheduleRealtimeRefresh = useCallback(() => {
    if (typeof document !== "undefined" && document.hidden) {
      return;
    }
    if (realtimeTimerRef.current) return;
    realtimeTimerRef.current = setTimeout(() => {
      realtimeTimerRef.current = null;
      void refreshStats();
    }, 350);
  }, [refreshStats]);

  useEffect(() => {
    let disposed = false;

    const stopPolling = () => {
      if (!pollTimerRef.current) return;
      clearInterval(pollTimerRef.current);
      pollTimerRef.current = null;
    };

    const startPolling = () => {
      if (pollTimerRef.current) return;
      pollTimerRef.current = setInterval(() => {
        void loadLight();
      }, 30_000);
    };

    void (async () => {
      try {
        await loadAll();
      } catch (error) {
        console.error("[admin-home] falha ao carregar resumo", error);
      } finally {
        if (!disposed) {
          if (typeof document !== "undefined" && document.hidden) {
            stopPolling();
          } else {
            startPolling();
          }
        }
      }
    })();

    const handleVisibility = () => {
      if (typeof document !== "undefined" && document.hidden) {
        stopPolling();
        return;
      }
      void loadLight();
      startPolling();
    };

    if (typeof window !== "undefined") {
      window.addEventListener("focus", handleVisibility);
    }
    if (typeof document !== "undefined") {
      document.addEventListener("visibilitychange", handleVisibility);
    }

    return () => {
      disposed = true;
      stopPolling();
      if (typeof window !== "undefined") {
        window.removeEventListener("focus", handleVisibility);
      }
      if (typeof document !== "undefined") {
        document.removeEventListener("visibilitychange", handleVisibility);
      }
    };
  }, [loadAll, loadLight]);

  // KPI: próximos 7 dias
  const sessionsNext7 = useMemo(() => {
    const raw = stats?.sessionsNext7 as number | string | null | undefined;
    if (typeof raw === "number" && Number.isFinite(raw)) return raw;
    if (typeof raw === "string") {
      const parsed = Number(raw.trim().replace(/\s+/g, ""));
      if (Number.isFinite(parsed)) return parsed;
    }
    return agenda.length;
  }, [agenda.length, stats?.sessionsNext7]);

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
        value: asNumber(stats?.clients),
        icon: "👥",
        href: "/dashboard/admin/clients",
        tooltip: "Ver lista de clientes",
        variant: "accent" as const,
      },
      {
        label: "Personal Trainers",
        value: asNumber(stats?.trainers),
        icon: "🏋️",
        href: "/dashboard/admin/users?q=pt",
        tooltip: "Gerir personal trainers",
        variant: "info" as const,
      },
      {
        label: "Admins",
        value: asNumber(stats?.admins),
        icon: "🛡️",
        href: "/dashboard/admin/users?q=admin",
        tooltip: "Gerir administradores",
        variant: "neutral" as const,
      },
      {
        label: "Sessões (próx. 7d)",
        value: asNumber(sessionsNext7),
        icon: "🗓️",
        href: "/dashboard/admin/pts-schedule",
        tooltip: "Abrir agenda de sessões",
        variant: "success" as const,
      },
    ],
    [asNumber, sessionsNext7, stats?.admins, stats?.clients, stats?.trainers]
  );

  useEffect(() => {
    if (supabaseRef.current) return;
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!url || !anon) return;
    try {
      supabaseRef.current = supabaseBrowser();
    } catch (error) {
      supabaseRef.current = null;
    }
  }, []);

  useEffect(() => {
    const sb = supabaseRef.current;
    if (!sb) return () => {};

    const channel = sb
      .channel("admin-dashboard-kpis")
      .on("postgres_changes", { event: "*", schema: "public", table: "users" }, () => {
        scheduleRealtimeRefresh();
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "sessions" }, () => {
        scheduleRealtimeRefresh();
      })
      .subscribe();

    return () => {
      if (realtimeTimerRef.current) {
        clearTimeout(realtimeTimerRef.current);
        realtimeTimerRef.current = null;
      }
      void channel.unsubscribe();
    };
  }, [scheduleRealtimeRefresh]);

  return (
    <main className={clsx("fp-page", styles.page)} aria-labelledby="dash-title">
      <section className={styles.hero}>
        <div className={styles.heroHeader}>
          <div>
            <h1 id="dash-title" className={styles.title}>
              Olá, {firstName} (Admin)
            </h1>
            <p className={styles.subtitle}>Aqui tens um resumo do teu dia e atalhos rápidos.</p>
          </div>
          <a
            href="/dashboard/admin/approvals"
            className={clsx(styles.pendingLink, "focus-ring")}
            title="Ver aprovações pendentes"
          >
            <span aria-hidden>🔔</span>
            <span>Novos registos</span>
            <span aria-live="polite" className={styles.pendingCount}>
              {pendingCount}
            </span>
          </a>
        </div>

        <div className={styles.kpiGrid}>
          {kpis.map((k, idx) => (
            <KpiCard
              key={k.label}
              label={k.label}
              value={k.value}
              icon={k.icon}
              tooltip={k.tooltip}
              href={k.href}
              variant={k.variant}
              loading={loading}
              enterDelay={idx * 0.06}
            />
          ))}
        </div>
      </section>

      <section className={styles.mainSection}>
        <div className={styles.panel}>
          <div className={styles.panelHeader}>
            <h2 className={styles.panelTitle}>Tendência de sessões (7 dias)</h2>
            <small className={styles.panelHint}>Atualizado em tempo real</small>
          </div>
          <TrendAreaChart data={series} height={180} />
        </div>

        <div className={styles.panels}>
          <div className={styles.panel}>
            <h2 className={styles.panelTitle}>Próximas sessões</h2>
            <MiniAgenda items={agenda} emptyText="Sem sessões marcadas para os próximos dias." />
          </div>

          <div className={styles.panel}>
            <h2 className={styles.panelTitle}>Notificações</h2>
            {notifications.length === 0 ? (
              <p className={styles.emptyState}>Sem novas notificações.</p>
            ) : (
              <ul className={styles.list}>
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
                    <li key={n.id} className={styles.notificationItem}>
                      <span aria-hidden>🆕</span>
                      <div style={{ minWidth: 0 }}>
                        <div style={{ fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                          {label}
                        </div>
                        {meta && <div className={styles.notificationMeta}>{meta}</div>}
                      </div>
                      <time
                        dateTime={created.toISOString()}
                        title={created.toLocaleString("pt-PT")}
                        className={styles.notificationTime}
                      >
                        {created.toLocaleDateString("pt-PT", { day: "2-digit", month: "2-digit" })}{" "}
                        {created.toLocaleTimeString("pt-PT", { hour: "2-digit", minute: "2-digit" })}
                      </time>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>
      </section>

      <section className={styles.activitySection}>
        <div className={styles.panel}>
          <h2 className={styles.panelTitle}>Atividade recente</h2>
          <ActivityFeed items={activities} emptyText="Sem atividade recente." />
        </div>
      </section>
    </main>
  );

}
