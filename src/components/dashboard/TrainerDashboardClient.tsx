'use client';

import * as React from 'react';
import Link from 'next/link';
import type { Route } from 'next';
import clsx from 'clsx';
import PageHeader from '@/components/ui/PageHeader';
import { greetingForDate } from '@/lib/time';

type AgendaSession = {
  id: string;
  title: string;
  start_at: string | null;
  kind?: string | null;
  client?: string | null;
  location?: string | null;
};

type AgendaDay = {
  date: Date;
  iso: string;
  label: string;
  sessions: AgendaSession[];
};

export type TrainerDashboardData = {
  stats: {
    totalClients: number;
    activePlans: number;
    sessionsThisWeek: number;
    pendingRequests: number;
  };
  clients: Array<{ id: string; name: string; status?: string | null }>;
  upcoming: Array<{
    id: string;
    start_time: string | null;
    client_id: string | null;
    client_name: string;
    location?: string | null;
    status?: string | null;
  }>;
};

type Props = {
  name: string;
  data: TrainerDashboardData;
  supabase: boolean;
};

type StatusTone = 'ok' | 'warn' | 'down';

type InsightTone = 'info' | 'warning' | 'positive';

const quickActions: ReadonlyArray<{ href: Route; label: string }> = [
  { href: '/dashboard/pt/schedule', label: 'Ver agenda' },
  { href: '/dashboard/pt/plans/new', label: 'Criar plano' },
  { href: '/dashboard/pt/clients', label: 'Gestão de clientes' },
];

function StatusPill({ tone, label }: { tone: StatusTone; label: string }) {
  return (
    <span className="status-pill" data-state={tone}>
      {label}
    </span>
  );
}

function ArrowTopRightIcon() {
  return (
    <svg viewBox="0 0 24 24" width={16} height={16} fill="none" stroke="currentColor" strokeWidth={1.6}>
      <path d="M7 17L17 7M17 7H9M17 7V15" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function RefreshIcon({ spinning }: { spinning: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={16}
      height={16}
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      className={clsx(spinning && 'animate-spin')}
    >
      <path
        d="M21 12a9 9 0 0 0-9-9 9 9 0 0 0-8.66 6H5a1 1 0 0 1 0 2H2a1 1 0 0 1-1-1V4a1 1 0 0 1 2 0v1.18A11 11 0 0 1 12 1a11 11 0 1 1-10.95 12h2A9 9 0 1 0 21 12Z"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function MetricTile({
  label,
  value,
  hint,
  icon,
  href,
  tone = 'info',
}: {
  label: string;
  value: number | string;
  hint?: string;
  icon?: string;
  href: Route;
  tone?: 'primary' | 'accent' | 'info' | 'success' | 'warning';
}) {
  return (
    <Link
      href={href}
      prefetch={false}
      className="neo-surface neo-surface--interactive flex flex-col justify-between gap-3 p-4 transition-transform hover:-translate-y-0.5"
      data-variant={tone}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <span className="neo-surface__hint uppercase tracking-wide">{label}</span>
          <span className="neo-surface__value text-2xl font-semibold text-fg">{value}</span>
        </div>
        {icon && (
          <span className="text-2xl" aria-hidden>
            {icon}
          </span>
        )}
      </div>
      {hint && <p className="text-xs text-muted">{hint}</p>}
      <span className="link-arrow mt-auto inline-flex items-center gap-1 text-sm font-medium">
        Abrir <ArrowTopRightIcon />
      </span>
    </Link>
  );
}

function buildWeekDays(base: Date): AgendaDay[] {
  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date(base);
    date.setDate(base.getDate() + index);
    const iso = date.toISOString().slice(0, 10);
    const label = date
      .toLocaleDateString('pt-PT', { weekday: 'short', day: '2-digit', month: 'short' })
      .replace('.', '')
      .toUpperCase();
    return {
      date,
      iso,
      label,
      sessions: [],
    } satisfies AgendaDay;
  });
}

function formatAgendaTime(value: string | null | undefined) {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' });
}

function formatSessionTime(value: string | null) {
  if (!value) {
    return { day: 'Data por agendar', time: '—' };
  }
  const date = new Date(value);
  return {
    day: date.toLocaleDateString('pt-PT', { weekday: 'short', day: '2-digit', month: 'short' }),
    time: date.toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' }),
  };
}

function sessionTone(status?: string | null): StatusTone {
  const normalized = (status ?? '').toString().toUpperCase();
  if (['CONFIRMED', 'COMPLETED', 'ACTIVE'].includes(normalized)) return 'ok';
  if (['PENDING', 'REQUESTED', 'RESCHEDULE', 'WAITING'].includes(normalized)) return 'warn';
  if (!normalized) return 'warn';
  return 'down';
}

function insightVariant(tone: InsightTone): 'info' | 'warning' | 'success' {
  switch (tone) {
    case 'warning':
      return 'warning';
    case 'positive':
      return 'success';
    default:
      return 'info';
  }
}

function toneFromCount(value: number): StatusTone {
  if (value === 0) return 'warn';
  if (value > 0) return 'ok';
  return 'warn';
}

export default function TrainerDashboardClient({ name, data, supabase }: Props) {
  const [weeklyAgenda, setWeeklyAgenda] = React.useState<AgendaDay[]>(() =>
    buildWeekDays(startOfWeek(new Date(), { weekStartsOn: 1 })),
  );
  const [weeklyLoading, setWeeklyLoading] = React.useState(false);

  const refreshWeeklyAgenda = React.useCallback(async () => {
    const base = startOfWeek(new Date(), { weekStartsOn: 1 });
    const days = buildWeekDays(base);
    setWeeklyAgenda(days);
    setWeeklyLoading(true);
    try {
      const from = `${days[0].iso}T00:00:00.000Z`;
      const to = `${days[days.length - 1].iso}T23:59:59.999Z`;
      const res = await fetch(
        `/api/pt/plans?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`,
        { cache: 'no-store' },
      );
      if (!res.ok) throw new Error(await res.text());
      const json = await res.json();
      const items: any[] = Array.isArray(json?.items)
        ? json.items
        : Array.isArray(json?.data)
        ? json.data
        : Array.isArray(json?.sessions)
        ? json.sessions
        : [];
      const grouped: Record<string, AgendaSession[]> = Object.fromEntries(days.map((day) => [day.iso, []]));
      for (const item of items) {
        const startRaw =
          (typeof item?.start_at === 'string' && item.start_at) ||
          (typeof item?.start_time === 'string' && item.start_time) ||
          (typeof item?.start === 'string' && item.start) ||
          (typeof item?.scheduled_for === 'string' && item.scheduled_for) ||
          (typeof item?.starts_at === 'string' && item.starts_at) ||
          null;
        if (!startRaw) continue;
        const iso = startRaw.slice(0, 10);
        if (!grouped[iso]) continue;
        const session: AgendaSession = {
          id: String(item?.id ?? item?.session_id ?? `${iso}-${grouped[iso].length}`),
          title: String(item?.title ?? item?.name ?? item?.label ?? 'Sessão'),
          start_at: startRaw,
          kind: item?.kind ?? item?.mode ?? item?.type ?? null,
          client: item?.client_name ?? item?.client ?? item?.client_id ?? null,
          location: item?.location ?? item?.place ?? item?.room ?? null,
        };
        grouped[iso].push(session);
      }
      Object.keys(grouped).forEach((iso) => {
        grouped[iso].sort((a, b) => {
          const aDate = a.start_at ?? '';
          const bDate = b.start_at ?? '';
          return aDate.localeCompare(bDate);
        });
      });
      setWeeklyAgenda(days.map((day) => ({ ...day, sessions: grouped[day.iso] ?? [] })));
    } catch (error) {
      console.error('weekly agenda load failed', error);
      setWeeklyAgenda((prev) => prev.map((day) => ({ ...day, sessions: [] })));
    } finally {
      setWeeklyLoading(false);
    }
  }, []);

  React.useEffect(() => {
    void refreshWeeklyAgenda();
  }, [refreshWeeklyAgenda]);

  const greetingInfo = React.useMemo(() => greetingForDate(), []);
  const greetingLabel = React.useMemo(
    () => `${greetingInfo.label}${name ? `, ${name}` : ''}!`,
    [greetingInfo.label, name],
  );

  const insights: Array<{ icon: string; message: string; tone: InsightTone }> = [];
  if (data.stats.pendingRequests > 0) {
    insights.push({
      icon: '🟠',
      message: `${data.stats.pendingRequests} pedido(s) de cliente aguardam a tua aprovação.`,
      tone: 'warning',
    });
  }
  if (data.stats.sessionsThisWeek === 0) {
    insights.push({
      icon: '📅',
      message: 'Agenda livre esta semana — agenda novas sessões para manter o ritmo.',
      tone: 'info',
    });
  }
  if (data.stats.activePlans < data.stats.totalClients) {
    insights.push({
      icon: '🧩',
      message: 'Existem clientes sem plano activo. Revisa os planos para manter todos alinhados.',
      tone: 'warning',
    });
  }
  if (insights.length === 0) {
    insights.push({
      icon: '✨',
      message: 'Tudo alinhado! Mantém o foco e continua a surpreender os teus clientes.',
      tone: 'positive',
    });
  }

  const upcomingSessions = data.upcoming
    .filter((session) => !session.start_time || new Date(session.start_time) >= new Date())
    .slice(0, 6);

  const metricCards: ReadonlyArray<{
    label: string;
    value: number | string;
    icon?: string;
    tone: 'primary' | 'accent' | 'info' | 'success' | 'warning';
    hint?: string;
    href: Route;
  }> = [
    {
      label: 'Clientes activos',
      value: data.stats.totalClients,
      icon: '👥',
      tone: 'primary' as const,
      hint: `${data.clients.length} na carteira`,
      href: '/dashboard/pt/clients',
    },
    {
      label: 'Sessões (7 dias)',
      value: data.stats.sessionsThisWeek,
      icon: '🗓️',
      tone: 'success' as const,
      hint: 'Inclui confirmadas e passadas',
      href: '/dashboard/pt/schedule',
    },
    {
      label: 'Planos activos',
      value: data.stats.activePlans,
      icon: '📋',
      tone: 'info' as const,
      hint: 'Em acompanhamento',
      href: '/dashboard/pt/plans',
    },
    {
      label: 'Pedidos pendentes',
      value: data.stats.pendingRequests,
      icon: '⏳',
      tone: 'warning' as const,
      hint: data.stats.pendingRequests > 0 ? 'Precisa de revisão' : 'Sem pendentes',
      href: '/dashboard/pt/approvals',
    },
  ];

  return (
    <div className="space-y-6 px-4 py-6 md:px-8">
      <PageHeader
        sticky={false}
        title={
          <span className="flex flex-wrap items-center gap-3">
            <span className="text-3xl" aria-hidden>
              {greetingInfo.emoji}
            </span>
            <span className="heading-solid text-3xl font-extrabold leading-tight text-fg">{greetingLabel}</span>
          </span>
        }
        subtitle="Controla sessões, clientes e planos com uma visão futurista e accionável."
        actions={
          <div className="neo-quick-actions">
            {quickActions.map((action) => (
              <Link key={action.href} href={action.href} className="btn" prefetch={false}>
                {action.label}
              </Link>
            ))}
          </div>
        }
      />

      <section className="neo-panel space-y-5" aria-labelledby="trainer-metrics-heading">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 id="trainer-metrics-heading" className="neo-panel__title">
              Cockpit do treinador
            </h2>
            <p className="neo-panel__subtitle">Resumo em tempo real dos indicadores chave.</p>
          </div>
          <StatusPill tone={supabase ? 'ok' : 'warn'} label={supabase ? 'Sincronizado' : 'Modo offline'} />
        </div>
        <div className="neo-grid auto-fit min-[420px]:grid-cols-2 xl:grid-cols-4">
          {metricCards.map((metric) => (
            <MetricTile
              key={metric.label}
              label={metric.label}
              value={metric.value}
              icon={metric.icon}
              href={metric.href}
              tone={metric.tone}
              hint={metric.hint}
            />
          ))}
        </div>
        <div className="neo-grid auto-fit min-[420px]:grid-cols-2">
          {insights.map((insight, index) => (
            <div key={`${insight.message}-${index}`} className="neo-surface p-4" data-variant={insightVariant(insight.tone)}>
              <div className="flex items-start gap-3">
                <span className="text-xl" aria-hidden>
                  {insight.icon}
                </span>
                <p className="text-sm text-fg">{insight.message}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <div className="grid gap-5 xl:grid-cols-[2fr_1fr]">
        <div className="space-y-5">
          <section className="neo-panel space-y-4" aria-labelledby="weekly-agenda-heading">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 id="weekly-agenda-heading" className="neo-panel__title">
                  Agenda semanal
                </h2>
                <p className="neo-panel__subtitle">Organiza as sessões desta semana por dia.</p>
              </div>
              <div className="flex items-center gap-2">
                {weeklyLoading && <StatusPill tone="warn" label="A actualizar…" />}
                <button
                  type="button"
                  className="btn ghost inline-flex items-center gap-2"
                  onClick={() => refreshWeeklyAgenda()}
                  disabled={weeklyLoading}
                >
                  <RefreshIcon spinning={weeklyLoading} /> Actualizar
                </button>
              </div>
            </div>
            <div className="neo-grid auto-fit min-[360px]:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7">
              {weeklyAgenda.map((day) => (
                <article
                  key={day.iso}
                  className="neo-surface space-y-3 p-4"
                  data-variant={day.sessions.length > 2 ? 'primary' : undefined}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-semibold text-fg">{day.label}</span>
                    <span className="text-xs text-muted">{day.sessions.length} sessão(s)</span>
                  </div>
                  <div className="grid gap-2 text-xs">
                    {day.sessions.length === 0 ? (
                      <span className="text-muted">Sem sessões agendadas.</span>
                    ) : (
                      day.sessions.slice(0, 3).map((session) => (
                        <div
                          key={session.id}
                          className="rounded-xl border border-transparent bg-white/70 p-2 text-left shadow-sm transition dark:bg-slate-800/50"
                        >
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-sm font-semibold text-fg">{formatAgendaTime(session.start_at)}</span>
                            {session.kind && (
                              <span className="text-[10px] uppercase tracking-wide text-muted">{session.kind}</span>
                            )}
                          </div>
                          <p className="text-xs text-muted">
                            {session.client ?? 'Cliente'}
                            {session.location ? ` • ${session.location}` : ''}
                          </p>
                        </div>
                      ))
                    )}
                  </div>
                  {day.sessions.length > 3 && (
                    <span className="text-[11px] uppercase tracking-wide text-muted">
                      +{day.sessions.length - 3} sessão(ões)
                    </span>
                  )}
                </article>
              ))}
            </div>
          </section>

          <section className="neo-panel space-y-4" aria-labelledby="upcoming-sessions-heading">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 id="upcoming-sessions-heading" className="neo-panel__title">
                  Próximas sessões
                </h2>
                <p className="neo-panel__subtitle">Coordenações para os próximos dias.</p>
              </div>
              <StatusPill tone={toneFromCount(upcomingSessions.length)} label={`${upcomingSessions.length} sessão(s)`} />
            </div>
            {upcomingSessions.length === 0 ? (
              <div className="space-y-3">
                <p className="text-base font-semibold text-fg">Não existem sessões marcadas.</p>
                <p className="text-sm text-muted">Cria uma nova sessão para manter os clientes activos.</p>
                <Link href="/dashboard/pt/schedule" className="btn primary" prefetch={false}>
                  Marcar nova sessão
                </Link>
              </div>
            ) : (
              <ul className="grid gap-3" aria-live="polite">
                {upcomingSessions.map((session) => {
                  const { day, time } = formatSessionTime(session.start_time);
                  return (
                    <li key={session.id} className="neo-surface space-y-2 p-4">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className="text-sm font-semibold text-fg">{session.client_name}</span>
                        <span className="text-xs uppercase tracking-wide text-muted">{day}</span>
                      </div>
                      <p className="text-sm text-muted">Hora: {time} · {session.location ?? 'Local a definir'}</p>
                      {session.status && (
                        <StatusPill tone={sessionTone(session.status)} label={String(session.status).toUpperCase()} />
                      )}
                    </li>
                  );
                })}
              </ul>
            )}
          </section>
        </div>

        <aside className="space-y-5">
          <section className="neo-panel space-y-4" aria-labelledby="insights-heading">
            <div>
              <h2 id="insights-heading" className="neo-panel__title">
                Insights rápidos
              </h2>
              <p className="neo-panel__subtitle">Alertas e destaques para hoje.</p>
            </div>
            <ul className="grid gap-3 text-sm">
              {insights.map((insight, index) => (
                <li key={`${insight.message}-${index}`} className="neo-surface p-4" data-variant={insightVariant(insight.tone)}>
                  <div className="flex items-start gap-3">
                    <span className="text-xl" aria-hidden>
                      {insight.icon}
                    </span>
                    <p className="text-sm text-fg">{insight.message}</p>
                  </div>
                </li>
              ))}
            </ul>
          </section>

          <section className="neo-panel space-y-4" aria-labelledby="clients-heading">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 id="clients-heading" className="neo-panel__title">
                  Clientes activos
                </h2>
                <p className="neo-panel__subtitle">Carteira sob acompanhamento.</p>
              </div>
              <Link href="/dashboard/pt/clients" className="btn ghost" prefetch={false}>
                Ver todos
              </Link>
            </div>
            {data.clients.length === 0 ? (
              <div className="space-y-3">
                <p className="text-sm text-muted">Ainda não tens clientes associados.</p>
                <Link href="/dashboard/pt/clients" className="btn primary" prefetch={false}>
                  Adicionar cliente
                </Link>
              </div>
            ) : (
              <ul className="grid gap-2 text-sm">
                {data.clients.map((client) => (
                  <li key={client.id} className="neo-surface p-3">
                    <span className="font-semibold text-fg">{client.name}</span>
                    {client.status && (
                      <span className="block text-xs uppercase tracking-wide text-muted">
                        {String(client.status)}
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </section>
        </aside>
      </div>
    </div>
  );
}

function startOfWeek(date: Date, options: { weekStartsOn: number }) {
  const clone = new Date(date);
  const day = clone.getDay();
  const diff = (day < options.weekStartsOn ? 7 : 0) + day - options.weekStartsOn;
  clone.setDate(clone.getDate() - diff);
  clone.setHours(0, 0, 0, 0);
  return clone;
}
