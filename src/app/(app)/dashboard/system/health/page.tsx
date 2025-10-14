import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Saúde do Sistema' };

type StatusState = 'ok' | 'warn' | 'down';

const layers = [
  {
    id: 'core-api',
    title: 'API Core',
    summary: 'Autenticação, planos, sessões e sincronização de clientes.',
    state: 'ok' as StatusState,
    latency: '42 ms',
    uptime: '99,98%',
    trend: '+0,4% nas últimas 24h',
  },
  {
    id: 'supabase',
    title: 'Supabase',
    summary: 'Base de dados relacional, storage e políticas Row Level Security.',
    state: 'ok' as StatusState,
    latency: '58 ms',
    uptime: '99,95%',
    trend: 'Sem oscilação',
  },
  {
    id: 'jobs',
    title: 'Fila de jobs',
    summary: 'Envio de emails, push, geração de relatórios e tarefas agendadas.',
    state: 'warn' as StatusState,
    latency: '1,2 s',
    uptime: '99,40%',
    trend: 'Reprocessamento automático activado',
  },
];

const monitors = [
  { id: 'uptime', title: 'Uptime Robot', detail: 'Monitora endpoints públicos e privados em 30 localizações.' },
  { id: 'slo', title: 'Apdex & SLO', detail: '98% das respostas abaixo de 300 ms em média semanal.' },
  { id: 'alerts', title: 'Alertas automáticos', detail: 'Integração com Slack #fitness-pro-ops e fallback por email.' },
];

const resilience = [
  { id: 'backups', title: 'Backups incrementais', detail: 'Intervalo de 30 minutos · retenção de 14 dias.' },
  { id: 'failover', title: 'Failover multi-região', detail: 'Replica de leitura pronta em Frankfurt com DNS programado.' },
  { id: 'circuit', title: 'Circuit breaker', detail: 'Retry exponencial automático até 3 tentativas antes de marcar falha.' },
];

function StatusPill({ state, label }: { state: StatusState; label: string }) {
  return <span className="status-pill" data-state={state}>{label}</span>;
}

export default function SystemHealthPage() {
  return (
    <section className="space-y-6 px-4 py-6 md:px-8 lg:px-12">
      <header className="neo-panel neo-panel--header">
        <div className="space-y-2">
          <span className="caps-tag">Saúde do sistema</span>
          <h1 className="heading-solid text-3xl font-extrabold leading-tight">
            Dependências monitorizadas 24/7
          </h1>
          <p className="text-sm text-muted max-w-2xl">
            Indicadores críticos, redundância e mecanismos de resiliência para manter o Fitness Pro disponível.
          </p>
        </div>
        <div className="status-pill" data-state="ok">Actualizado há 45 s</div>
      </header>

      <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        <section className="neo-panel space-y-4" aria-labelledby="layers-heading">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 id="layers-heading" className="neo-panel__title">Camadas críticas</h2>
              <p className="neo-panel__subtitle">Visão geral dos pilares técnicos que suportam a plataforma.</p>
            </div>
            <StatusPill state="ok" label="Estável" />
          </div>
          <ul className="grid gap-4">
            {layers.map((layer) => (
              <li key={layer.id} id={layer.id} className="neo-surface p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="space-y-1">
                    <h3 className="text-lg font-semibold text-fg">{layer.title}</h3>
                    <p className="text-sm text-muted">{layer.summary}</p>
                  </div>
                  <StatusPill state={layer.state} label={layer.state === 'ok' ? 'operacional' : 'atenção'} />
                </div>
                <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-3">
                  <div>
                    <dt className="neo-surface__hint">Latência média</dt>
                    <dd className="text-base font-semibold text-fg">{layer.latency}</dd>
                  </div>
                  <div>
                    <dt className="neo-surface__hint">Uptime (30 dias)</dt>
                    <dd className="text-base font-semibold text-fg">{layer.uptime}</dd>
                  </div>
                  <div>
                    <dt className="neo-surface__hint">Tendência</dt>
                    <dd className="text-base font-semibold text-fg">{layer.trend}</dd>
                  </div>
                </dl>
              </li>
            ))}
          </ul>
        </section>

        <aside className="space-y-5">
          <section className="neo-panel space-y-3" aria-labelledby="monitors-heading">
            <div>
              <h2 id="monitors-heading" className="neo-panel__title">Monitores activos</h2>
              <p className="neo-panel__subtitle">Serviços externos e regras internas a reportar falhas.</p>
            </div>
            <ul className="grid gap-3 text-sm">
              {monitors.map((monitor) => (
                <li key={monitor.id} className="neo-surface p-4">
                  <div className="font-semibold text-fg">{monitor.title}</div>
                  <div className="text-sm text-muted">{monitor.detail}</div>
                </li>
              ))}
            </ul>
          </section>

          <section className="neo-panel space-y-3" aria-labelledby="resilience-heading">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 id="resilience-heading" className="neo-panel__title">Resiliência</h2>
                <p className="neo-panel__subtitle">Planos de recuperação e salvaguarda.</p>
              </div>
              <StatusPill state="ok" label="Pronto" />
            </div>
            <ul className="grid gap-3 text-sm">
              {resilience.map((item) => (
                <li key={item.id} className="neo-surface p-4">
                  <div className="font-semibold text-fg">{item.title}</div>
                  <div className="text-sm text-muted">{item.detail}</div>
                </li>
              ))}
            </ul>
          </section>
        </aside>
      </div>
    </section>
  );
}
