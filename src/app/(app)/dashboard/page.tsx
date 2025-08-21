export const dynamic = "force-dynamic";

import React from "react";
import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/sessions";
import { toAppRole } from "@/lib/roles";
import { getAdminStats, getPTStats, getClientStats } from "@/lib/dashboardRepo";
import { getUserTimeZone, greetingForTZ } from "@/lib/time";
import styles from "./dashboard.module.css";

type TrendPoint = { date: string; sessions: number };
type Upcoming = { id: string; date: string; title?: string };
type Notif = { id: string; title: string; createdAt: string };

type DashboardData = {
  counts: { clients: number; trainers: number; admins: number; sessionsNext7d: number };
  trend7d: TrendPoint[];
  upcomingSessions: Upcoming[];
  notifications: Notif[];
};

function fmtDateTimeISO(iso: string) {
  const d = new Date(iso);
  try {
    return d.toLocaleString("pt-PT", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" });
  } catch { return iso.replace("T", " ").slice(0, 16); }
}

function sparklinePoints(data: TrendPoint[], w = 200, h = 48, pad = 2) {
  const max = Math.max(1, ...data.map((d) => d.sessions));
  const step = (w - pad * 2) / Math.max(1, data.length - 1);
  return data.map((d, i) => {
    const x = pad + i * step;
    const y = pad + (h - pad * 2) * (1 - d.sessions / max);
    return `${x},${y}`;
  }).join(" ");
}

export default async function DashboardPage() {
  const user = await getSessionUser();
  if (!user) redirect("/login");

  const role = toAppRole(user.role);
  const data: DashboardData =
    role === "admin"
      ? await getAdminStats()
      : role === "pt"
      ? await getPTStats(user.id)
      : await getClientStats(user.id);

  const tz = getUserTimeZone();
  const greet = greetingForTZ(tz);
  const displayName = user.name?.split(" ")[0] || (role === "admin" ? "Admin" : role === "pt" ? "PT" : "Cliente");

  return (
    <div className={styles.wrap}>
      <h1 className={styles.h1}>
        {greet}, {displayName} <span aria-hidden>👋</span>
      </h1>

      <section className={styles.countsRow} aria-label="Resumo">
        <CountCard label="Clientes" value={data.counts.clients} />
        <CountCard label="Treinadores" value={data.counts.trainers} />
        <CountCard label="Admins" value={data.counts.admins} />
        <CountCard label="Sessões (próx. 7d)" value={data.counts.sessionsNext7d} />
      </section>

      <section className={styles.gridTwo}>
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <div className={styles.cardTitle}>Tendência de sessões (7 dias)</div>
            <div className={styles.cardHint}>Atualizado em tempo real</div>
          </div>
          <div className={styles.cardBody}>
            {data.trend7d?.length ? (
              <div className={styles.sparkWrap} role="img" aria-label="Gráfico de tendência de sessões">
                <svg viewBox="0 0 220 60" className={styles.spark}>
                  <polyline
                    points={sparklinePoints(data.trend7d, 220, 60, 6)}
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    opacity="0.9"
                  />
                </svg>
                <div className={styles.sparkLegend}>
                  {data.trend7d.map((p) => (
                    <span key={p.date}>
                      <strong>{p.sessions}</strong> <span className={styles.labelMuted}>{p.date}</span>
                    </span>
                  ))}
                </div>
              </div>
            ) : (
              <div className={styles.empty}>Sem dados suficientes.</div>
            )}
          </div>
        </div>

        <div className={styles.gridSubTwo}>
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <div className={styles.cardTitle}>Próximas sessões</div>
            </div>
            <div className={styles.cardBody}>
              {data.upcomingSessions?.length ? (
                <ul className={styles.list}>
                  {data.upcomingSessions.map((u) => (
                    <li key={u.id} className={styles.listItem}>
                      <div className={styles.listTitle}>{u.title ?? "Sessão"}</div>
                      <div className={styles.labelMuted}>{fmtDateTimeISO(u.date)}</div>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className={styles.empty}>Sem sessões marcadas para os próximos dias.</div>
              )}
            </div>
          </div>

          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <div className={styles.cardTitle}>Notificações</div>
            </div>
            <div className={styles.cardBody}>
              {data.notifications?.length ? (
                <ul className={styles.list}>
                  {data.notifications.map((n) => (
                    <li key={n.id} className={styles.listItem}>
                      <div className={styles.listTitle}>{n.title}</div>
                      <div className={styles.labelMuted}>{fmtDateTimeISO(n.createdAt)}</div>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className={styles.empty}>Sem novas notificações.</div>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function CountCard({ label, value }: { label: string; value: number }) {
  return (
    <div className={styles.countCard}>
      <div className={styles.countLabel}>{label}</div>
      <div className={styles.countValue}>{value ?? 0}</div>
    </div>
  );
}
