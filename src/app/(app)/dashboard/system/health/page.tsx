import type { Metadata } from 'next';
import { redirect } from 'next/navigation';

import { createServerClient } from '@/lib/supabaseServer';
import { getSessionUserSafe } from '@/lib/session-bridge';
import { toAppRole, type AppRole } from '@/lib/roles';
import type { Database } from '@/types/supabase';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = { title: 'Saúde do Sistema' };

type StatusState = 'ok' | 'warn' | 'down';

type ServiceRow = Database['public']['Tables']['system_services']['Row'];
type MonitorRow = Database['public']['Tables']['system_monitors']['Row'];
type ResilienceRow = Database['public']['Tables']['system_resilience_practices']['Row'];

const numberFormatter = new Intl.NumberFormat('pt-PT', {
  maximumFractionDigits: 1,
  minimumFractionDigits: 0,
});

const percentFormatter = new Intl.NumberFormat('pt-PT', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

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

function resolveStatusLabel(state: StatusState): string {
  switch (state) {
    case 'down':
      return 'incidente';
    case 'warn':
      return 'atenção';
    default:
      return 'operacional';
  }
}

function resolveOverallState(states: StatusState[]): StatusState {
  if (states.includes('down')) return 'down';
  if (states.includes('warn')) return 'warn';
  return 'ok';
}

function computeLastUpdated(timestamps: Array<string | null>): string | null {
  const latest = timestamps
    .map((value) => {
      if (!value) return null;
      const parsed = new Date(value);
      return Number.isNaN(parsed.getTime()) ? null : parsed;
    })
    .filter((value): value is Date => Boolean(value))
    .sort((a, b) => b.getTime() - a.getTime())[0];

  if (!latest) return null;
  return formatRelativeTime(latest.toISOString());
}

function StatusPill({ state, label }: { state: StatusState; label: string }) {
  return (
    <span className="status-pill" data-state={state}>
      {label}
    </span>
  );
}

export default async function SystemHealthPage() {
  const viewer = await getSessionUserSafe();
  if (!viewer?.id) redirect('/login');

  const role = (toAppRole(viewer.role) ?? 'CLIENT') as AppRole;
  if (role !== 'ADMIN') redirect('/dashboard');

  const sb = createServerClient();

  const [servicesResult, monitorsResult, resilienceResult] = await Promise.all([
    sb
      .from('system_services')
      .select('*')
      .order('display_order', { ascending: true })
      .order('name', { ascending: true }),
    sb
      .from('system_monitors')
      .select('*')
      .order('display_order', { ascending: true })
      .order('id', { ascending: true }),
    sb
      .from('system_resilience_practices')
      .select('*')
      .order('display_order', { ascending: true })
      .order('id', { ascending: true }),
  ]);

  const services = (servicesResult.data ?? []).map((service: ServiceRow) => ({
    id: service.id,
    name: service.name,
    summary: service.description ?? '',
    state: (service.state as StatusState) ?? 'ok',
    latency: formatLatency(service.latency_ms),
    uptime: formatUptime(service.uptime_percent),
    trend: service.trend_label ?? '—',
    updatedAgo: formatRelativeTime(service.updated_at),
    updatedAt: service.updated_at,
  }));

  const monitors = (monitorsResult.data ?? []).map((monitor: MonitorRow) => ({
    id: monitor.id,
    title: monitor.title,
    detail: monitor.detail ?? '',
    status: (monitor.status as StatusState) ?? 'ok',
    updatedAgo: formatRelativeTime(monitor.updated_at),
    updatedAt: monitor.updated_at,
  }));

  const resilience = (resilienceResult.data ?? []).map((item: ResilienceRow) => ({
    id: item.id,
    title: item.title,
    detail: item.detail ?? '',
    status: (item.status as StatusState) ?? 'ok',
    updatedAgo: formatRelativeTime(item.updated_at),
    updatedAt: item.updated_at,
  }));

  const resilienceState = resolveOverallState(resilience.map((item) => item.status));
  const overallState = resolveOverallState([
    ...services.map((service) => service.state),
    ...monitors.map((monitor) => monitor.status),
    resilienceState,
  ]);

  const lastUpdated = computeLastUpdated([
    ...services.map((service) => service.updatedAt),
    ...monitors.map((monitor) => monitor.updatedAt),
    ...resilience.map((item) => item.updatedAt),
  ]);

  return (
    <section className="system-page system-health neo-stack neo-stack--xl">
      <header className="neo-panel neo-panel--header system-page__hero system-health__hero">
        <div className="neo-stack neo-stack--sm system-page__intro system-health__intro">
          <span className="caps-tag">Saúde do sistema</span>
          <h1 className="system-page__title heading-solid">Dependências monitorizadas 24/7</h1>
          <p className="system-page__lede system-health__lede">
            Indicadores críticos, redundância e mecanismos de resiliência para manter o Fitness Pro disponível.
          </p>
        </div>
        <div className="neo-inline neo-inline--sm neo-inline--middle system-health__status" role="status">
          <StatusPill state={overallState} label={resolveStatusLabel(overallState)} />
          <span className="system-health__timestamp">
            {lastUpdated ? `Actualizado ${lastUpdated}` : 'Sem leituras recentes'}
          </span>
        </div>
      </header>

      <div className="system-page__layout system-health__layout">
        <section className="neo-panel neo-stack neo-stack--lg system-panel system-health__main" aria-labelledby="layers-heading">
          <div className="neo-inline neo-inline--wrap neo-inline--between neo-inline--md system-health__mainHeader">
            <div className="neo-stack neo-stack--xs">
              <h2 id="layers-heading" className="neo-panel__title">
                Camadas críticas
              </h2>
              <p className="neo-panel__subtitle">Visão geral dos pilares técnicos que suportam a plataforma.</p>
            </div>
            <StatusPill state={overallState} label={resolveStatusLabel(overallState)} />
          </div>

          {services.length === 0 ? (
            <div className="neo-surface neo-surface--padded system-health__empty" role="status">
              <span className="neo-text--sm neo-text--muted">
                Ainda sem leituras registadas para os serviços monitorizados.
              </span>
            </div>
          ) : (
            <div className="neo-grid neo-grid--auto system-health__services" role="list">
              {services.map((service) => (
                <article
                  key={service.id}
                  role="listitem"
                  className="neo-surface neo-surface--interactive neo-stack neo-stack--md system-health__serviceCard"
                  data-service-state={service.state}
                >
                  <div className="neo-inline neo-inline--between neo-inline--md system-health__serviceHeader">
                    <div className="neo-stack neo-stack--xs">
                      <h3 className="system-services__name">{service.name}</h3>
                      <p className="system-services__description">{service.summary}</p>
                    </div>
                    <StatusPill state={service.state} label={resolveStatusLabel(service.state)} />
                  </div>
                  <dl className="system-health__serviceMeta">
                    <div className="system-health__serviceMetaItem">
                      <dt className="neo-surface__hint">Latência média</dt>
                      <dd className="system-health__serviceMetaValue">{service.latency}</dd>
                    </div>
                    <div className="system-health__serviceMetaItem">
                      <dt className="neo-surface__hint">Uptime (30 dias)</dt>
                      <dd className="system-health__serviceMetaValue">{service.uptime}</dd>
                    </div>
                    <div className="system-health__serviceMetaItem">
                      <dt className="neo-surface__hint">Tendência</dt>
                      <dd className="system-health__serviceMetaValue">{service.trend}</dd>
                    </div>
                  </dl>
                  <footer className="system-health__serviceFooter">
                    <span className="system-health__serviceUpdated">
                      {service.updatedAgo !== '—' ? `Actualizado ${service.updatedAgo}` : 'Sem leituras recentes'}
                    </span>
                  </footer>
                </article>
              ))}
            </div>
          )}
        </section>

        <aside className="system-page__aside system-health__aside neo-stack neo-stack--lg">
          <section className="neo-panel neo-stack neo-stack--md system-health__asidePanel" aria-labelledby="monitors-heading">
            <div className="neo-stack neo-stack--xs">
              <h2 id="monitors-heading" className="neo-panel__title">
                Monitores activos
              </h2>
              <p className="neo-panel__subtitle">Serviços externos e regras internas a reportar falhas.</p>
            </div>
            {monitors.length === 0 ? (
              <div className="neo-surface neo-surface--padded system-health__empty" role="status">
                <span className="neo-text--sm neo-text--muted">Sem monitores registados.</span>
              </div>
            ) : (
              <ul className="system-health__list" role="list">
                {monitors.map((monitor) => (
                  <li key={monitor.id} role="listitem" className="neo-surface neo-surface--padded system-health__listItem">
                    <div className="neo-inline neo-inline--between neo-inline--sm system-health__listHeader">
                      <span className="system-health__listTitle">{monitor.title}</span>
                      <StatusPill state={monitor.status} label={resolveStatusLabel(monitor.status)} />
                    </div>
                    <p className="system-health__listDetail">{monitor.detail}</p>
                    <span className="system-health__listMeta">
                      {monitor.updatedAgo !== '—' ? `Actualizado ${monitor.updatedAgo}` : 'Sem leituras recentes'}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="neo-panel neo-stack neo-stack--md system-health__asidePanel" aria-labelledby="resilience-heading">
            <div className="neo-inline neo-inline--between neo-inline--sm system-health__listHeader">
              <div className="neo-stack neo-stack--xs">
                <h2 id="resilience-heading" className="neo-panel__title">
                  Resiliência
                </h2>
                <p className="neo-panel__subtitle">Planos de recuperação e salvaguarda.</p>
              </div>
              <StatusPill state={resilienceState} label={resolveStatusLabel(resilienceState)} />
            </div>
            {resilience.length === 0 ? (
              <div className="neo-surface neo-surface--padded system-health__empty" role="status">
                <span className="neo-text--sm neo-text--muted">Sem medidas de resiliência configuradas.</span>
              </div>
            ) : (
              <ul className="system-health__list" role="list">
                {resilience.map((item) => (
                  <li key={item.id} role="listitem" className="neo-surface neo-surface--padded system-health__listItem">
                    <div className="neo-inline neo-inline--between neo-inline--sm system-health__listHeader">
                      <span className="system-health__listTitle">{item.title}</span>
                      <StatusPill state={item.status} label={resolveStatusLabel(item.status)} />
                    </div>
                    <p className="system-health__listDetail">{item.detail}</p>
                    <span className="system-health__listMeta">
                      {item.updatedAgo !== '—' ? `Actualizado ${item.updatedAgo}` : 'Sem leituras recentes'}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </aside>
      </div>
    </section>
  );
}
