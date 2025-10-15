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
  start_time: string | null;
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
  if (!value.start_time) {
    return { day: 'Agendar', time: '—' };
  }
  const date = new Date(value.start_time);
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
    <div className="flex h-full flex-col justify-between gap-4">
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-2">
          <span className="neo-surface__hint uppercase tracking-wide text-xs">{label}</span>
          <span className="neo-surface__value text-2xl font-semibold text-fg">{formattedValue}</span>
          {hint && <p className="text-xs text-muted">{hint}</p>}
        </div>
        <span className="rounded-full bg-white/60 p-2 text-primary shadow-sm ring-1 ring-inset ring-white/60 dark:bg-slate-900/60 dark:text-primary dark:ring-slate-700/60">
          {icon}
        </span>
      </div>
      <span className="link-arrow mt-auto inline-flex items-center gap-1 text-sm font-medium">
        Abrir <ArrowUpRight className="h-4 w-4" aria-hidden />
      </span>
    </div>
  );

  return (
    <Link
      href={href}
      prefetch={false}
      className="neo-surface neo-surface--interactive h-full rounded-3xl p-5"
      data-variant={tone}
      aria-label={`${label} – abrir detalhes`}
    >
      {content}
    </Link>
  );
}

function PulseMetricCard({ label, value, hint, tone = 'warn' }: PulseMetric) {
  return (
    <div className="neo-surface rounded-2xl border border-white/20 bg-white/60 p-4 text-sm shadow-sm backdrop-blur-sm dark:border-slate-800/60 dark:bg-slate-900/40">
      <div className="flex items-center justify-between gap-2">
        <span className="uppercase tracking-[0.24em] text-[11px] text-muted">{label}</span>
        <StatusPill tone={tone}>{tone === 'ok' ? 'Saudável' : tone === 'warn' ? 'Atenção' : 'Revê'}</StatusPill>
      </div>
      <p className="mt-3 text-2xl font-semibold text-fg">{value}</p>
      {hint && <p className="mt-2 text-xs text-muted">{hint}</p>}
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
      icon: <Users className="h-4 w-4" aria-hidden />,
    },
    {
      label: 'Sessões hoje',
      value: data.totals.sessionsToday,
      hint: 'próximas 24h',
      href: '/dashboard/admin/pts-schedule',
      tone: 'accent',
      icon: <CalendarCheck className="h-4 w-4" aria-hidden />,
    },
    {
      label: 'Aprovações pendentes',
      value: data.totals.pendingApprovals,
      hint: 'aguardam revisão',
      href: '/dashboard/admin/approvals',
      tone: 'warning',
      icon: <UserCheck className="h-4 w-4" aria-hidden />,
    },
    {
      label: 'Novos registos',
      value: data.recentUsers.length,
      hint: 'últimos dias',
      href: '/dashboard/admin/users?filter=recent',
      tone: 'success',
      icon: <UserPlus className="h-4 w-4" aria-hidden />,
    },
  ];

  const sessionsNext7 = data.topTrainers.reduce((sum, row) => sum + (row.total ?? 0), 0);
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
      hint: 'inclui próximas 24h',
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
    <div className="space-y-10 pb-16">
      <PageHeader
        title={
          <div className="flex flex-col gap-3">
            <span className="caps-tag text-xs tracking-[0.32em] text-muted">Centro de operações</span>
            <span className="text-3xl font-semibold text-fg">
              {greeting.emoji} {greeting.label}, {name || 'Admin'}!
            </span>
          </div>
        }
        subtitle={
          supabase
            ? 'Estamos a usar dados em tempo real do Supabase. Mantém a vigilância sobre os indicadores chave.'
            : 'O Supabase não está configurado neste ambiente — utilizamos dados de exemplo para não interromper o fluxo.'
        }
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Link href="/dashboard/system" className="btn ghost" prefetch={false}>
              Monitorização
            </Link>
            <Link href="/dashboard/admin/approvals" className="btn primary" prefetch={false}>
              Aprovações
            </Link>
          </div>
        }
      />

      <section className="admin-hero">
        <div className="admin-hero__header">
          <div className="flex flex-wrap items-center gap-2 text-sm">
            <StatusPill tone={supabase ? 'ok' : 'warn'}>
              {supabase ? 'Live Supabase' : 'Modo amostra'}
            </StatusPill>
            <span className="text-sm/6 opacity-80">
              {supabase
                ? 'Actualizado em tempo real — dados de produção visíveis apenas a partir deste ambiente.'
                : 'Dados fictícios para acelerar o design e QA sem dependências externas.'}
            </span>
          </div>
          <p className="text-base text-white/90 dark:text-slate-200">
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

      <section className="grid gap-6 lg:grid-cols-[1.35fr_1fr]">
        <div className="grid gap-6">
          <div className="grid gap-4 md:grid-cols-2">
            {pulse.map((metric) => (
              <PulseMetricCard key={metric.label} {...metric} />
            ))}
          </div>

          <div className="neo-panel space-y-4">
            <header className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="neo-panel__title flex items-center gap-2 text-lg">
                  <CalendarDays className="h-5 w-5 text-primary" aria-hidden /> Próximas sessões
                </h2>
                <p className="neo-panel__subtitle">
                  {supabase ? 'Agenda sincronizada com Supabase' : 'Agenda simulada para ambientes locais'}
                </p>
              </div>
              <span className="rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary dark:bg-primary/15">
                {agendaRows.length}
              </span>
            </header>
            {agendaRows.length === 0 ? (
              <div className="neo-surface rounded-2xl border border-dashed border-white/40 bg-white/40 p-6 text-sm text-muted backdrop-blur-sm dark:border-slate-700/60 dark:bg-slate-900/30">
                Não existem sessões marcadas. Agenda uma nova sessão para manter os clientes activos e a operação em ritmo.
              </div>
            ) : (
              <ul className="space-y-3">
                {agendaRows.map((session) => {
                  const { day, time } = formatAgendaTime(session);
                  return (
                    <li
                      key={session.id}
                      className="neo-surface flex flex-col gap-3 rounded-2xl p-4 sm:flex-row sm:items-center sm:justify-between"
                      data-variant="neutral"
                    >
                      <div className="flex items-start gap-3">
                        <div className="rounded-2xl bg-primary/15 px-3 py-2 text-center text-primary dark:bg-primary/20">
                          <p className="text-xs font-medium uppercase tracking-widest">{day}</p>
                          <p className="text-base font-semibold text-fg">{time}</p>
                        </div>
                        <div className="space-y-2">
                          <p className="text-sm font-semibold text-fg">{session.client_name}</p>
                          <div className="flex flex-wrap items-center gap-3 text-xs text-muted">
                            <span className="inline-flex items-center gap-1">
                              <Activity className="h-3.5 w-3.5" aria-hidden /> PT: {session.trainer_name}
                            </span>
                            <span className="inline-flex items-center gap-1">
                              <MapPin className="h-3.5 w-3.5" aria-hidden />
                              {session.location ? session.location : 'Local a definir'}
                            </span>
                          </div>
                        </div>
                      </div>
                      <Link
                        href={`/dashboard/admin/pts-schedule/${session.id}`}
                        prefetch={false}
                        className="btn ghost flex items-center gap-2 text-sm"
                      >
                        Rever sessão <ArrowUpRight className="h-4 w-4" aria-hidden />
                      </Link>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>

        <div className="grid gap-6">
          <div className="neo-panel space-y-4">
            <header className="flex items-center justify-between gap-3">
              <div>
                <h2 className="neo-panel__title flex items-center gap-2 text-lg">
                  <Sparkles className="h-5 w-5 text-accent" aria-hidden /> Trainers em destaque
                </h2>
                <p className="neo-panel__subtitle">Top sessões na última semana</p>
              </div>
              <span className="rounded-full bg-accent/15 px-3 py-1 text-sm font-medium text-accent">
                {data.topTrainers.length}
              </span>
            </header>
            {data.topTrainers.length === 0 ? (
              <p className="text-sm text-muted">
                Ainda não temos dados suficientes para destacar Personal Trainers. Assim que o Supabase estiver ligado, vais ver o
                ranking em tempo real.
              </p>
            ) : (
              <ul className="space-y-3">
                {data.topTrainers.map((trainer) => (
                  <li
                    key={trainer.id}
                    className="neo-surface flex items-center gap-3 rounded-2xl p-4"
                    data-variant="neutral"
                  >
                    <span className="flex h-10 w-10 items-center justify-center rounded-full bg-accent/15 text-sm font-semibold text-accent">
                      {initials(trainer.name)}
                    </span>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-fg">{trainer.name}</p>
                      <p className="text-xs text-muted">Sessões: {trainer.total}</p>
                    </div>
                    <Link
                      href={`/dashboard/admin/roster/${trainer.id}`}
                      prefetch={false}
                      className="btn ghost flex items-center gap-2 text-xs"
                    >
                      Abrir perfil <ArrowUpRight className="h-3.5 w-3.5" aria-hidden />
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="neo-panel space-y-4">
            <header className="flex items-center justify-between gap-3">
              <div>
                <h2 className="neo-panel__title flex items-center gap-2 text-lg">
                  <Users className="h-5 w-5 text-primary" aria-hidden /> Novos utilizadores
                </h2>
                <p className="neo-panel__subtitle">Últimas entradas</p>
              </div>
              <span className="rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary dark:bg-primary/15">
                {data.recentUsers.length}
              </span>
            </header>
            {data.recentUsers.length === 0 ? (
              <p className="text-sm text-muted">
                Ainda não existem registos recentes. Assim que os convites forem enviados, vais ver aqui a actividade contínua.
              </p>
            ) : (
              <ul className="space-y-3">
                {data.recentUsers.map((user) => (
                  <li
                    key={user.id}
                    className="neo-surface flex items-center gap-3 rounded-2xl p-4"
                    data-variant="neutral"
                  >
                    <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/15 text-sm font-semibold text-primary dark:bg-primary/25">
                      {initials(user.name)}
                    </span>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-fg">{user.name}</p>
                      <p className="text-xs text-muted">{user.email ?? 'sem email registado'}</p>
                    </div>
                    <span className="text-xs text-muted">{formatRelative(user.createdAt)}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <MotivationAdminCard />
        <AdminQuickNotesCard />
      </section>
    </div>
  );
}
