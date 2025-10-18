import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createServerClient } from '@/lib/supabaseServer';
import { getSessionUserSafe } from '@/lib/session-bridge';
import { toAppRole, type AppRole } from '@/lib/roles';
import type { Database } from '@/types/supabase';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Centro de controlo',
  description: 'Monitorização operacional do Fitness Pro.',
};

type StatusState = 'ok' | 'warn' | 'down';

type ServiceRow = Database['public']['Tables']['system_services']['Row'];
type MaintenanceRow = Database['public']['Tables']['system_maintenance_windows']['Row'];
type InsightRow = Database['public']['Tables']['system_insights']['Row'];

const numberFormatter = new Intl.NumberFormat('pt-PT', { maximumFractionDigits: 1, minimumFractionDigits: 0 });
const percentFormatter = new Intl.NumberFormat('pt-PT', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const dayFormatter = new Intl.DateTimeFormat('pt-PT', { day: '2-digit', month: 'short' });
const timeFormatter = new Intl.DateTimeFormat('pt-PT', { hour: '2-digit', minute: '2-digit' });
const relativeFormatter = new Intl.RelativeTimeFormat('pt-PT', { numeric: 'auto' });

function formatLatency(latency: number | null): string {
  if (latency === null || Number.isNaN(latency)) return '—';
  if (latency >= 1000) {
    const seconds = latency / 1000;
    return `${numberFormatter.format(seconds)} s`;
  }
  return `${numberFormatter.format(latency)} ms`;
}

function formatUptime(uptime: number | null): string {
  if (uptime === null || Number.isNaN(uptime)) return '—';
  return `${percentFormatter.format(uptime)}%`;
}

function formatRelativeTime(value: string | null): string {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  const diffSeconds = (date.getTime() - Date.now()) / 1000;
  const thresholds: Array<{ limit: number; unit: Intl.RelativeTimeFormatUnit; divisor: number }> = [
    { limit: 60, unit: 'second', divisor: 1 },
    { limit: 3600, unit: 'minute', divisor: 60 },
    { limit: 86400, unit: 'hour', divisor: 3600 },
    { limit: 604800, unit: 'day', divisor: 86400 },
    { limit: 2629800, unit: 'week', divisor: 604800 },
    { limit: 31557600, unit: 'month', divisor: 2629800 },
    { limit: Infinity, unit: 'year', divisor: 31557600 },
  ];
  const absSeconds = Math.abs(diffSeconds);
  const bucket = thresholds.find((threshold) => absSeconds < threshold.limit) ?? thresholds[thresholds.length - 1];
  const valueRounded = Math.round(diffSeconds / bucket.divisor);
  return relativeFormatter.format(valueRounded, bucket.unit);
}

function formatWindowRange(start: string | null, end: string | null): string {
  if (!start || !end) return '—';
  const startDate = new Date(start);
  const endDate = new Date(end);
  if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) return '—';
  const sameDay = startDate.toDateString() === endDate.toDateString();
  const startLabel = `${dayFormatter.format(startDate)} · ${timeFormatter.format(startDate)}`;
  const endLabel = sameDay
    ? timeFormatter.format(endDate)
    : `${dayFormatter.format(endDate)} · ${timeFormatter.format(endDate)}`;
  return `${startLabel} — ${endLabel}`;
}

const quickLinks = [
  { href: '/dashboard/system/health', label: 'Diagnóstico em tempo real' },
  { href: '/dashboard/system/metrics', label: 'Métricas de adoção' },
  { href: '/dashboard/system/logs', label: 'Logs e auditoria' },
];

function StatusPill({ state, label }: { state: StatusState; label: string }) {
  return <span className="status-pill" data-state={state}>{label}</span>;
}

function ArrowIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" width={16} height={16}
      aria-hidden="true">
      <path d="M7 17L17 7M17 7H9M17 7V15" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default async function SystemPage() {
  const viewer = await getSessionUserSafe();
  if (!viewer?.id) redirect('/login');

  const role = (toAppRole(viewer.role) ?? 'CLIENT') as AppRole;
  if (role !== 'ADMIN') redirect('/dashboard');

  const sb = createServerClient();

  const [{ data: servicesData }, { data: maintenanceData }, { data: insightsData }] = await Promise.all([
    sb
      .from('system_services')
      .select('*')
      .order('display_order', { ascending: true })
      .order('name', { ascending: true }),
    sb
      .from('system_maintenance_windows')
      .select('*')
      .order('start_at', { ascending: true }),
    sb
      .from('system_insights')
      .select('*')
      .order('sort_order', { ascending: true })
      .order('updated_at', { ascending: false }),
  ]);

  const services = (servicesData ?? []).map((service: ServiceRow) => ({
    id: service.id,
    name: service.name,
    description: service.description ?? '',
    state: (service.state as StatusState) ?? 'ok',
    latency: formatLatency(service.latency_ms),
    uptime: formatUptime(service.uptime_percent),
    updatedAgo: formatRelativeTime(service.updated_at),
  }));

  const maintenanceWindows = (maintenanceData ?? []).map((row: MaintenanceRow) => ({
    id: row.id,
    title: row.title,
    when: formatWindowRange(row.start_at, row.end_at),
    impact: row.impact ?? 'Sem impacto previsto',
  }));

  const insights = (insightsData ?? []).map((row: InsightRow) => ({
    id: row.id,
    label: row.label,
    value: row.value,
    detail: row.detail ?? '',
    updated: formatRelativeTime(row.updated_at),
  }));

  return (
    <section className="system-page neo-stack neo-stack--xl">
      <header className="neo-panel neo-panel--header system-page__hero">
        <div className="neo-stack neo-stack--sm system-page__intro">
          <span className="caps-tag">Centro de controlo</span>
          <h1 className="system-page__title heading-solid">Operações em tempo real</h1>
          <p className="system-page__lede">
            Monitoriza a disponibilidade dos serviços principais, agenda janelas de manutenção e navega rapidamente para as áreas críticas.
          </p>
        </div>
        <div className="neo-quick-actions">
          {quickLinks.map((link) => (
            <Link key={link.href} href={link.href} className="btn" prefetch={false}>
              {link.label}
            </Link>
          ))}
        </div>
      </header>

      <div className="system-page__layout">
        <div className="neo-stack neo-stack--lg system-page__main">
          <section className="neo-panel neo-stack neo-stack--lg system-panel" aria-labelledby="services-heading">
            <div className="neo-inline neo-inline--wrap neo-inline--between neo-inline--md system-panel__header">
              <div className="neo-stack neo-stack--xs">
                <h2 id="services-heading" className="neo-panel__title">Serviços essenciais</h2>
                <p className="neo-panel__subtitle">Estados actualizados de minuto a minuto com latência média.</p>
              </div>
              <StatusPill state="ok" label="Operacional" />
            </div>

            {services.length === 0 ? (
              <div className="neo-surface neo-surface--padded system-empty" role="status">
                <span className="neo-text--sm neo-text--muted">Ainda sem leituras registadas para os serviços monitorizados.</span>
              </div>
            ) : (
              <div className="neo-grid neo-grid--auto system-services__grid" role="list">
                {services.map((service) => (
                  <article
                    key={service.id}
                    role="listitem"
                    className="neo-surface neo-surface--interactive neo-stack neo-stack--md system-services__card"
                    data-service-state={service.state}
                  >
                    <div className="neo-inline neo-inline--between neo-inline--md system-services__cardHeader">
                      <div className="neo-stack neo-stack--xs system-services__cardBody">
                        <h3 className="system-services__name">{service.name}</h3>
                        <p className="system-services__description">{service.description}</p>
                      </div>
                      <StatusPill
                        state={service.state}
                        label={service.state === 'ok' ? 'ok' : service.state === 'warn' ? 'atenção' : 'incidente'}
                      />
                    </div>
                    <dl className="system-services__meta">
                      <div className="system-services__metaItem">
                        <dt className="neo-surface__hint">Latência média</dt>
                        <dd className="system-services__metaValue">{service.latency}</dd>
                      </div>
                      <div className="system-services__metaItem">
                        <dt className="neo-surface__hint">Uptime (30 dias)</dt>
                        <dd className="system-services__metaValue">{service.uptime}</dd>
                      </div>
                      <div className="system-services__metaFooter">
                        <span className="system-services__metaUpdated">Última leitura {service.updatedAgo}</span>
                        <Link href={`/dashboard/system/health#${service.id}`} className="link-arrow" prefetch={false}>
                          Ver detalhes <ArrowIcon />
                        </Link>
                      </div>
                    </dl>
                  </article>
                ))}
              </div>
            )}
          </section>

          <section className="neo-panel neo-stack neo-stack--lg system-panel" aria-labelledby="maintenance-heading">
            <div className="neo-inline neo-inline--wrap neo-inline--between neo-inline--md system-panel__header">
              <div className="neo-stack neo-stack--xs">
                <h2 id="maintenance-heading" className="neo-panel__title">Janelas de manutenção</h2>
                <p className="neo-panel__subtitle">Planeamento preventivo para evitar surpresas em horas de pico.</p>
              </div>
              <StatusPill state={maintenanceWindows.length > 0 ? 'warn' : 'ok'} label={`${maintenanceWindows.length} agendadas`} />
            </div>
            {maintenanceWindows.length === 0 ? (
              <div className="neo-surface neo-surface--padded system-empty" role="status">
                <span className="neo-text--sm neo-text--muted">Sem janelas de manutenção planeadas neste momento.</span>
              </div>
            ) : (
              <ul className="neo-stack neo-stack--md system-maintenance__list" aria-live="polite">
                {maintenanceWindows.map((mw) => (
                  <li key={mw.id} className="neo-surface neo-surface--padded neo-stack neo-stack--xs system-maintenance__item">
                    <span className="system-maintenance__title">{mw.title}</span>
                    <span className="system-maintenance__when">{mw.when}</span>
                    <span className="system-maintenance__impact">{mw.impact}</span>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>

        <aside className="neo-stack neo-stack--lg system-page__aside" aria-labelledby="insights-heading">
          <section className="neo-panel neo-stack neo-stack--lg system-panel">
            <div className="neo-stack neo-stack--xs">
              <h2 id="insights-heading" className="neo-panel__title">Insights rápidos</h2>
              <p className="neo-panel__subtitle">Contexto imediato para decisões operacionais.</p>
            </div>
            {insights.length === 0 ? (
              <div className="neo-surface neo-surface--padded system-empty" role="status">
                <span className="neo-text--sm neo-text--muted">Sem insights registados no momento.</span>
              </div>
            ) : (
              <ul className="neo-stack neo-stack--md system-insights__list">
                {insights.map((insight) => (
                  <li key={insight.id} className="neo-surface neo-surface--padded neo-stack neo-stack--sm system-insights__item">
                    <div className="system-insights__label">{insight.label}</div>
                    <div className="system-insights__value">{insight.value}</div>
                    {insight.detail && <div className="system-insights__detail">{insight.detail}</div>}
                    <div className="system-insights__updated">Actualizado {insight.updated}</div>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="neo-panel neo-stack neo-stack--lg system-panel" aria-labelledby="ops-links-heading">
            <div className="neo-inline neo-inline--between neo-inline--wrap neo-inline--md system-panel__header">
              <div className="neo-stack neo-stack--xs">
                <h2 id="ops-links-heading" className="neo-panel__title">Operações</h2>
                <p className="neo-panel__subtitle">Ligações úteis para aprofundar cada área.</p>
              </div>
              <StatusPill state="ok" label="Cobertura total" />
            </div>
            <ul className="neo-stack neo-stack--sm system-ops__list">
              {quickLinks.map((link) => (
                <li key={`ops-${link.href}`}>
                  <Link href={link.href} className="link-arrow" prefetch={false}>
                    {link.label}
                    <ArrowIcon />
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        </aside>
      </div>
    </section>
  );
}
