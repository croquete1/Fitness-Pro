'use client';

import * as React from 'react';
import Link from 'next/link';
import {
  Activity,
  ArrowUpRight,
  CalendarCheck,
  CalendarDays,
  MapPin,
  Sparkles,
  Users,
  UserCheck,
  UserPlus,
} from 'lucide-react';

import AdminQuickNotesCard from '@/components/admin/AdminQuickNotesCard';
import MotivationAdminCard from '@/components/admin/MotivationAdminCard';
import PageHeader from '@/components/ui/PageHeader';
import { greetingForDate } from '@/lib/time';

export type AgendaRow = {
  id: string;
  scheduled_at: string | null;
  start_time?: string | null;
  trainer_id: string | null;
  trainer_name: string;
  client_id: string | null;
  client_name: string;
  location?: string | null;
};

export type AdminDashboardData = {
  totals: {
    users: number;
    clients: number;
    trainers: number;
    sessionsToday: number;
    pendingApprovals: number;
  };
  recentUsers: Array<{ id: string; name: string; email: string | null; createdAt: string | null }>;
  topTrainers: Array<{ id: string; name: string; total: number }>;
  agenda: AgendaRow[];
  topTrainersSource: 'materialized-view' | 'sessions-fallback' | 'sample';
  agendaSource: 'supabase' | 'sample';
};

type Props = {
  name: string;
  data: AdminDashboardData;
  supabase: boolean;
};

type StatusTone = 'ok' | 'warn' | 'down';

type QuickMetric = {
  label: string;
  value: number;
  hint?: string;
  href: string;
  tone?: 'primary' | 'accent' | 'success' | 'warning' | 'info';
  icon: React.ReactNode;
};

type PulseMetric = {
  label: string;
  value: number | string;
  hint?: string;
  tone?: StatusTone;
};

function formatAgendaTime(value: AgendaRow) {
  const iso = value.scheduled_at ?? value.start_time ?? null;
  if (!iso) {
    return { day: 'Agendar', time: '—' };
  }
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return { day: '—', time: '—' };
  const day = date
    .toLocaleDateString('pt-PT', { weekday: 'short', day: '2-digit', month: 'short' })
    .replace('.', '')
    .toUpperCase();
  const time = date.toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' });
  return { day, time };
}

function formatRelative(iso: string | null | undefined) {
  if (!iso) return '';
  try {
    const value = new Date(iso).getTime();
    if (Number.isNaN(value)) return '';
    const diff = Date.now() - value;
    const minutes = Math.max(0, Math.round(diff / (1000 * 60)));
    if (minutes < 1) return 'agora mesmo';
    if (minutes < 60) return `há ${minutes} min`;
    const hours = Math.round(minutes / 60);
    if (hours < 24) return `há ${hours} h`;
    const days = Math.round(hours / 24);
    if (days < 30) return `há ${days} dia${days === 1 ? '' : 's'}`;
    const months = Math.round(days / 30);
    if (months < 12) return `há ${months} mês${months === 1 ? '' : 'es'}`;
    const years = Math.round(months / 12);
    return `há ${years} ano${years === 1 ? '' : 's'}`;
  } catch {
    return '';
  }
}

function statusToneFromCount(value: number): StatusTone {
  if (value <= 0) return 'warn';
  if (value < 3) return 'ok';
  return 'down';
}

function StatusPill({ tone, children }: { tone: StatusTone; children: React.ReactNode }) {
  return (
    <span className="status-pill" data-state={tone}>
      {children}
    </span>
  );
}

function QuickMetricCard({ label, value, hint, href, tone = 'info', icon }: QuickMetric) {
  const formatter = React.useMemo(() => new Intl.NumberFormat('pt-PT'), []);
  const formattedValue = formatter.format(value);

  const content = (
    <div className="admin-quick-metric__layout">
      <div className="admin-quick-metric__header">
        <div className="admin-quick-metric__meta">
          <span className="admin-quick-metric__label">{label}</span>
          <span className="admin-quick-metric__value">{formattedValue}</span>
          {hint && <p className="admin-quick-metric__hint">{hint}</p>}
        </div>
        <span className="admin-quick-metric__icon" aria-hidden>
          {icon}
        </span>
      </div>
      <span className="link-arrow admin-quick-metric__cta">
        Abrir <ArrowUpRight className="neo-icon neo-icon--sm" aria-hidden />
      </span>
    </div>
  );

  return (
    <Link
      href={href}
      prefetch={false}
      className="neo-surface neo-surface--interactive admin-quick-metric"
      data-tone={tone}
      aria-label={`${label} – abrir detalhes`}
    >
      {content}
    </Link>
  );
}

function PulseMetricCard({ label, value, hint, tone = 'warn' }: PulseMetric) {
  return (
    <div className="admin-pulse-card">
      <div className="admin-pulse-card__header">
        <span className="admin-pulse-card__label">{label}</span>
        <StatusPill tone={tone}>{tone === 'ok' ? 'Saudável' : tone === 'warn' ? 'Atenção' : 'Revê'}</StatusPill>
      </div>
      <p className="admin-pulse-card__value">{value}</p>
      {hint && <p className="admin-pulse-card__hint">{hint}</p>}
    </div>
  );
}

function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');
}

export default function AdminDashboardClient({ name, data, supabase }: Props) {
  const greeting = React.useMemo(() => greetingForDate(), []);

  const quickMetrics: QuickMetric[] = [
    {
      label: 'Utilizadores',
      value: data.totals.users,
      hint: `${data.totals.clients} clientes · ${data.totals.trainers} Personal Trainers`,
      href: '/dashboard/admin/users',
      tone: 'primary',
      icon: <Users className="neo-icon neo-icon--sm" aria-hidden />,
    },
    {
      label: 'Sessões hoje',
      value: data.totals.sessionsToday,
      hint: 'próximas 24h',
      href: '/dashboard/admin/pts-schedule',
      tone: 'accent',
      icon: <CalendarCheck className="neo-icon neo-icon--sm" aria-hidden />,
    },
    {
      label: 'Aprovações pendentes',
      value: data.totals.pendingApprovals,
      hint: 'aguardam revisão',
      href: '/dashboard/admin/approvals',
      tone: 'warning',
      icon: <UserCheck className="neo-icon neo-icon--sm" aria-hidden />,
    },
    {
      label: 'Novos registos',
      value: data.recentUsers.length,
      hint: 'últimos dias',
      href: '/dashboard/admin/users?filter=recent',
      tone: 'success',
      icon: <UserPlus className="neo-icon neo-icon--sm" aria-hidden />,
    },
  ];

  const sessionsNext7 = data.topTrainers.reduce((sum, row) => sum + (row.total ?? 0), 0);
  const sessionsNext7Hint = React.useMemo(() => {
    if (!supabase) return 'estimativa local (fallback)';
    if (data.topTrainersSource === 'materialized-view') {
      return 'vista materializada com refresh concorrente';
    }
    if (data.topTrainersSource === 'sessions-fallback') {
      return 'contagem directa das sessões (fallback)';
    }
    return 'dados simulados';
  }, [data.topTrainersSource, supabase]);
  const clientsShare = data.totals.users
    ? Math.round((data.totals.clients / Math.max(1, data.totals.users)) * 100)
    : 0;

  const pulse: PulseMetric[] = [
    {
      label: 'Clientes activos',
      value: data.totals.clients,
      hint: `${clientsShare}% da base`,
      tone: data.totals.clients > 0 ? 'ok' : 'warn',
    },
    {
      label: 'PT com agenda',
      value: data.topTrainers.length,
      hint: `${data.totals.trainers} Personal Trainers totais`,
      tone: data.topTrainers.length > 0 ? 'ok' : 'warn',
    },
    {
      label: 'Sessões (7 dias)',
      value: sessionsNext7,
      hint: sessionsNext7Hint,
      tone: sessionsNext7 > 6 ? 'ok' : sessionsNext7 > 0 ? 'warn' : 'down',
    },
    {
      label: 'Pendências críticas',
      value: data.totals.pendingApprovals,
      hint: 'revê hoje',
      tone: statusToneFromCount(data.totals.pendingApprovals),
    },
  ];

  const agendaRows = React.useMemo(() => data.agenda.slice(0, 6), [data.agenda]);

  return (
    <div className="admin-dashboard">
      <PageHeader
        title={
          <div className="admin-dashboard__headline">
            <span className="caps-tag">Centro de operações</span>
            <span className="admin-dashboard__title">
              {greeting.emoji} {greeting.label}, {name || 'Admin'}!
            </span>
          </div>
        }
        subtitle={
          supabase
            ? 'Estamos a usar dados em tempo real do servidor. Mantém a vigilância sobre os indicadores chave.'
            : 'A ligação ao servidor não está configurada neste ambiente — utilizamos dados de exemplo para não interromper o fluxo.'
        }
        actions={
          <div className="admin-dashboard__actions">
            <Link
              href="/dashboard/system"
              className="btn"
              data-variant="ghost"
              data-size="md"
              prefetch={false}
            >
              Monitorização
            </Link>
            <Link
              href="/dashboard/admin/approvals"
              className="btn"
              data-variant="primary"
              data-size="md"
              prefetch={false}
            >
              Aprovações
            </Link>
          </div>
        }
      />

      <section className="admin-hero">
        <div className="admin-hero__header">
          <div className="admin-dashboard__status">
            <StatusPill tone={supabase ? 'ok' : 'warn'}>
              {supabase ? 'Servidor em tempo real' : 'Modo amostra'}
            </StatusPill>
            <span className="admin-dashboard__status-note">
              {supabase
                ? 'Actualizado em tempo real — dados de produção visíveis apenas a partir deste ambiente.'
                : 'Dados fictícios para acelerar o design e QA sem dependências externas.'}
            </span>
          </div>
          <p className="admin-dashboard__hero-text">
            Mantém o controlo da operação: valida novos utilizadores, acompanha os Personal Trainers e garante que cada cliente
            recebe acompanhamento humano com atenção permanente.
          </p>
        </div>
        <div className="admin-hero__grid">
          {quickMetrics.map((metric) => (
            <QuickMetricCard key={metric.label} {...metric} />
          ))}
        </div>
      </section>

      <section className="admin-dashboard__layout">
        <div className="admin-dashboard__column">
          <div className="admin-dashboard__pulse-grid">
            {pulse.map((metric) => (
              <PulseMetricCard key={metric.label} {...metric} />
            ))}
          </div>

          <div className="neo-panel admin-panel">
            <header className="neo-panel__header admin-panel__header">
              <div>
                <h2 className="neo-panel__title admin-panel__title">
                  <CalendarDays className="neo-icon" aria-hidden /> Próximas sessões
                </h2>
                <p className="neo-panel__subtitle">
                  {supabase
                    ? data.agendaSource === 'supabase'
                      ? 'Agenda sincronizada com o servidor'
                      : 'Agenda reconstruída a partir de dados simulados'
                    : 'Agenda simulada para ambientes locais'}
                </p>
              </div>
              <span className="admin-panel__badge" data-variant="primary">
                {agendaRows.length}
              </span>
            </header>
            {agendaRows.length === 0 ? (
              <div className="admin-panel__empty">
                Não existem sessões marcadas. Agenda uma nova sessão para manter os clientes activos e a operação em ritmo.
              </div>
            ) : (
              <ul className="admin-agenda__list">
                {agendaRows.map((session) => {
                  const { day, time } = formatAgendaTime(session);
                  return (
                    <li key={session.id} className="neo-surface admin-agenda__item" data-variant="neutral">
                      <div className="admin-agenda__row">
                        <div className="admin-agenda__slot">
                          <p className="admin-agenda__slot-day">{day}</p>
                          <p className="admin-agenda__slot-time">{time}</p>
                        </div>
                        <div className="admin-agenda__details">
                          <p className="admin-agenda__client">{session.client_name}</p>
                          <div className="admin-agenda__meta">
                            <span className="admin-agenda__meta-item">
                              <Activity className="neo-icon neo-icon--xs" aria-hidden /> PT: {session.trainer_name}
                            </span>
                            <span className="admin-agenda__meta-item">
                              <MapPin className="neo-icon neo-icon--xs" aria-hidden />
                              {session.location ? session.location : 'Local a definir'}
                            </span>
                          </div>
                        </div>
                      </div>
                      <Link
                        href={`/dashboard/admin/pts-schedule/${session.id}`}
                        prefetch={false}
                        className="btn admin-agenda__link"
                        data-variant="ghost"
                        data-size="sm"
                      >
                        Rever sessão <ArrowUpRight className="neo-icon neo-icon--sm" aria-hidden />
                      </Link>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>

        <div className="admin-dashboard__column">
          <div className="neo-panel admin-panel">
            <header className="neo-panel__header admin-panel__header">
              <div>
                <h2 className="neo-panel__title admin-panel__title">
                  <Sparkles className="neo-icon" aria-hidden /> Trainers em destaque
                </h2>
                <p className="neo-panel__subtitle">
                  Próximos 7 dias (
                  {supabase
                    ? data.topTrainersSource === 'materialized-view'
                      ? 'vista materializada'
                      : 'fallback directo'
                    : 'dados simulados'}
                  )
                </p>
              </div>
              <span className="admin-panel__badge" data-variant="accent">
                {data.topTrainers.length}
              </span>
            </header>
            {data.topTrainers.length === 0 ? (
              <div className="admin-panel__empty">
                Ainda não temos dados suficientes para destacar Personal Trainers. Assim que a ligação ao servidor estiver activa, vais ver o
                ranking em tempo real.
              </div>
            ) : (
              <ul className="admin-trainers__list">
                {data.topTrainers.map((trainer) => (
                  <li key={trainer.id} className="neo-surface admin-trainers__item" data-variant="neutral">
                    <span className="admin-trainers__avatar">{initials(trainer.name)}</span>
                    <div className="admin-trainers__body">
                      <p className="admin-trainers__name">{trainer.name}</p>
                      <p className="admin-trainers__info">Sessões (7d): {trainer.total}</p>
                    </div>
                    <Link
                      href={`/dashboard/admin/roster/${trainer.id}`}
                      prefetch={false}
                      className="btn admin-trainers__action"
                      data-variant="ghost"
                      data-size="sm"
                    >
                      Abrir perfil <ArrowUpRight className="neo-icon neo-icon--xs" aria-hidden />
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="neo-panel admin-panel">
            <header className="neo-panel__header admin-panel__header">
              <div>
                <h2 className="neo-panel__title admin-panel__title">
                  <Users className="neo-icon" aria-hidden /> Novos utilizadores
                </h2>
                <p className="neo-panel__subtitle">Últimas entradas</p>
              </div>
              <span className="admin-panel__badge" data-variant="primary">
                {data.recentUsers.length}
              </span>
            </header>
            {data.recentUsers.length === 0 ? (
              <div className="admin-panel__empty">
                Ainda não existem registos recentes. Assim que os convites forem enviados, vais ver aqui a actividade contínua.
              </div>
            ) : (
              <ul className="admin-users__list">
                {data.recentUsers.map((user) => (
                  <li key={user.id} className="neo-surface admin-users__item" data-variant="neutral">
                    <span className="admin-users__avatar">{initials(user.name)}</span>
                    <div className="admin-users__body">
                      <p className="admin-users__name">{user.name}</p>
                      <p className="admin-users__info">{user.email ?? 'sem email registado'}</p>
                    </div>
                    <span className="admin-users__time">{formatRelative(user.createdAt)}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </section>

      <section className="admin-dashboard__layout">
        <MotivationAdminCard />
        <AdminQuickNotesCard />
      </section>
    </div>
  );
}
