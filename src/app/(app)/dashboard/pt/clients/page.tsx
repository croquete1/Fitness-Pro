export const dynamic = 'force-dynamic';

import { redirect } from 'next/navigation';
import type { Metadata } from 'next';
import Link from 'next/link';

import PageHeader from '@/components/ui/PageHeader';
import { getSessionUserSafe } from '@/lib/session-bridge';
import { toAppRole } from '@/lib/roles';
import { brand } from '@/lib/brand';
import { loadTrainerClientOverview } from '@/lib/trainer/clients/server';
import { normalizePhone } from '@/lib/phone';
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

type AlertTone = 'warning' | 'info' | 'violet';

type ClientAlertKey =
  | 'NO_UPCOMING'
  | 'NO_PLAN'
  | 'PLAN_NOT_ACTIVE'
  | 'NO_CONTACT'
  | 'CLIENT_STATUS'
  | 'NO_HISTORY'
  | 'LAST_SESSION_STALE';

type ClientAlert = { key: ClientAlertKey; label: string; tone: AlertTone };

const ALERT_SUMMARY_META: Record<ClientAlertKey, { label: string; tone: AlertTone }> = {
  NO_UPCOMING: { label: 'Sem próxima sessão agendada', tone: 'warning' },
  NO_PLAN: { label: 'Sem plano activo', tone: 'info' },
  PLAN_NOT_ACTIVE: { label: 'Planos por activar', tone: 'info' },
  NO_CONTACT: { label: 'Sem contacto directo', tone: 'warning' },
  CLIENT_STATUS: { label: 'Estado do cliente a rever', tone: 'violet' },
  NO_HISTORY: { label: 'Sem histórico de sessões', tone: 'violet' },
  LAST_SESSION_STALE: { label: 'Sessão recente em atraso', tone: 'warning' },
};

const DAY_IN_MS = 86_400_000;
const STALE_SESSION_THRESHOLD_DAYS = 14;
const STALE_SESSION_THRESHOLD_MS = STALE_SESSION_THRESHOLD_DAYS * DAY_IN_MS;

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

type ClientRowAnalysis = {
  row: Awaited<ReturnType<typeof loadTrainerClientOverview>>['rows'][number];
  alerts: ClientAlert[];
  urgency: number;
};

function buildRowAnalysis(
  rows: Awaited<ReturnType<typeof loadTrainerClientOverview>>['rows'],
  nowMs = Date.now(),
): ClientRowAnalysis[] {
  return rows.map((row) => ({
    row,
    alerts: buildRowAlerts(row, nowMs),
    urgency: clientUrgencyScore(row, nowMs),
  }));
}

function sortAnalysedRows(entries: ClientRowAnalysis[]): ClientRowAnalysis[] {
  return [...entries].sort((a, b) => {
    if (a.urgency !== b.urgency) return b.urgency - a.urgency;
    const aNext = a.row.nextSessionAt ? new Date(a.row.nextSessionAt).getTime() : Infinity;
    const bNext = b.row.nextSessionAt ? new Date(b.row.nextSessionAt).getTime() : Infinity;
    if (aNext !== bNext) return aNext - bNext;
    if (b.row.upcomingCount !== a.row.upcomingCount) {
      return b.row.upcomingCount - a.row.upcomingCount;
    }
    return a.row.name.localeCompare(b.row.name, 'pt-PT');
  });
}

function clientUrgencyScore(
  row: Awaited<ReturnType<typeof loadTrainerClientOverview>>['rows'][number],
  nowMs = Date.now(),
) {
  let score = 0;
  const planStatus = row.planStatus ? row.planStatus.toString().trim().toUpperCase() : '';
  if (!row.upcomingCount) {
    score += 4;
  }
  if (!planStatus || planStatus !== 'ACTIVE') {
    score += 2;
  }
  if (!row.email && !row.phone) {
    score += 1;
  }
  const lastAt = row.lastSessionAt ? new Date(row.lastSessionAt).getTime() : Number.NaN;
  if (!row.lastSessionAt) {
    score += 1;
  } else if (!Number.isNaN(lastAt) && nowMs - lastAt > STALE_SESSION_THRESHOLD_MS) {
    score += 2;
  }
  return score;
}

function buildTelHref(value: string | null | undefined) {
  if (!value) return null;
  const normalized = normalizePhone(value);
  if (!normalized) return null;
  const compact = normalized.replace(/\s+/g, '');
  return `tel:${compact}`;
}

function buildRowAlerts(
  row: Awaited<ReturnType<typeof loadTrainerClientOverview>>['rows'][number],
  nowMs = Date.now(),
): ClientAlert[] {
  const alerts: ClientAlert[] = [];
  if (!row.upcomingCount) {
    alerts.push({ key: 'NO_UPCOMING', label: 'Sem próxima sessão agendada', tone: 'warning' });
  }

  const planStatus = normalize(row.planStatus);
  if (!planStatus) {
    alerts.push({ key: 'NO_PLAN', label: 'Sem plano activo', tone: 'info' });
  } else if (planStatus !== 'ACTIVE') {
    alerts.push({
      key: 'PLAN_NOT_ACTIVE',
      label: `Plano ${planStatusLabel(row.planStatus)}`,
      tone: 'info',
    });
  }

  if (!row.email && !row.phone) {
    alerts.push({ key: 'NO_CONTACT', label: 'Sem contacto directo', tone: 'warning' });
  }

  const status = normalize(row.clientStatus);
  if (status && status !== 'ACTIVE') {
    alerts.push({
      key: 'CLIENT_STATUS',
      label: `Estado ${clientStatusLabel(row.clientStatus)}`,
      tone: 'violet',
    });
  }

  const lastAt = row.lastSessionAt ? new Date(row.lastSessionAt).getTime() : Number.NaN;
  if (!row.lastSessionAt) {
    alerts.push({ key: 'NO_HISTORY', label: 'Sem sessões registadas', tone: 'violet' });
  } else if (!Number.isNaN(lastAt) && nowMs - lastAt > STALE_SESSION_THRESHOLD_MS) {
    alerts.push({
      key: 'LAST_SESSION_STALE',
      label: `Última sessão ${relativeLabel(row.lastSessionAt, 'há mais de 14 dias')}`,
      tone: 'warning',
    });
  }
  return score;
}

function buildTelHref(value: string | null | undefined) {
  if (!value) return null;
  const normalized = normalizePhone(value);
  if (!normalized) return null;
  const compact = normalized.replace(/\s+/g, '');
  return `tel:${compact}`;
}

  return alerts;
}

function summarizeAlerts(entries: ClientRowAnalysis[]) {
  const summary = new Map<
    ClientAlertKey,
    { key: ClientAlertKey; label: string; tone: AlertTone; count: number }
  >();

  for (const entry of entries) {
    for (const alert of entry.alerts) {
      const meta = ALERT_SUMMARY_META[alert.key];
      if (!meta) continue;
      const current = summary.get(alert.key) ?? {
        key: alert.key,
        label: meta.label,
        tone: meta.tone,
        count: 0,
      };
      current.count += 1;
      summary.set(alert.key, current);
    }
  }

  return Array.from(summary.values()).sort((a, b) => {
    if (a.count !== b.count) return b.count - a.count;
    return a.label.localeCompare(b.label, 'pt-PT');
  });
}

export default async function PtClientsPage() {
  const session = await getSessionUserSafe();
  const me = session?.user;
  if (!me?.id) redirect('/login');
  const role = toAppRole(me.role) ?? 'CLIENT';
  if (role !== 'PT' && role !== 'ADMIN') redirect('/dashboard');

  const overview = await loadTrainerClientOverview(me.id);
  const nowMs = Date.now();
  const analysedRows = sortAnalysedRows(buildRowAnalysis(overview.rows, nowMs));
  const rows = analysedRows.map((entry) => entry.row);
  const lastUpdatedLabel = relativeLabel(overview.updatedAt, 'actualizado agora mesmo');
  const attention = analysedRows.filter((entry) => entry.alerts.length > 0);
  const urgentRows = attention.slice(0, 6);
  const overflowCount = attention.length - urgentRows.length;
  const alertSummary = summarizeAlerts(attention);

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
    {
      label: 'Sem contacto directo',
      value: overview.metrics.missingContacts,
      hint: 'Clientes sem email ou telefone registado',
      tone: 'warning',
    },
    {
      label: 'Sem plano activo',
      value: overview.metrics.withoutPlan,
      hint: 'Clientes ligados mas sem plano identificado',
      tone: 'info',
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

      <section className="neo-panel space-y-4" aria-label="Alertas operacionais">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="neo-panel__title">Alertas operacionais</h2>
            <p className="neo-panel__subtitle">
              Prioriza clientes com bloqueios imediatos no plano, contacto ou sessões.
            </p>
          </div>
          <span className="neo-badge neo-badge--muted" data-tone={attention.length > 0 ? 'warning' : 'success'}>
            {attention.length > 0
              ? `${attention.length} cliente(s) a requerer atenção`
              : 'Carteira em dia'}
          </span>
        </div>

        {alertSummary.length > 0 && (
          <div className="neo-inline neo-inline--sm flex-wrap" role="list">
            {alertSummary.map((item) => (
              <span
                key={item.key}
                className="neo-badge"
                data-tone={item.tone}
                role="listitem"
                aria-label={`${item.count} clientes com alerta: ${item.label}`}
              >
                <span className="font-semibold">{item.count}</span>
                <span aria-hidden="true"> · </span>
                {item.label}
              </span>
            ))}
          </div>
        )}

        {urgentRows.length > 0 ? (
          <div className="neo-stack space-y-3">
            {urgentRows.map(({ row, alerts }) => {
              const nextRelative = relativeLabel(row.nextSessionAt, 'Sem agendamento');
              const lastRelative = relativeLabel(row.lastSessionAt, 'Sem histórico');
              const linkedRelative = row.linkedAt
                ? relativeLabel(row.linkedAt, 'há algum tempo')
                : 'Ligação pendente';
              const telHref = buildTelHref(row.phone);
              const variant: AlertTone = alerts.some((alert) => alert.tone === 'warning')
                ? 'warning'
                : alerts.some((alert) => alert.tone === 'violet')
                ? 'violet'
                : 'info';

              return (
                <article key={row.id} className="neo-surface space-y-3 p-4" data-variant={variant}>
                  <header className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="font-semibold text-fg">{row.name}</p>
                      <p className="text-xs text-muted">Ligado {linkedRelative}</p>
                    </div>
                    <span className="status-pill" data-state={clientStatusTone(row.clientStatus)}>
                      {clientStatusLabel(row.clientStatus)}
                    </span>
                  </header>

                  <div className="neo-inline neo-inline--sm" role="list">
                    {alerts.map((alert) => (
                      <span
                        key={`${alert.key}-${alert.label}`}
                        className="neo-badge"
                        data-tone={alert.tone}
                        role="listitem"
                      >
                        {alert.label}
                      </span>
                    ))}
                  </div>

                  <div className="flex flex-wrap items-center gap-4 text-xs text-muted">
                    <span>Próxima sessão: {nextRelative}</span>
                    <span>Última sessão: {lastRelative}</span>
                    {row.planTitle && <span>Plano: {row.planTitle}</span>}
                  </div>

                  <div className="neo-inline neo-inline--sm">
                    {row.email && (
                      <a
                        href={`mailto:${row.email}`}
                        className="link-arrow text-sm"
                        aria-label={`Enviar email para ${row.name}`}
                      >
                        Enviar email
                      </a>
                    )}
                    {telHref && (
                      <a
                        href={telHref}
                        className="link-arrow text-sm"
                        aria-label={`Ligar para ${row.name}`}
                      >
                        Ligar agora
                      </a>
                    )}
                    <Link
                      href={`/dashboard/users/${row.id}`}
                      prefetch={false}
                      className="link-arrow inline-flex items-center gap-1 text-sm"
                    >
                      Ver perfil completo
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          <p className="rounded-xl border border-dashed border-white/40 bg-white/30 p-4 text-sm text-muted dark:border-slate-700/60 dark:bg-slate-900/20">
            Todos os clientes têm plano activo, contacto directo e sessões em curso.
          </p>
        )}

        {overflowCount > 0 && (
          <p className="text-xs text-muted">
            Outros {overflowCount} cliente(s) com alertas estão detalhados na tabela abaixo.
          </p>
        )}
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
                const telHref = buildTelHref(row.phone);

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
                      <div className="neo-inline neo-inline--sm justify-end">
                        {row.email && (
                          <a
                            href={`mailto:${row.email}`}
                            className="link-arrow text-sm"
                            aria-label={`Enviar email para ${row.name}`}
                          >
                            Enviar email
                          </a>
                        )}
                        {telHref && (
                          <a
                            href={telHref}
                            className="link-arrow text-sm"
                            aria-label={`Ligar para ${row.name}`}
                          >
                            Ligar agora
                          </a>
                        )}
                        <Link
                          href={`/dashboard/users/${row.id}`}
                          prefetch={false}
                          className="link-arrow inline-flex items-center gap-1 text-sm"
                        >
                          Ver perfil
                        </Link>
                      </div>
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
