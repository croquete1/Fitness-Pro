export const dynamic = 'force-dynamic';

import { redirect } from 'next/navigation';
import { createServerClient } from '@/lib/supabaseServer';
import { getSessionUserSafe } from '@/lib/session-bridge';
import { toAppRole, type AppRole } from '@/lib/roles';

type SB = ReturnType<typeof createServerClient>;

type StatusState = 'ok' | 'warn' | 'down';

type MetricTile = {
  id: string;
  label: string;
  value: string;
  hint?: string;
  variant?: 'primary' | 'info' | 'success' | 'warning' | 'danger' | 'neutral';
};

const numberFormatter = new Intl.NumberFormat('pt-PT');
const dateTimeFormatter = new Intl.DateTimeFormat('pt-PT', { dateStyle: 'short', timeStyle: 'short' });
const timeFormatter = new Intl.DateTimeFormat('pt-PT', { hour: '2-digit', minute: '2-digit' });

function formatNumber(value: number) {
  return numberFormatter.format(Number.isFinite(value) ? value : 0);
}

function formatDateTime(value: string | null) {
  if (!value) return '—';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? '—' : dateTimeFormatter.format(date);
}

function formatTime(value: string | null) {
  if (!value) return '—';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? '—' : timeFormatter.format(date);
}

function roleLabel(role: string | null) {
  switch (role) {
    case 'PT':
      return 'Personal Trainer';
    case 'ADMIN':
      return 'Administrador';
    case 'CLIENT':
      return 'Cliente';
    default:
      return role ?? '—';
  }
}

function StatusPill({ state, label }: { state: StatusState; label: string }) {
  return <span className="status-pill" data-state={state}>{label}</span>;
}

/** Conta linhas com filtros opcionais, aplicados ANTES do select(count). */
async function safeCount(
  sb: SB,
  table: string,
  build?: (q: ReturnType<SB['from']> & any) => ReturnType<SB['from']> & any,
) {
  try {
    let q = sb.from(table) as any;
    if (build) q = build(q);
    const { count } = await q.select('*', { count: 'exact', head: true });
    return count ?? 0;
  } catch {
    return 0;
  }
}

export default async function SystemMetricsPage() {
  const viewer = await getSessionUserSafe();
  if (!viewer?.id) redirect('/login');

  const role = (toAppRole(viewer.role) ?? 'CLIENT') as AppRole;
  if (role !== 'ADMIN') redirect('/dashboard');

  const sb = createServerClient();

  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
  const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
  const in7 = new Date(now);
  in7.setDate(now.getDate() + 7);

  const [
    totalUsers,
    clients,
    trainers,
    admins,
    sessionsToday,
    sessions7d,
    notifs24h,
  ] = await Promise.all([
    safeCount(sb, 'users'),
    safeCount(sb, 'users', (q) => q.eq('role', 'CLIENT')),
    safeCount(sb, 'users', (q) => q.eq('role', 'PT')),
    safeCount(sb, 'users', (q) => q.eq('role', 'ADMIN')),
    safeCount(sb, 'sessions', (q) =>
      q
        .gte('scheduled_at', startOfToday.toISOString())
        .lte('scheduled_at', endOfToday.toISOString())
    ),
    safeCount(sb, 'sessions', (q) =>
      q
        .gte('scheduled_at', now.toISOString())
        .lt('scheduled_at', in7.toISOString())
    ),
    safeCount(sb, 'notifications', (q) =>
      q.gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
    ),
  ]);

  type Signup = { id: string; name: string | null; email: string; role: string | null; created_at: string | null };
  let lastSignups: Signup[] = [];
  try {
    const { data } = await sb
      .from('users')
      .select('id,name,email,role,created_at')
      .order('created_at', { ascending: false })
      .limit(6);
    lastSignups = (data ?? []) as Signup[];
  } catch {
    lastSignups = [];
  }

  type RecentSession = { id: string; scheduled_at: string | null; location: string | null; notes: string | null };
  let todaySessions: RecentSession[] = [];
  try {
    const { data } = await sb
      .from('sessions')
      .select('id,scheduled_at,location,notes')
      .gte('scheduled_at', startOfToday.toISOString())
      .lte('scheduled_at', endOfToday.toISOString())
      .order('scheduled_at', { ascending: true })
      .limit(10);
    todaySessions = (data ?? []) as RecentSession[];
  } catch {
    todaySessions = [];
  }

  const total = totalUsers || 0;
  const clientShare = total > 0 ? Math.round((clients / total) * 100) : 0;
  const trainerShare = total > 0 ? Math.round((trainers / total) * 100) : 0;
  const adminShare = total > 0 ? Math.round((admins / total) * 100) : 0;

  const metricsTiles: MetricTile[] = [
    {
      id: 'total-users',
      label: 'Utilizadores',
      value: formatNumber(totalUsers),
      hint: 'Contas totais no ecossistema',
      variant: 'primary',
    },
    {
      id: 'clients',
      label: 'Clientes',
      value: formatNumber(clients),
      hint: `${clientShare}% da base activa`,
      variant: 'success',
    },
    {
      id: 'trainers',
      label: 'Personal Trainers',
      value: formatNumber(trainers),
      hint: `${trainerShare}% de representação`,
      variant: 'info',
    },
    {
      id: 'admins',
      label: 'Admins',
      value: formatNumber(admins),
      hint: `${adminShare}% com privilégios elevados`,
      variant: 'neutral',
    },
    {
      id: 'sessions-today',
      label: 'Sessões (hoje)',
      value: formatNumber(sessionsToday),
      hint: sessionsToday > 0 ? 'Fluxo saudável para o dia' : 'Sem sessões calendarizadas',
      variant: sessionsToday > 0 ? 'success' : 'warning',
    },
    {
      id: 'sessions-7d',
      label: 'Sessões (7 dias)',
      value: formatNumber(sessions7d),
      hint: 'Agenda confirmada para a próxima semana',
      variant: 'primary',
    },
    {
      id: 'notifs-24h',
      label: 'Notificações (24h)',
      value: formatNumber(notifs24h),
      hint: notifs24h > 0 ? 'Eventos enviados nas últimas 24h' : 'Sem eventos recentes',
      variant: notifs24h > 25 ? 'danger' : notifs24h > 0 ? 'warning' : 'neutral',
    },
  ];

  const signupsState: StatusState = lastSignups.length > 0 ? 'ok' : 'warn';
  const sessionsState: StatusState = todaySessions.length > 0 ? 'ok' : 'warn';
  const headerLabel = `Actualizado às ${timeFormatter.format(now)}`;

  return (
    <section className="system-page neo-stack neo-stack--xl">
      <header className="neo-panel neo-panel--header system-page__hero">
        <div className="neo-stack neo-stack--xs system-page__intro">
          <span className="caps-tag">Inteligência operacional</span>
          <h1 className="system-page__title heading-solid">Pulso da plataforma</h1>
          <p className="system-page__lede">
            Acompanha a evolução de utilizadores, sessões e emissões de notificações para antecipar gargalos e oportunidades.
          </p>
        </div>
        <div className="neo-inline neo-inline--wrap neo-inline--md">
          <StatusPill state="ok" label={headerLabel} />
        </div>
      </header>

      <section className="neo-panel neo-stack neo-stack--xl system-panel" aria-labelledby="metrics-heading">
        <div className="neo-inline neo-inline--wrap neo-inline--between neo-inline--md system-panel__header">
          <div className="neo-stack neo-stack--xs">
            <h2 id="metrics-heading" className="neo-panel__title">Distribuição actual</h2>
            <p className="neo-panel__subtitle">Volumes agregados por tipo de utilizador e actividade.</p>
          </div>
          <StatusPill state={sessions7d > 0 ? 'ok' : 'warn'} label={`${formatNumber(sessions7d)} sessões/7d`} />
        </div>
        <div className="neo-grid neo-grid--auto system-metrics__grid">
          {metricsTiles.map((metric) => (
            <article
              key={metric.id}
              className="neo-surface neo-surface--interactive neo-stack neo-stack--md system-metrics__metric"
              data-variant={metric.variant}
            >
              <span className="neo-surface__label">{metric.label}</span>
              <span className="neo-surface__value">{metric.value}</span>
              {metric.hint && <span className="neo-surface__hint">{metric.hint}</span>}
            </article>
          ))}
        </div>
      </section>

      <div className="system-metrics__split">
        <section className="neo-panel neo-stack neo-stack--lg system-panel" aria-labelledby="signups-heading">
          <div className="neo-inline neo-inline--wrap neo-inline--between neo-inline--md system-panel__header">
            <div className="neo-stack neo-stack--xs">
              <h2 id="signups-heading" className="neo-panel__title">Novos registos</h2>
              <p className="neo-panel__subtitle">Últimas contas criadas na plataforma.</p>
            </div>
            <StatusPill state={signupsState} label={`${lastSignups.length} recentes`} />
          </div>
          {lastSignups.length === 0 ? (
            <div className="neo-surface neo-surface--padded system-empty system-empty--center">
              Sem registos recentes.
            </div>
          ) : (
            <ul className="neo-stack neo-stack--md system-metrics__list">
              {lastSignups.map((user) => (
                <li key={user.id} className="neo-surface neo-surface--interactive neo-stack neo-stack--sm system-metrics__item">
                  <div className="neo-stack neo-stack--sm system-metrics__itemBody">
                    <div className="neo-inline neo-inline--wrap neo-inline--between neo-inline--sm system-metrics__itemHeader">
                      <span className="system-metrics__itemTitle">{user.name ?? user.email}</span>
                      <span className="neo-text--xs neo-text--muted system-metrics__timestamp">{formatDateTime(user.created_at)}</span>
                    </div>
                    <div className="system-metrics__itemMeta">
                      <span className="system-metrics__role">{roleLabel(user.role)}</span>
                      <span className="system-metrics__dot" aria-hidden="true">•</span>
                      <span className="system-metrics__email">{user.email}</span>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="neo-panel neo-stack neo-stack--lg system-panel" aria-labelledby="sessions-heading">
          <div className="neo-inline neo-inline--wrap neo-inline--between neo-inline--md system-panel__header">
            <div className="neo-stack neo-stack--xs">
              <h2 id="sessions-heading" className="neo-panel__title">Sessões de hoje</h2>
              <p className="neo-panel__subtitle">Agenda confirmada entre {formatTime(startOfToday.toISOString())} e {formatTime(endOfToday.toISOString())}.</p>
            </div>
            <StatusPill state={sessionsState} label={`${todaySessions.length} marcadas`} />
          </div>
          {todaySessions.length === 0 ? (
            <div className="neo-surface neo-surface--padded system-empty system-empty--center">
              Sem sessões marcadas para hoje.
            </div>
          ) : (
            <ul className="neo-stack neo-stack--md system-metrics__list">
              {todaySessions.map((session) => (
                <li key={session.id} className="neo-surface neo-surface--interactive neo-stack neo-stack--sm system-metrics__item">
                  <div className="neo-stack neo-stack--sm system-metrics__itemBody">
                    <div className="neo-inline neo-inline--wrap neo-inline--between neo-inline--sm system-metrics__itemHeader">
                      <span className="system-metrics__itemTitle">{session.notes?.trim() || 'Sessão'}</span>
                      <span className="neo-text--xs neo-text--muted system-metrics__timestamp">{formatTime(session.scheduled_at)}</span>
                    </div>
                    <div className="system-metrics__itemMeta">
                      <span className="system-metrics__location">
                        {session.location ? `📍 ${session.location}` : 'Local a definir'}
                      </span>
                      <span className="system-metrics__dot" aria-hidden="true">•</span>
                      <span className="system-metrics__id">ID {session.id.slice(0, 8)}</span>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </section>
  );
}
