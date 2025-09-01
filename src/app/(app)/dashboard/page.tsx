// src/app/(app)/dashboard/page.tsx
export const dynamic = 'force-dynamic';

import React from 'react';
import { redirect } from 'next/navigation';
import { getSessionUser } from '@/lib/sessions';
import { toAppRole, isAdmin, isTrainer, type AppRole } from '@/lib/roles';
import { getAdminStats, getPTStats, getClientStats } from '@/lib/dashboardRepo';
import { getUserTimeZone, greetingForTZ } from '@/lib/time';
import EmptyState from '@/components/ui/EmptyState';
import styles from './dashboard.module.css';

type TrendPoint = { date: string; sessions: number };
type Upcoming = { id: string; date: string; title?: string };
type Notif = { id: string; title: string; createdAt?: string | null };

type DashboardData = {
  counts: {
    clients: number;
    trainers: number;
    admins: number;
    sessionsNext7d: number;
  };
  trend7d: TrendPoint[];
  upcomingSessions: Upcoming[];
  notifications: Notif[];
};

function fmtDateTimeISO(iso: string) {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return String(iso).replace('T', ' ').slice(0, 16);
  try {
    return d.toLocaleString('pt-PT', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return iso.replace('T', ' ').slice(0, 16);
  }
}

function sparklinePoints(data: TrendPoint[], w = 220, h = 60, pad = 6) {
  if (!Array.isArray(data) || data.length === 0) return '';
  const safe = data.map((d) => ({
    sessions: Number.isFinite(d.sessions) ? Math.max(0, d.sessions) : 0,
  }));
  const max = Math.max(1, ...safe.map((d) => d.sessions));
  const step = (w - pad * 2) / Math.max(1, safe.length - 1);
  return safe
    .map((d, i) => {
      const x = pad + i * step;
      const y = pad + (h - pad * 2) * (1 - d.sessions / max);
      return `${x},${y}`;
    })
    .join(' ');
}

function emptyData(): DashboardData {
  return {
    counts: { clients: 0, trainers: 0, admins: 0, sessionsNext7d: 0 },
    trend7d: [],
    upcomingSessions: [],
    notifications: [],
  };
}

export default async function DashboardPage() {
  const user = await getSessionUser();
  if (!user?.id) redirect('/login');

  const role: AppRole = toAppRole((user as any).role) ?? 'CLIENT';

  // Busca de dados resiliente a erros
  let data: DashboardData = emptyData();
  try {
    if (isAdmin(role)) {
      data = await getAdminStats();
    } else if (isTrainer(role)) {
      data = await getPTStats(user.id);
    } else {
      data = await getClientStats(user.id);
    }
  } catch {
    // Mantém o fallback vazio para não quebrar o dashboard se a query falhar
    data = emptyData();
  }

  const tz = getUserTimeZone();
  const greet = greetingForTZ(tz);
  const displayName =
    user.name?.trim()?.split(' ')?.[0] ||
    (isAdmin(role) ? 'Admin' : isTrainer(role) ? 'PT' : 'Cliente');

  return (
    <div className={styles.wrap}>
      <h1 className={styles.h1}>
        {greet}, {displayName} <span aria-hidden>👋</span>
      </h1>

      <section className={styles.countsRow} aria-label="Resumo">
        <CountCard label="Clientes" value={data.counts?.clients ?? 0} />
        <CountCard label="Treinadores" value={data.counts?.trainers ?? 0} />
        <CountCard label="Admins" value={data.counts?.admins ?? 0} />
        <CountCard label="Sessões (próx. 7d)" value={data.counts?.sessionsNext7d ?? 0} />
      </section>

      <section className={styles.gridTwo}>
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <div className={styles.cardTitle}>Tendência de sessões (7 dias)</div>
            <div className={styles.cardHint}>Atualizado em tempo real</div>
          </div>
          <div className={styles.cardBody}>
            {data.trend7d && data.trend7d.length > 0 ? (
              <div className={styles.sparkWrap} role="img" aria-label="Gráfico de tendência de sessões">
                <svg viewBox="0 0 220 60" className={styles.spark}>
                  <polyline
                    points={sparklinePoints(data.trend7d)}
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    opacity="0.9"
                  />
                </svg>
                <div className={styles.sparkLegend}>
                  {data.trend7d.map((p) => (
                    <span key={`${p.date}-${p.sessions}`}>
                      <strong>{p.sessions}</strong> <span className={styles.labelMuted}>{p.date}</span>
                    </span>
                  ))}
                </div>
              </div>
            ) : (
              <EmptyState
                emoji="📉"
                title="Sem dados suficientes"
                subtitle="Ainda não há sessões para gerar o gráfico."
              />
            )}
          </div>
        </div>

        <div className={styles.gridSubTwo}>
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <div className={styles.cardTitle}>Próximas sessões</div>
            </div>
            <div className={styles.cardBody}>
              {data.upcomingSessions && data.upcomingSessions.length > 0 ? (
                <ul className={styles.list}>
                  {data.upcomingSessions.map((u) => (
                    <li key={u.id} className={styles.listItem}>
                      <div className={styles.listTitle}>{u.title ?? 'Sessão'}</div>
                      <div className={styles.labelMuted}>{fmtDateTimeISO(u.date)}</div>
                    </li>
                  ))}
                </ul>
              ) : (
                <EmptyState emoji="🗓️" title="Sem sessões marcadas" subtitle="Nada agendado para os próximos dias." />
              )}
            </div>
          </div>

          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <div className={styles.cardTitle}>Notificações</div>
            </div>
            <div className={styles.cardBody}>
              {data.notifications && data.notifications.length > 0 ? (
                <ul className={styles.list}>
                  {data.notifications.map((n) => (
                    <li key={n.id} className={styles.listItem}>
                      <div className={styles.listTitle}>{n.title}</div>
                      <div className={styles.labelMuted}>{n.createdAt ? fmtDateTimeISO(n.createdAt) : ''}</div>
                    </li>
                  ))}
                </ul>
              ) : (
                <EmptyState emoji="🔔" title="Sem novas notificações" subtitle="Quando houver novidades, aparecem aqui." />
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
      <div className={styles.countValue}>{Number.isFinite(value) ? value : 0}</div>
    </div>
  );
}