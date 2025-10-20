'use client';

import * as React from 'react';
import useSWR from 'swr';
import {
  AlertTriangle,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Copy,
  Download,
  MapPin,
  NotebookPen,
  Plus,
  RefreshCcw,
  Trash2,
  Users,
} from 'lucide-react';

import PageHeader from '@/components/ui/PageHeader';
import Button from '@/components/ui/Button';
import Alert from '@/components/ui/Alert';
import Modal from '@/components/ui/Modal';
import DataSourceBadge, { describeDataSourceRelative } from '@/components/ui/DataSourceBadge';
import Spinner from '@/components/ui/Spinner';
import SessionFormClient from './SessionFormClient';
import type { AdminPtsScheduleDashboardData, AdminPtsScheduleSessionView } from '@/lib/admin/pts-schedule/types';

type DashboardResponse = AdminPtsScheduleDashboardData & {
  ok: true;
  source: 'supabase' | 'fallback';
};

type Props = {
  initialData: DashboardResponse;
};

const fetcher = async (url: string): Promise<DashboardResponse> => {
  const response = await fetch(url, { cache: 'no-store' });
  if (!response.ok) {
    const text = await response.text().catch(() => '');
    throw new Error(text || 'Não foi possível sincronizar a agenda.');
  }
  const json = (await response.json()) as DashboardResponse | { ok?: boolean; message?: string };
  if (!json || typeof json !== 'object' || !('ok' in json) || !json.ok) {
    const message = (json as any)?.message ?? 'Não foi possível sincronizar a agenda.';
    throw new Error(message);
  }
  return json as DashboardResponse;
};

function exportSessions(sessions: AdminPtsScheduleSessionView[]) {
  const header = [
    'ID',
    'Início',
    'Fim',
    'PT',
    'Cliente',
    'Estado',
    'Local',
    'Notas',
  ];
  const rows = sessions.map((session) => [
    session.id,
    session.startLabel,
    session.end ? new Date(session.end).toLocaleString('pt-PT') : '—',
    session.trainerName,
    session.clientName,
    session.statusLabel,
    session.location ?? '',
    session.notes ?? '',
  ]);
  const csv = [header, ...rows]
    .map((cols) => cols.map((value) => {
      const normalized = String(value ?? '');
      return normalized.includes(',') ? `"${normalized.replace(/"/g, '""')}"` : normalized;
    }).join(','))
    .join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `agenda-pts-${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(link.href);
}

function matchesQuery(session: AdminPtsScheduleSessionView, query: string): boolean {
  if (!query) return true;
  const normalized = query.toLowerCase();
  const haystack = [
    session.trainerName,
    session.clientName,
    session.statusLabel,
    session.location ?? '',
    session.notes ?? '',
    session.rangeLabel,
  ].join(' ').toLowerCase();
  return haystack.includes(normalized);
}

function toInitialValues(session: AdminPtsScheduleSessionView) {
  const normalizedStatus = (() => {
    const value = session.status.toLowerCase();
    if (value === 'done' || value === 'completed') return 'done';
    if (value === 'cancelled' || value === 'canceled') return 'cancelled';
    if (value === 'confirmed') return 'confirmed';
    return 'scheduled';
  })();

  return {
    trainer_id: session.trainerId ?? '',
    client_id: session.clientId ?? '',
    start_time: session.start ?? '',
    end_time: session.end ?? session.start ?? '',
    status: normalizedStatus,
    location: session.location ?? '',
    notes: session.notes ?? '',
  } as const;
}

function heroIcon(id: string) {
  switch (id) {
    case 'today':
      return CalendarDays;
    case 'upcoming':
      return Users;
    case 'concluded':
      return CheckCircle2;
    case 'planned-hours':
      return Clock3;
    case 'cancelled':
      return AlertTriangle;
    default:
      return Users;
  }
}

export default function AdminPtsScheduleClient({ initialData }: Props) {
  const { data, error, isLoading, mutate } = useSWR<DashboardResponse>(
    '/api/admin/pts-schedule/dashboard',
    fetcher,
    {
      fallbackData: initialData,
      revalidateOnFocus: false,
    },
  );

  const dashboard = data ?? initialData;

  const [statusFilter, setStatusFilter] = React.useState('all');
  const [trainerFilter, setTrainerFilter] = React.useState('all');
  const [query, setQuery] = React.useState('');
  const [createOpen, setCreateOpen] = React.useState(false);
  const [cloneSession, setCloneSession] = React.useState<AdminPtsScheduleSessionView | null>(null);
  const [feedback, setFeedback] = React.useState<{ tone: 'success' | 'danger'; message: string } | null>(null);
  const [actionBusy, setActionBusy] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!feedback) return;
    const timer = window.setTimeout(() => setFeedback(null), 3600);
    return () => window.clearTimeout(timer);
  }, [feedback]);

  const sessions = React.useMemo(() => {
    return dashboard.sessions
      .filter((session) => (statusFilter === 'all' ? true : session.status === statusFilter))
      .filter((session) => (trainerFilter === 'all' ? true : session.trainerId === trainerFilter))
      .filter((session) => matchesQuery(session, query.trim()));
  }, [dashboard.sessions, statusFilter, trainerFilter, query]);

  const trainers = React.useMemo(() => {
    const map = new Map<string, string>();
    dashboard.trainers.forEach((trainer) => {
      map.set(trainer.id, trainer.name);
    });
    return map;
  }, [dashboard.trainers]);

  async function handleDelete(id: string) {
    if (!confirm('Remover sessão da agenda?')) return;
    try {
      setActionBusy(id);
      const response = await fetch(`/api/admin/pts-schedule/${id}`, { method: 'DELETE' });
      if (!response.ok) {
        const text = await response.text().catch(() => '');
        throw new Error(text || 'Falha ao remover a sessão.');
      }
      setFeedback({ tone: 'success', message: 'Sessão removida com sucesso.' });
      await mutate();
    } catch (err: any) {
      const message = typeof err?.message === 'string' ? err.message : 'Não foi possível remover a sessão.';
      setFeedback({ tone: 'danger', message });
    } finally {
      setActionBusy(null);
    }
  }

  const metaUpdated = describeDataSourceRelative(dashboard.updatedAt);

  return (
    <div className="admin-pts-schedule">
      <PageHeader
        title="Agenda PTs"
        subtitle="Monitoriza as sessões planeadas, ajusta horários e mantém a equipa alinhada."
        actions={(
          <div className="admin-pts-schedule__actions">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => mutate()}
              loading={isLoading}
              leftIcon={<RefreshCcw size={16} aria-hidden />}
            >
              Atualizar
            </Button>
            <Button
              variant="primary"
              size="sm"
              leftIcon={<Plus size={16} aria-hidden />}
              onClick={() => setCreateOpen(true)}
            >
              Nova sessão
            </Button>
          </div>
        )}
      />

      <section className="admin-pts-schedule__meta" aria-label="Origem dos dados">
        <DataSourceBadge source={dashboard.source} generatedAt={dashboard.generatedAt} />
        <div className="admin-pts-schedule__metaDetail">
          <span>
            <CalendarDays size={14} aria-hidden className="neo-icon neo-icon--sm" /> Intervalo {dashboard.rangeLabel}
          </span>
          {metaUpdated ? (
            <span>
              <Clock3 size={14} aria-hidden className="neo-icon neo-icon--sm" /> Última alteração {metaUpdated}
            </span>
          ) : null}
        </div>
      </section>

      {feedback && (
        <Alert tone={feedback.tone === 'danger' ? 'danger' : 'success'} title={feedback.message} />
      )}

      {error ? (
        <Alert tone="danger" title="Não foi possível sincronizar a agenda." role="alert">
          {error.message}
        </Alert>
      ) : null}

      <section className="admin-pts-schedule__hero" role="list">
        {dashboard.hero.map((metric) => {
          const Icon = heroIcon(metric.id);
          return (
            <article key={metric.id} className="admin-pts-schedule__heroCard" data-tone={metric.tone} role="listitem">
              <header className="admin-pts-schedule__heroHeader">
                <span className="admin-pts-schedule__heroIcon" aria-hidden>
                  <Icon size={18} />
                </span>
                <span className="admin-pts-schedule__heroLabel">{metric.label}</span>
              </header>
              <strong className="admin-pts-schedule__heroValue">{metric.value}</strong>
              <span className="admin-pts-schedule__heroHint">{metric.hint}</span>
            </article>
          );
        })}
      </section>

      <section className="admin-pts-schedule__insights">
        <div className="admin-pts-schedule__panel" aria-label="Estados das sessões">
          <header>
            <h3>Estados</h3>
          </header>
          <ul>
            {dashboard.statuses.map((status) => (
              <li key={status.id} data-tone={status.tone}>
                <span>{status.label}</span>
                <strong>{status.count}</strong>
              </li>
            ))}
          </ul>
        </div>

        <div className="admin-pts-schedule__panel" aria-label="Carga por PT">
          <header>
            <h3>PTs em destaque</h3>
          </header>
          <ul>
            {dashboard.trainers.map((trainer) => (
              <li key={trainer.id}>
                <div>
                  <span className="admin-pts-schedule__trainerName">{trainer.name}</span>
                  <span className="admin-pts-schedule__trainerMeta">
                    {trainer.sessions} sessão{trainer.sessions === 1 ? '' : 's'} · {trainer.uniqueClients} cliente{trainer.uniqueClients === 1 ? '' : 's'}
                  </span>
                </div>
                <span className="admin-pts-schedule__trainerNext">
                  {trainer.nextSessionLabel ? `Próxima: ${trainer.nextSessionLabel}` : 'Sem próxima sessão nas próximas 2 semanas.'}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="admin-pts-schedule__table" aria-label="Lista de sessões">
        <header className="admin-pts-schedule__tableToolbar">
          <div className="admin-pts-schedule__filters">
            <label className="admin-pts-schedule__filter">
              <span>Estado</span>
              <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
                {dashboard.statuses.map((status) => (
                  <option key={status.id} value={status.id}>
                    {status.label} ({status.count})
                  </option>
                ))}
              </select>
            </label>
            <label className="admin-pts-schedule__filter">
              <span>PT</span>
              <select value={trainerFilter} onChange={(event) => setTrainerFilter(event.target.value)}>
                <option value="all">Todos</option>
                {dashboard.trainers.map((trainer) => (
                  <option key={trainer.id} value={trainer.id}>
                    {trainer.name} ({trainer.sessions})
                  </option>
                ))}
              </select>
            </label>
            <div className="admin-pts-schedule__search">
              <NotebookPen size={16} aria-hidden className="neo-icon neo-icon--sm" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Pesquisar por PT, cliente ou notas"
              />
            </div>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => exportSessions(sessions)}
            leftIcon={<Download size={16} aria-hidden />}
            disabled={!sessions.length}
          >
            Exportar CSV
          </Button>
        </header>

        <div className={`neo-table-wrapper${isLoading ? ' is-loading' : ''}`} role="region" aria-live="polite">
          {isLoading ? (
            <div className="neo-table__loading">
              <Spinner size={18} /> A sincronizar sessões…
            </div>
          ) : null}
          <table className="neo-table">
            <thead>
              <tr>
                <th scope="col">Data</th>
                <th scope="col">PT</th>
                <th scope="col">Cliente</th>
                <th scope="col">Estado</th>
                <th scope="col">Local</th>
                <th scope="col">Notas</th>
                <th scope="col">Duração</th>
                <th scope="col" className="neo-table__actions">Ações</th>
              </tr>
            </thead>
            <tbody>
              {sessions.length ? (
                sessions.map((session) => (
                  <tr key={session.id}>
                    <td>
                      <div className="admin-pts-schedule__time">
                        <span>{session.startLabel}</span>
                        {session.end ? <span className="admin-pts-schedule__timeHint">até {new Date(session.end).toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' })}</span> : null}
                      </div>
                    </td>
                    <td>{session.trainerName}</td>
                    <td>{session.clientName}</td>
                    <td>
                      <span className="admin-pts-schedule__status" data-tone={session.statusTone}>
                        {session.statusLabel}
                      </span>
                    </td>
                    <td>
                      {session.location ? (
                        <span className="admin-pts-schedule__cellMeta">
                          <MapPin size={14} aria-hidden /> {session.location}
                        </span>
                      ) : (
                        <span className="neo-text--muted">—</span>
                      )}
                    </td>
                    <td>{session.notes ? session.notes : <span className="neo-text--muted">—</span>}</td>
                    <td>{session.durationLabel ?? '—'}</td>
                    <td className="admin-pts-schedule__rowActions">
                      <button
                        type="button"
                        className="btn ghost"
                        onClick={() => setCloneSession(session)}
                        title="Duplicar sessão"
                      >
                        <Copy size={14} aria-hidden />
                      </button>
                      <a
                        className="btn ghost"
                        href={`/dashboard/admin/pts-schedule/${session.id}`}
                        title="Editar sessão"
                      >
                        <NotebookPen size={14} aria-hidden />
                      </a>
                      <button
                        type="button"
                        className="btn ghost"
                        data-variant="danger"
                        onClick={() => handleDelete(session.id)}
                        disabled={actionBusy === session.id}
                        title="Remover sessão"
                      >
                        {actionBusy === session.id ? <Spinner size={14} /> : <Trash2 size={14} aria-hidden />}
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8}>
                    <div className="neo-table-empty">
                      <p className="neo-text--muted">Sem sessões para os filtros seleccionados.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <Modal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        title="Nova sessão"
        size="md"
      >
        <SessionFormClient
          mode="create"
          onSuccess={async () => {
            setCreateOpen(false);
            await mutate();
            setFeedback({ tone: 'success', message: 'Sessão criada com sucesso.' });
          }}
        />
      </Modal>

      <Modal
        open={!!cloneSession}
        onClose={() => setCloneSession(null)}
        title="Duplicar sessão"
        size="md"
      >
        {cloneSession ? (
          <SessionFormClient
            mode="create"
            initial={toInitialValues(cloneSession)}
            onSuccess={async () => {
              setCloneSession(null);
              await mutate();
              setFeedback({ tone: 'success', message: 'Sessão criada a partir da original.' });
            }}
          />
        ) : null}
      </Modal>
    </div>
  );
}
