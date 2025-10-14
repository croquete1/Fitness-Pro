import type { Metadata } from 'next';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Centro de controlo',
  description: 'Monitorização operacional do Fitness Pro.',
};

type StatusState = 'ok' | 'warn' | 'down';

const services: Array<{
  id: string;
  name: string;
  description: string;
  state: StatusState;
  latency: string;
  uptime: string;
  updatedAgo: string;
}> = [
  {
    id: 'core-api',
    name: 'API Core',
    description: 'Autenticação, planos e sincronização em tempo real.',
    state: 'ok',
    latency: '42 ms',
    uptime: '99,98%',
    updatedAgo: 'há 32 s',
  },
  {
    id: 'supabase',
    name: 'Supabase',
    description: 'Base de dados e RPC utilizados pela experiência web.',
    state: 'ok',
    latency: '58 ms',
    uptime: '99,95%',
    updatedAgo: 'há 55 s',
  },
  {
    id: 'jobs',
    name: 'Fila de jobs',
    description: 'Envio de emails, notificações push e geração de relatórios.',
    state: 'warn',
    latency: '1,2 s',
    uptime: '99,40%',
    updatedAgo: 'há 4 min',
  },
];

const maintenanceWindows = [
  { id: 'mw-1', title: 'Atualização da API', when: '12 Jan · 02:00 — 02:15', impact: 'Intermitência de autenticação' },
  { id: 'mw-2', title: 'Rotina semanal de backups', when: '14 Jan · 03:30 — 03:45', impact: 'Sem impacto previsto' },
];

const insights = [
  { id: 'insight-1', label: 'Último deploy', value: 'há 2 h', detail: 'v2.14.0 — ajustes na experiência mobile' },
  { id: 'insight-2', label: 'Erros captados (1h)', value: '3', detail: 'Todos mitigados pelo circuito de retry' },
  { id: 'insight-3', label: 'Sincronizações calendarizadas', value: '12', detail: 'Próxima em 6 minutos' },
];

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

export default function SystemPage() {
  return (
    <section className="space-y-6 px-4 py-6 md:px-8 lg:px-12">
      <header className="neo-panel neo-panel--header">
        <div className="space-y-3">
          <span className="text-xs font-semibold tracking-[0.32em] uppercase" style={{ color: 'var(--muted-fg)' }}>
            Centro de controlo
          </span>
          <h1 className="text-3xl font-extrabold leading-tight" style={{ color: 'var(--fg)' }}>
            Operações em tempo real
          </h1>
          <p className="text-sm" style={{ color: 'var(--muted-fg)' }}>
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

      <div className="grid gap-5 xl:grid-cols-[2fr_1fr]">
        <div className="space-y-5">
          <section className="neo-panel space-y-4" aria-labelledby="services-heading">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 id="services-heading" className="neo-panel__title">Serviços essenciais</h2>
                <p className="neo-panel__subtitle">Estados actualizados de minuto a minuto com latência média.</p>
              </div>
              <StatusPill state="ok" label="Operacional" />
            </div>

            <div className="neo-grid auto-fit" role="list">
              {services.map((service) => (
                <article key={service.id} role="listitem" className="space-y-3 rounded-2xl border border-transparent bg-white/70 p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-slate-200 dark:bg-slate-950/40 dark:hover:border-slate-800">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="text-base font-semibold" style={{ color: 'var(--fg)' }}>{service.name}</h3>
                      <p className="text-sm" style={{ color: 'var(--muted-fg)' }}>{service.description}</p>
                    </div>
                    <StatusPill state={service.state} label={service.state === 'ok' ? 'ok' : service.state === 'warn' ? 'atenção' : 'incidente'} />
                  </div>
                  <dl className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <dt className="font-medium" style={{ color: 'var(--muted-fg)' }}>Latência média</dt>
                      <dd className="text-base font-semibold" style={{ color: 'var(--fg)' }}>{service.latency}</dd>
                    </div>
                    <div>
                      <dt className="font-medium" style={{ color: 'var(--muted-fg)' }}>Uptime (30 dias)</dt>
                      <dd className="text-base font-semibold" style={{ color: 'var(--fg)' }}>{service.uptime}</dd>
                    </div>
                    <div className="col-span-2 flex items-center justify-between text-xs" style={{ color: 'var(--muted-fg)' }}>
                      <span>Última leitura {service.updatedAgo}</span>
                      <Link href={`/dashboard/system/health#${service.id}`} className="link-arrow" prefetch={false}>
                        Ver detalhes <ArrowIcon />
                      </Link>
                    </div>
                  </dl>
                </article>
              ))}
            </div>
          </section>

          <section className="neo-panel space-y-4" aria-labelledby="maintenance-heading">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 id="maintenance-heading" className="neo-panel__title">Janelas de manutenção</h2>
                <p className="neo-panel__subtitle">Planeamento preventivo para evitar surpresas em horas de pico.</p>
              </div>
              <StatusPill state="warn" label="2 agendadas" />
            </div>
            <ul className="grid gap-3" aria-live="polite">
              {maintenanceWindows.map((mw) => (
                <li key={mw.id} className="rounded-xl border border-slate-200/60 bg-white/60 p-4 dark:border-slate-800/60 dark:bg-slate-950/40">
                  <div className="flex flex-col gap-1">
                    <span className="text-sm font-semibold" style={{ color: 'var(--fg)' }}>{mw.title}</span>
                    <span className="text-xs uppercase tracking-wide" style={{ color: 'var(--muted-fg)' }}>{mw.when}</span>
                    <span className="text-sm" style={{ color: 'var(--muted-fg)' }}>{mw.impact}</span>
                  </div>
                </li>
              ))}
            </ul>
          </section>
        </div>

        <aside className="space-y-5" aria-labelledby="insights-heading">
          <section className="neo-panel space-y-4">
            <div>
              <h2 id="insights-heading" className="neo-panel__title">Insights rápidos</h2>
              <p className="neo-panel__subtitle">Contexto imediato para decisões operacionais.</p>
            </div>
            <ul className="grid gap-3">
              {insights.map((insight) => (
                <li key={insight.id} className="rounded-xl border border-slate-200/60 bg-white/60 p-4 dark:border-slate-800/60 dark:bg-slate-950/40">
                  <div className="text-xs uppercase tracking-wide" style={{ color: 'var(--muted-fg)' }}>{insight.label}</div>
                  <div className="text-2xl font-bold" style={{ color: 'var(--fg)' }}>{insight.value}</div>
                  <div className="text-sm" style={{ color: 'var(--muted-fg)' }}>{insight.detail}</div>
                </li>
              ))}
            </ul>
          </section>

          <section className="neo-panel space-y-4" aria-labelledby="ops-links-heading">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 id="ops-links-heading" className="neo-panel__title">Operações</h2>
                <p className="neo-panel__subtitle">Ligações úteis para aprofundar cada área.</p>
              </div>
              <StatusPill state="ok" label="Cobertura total" />
            </div>
            <ul className="grid gap-2 text-sm">
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
