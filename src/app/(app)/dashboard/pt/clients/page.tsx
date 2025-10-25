export const dynamic = 'force-dynamic';

import { redirect } from 'next/navigation';
import type { Metadata } from 'next';
import Link from 'next/link';

import PageHeader from '@/components/ui/PageHeader';
import { getSessionUserSafe } from '@/lib/session-bridge';
import { toAppRole } from '@/lib/roles';
import { brand } from '@/lib/brand';
import { loadTrainerClientOverview } from '@/lib/trainer/clients/server';
import { formatRelativeTime } from '@/lib/datetime/relative';

export const metadata: Metadata = {
  title: `Clientes do Personal Trainer · ${brand.name}`,
  description: 'Consulta os clientes associados aos teus planos e sessões.',
};

type Metric = {
  label: string;
  value: number;
  hint?: string;
  tone?: 'primary' | 'info' | 'success' | 'warning' | 'violet';
};

type StatusTone = 'ok' | 'warn' | 'down';

type PlanStatusTone = 'primary' | 'success' | 'warning' | 'violet' | 'info';

const CLIENT_STATUS_LABELS: Record<string, string> = {
  ACTIVE: 'Activo',
  SUSPENDED: 'Suspenso',
  PENDING: 'Pendente',
};

const PLAN_STATUS_LABELS: Record<string, string> = {
  ACTIVE: 'Activo',
  DRAFT: 'Em construção',
  ARCHIVED: 'Arquivado',
  DELETED: 'Removido',
};

function normalize(value: string | null | undefined): string {
  return value ? value.toString().trim().toUpperCase() : '';
}

function clientStatusTone(value: string | null | undefined): StatusTone {
  const normalized = normalize(value);
  if (normalized === 'ACTIVE') return 'ok';
  if (normalized === 'SUSPENDED') return 'down';
  if (!normalized || normalized === 'PENDING') return 'warn';
  return 'warn';
}

function clientStatusLabel(value: string | null | undefined): string {
  const normalized = normalize(value);
  return CLIENT_STATUS_LABELS[normalized] ?? (value || '—');
}

function planBadgeTone(value: string | null | undefined): PlanStatusTone {
  const normalized = normalize(value);
  if (normalized === 'ACTIVE') return 'success';
  if (normalized === 'ARCHIVED') return 'info';
  if (normalized === 'DELETED') return 'violet';
  return 'warning';
}

function planStatusLabel(value: string | null | undefined): string {
  const normalized = normalize(value);
  if (!normalized) return 'Sem plano activo';
  return PLAN_STATUS_LABELS[normalized] ?? value ?? 'Sem plano activo';
}

function formatTimestamp(value: string | null): string | null {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleString('pt-PT');
}

function relativeLabel(value: string | null, empty: string): string {
  const relative = formatRelativeTime(value);
  if (relative) return relative;
  if (value) {
    const formatted = formatTimestamp(value);
    if (formatted) return formatted;
  }
  return empty;
}

function sortRows(
  rows: Awaited<ReturnType<typeof loadTrainerClientOverview>>['rows'],
): typeof rows {
  return [...rows].sort((a, b) => {
    const aNext = a.nextSessionAt ? new Date(a.nextSessionAt).getTime() : Infinity;
    const bNext = b.nextSessionAt ? new Date(b.nextSessionAt).getTime() : Infinity;
    if (aNext !== bNext) return aNext - bNext;
    if (b.upcomingCount !== a.upcomingCount) return b.upcomingCount - a.upcomingCount;
    return a.name.localeCompare(b.name, 'pt-PT');
  });
}

export default async function PtClientsPage() {
  const session = await getSessionUserSafe();
  const me = session?.user;
  if (!me?.id) redirect('/login');
  const role = toAppRole(me.role) ?? 'CLIENT';
  if (role !== 'PT' && role !== 'ADMIN') redirect('/dashboard');

  const overview = await loadTrainerClientOverview(me.id);
  const rows = sortRows(overview.rows);
  const lastUpdatedLabel = relativeLabel(overview.updatedAt, 'actualizado agora mesmo');

  const metrics: Metric[] = [
    {
      label: 'Total na carteira',
      value: overview.metrics.total,
      hint: 'Clientes com vínculo activo ao teu perfil',
      tone: 'primary',
    },
    {
      label: 'Planos activos',
      value: overview.metrics.activePlans,
      hint: 'Com plano marcado como ACTIVO',
      tone: 'success',
    },
    {
      label: 'Sessões agendadas',
      value: overview.metrics.upcomingSessions,
      hint: 'Nos próximos 120 dias de agenda',
      tone: 'info',
    },
    {
      label: 'Sem próxima sessão',
      value: overview.metrics.withoutUpcoming,
      hint: 'Clientes sem agendamentos futuros',
      tone: 'warning',
    },
    {
      label: 'Em onboarding',
      value: overview.metrics.onboarding,
      hint: 'A iniciar acompanhamento ou a aguardar activação',
      tone: 'violet',
    },
  ];

  const realtime = overview.source === 'supabase' && overview.supabase;
  const supabaseTone: StatusTone = realtime ? 'ok' : 'warn';
  const supabaseLabel = realtime ? 'Dados em tempo real' : 'Modo offline';

  return (
    <div className="space-y-6 px-4 py-6 md:px-8">
      <PageHeader
        title="Carteira de clientes"
        subtitle="Uma visão consolidada dos clientes que confiam no teu acompanhamento."
        actions={
          <div className="neo-inline neo-inline--wrap neo-inline--sm">
            <span className="status-pill" data-state={supabaseTone}>
              {supabaseLabel}
            </span>
            <span className="text-xs text-muted" aria-live="polite">
              Actualizado {lastUpdatedLabel}
            </span>
            <Link href="/register" prefetch={false} className="btn primary">
              Adicionar novo cliente
            </Link>
            <Link href="/dashboard/pt/plans" prefetch={false} className="btn ghost">
              Criar plano personalizado
            </Link>
          </div>
        }
      />

      <section className="neo-panel space-y-4" aria-label="Resumo de clientes">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="neo-panel__title">Panorama rápido</h2>
            <p className="neo-panel__subtitle">Indicadores para priorizares onboarding e acompanhamento.</p>
          </div>
          <span className="status-pill" data-state={overview.metrics.total > 0 ? 'ok' : 'warn'}>
            {overview.metrics.total > 0
              ? `${overview.metrics.total} cliente(s)`
              : 'Sem clientes ainda'}
          </span>
        </div>
        <div className="neo-grid auto-fit min-[320px]:grid-cols-2 xl:grid-cols-4">
          {metrics.map((metric) => (
            <article
              key={metric.label}
              className="neo-surface neo-surface--interactive space-y-3 p-4"
              data-variant={metric.tone}
            >
              <div className="space-y-1">
                <span className="neo-surface__hint uppercase tracking-wide">{metric.label}</span>
                <span className="neo-surface__value text-2xl font-semibold text-fg">{metric.value}</span>
              </div>
              {metric.hint && <p className="text-xs text-muted">{metric.hint}</p>}
            </article>
          ))}
        </div>
      </section>

      <section className="neo-panel space-y-4" aria-label="Lista de clientes">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="neo-panel__title">Clientes associados</h2>
            <p className="neo-panel__subtitle">
              Contactos, planos e agenda sincronizados com a tua operação diária.
            </p>
          </div>
          <Link href="/dashboard/pt/messages" prefetch={false} className="btn ghost">
            Enviar mensagem
          </Link>
        </div>

        <div className="neo-table-wrapper" role="region" aria-live="polite">
          <table className="neo-table">
            <thead>
              <tr>
                <th scope="col">Cliente</th>
                <th scope="col">Plano</th>
                <th scope="col">Próxima sessão</th>
                <th scope="col">Última sessão</th>
                <th scope="col">Estado</th>
                <th scope="col" className="text-right">
                  Acções
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => {
                const nextRelative = relativeLabel(row.nextSessionAt, 'Sem agendamento');
                const lastRelative = relativeLabel(row.lastSessionAt, 'Sem histórico');
                const nextAbsolute = formatTimestamp(row.nextSessionAt);
                const lastAbsolute = formatTimestamp(row.lastSessionAt);
                const linkedRelative = row.linkedAt
                  ? relativeLabel(row.linkedAt, 'há algum tempo')
                  : 'Ligação pendente';
                const hasContact = Boolean(row.email || row.phone);

                return (
                  <tr key={row.id}>
                    <td>
                      <div className="space-y-1">
                        <span className="font-semibold text-fg">{row.name}</span>
                        <p className="text-xs text-muted">Ligado {linkedRelative}</p>
                        <div className="flex flex-wrap gap-2 text-xs text-muted">
                          {row.email && <span>{row.email}</span>}
                          {row.phone && <span>{row.phone}</span>}
                          <span className="opacity-70">ID #{row.id}</span>
                          {row.upcomingCount > 0 && (
                            <span className="neo-badge neo-badge--muted">
                              {row.upcomingCount} sessão(ões) futura(s)
                            </span>
                          )}
                          {!hasContact && (
                            <span className="neo-badge neo-badge--muted" data-tone="warning">
                              Sem contacto directo
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="neo-badge" data-tone={planBadgeTone(row.planStatus)}>
                            {planStatusLabel(row.planStatus)}
                          </span>
                          {row.planTitle && (
                            <span className="text-xs text-muted" title={row.planTitle}>
                              {row.planTitle}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-muted">
                          {row.planUpdatedAt
                            ? `Actualizado ${relativeLabel(row.planUpdatedAt, 'há algum tempo')}`
                            : 'Sem histórico de actualização'}
                        </p>
                      </div>
                    </td>
                    <td>
                      <div className="space-y-1">
                        <span className="font-medium text-fg">{nextRelative}</span>
                        {nextAbsolute && <span className="text-xs text-muted">{nextAbsolute}</span>}
                      </div>
                    </td>
                    <td>
                      <div className="space-y-1">
                        <span className="text-sm text-fg">{lastRelative}</span>
                        {lastAbsolute && <span className="text-xs text-muted">{lastAbsolute}</span>}
                      </div>
                    </td>
                    <td>
                      <span className="status-pill" data-state={clientStatusTone(row.clientStatus)}>
                        {clientStatusLabel(row.clientStatus)}
                      </span>
                    </td>
                    <td className="text-right">
                      <Link
                        href={`/dashboard/users/${row.id}`}
                        prefetch={false}
                        className="link-arrow inline-flex items-center gap-1 text-sm"
                      >
                        Ver perfil
                      </Link>
                    </td>
                  </tr>
                );
              })}
              {rows.length === 0 && (
                <tr>
                  <td colSpan={6}>
                    <div className="rounded-2xl border border-dashed border-white/40 bg-white/40 p-6 text-center text-sm text-muted dark:border-slate-700/60 dark:bg-slate-900/30">
                      Ainda não tens clientes atribuídos. Usa as acções acima para convidar o primeiro atleta.
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
