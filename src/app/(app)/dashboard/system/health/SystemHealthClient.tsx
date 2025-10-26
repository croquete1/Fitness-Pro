'use client';

import * as React from 'react';
import useSWR from 'swr';
import Button from '@/components/ui/Button';
import Alert from '@/components/ui/Alert';
import type { SystemHealthDashboardResponse, SystemHealthHeroMetric } from '@/lib/system/health/types';

type Props = {
  initialData: SystemHealthDashboardResponse;
};

const fetcher = async (url: string): Promise<SystemHealthDashboardResponse> => {
  const response = await fetch(url, { credentials: 'include' });
  if (!response.ok) {
    const message = await response.text().catch(() => 'Não foi possível sincronizar a saúde do sistema.');
    throw new Error(message || 'Não foi possível sincronizar a saúde do sistema.');
  }
  const payload = (await response.json()) as SystemHealthDashboardResponse | { ok?: boolean; message?: string };
  if (!payload || typeof payload !== 'object' || !('ok' in payload) || !payload.ok) {
    throw new Error((payload as any)?.message ?? 'Não foi possível sincronizar a saúde do sistema.');
  }
  return payload as SystemHealthDashboardResponse;
};

type StatusState = 'ok' | 'warn' | 'down';

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

function StatusPill({ state, label }: { state: StatusState; label: string }) {
  return (
    <span className="status-pill" data-state={state}>
      {label}
    </span>
  );
}

function HeroMetrics({ metrics }: { metrics: SystemHealthHeroMetric[] }) {
  if (!metrics.length) return null;
  return (
    <div className="system-metrics__heroGrid system-health__heroMetrics" role="list">
      {metrics.map((metric) => (
        <article
          key={metric.key}
          role="listitem"
          className="system-metrics__hero"
          data-tone={metric.tone ?? 'info'}
        >
          <span className="system-metrics__heroLabel">{metric.label}</span>
          <strong className="system-metrics__heroValue">{metric.value}</strong>
          {metric.hint ? <span className="system-metrics__heroHint">{metric.hint}</span> : null}
          {metric.trend ? <span className="system-metrics__heroTrend">{metric.trend}</span> : null}
        </article>
      ))}
    </div>
  );
}

export default function SystemHealthClient({ initialData }: Props) {
  const { data, error, isValidating, mutate } = useSWR<SystemHealthDashboardResponse>('/api/system/health', fetcher, {
    fallbackData: initialData,
    revalidateOnFocus: false,
    dedupingInterval: 15_000,
  });

  const dashboard = data ?? initialData;
  const summary = dashboard.summary;

  const lastUpdatedLabel = summary.lastUpdatedRelative
    ? `Actualizado ${summary.lastUpdatedRelative}`
    : 'Sem leituras recentes';

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
          <StatusPill state={summary.overallState} label={resolveStatusLabel(summary.overallState)} />
          <span className="system-health__timestamp">{lastUpdatedLabel}</span>
          <Button
            variant="ghost"
            size="sm"
            loading={isValidating}
            onClick={() => mutate()}
            aria-live="polite"
          >
            {isValidating ? 'A actualizar…' : 'Actualizar'}
          </Button>
        </div>
      </header>

      <HeroMetrics metrics={dashboard.hero ?? []} />

      {error ? (
        <Alert tone="danger" title="Não foi possível sincronizar a saúde do sistema.">
          {error.message}
        </Alert>
      ) : null}

      {dashboard.source === 'fallback' ? (
        <Alert tone="warning" title="A mostrar dados de referência.">
          Ligação ao servidor indisponível — a apresentar leituras mais recentes em cache.
        </Alert>
      ) : null}

      <div className="system-page__layout system-health__layout">
        <section className="neo-panel neo-stack neo-stack--lg system-panel system-health__main" aria-labelledby="layers-heading">
          <div className="neo-inline neo-inline--wrap neo-inline--between neo-inline--md system-health__mainHeader">
            <div className="neo-stack neo-stack--xs">
              <h2 id="layers-heading" className="neo-panel__title">
                Camadas críticas
              </h2>
              <p className="neo-panel__subtitle">Visão geral dos pilares técnicos que suportam a plataforma.</p>
            </div>
            <StatusPill state={summary.overallState} label={resolveStatusLabel(summary.overallState)} />
          </div>

          {dashboard.services.length === 0 ? (
            <div className="neo-surface neo-surface--padded system-health__empty" role="status">
              <span className="neo-text--sm neo-text--muted">Ainda sem leituras registadas para os serviços monitorizados.</span>
            </div>
          ) : (
            <div className="neo-grid neo-grid--auto system-health__services" role="list">
              {dashboard.services.map((service) => (
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
                      {service.updatedRelative !== '—' ? `Actualizado ${service.updatedRelative}` : 'Sem leituras recentes'}
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
            {dashboard.monitors.length === 0 ? (
              <div className="neo-surface neo-surface--padded system-health__empty" role="status">
                <span className="neo-text--sm neo-text--muted">Sem monitores registados.</span>
              </div>
            ) : (
              <ul className="system-health__list" role="list">
                {dashboard.monitors.map((monitor) => (
                  <li key={monitor.id} role="listitem" className="neo-surface neo-surface--padded system-health__listItem">
                    <div className="neo-inline neo-inline--between neo-inline--sm system-health__listHeader">
                      <span className="system-health__listTitle">{monitor.title}</span>
                      <StatusPill state={monitor.status} label={resolveStatusLabel(monitor.status)} />
                    </div>
                    <p className="system-health__listDetail">{monitor.detail}</p>
                    <span className="system-health__listMeta">
                      {monitor.updatedRelative !== '—'
                        ? `Actualizado ${monitor.updatedRelative}`
                        : 'Sem leituras recentes'}
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
              <StatusPill state={summary.overallState} label={resolveStatusLabel(summary.overallState)} />
            </div>
            {dashboard.resilience.length === 0 ? (
              <div className="neo-surface neo-surface--padded system-health__empty" role="status">
                <span className="neo-text--sm neo-text--muted">Sem medidas de resiliência configuradas.</span>
              </div>
            ) : (
              <ul className="system-health__list" role="list">
                {dashboard.resilience.map((item) => (
                  <li key={item.id} role="listitem" className="neo-surface neo-surface--padded system-health__listItem">
                    <div className="neo-inline neo-inline--between neo-inline--sm system-health__listHeader">
                      <span className="system-health__listTitle">{item.title}</span>
                      <StatusPill state={item.status} label={resolveStatusLabel(item.status)} />
                    </div>
                    <p className="system-health__listDetail">{item.detail}</p>
                    <span className="system-health__listMeta">
                      {item.updatedRelative !== '—' ? `Actualizado ${item.updatedRelative}` : 'Sem leituras recentes'}
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
