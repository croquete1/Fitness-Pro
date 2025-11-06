'use client';

import * as React from 'react';
import Link from 'next/link';
import {
  CalendarDays,
  CheckCircle2,
  Clock3,
  Download,
  Loader2,
  MapPin,
  RefreshCcw,
  ShieldCheck,
  TrendingUp,
  UserRound,
} from 'lucide-react';
import Alert from '@/components/ui/Alert';
import Button from '@/components/ui/Button';
import { buildClientSessionDashboard } from '@/lib/sessions/dashboard';
import type {
  ClientSession,
  SessionDashboardData,
  SessionRequest,
  SessionRequestStatus,
  SessionTimelinePoint,
} from '@/lib/sessions/types';

const HALF_HOUR_MS = 30 * 60 * 1000;

type TrainerOption = {
  id: string;
  name: string | null;
  email: string | null;
  status: string | null;
};

type HistoryStatusFilter = 'all' | 'completed' | 'cancelled' | 'no_show' | 'pending';
type RequestTab = 'open' | 'history';

const HISTORY_FILTERS: Array<{ value: HistoryStatusFilter; label: string }> = [
  { value: 'all', label: 'Todas' },
  { value: 'completed', label: 'Concluídas' },
  { value: 'pending', label: 'Por confirmar' },
  { value: 'cancelled', label: 'Canceladas' },
  { value: 'no_show', label: 'Faltas' },
];

function toDate(value: string | null | undefined): Date | null {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date;
}

function formatDateTime(value: string | null | undefined, fallback = 'Data por definir') {
  const date = toDate(value);
  if (!date) return fallback;
  return date.toLocaleString('pt-PT', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatDay(value: string | null | undefined) {
  const date = toDate(value);
  if (!date) return '—';
  return date.toLocaleDateString('pt-PT', { day: '2-digit', month: 'short' });
}

function formatTime(value: string | null | undefined) {
  const date = toDate(value);
  if (!date) return '—';
  return date.toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' });
}

function formatRelative(value: string | null | undefined) {
  const date = toDate(value);
  if (!date) return '—';
  const diffMinutes = Math.round((date.getTime() - Date.now()) / 60000);
  const diffHours = Math.round(diffMinutes / 60);
  const diffDays = Math.round(diffMinutes / 1440);
  const formatter = new Intl.RelativeTimeFormat('pt-PT', { numeric: 'auto' });
  if (Math.abs(diffMinutes) < 60) return formatter.format(diffMinutes, 'minute');
  if (Math.abs(diffHours) < 48) return formatter.format(diffHours, 'hour');
  return formatter.format(diffDays, 'day');
}

function formatPercentage(value: number) {
  return `${value.toFixed(value % 1 === 0 ? 0 : 1)}%`;
}

function sessionTone(attendance: ClientSession['attendanceStatus']) {
  switch (attendance) {
    case 'completed':
      return 'success';
    case 'confirmed':
      return 'primary';
    case 'cancelled':
    case 'no_show':
      return 'danger';
    case 'pending':
    default:
      return 'warning';
  }
}

function attendanceLabel(attendance: ClientSession['attendanceStatus']) {
  switch (attendance) {
    case 'completed':
      return 'Concluída';
    case 'confirmed':
      return 'Confirmada';
    case 'cancelled':
      return 'Cancelada';
    case 'no_show':
      return 'Faltou';
    case 'pending':
    default:
      return 'Por confirmar';
  }
}

function friendlyRequestStatus(status: SessionRequestStatus) {
  switch (status) {
    case 'accepted':
      return { label: 'Aceite', tone: 'success' as const };
    case 'declined':
    case 'cancelled':
    case 'reschedule_declined':
      return { label: 'Recusado', tone: 'danger' as const };
    case 'reschedule_pending':
      return { label: 'Remarcação pendente', tone: 'primary' as const };
    case 'pending':
    default:
      return { label: 'A aguardar resposta', tone: 'warning' as const };
  }
}

function trainerDisplay(trainer: SessionRequest['trainer']) {
  if (!trainer) return 'Personal trainer';
  if (trainer.name && trainer.email) return `${trainer.name} (${trainer.email})`;
  return trainer.name ?? trainer.email ?? 'Personal trainer';
}

function computeMetricCards(metrics: SessionDashboardData['metrics']) {
  return [
    {
      key: 'upcoming',
      label: 'Próximas sessões',
      value: metrics.upcomingCount,
      hint: metrics.nextSessionAt ? `Seguinte ${formatRelative(metrics.nextSessionAt)}` : 'Sem agendamentos futuros',
      icon: CalendarDays,
      tone: metrics.upcomingCount > 0 ? 'primary' : 'neutral',
    },
    {
      key: 'attendance',
      label: 'Presença confirmada',
      value: formatPercentage(metrics.attendanceRate),
      hint: `${metrics.totalSessions} sessão(ões) analisadas`,
      icon: CheckCircle2,
      tone: metrics.attendanceRate >= 70 ? 'success' : metrics.attendanceRate >= 40 ? 'warning' : 'danger',
    },
    {
      key: 'hours',
      label: 'Horas (7 dias)',
      value: `${metrics.hoursBooked7d.toFixed(metrics.hoursBooked7d % 1 === 0 ? 0 : 1)} h`,
      hint:
        metrics.hoursBookedDelta === 0
          ? 'Estável face à semana anterior'
          : metrics.hoursBookedDelta > 0
          ? `+${metrics.hoursBookedDelta.toFixed(metrics.hoursBookedDelta % 1 === 0 ? 0 : 1)} h vs. semana anterior`
          : `${metrics.hoursBookedDelta.toFixed(metrics.hoursBookedDelta % 1 === 0 ? 0 : 1)} h vs. semana anterior`,
      icon: TrendingUp,
      tone: 'info',
    },
    {
      key: 'requests',
      label: 'Pedidos em aberto',
      value: metrics.openRequests,
      hint: metrics.lastCompletedAt
        ? `Última conclusão ${formatRelative(metrics.lastCompletedAt)}`
        : 'Sem conclusões recentes',
      icon: RefreshCcw,
      tone: metrics.openRequests > 0 ? 'warning' : 'success',
    },
  ];
}

type Props = {
  initialSessions: ClientSession[];
  initialRequests: SessionRequest[];
};

export default function SessionsClient({ initialSessions, initialRequests }: Props) {
  const supabaseSessions = initialSessions.length > 0;
  const supabaseRequests = initialRequests.length > 0;
  const [sessions, setSessions] = React.useState<ClientSession[]>(() => initialSessions);
  const [requests, setRequests] = React.useState<SessionRequest[]>(() => initialRequests);
  const [sessionError, setSessionError] = React.useState<string | null>(null);
  const [requestError, setRequestError] = React.useState<string | null>(null);
  const [requestSuccess, setRequestSuccess] = React.useState<string | null>(null);
  const [pendingSessionId, setPendingSessionId] = React.useState<string | null>(null);
  const [pendingRequestAction, setPendingRequestAction] = React.useState<string | null>(null);
  const [requestDialogOpen, setRequestDialogOpen] = React.useState(false);
  const [requestBusy, setRequestBusy] = React.useState(false);
  const [trainerOptions, setTrainerOptions] = React.useState<TrainerOption[]>([]);
  const [loadingTrainers, setLoadingTrainers] = React.useState(false);
  const [requestForm, setRequestForm] = React.useState({ trainerId: '', start: '', duration: 60, note: '' });
  const [historyQuery, setHistoryQuery] = React.useState('');
  const [historyStatus, setHistoryStatus] = React.useState<HistoryStatusFilter>('all');
  const [requestTab, setRequestTab] = React.useState<RequestTab>('open');

  const requestHeadingId = React.useId();
  const upcomingHeadingId = React.useId();
  const historyHeadingId = React.useId();
  const dialogTitleId = React.useId();
  const dialogFormId = React.useId();

  const dashboard = React.useMemo(
    () => buildClientSessionDashboard(sessions, requests, { supabase: supabaseSessions || supabaseRequests }),
    [sessions, requests, supabaseSessions, supabaseRequests],
  );

  const sortedSessions = React.useMemo(() => {
    return [...sessions].sort((a, b) => {
      const aTime = toDate(a.startISO)?.getTime() ?? 0;
      const bTime = toDate(b.startISO)?.getTime() ?? 0;
      return aTime - bTime;
    });
  }, [sessions]);

  const upcomingSessions = React.useMemo(() => {
    const now = Date.now();
    return sortedSessions.filter((session) => {
      const start = toDate(session.startISO);
      if (!start) return true;
      return start.getTime() >= now - HALF_HOUR_MS;
    });
  }, [sortedSessions]);

  const pastSessions = React.useMemo(() => {
    const now = Date.now();
    return sortedSessions
      .filter((session) => {
        const start = toDate(session.startISO);
        if (!start) return false;
        return start.getTime() < now - HALF_HOUR_MS;
      })
      .sort((a, b) => {
        const aTime = toDate(a.startISO)?.getTime() ?? 0;
        const bTime = toDate(b.startISO)?.getTime() ?? 0;
        return bTime - aTime;
      });
  }, [sortedSessions]);

  const filteredHistory = React.useMemo(() => {
    const query = historyQuery.trim().toLowerCase();
    return pastSessions.filter((session) => {
      if (historyStatus !== 'all') {
        if ((session.attendanceStatus ?? 'pending') !== historyStatus) {
          return false;
        }
      }
      if (!query) return true;
      const haystack = [
        session.trainerName ?? '',
        session.trainerEmail ?? '',
        session.location ?? '',
        session.notes ?? '',
      ]
        .join(' ')
        .toLowerCase();
      return haystack.includes(query);
    });
  }, [pastSessions, historyQuery, historyStatus]);

  const sortedRequests = React.useMemo(() => {
    return [...requests].sort((a, b) => {
      const aTime = toDate(a.createdAt)?.getTime() ?? toDate(a.requestedStart)?.getTime() ?? 0;
      const bTime = toDate(b.createdAt)?.getTime() ?? toDate(b.requestedStart)?.getTime() ?? 0;
      return bTime - aTime;
    });
  }, [requests]);

  const openRequests = React.useMemo(
    () =>
      sortedRequests.filter(
        (request) => request.status === 'pending' || request.status === 'reschedule_pending',
      ),
    [sortedRequests],
  );

  const closedRequests = React.useMemo(
    () => sortedRequests.filter((request) => !openRequests.includes(request)),
    [sortedRequests, openRequests],
  );

  async function updateAttendance(sessionId: string, status: NonNullable<ClientSession['attendanceStatus']>) {
    if (pendingSessionId) return;
    setPendingSessionId(sessionId);
    setSessionError(null);
    try {
      const res = await fetch(`/api/sessions/${sessionId}/attendance`, {
        method: 'PATCH',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || 'Não foi possível atualizar a presença.');
      }
      const json = await res.json().catch(() => ({}));
      setSessions((prev) =>
        prev.map((session) =>
          session.id === sessionId
            ? {
                ...session,
                attendanceStatus: status,
                attendanceAt: json?.at ?? new Date().toISOString(),
              }
            : session,
        ),
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Não foi possível atualizar a presença.';
      setSessionError(message);
    } finally {
      setPendingSessionId(null);
    }
  }

  React.useEffect(() => {
    if (!requestDialogOpen || trainerOptions.length > 0 || loadingTrainers) return;
    let cancelled = false;
    setLoadingTrainers(true);
    fetch('/api/client/trainers?limit=50', { cache: 'no-store' })
      .then((res) => res.json().catch(() => ({})))
      .then((json) => {
        if (cancelled) return;
        if (Array.isArray(json?.trainers)) {
          setTrainerOptions(json.trainers as TrainerOption[]);
        } else {
          setTrainerOptions([]);
        }
      })
      .catch(() => {
        if (!cancelled) setTrainerOptions([]);
      })
      .finally(() => {
        if (!cancelled) setLoadingTrainers(false);
      });
    return () => {
      cancelled = true;
    };
  }, [requestDialogOpen, trainerOptions.length, loadingTrainers]);

  const availableTrainers = React.useMemo(
    () => trainerOptions.filter((trainer) => (trainer.status ?? '').toUpperCase() !== 'SUSPENDED'),
    [trainerOptions],
  );

  React.useEffect(() => {
    if (!requestSuccess) return;
    const timer = window.setTimeout(() => setRequestSuccess(null), 6000);
    return () => window.clearTimeout(timer);
  }, [requestSuccess]);

  function resetRequestForm() {
    setRequestForm({ trainerId: '', start: '', duration: 60, note: '' });
  }

  async function submitRequest(event: React.FormEvent) {
    event.preventDefault();
    if (requestBusy) return;

    if (!requestForm.trainerId) {
      setRequestError('Selecciona o personal trainer.');
      return;
    }
    if (!requestForm.start) {
      setRequestError('Indica data e hora pretendidas.');
      return;
    }
    const duration = Number(requestForm.duration);
    if (!duration || duration <= 0) {
      setRequestError('Define uma duração válida (minutos).');
      return;
    }

    const startDate = new Date(requestForm.start);
    if (Number.isNaN(startDate.getTime())) {
      setRequestError('Data/hora inválida.');
      return;
    }

    const endDate = new Date(startDate.getTime() + duration * 60000);

    setRequestBusy(true);
    setRequestError(null);
    setRequestSuccess(null);
    try {
      const res = await fetch('/api/client/session-requests', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          trainerId: requestForm.trainerId,
          start: startDate.toISOString(),
          end: endDate.toISOString(),
          note: requestForm.note?.trim() || undefined,
        }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(json?.details || json?.error || 'Não foi possível criar o pedido.');
      }
      if (json?.request) {
        setRequests((prev) => [json.request as SessionRequest, ...prev]);
      }
      setRequestDialogOpen(false);
      resetRequestForm();
      setRequestSuccess('Pedido enviado — o PT será notificado.');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Não foi possível criar o pedido.';
      setRequestError(message);
    } finally {
      setRequestBusy(false);
    }
  }

  async function mutateRequest(
    id: string,
    action: 'cancel' | 'accept_reschedule' | 'decline_reschedule',
    successMessage: string,
  ) {
    const actionKey = `${id}:${action}`;
    if (pendingRequestAction === actionKey) return;
    setPendingRequestAction(actionKey);
    setRequestError(null);
    setRequestSuccess(null);
    try {
      const res = await fetch(`/api/client/session-requests/${id}`, {
        method: 'PATCH',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ action }),
      });
      const text = await res.text();
      let json: any = {};
      try {
        json = text ? JSON.parse(text) : {};
      } catch {
        json = {};
      }
      if (!res.ok) {
        throw new Error(json?.details || json?.error || text || 'Não foi possível actualizar o pedido.');
      }
      if (json?.request) {
        setRequests((prev) => prev.map((request) => (request.id === id ? (json.request as SessionRequest) : request)));
      }
      if (successMessage) {
        setRequestSuccess(successMessage);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Não foi possível actualizar o pedido.';
      setRequestError(message);
    } finally {
      setPendingRequestAction(null);
    }
  }

  const metricCards = React.useMemo(() => computeMetricCards(dashboard.metrics), [dashboard.metrics]);

  function renderTimelinePoint(point: SessionTimelinePoint) {
    const total = point.scheduled || 1;
    const confirmedPct = Math.round((point.confirmed / total) * 100);
    const cancelledPct = Math.round((point.cancelled / total) * 100);
    return (
      <li key={point.date} className="client-sessions__timelineItem">
        <span className="client-sessions__timelineDate">{formatDay(point.date)}</span>
        <div className="client-sessions__timelineBar" aria-hidden>
          <span className="client-sessions__timelineSegment client-sessions__timelineSegment--confirmed" style={{ width: `${confirmedPct}%` }} />
          <span className="client-sessions__timelineSegment client-sessions__timelineSegment--cancelled" style={{ width: `${cancelledPct}%` }} />
        </div>
        <span className="client-sessions__timelineMeta">
          {point.confirmed} concluída(s) · {point.cancelled} cancelada(s)
        </span>
      </li>
    );
  }

  function renderSessionRow(session: ClientSession) {
    const disableActions = pendingSessionId === session.id;
    const tone = sessionTone(session.attendanceStatus);
    return (
      <tr key={session.id}>
        <td>
          <div className="client-sessions__sessionCell">
            <span className="client-sessions__sessionDate">{formatDateTime(session.startISO)}</span>
            <span className="client-sessions__sessionLocation">
              <MapPin size={14} aria-hidden />
              {session.location ?? 'Local a definir'}
            </span>
          </div>
        </td>
        <td>
          <div className="client-sessions__trainer">
            <UserRound size={14} aria-hidden />
            <span>{session.trainerName ?? session.trainerEmail ?? 'Personal trainer'}</span>
          </div>
        </td>
        <td>
          <span className="status-pill" data-state={tone}>
            {attendanceLabel(session.attendanceStatus)}
          </span>
        </td>
        <td>
          <span className="client-sessions__duration">{session.durationMin ? `${session.durationMin} min` : '—'}</span>
        </td>
        <td className="neo-table__cell--right">
          <div className="neo-table__actions">
            <a
              className="btn"
              data-variant="ghost"
              data-size="sm"
              href={`/api/sessions/${session.id}/ics`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <span className="btn__icon btn__icon--left" aria-hidden>
                <CalendarDays size={16} />
              </span>
              <span className="btn__label">ICS</span>
            </a>
            {session.attendanceStatus !== 'confirmed' && session.attendanceStatus !== 'completed' ? (
              <Button
                size="sm"
                variant="ghost"
                leftIcon={
                  disableActions ? <Loader2 size={16} className="icon-spin" aria-hidden /> : <CheckCircle2 size={16} aria-hidden />
                }
                onClick={() => updateAttendance(session.id, 'confirmed')}
                loading={disableActions}
                loadingText="A confirmar…"
              >
                Confirmar
              </Button>
            ) : null}
            {session.attendanceStatus !== 'completed' ? (
              <Button
                size="sm"
                variant="primary"
                leftIcon={disableActions ? <Loader2 size={16} className="icon-spin" aria-hidden /> : <ShieldCheck size={16} aria-hidden />}
                onClick={() => updateAttendance(session.id, 'completed')}
                loading={disableActions}
                loadingText="A registar…"
              >
                Concluída
              </Button>
            ) : null}
          </div>
        </td>
      </tr>
    );
  }

  function renderHistoryRow(session: ClientSession) {
    const tone = sessionTone(session.attendanceStatus);
    return (
      <tr key={session.id}>
        <td>
          <span className="client-sessions__sessionDate">{formatDateTime(session.startISO)}</span>
        </td>
        <td>
          <div className="client-sessions__trainer">
            <UserRound size={14} aria-hidden />
            <span>{session.trainerName ?? session.trainerEmail ?? 'Personal trainer'}</span>
          </div>
        </td>
        <td>
          <span className="status-pill" data-state={tone}>
            {attendanceLabel(session.attendanceStatus)}
          </span>
        </td>
        <td>
          <span className="client-sessions__duration">{session.durationMin ? `${session.durationMin} min` : '—'}</span>
        </td>
        <td>
          <span className="client-sessions__notes">{session.notes ?? '—'}</span>
        </td>
        <td>
          <span className="client-sessions__updated">{formatDay(session.attendanceAt ?? session.endISO)}</span>
        </td>
      </tr>
    );
  }

  function renderRequestRow(request: SessionRequest) {
    const status = friendlyRequestStatus(request.status);
    const actions: React.ReactNode[] = [];
    const disable = pendingRequestAction?.startsWith(request.id);
    if (request.status === 'pending') {
      actions.push(
        <Button
          key="cancel"
          size="sm"
          variant="ghost"
          onClick={() => mutateRequest(request.id, 'cancel', 'Pedido cancelado com sucesso.')}
          leftIcon={disable ? <Loader2 size={16} className="icon-spin" aria-hidden /> : <RefreshCcw size={16} aria-hidden />}
          loading={disable}
          loadingText="A cancelar…"
        >
          Cancelar
        </Button>,
      );
    }
    if (request.status === 'reschedule_pending') {
      actions.push(
        <Button
          key="accept"
          size="sm"
          variant="primary"
          onClick={() => mutateRequest(request.id, 'accept_reschedule', 'Remarcação aceite.')}
          leftIcon={disable ? <Loader2 size={16} className="icon-spin" aria-hidden /> : <CheckCircle2 size={16} aria-hidden />}
          loading={disable}
          loadingText="A aceitar…"
        >
          Aceitar
        </Button>,
      );
      actions.push(
        <Button
          key="decline"
          size="sm"
          variant="ghost"
          onClick={() => mutateRequest(request.id, 'decline_reschedule', 'Remarcação rejeitada.')}
          leftIcon={disable ? <Loader2 size={16} className="icon-spin" aria-hidden /> : <ShieldCheck size={16} aria-hidden />}
          loading={disable}
          loadingText="A responder…"
        >
          Recusar
        </Button>,
      );
    }

    return (
      <tr key={request.id}>
        <td>
          <div className="client-sessions__requestSummary">
            <span className="client-sessions__sessionDate">{formatDateTime(request.requestedStart)}</span>
            <span className="client-sessions__range">{`${formatTime(request.requestedStart)} — ${formatTime(request.requestedEnd)}`}</span>
          </div>
        </td>
        <td>
          <div className="client-sessions__trainer">
            <UserRound size={14} aria-hidden />
            <span>{trainerDisplay(request.trainer)}</span>
          </div>
        </td>
        <td>
          <span className="status-pill" data-state={status.tone}>
            {status.label}
          </span>
        </td>
        <td>
          <span className="client-sessions__notes">{request.message ?? '—'}</span>
        </td>
        <td>
          <span className="client-sessions__notes">{request.trainerNote ?? request.rescheduleNote ?? '—'}</span>
        </td>
        <td className="neo-table__cell--right">
          <div className="neo-table__actions">{actions}</div>
        </td>
      </tr>
    );
  }

  return (
    <div className="client-sessions">
      <header className="client-sessions__header">
        <div>
          <h1 className="client-sessions__title">Sessões &amp; Pedidos</h1>
          <p className="client-sessions__subtitle">
            Visão Neo das tuas sessões com métricas reais, pedidos de reagendamento e evolução recente.
          </p>
        </div>
        <div className="client-sessions__headerActions">
          <Button variant="primary" onClick={() => setRequestDialogOpen(true)}>
            Nova sessão
          </Button>
          <Link href="/dashboard/history" prefetch={false} className="btn" data-variant="ghost">
            <span className="btn__icon btn__icon--left" aria-hidden>
              <Download size={16} />
            </span>
            <span className="btn__label">Exportar histórico</span>
          </Link>
        </div>
      </header>

      {sessionError ? <Alert tone="danger" title={sessionError} /> : null}
      {requestError ? <Alert tone="danger" title={requestError} /> : null}
      {requestSuccess ? <Alert tone="success" title={requestSuccess} /> : null}
      {!dashboard.metrics.supabase ? (
        <Alert tone="warning" title="Sincronização limitada">
          Não foi possível carregar dados em tempo real — alguns indicadores podem ficar vazios até a ligação ser reposta.
        </Alert>
      ) : null}

      <section className="client-sessions__metrics" aria-label="Métricas principais">
        {metricCards.map((metric) => {
          const Icon = metric.icon;
          return (
            <article key={metric.key} className="client-sessions__metric" data-tone={metric.tone}>
              <header>
                <span className="client-sessions__metricIcon" aria-hidden>
                  <Icon size={20} />
                </span>
                <span className="client-sessions__metricLabel">{metric.label}</span>
              </header>
              <p className="client-sessions__metricValue">{metric.value}</p>
              <p className="client-sessions__metricHint">{metric.hint}</p>
            </article>
          );
        })}
      </section>

      <div className="client-sessions__grid">
        <section className="neo-panel client-sessions__panel" aria-labelledby={upcomingHeadingId}>
          <header className="neo-panel__header">
            <div className="neo-panel__meta">
              <h2 id={upcomingHeadingId} className="neo-panel__title">
                Sessões agendadas
              </h2>
              <p className="neo-panel__subtitle">
                Confirma presença e consulta o detalhe dos próximos treinos.
              </p>
            </div>
            <span className="client-sessions__count" role="status" aria-live="polite">
              {upcomingSessions.length} próximas
            </span>
          </header>

          {upcomingSessions.length ? (
            <div className="neo-table-wrapper" role="region" aria-live="polite">
              <table className="neo-table client-sessions__table">
                <thead>
                  <tr>
                    <th>Data</th>
                    <th>PT</th>
                    <th>Estado</th>
                    <th>Duração</th>
                    <th className="sr-only">Notas</th>
                    <th className="neo-table__cell--right">Ações</th>
                  </tr>
                </thead>
                <tbody>{upcomingSessions.map(renderSessionRow)}</tbody>
              </table>
            </div>
          ) : (
            <div className="neo-empty client-sessions__empty">
              <span className="neo-empty__icon" aria-hidden>
                <CalendarDays size={32} />
              </span>
              <p className="neo-empty__title">Sem sessões futuras</p>
              <p className="neo-empty__description">Assim que o teu PT agendar novos treinos eles aparecerão automaticamente.</p>
            </div>
          )}
        </section>

        <section className="neo-panel client-sessions__panel" aria-labelledby={historyHeadingId}>
          <header className="neo-panel__header client-sessions__historyHeader">
            <div className="neo-panel__meta">
              <h2 id={historyHeadingId} className="neo-panel__title">
                Histórico recente
              </h2>
              <p className="neo-panel__subtitle">Filtra por estado ou PT para reveres as últimas sessões.</p>
            </div>
            <div className="client-sessions__historyFilters">
              <div className="neo-input-group client-sessions__search">
                <label htmlFor="client-sessions-search" className="neo-input-group__label">
                  Pesquisa
                </label>
                <div className="neo-input-group__field">
                  <input
                    id="client-sessions-search"
                    type="search"
                    className="neo-input neo-input--compact"
                    placeholder="Filtrar por PT ou local"
                    value={historyQuery}
                    onChange={(event) => setHistoryQuery(event.target.value)}
                  />
                </div>
              </div>
              <div className="client-sessions__segmented" role="group" aria-label="Filtrar histórico">
                {HISTORY_FILTERS.map((filter) => (
                  <button
                    key={filter.value}
                    type="button"
                    className="client-sessions__segment"
                    data-active={historyStatus === filter.value}
                    onClick={() => setHistoryStatus(filter.value)}
                  >
                    {filter.label}
                  </button>
                ))}
              </div>
            </div>
          </header>

          {filteredHistory.length ? (
            <div className="neo-table-wrapper" role="region" aria-live="polite">
              <table className="neo-table client-sessions__table client-sessions__table--history">
                <thead>
                  <tr>
                    <th>Data</th>
                    <th>PT</th>
                    <th>Estado</th>
                    <th>Duração</th>
                    <th>Notas</th>
                    <th>Actualizado</th>
                  </tr>
                </thead>
                <tbody>{filteredHistory.map(renderHistoryRow)}</tbody>
              </table>
            </div>
          ) : (
            <div className="neo-empty client-sessions__empty">
              <span className="neo-empty__icon" aria-hidden>
                <Clock3 size={32} />
              </span>
              <p className="neo-empty__title">Sem resultados</p>
              <p className="neo-empty__description">
                Ajusta a pesquisa ou o filtro para encontrares as sessões registadas nos últimos meses.
              </p>
            </div>
          )}
        </section>

        <section className="neo-panel client-sessions__panel client-sessions__panel--timeline" aria-label="Tendência de sessões">
          <header className="neo-panel__header">
            <div className="neo-panel__meta">
              <h2 className="neo-panel__title">Tendência (14 dias)</h2>
              <p className="neo-panel__subtitle">
                Sessões agendadas, concluídas e canceladas nos últimos dias — destaca padrões de assiduidade.
              </p>
            </div>
            <div className="client-sessions__timelineMeta">
              {dashboard.metrics.busiestDayLabel ? `Dia com mais sessões: ${dashboard.metrics.busiestDayLabel}` : 'Sem picos recentes'}
            </div>
          </header>
          <ul className="client-sessions__timeline">{dashboard.timeline.map(renderTimelinePoint)}</ul>
        </section>

        <section className="neo-panel client-sessions__panel" aria-labelledby={requestHeadingId}>
          <header className="neo-panel__header client-sessions__requestsHeader">
            <div className="neo-panel__meta">
              <h2 id={requestHeadingId} className="neo-panel__title">
                Pedidos ao PT
              </h2>
              <p className="neo-panel__subtitle">Acompanha o estado de cada pedido e responde rapidamente às propostas.</p>
            </div>
            <div className="client-sessions__tabs" role="tablist">
              <button
                type="button"
                role="tab"
                className="client-sessions__tab"
                data-active={requestTab === 'open'}
                onClick={() => setRequestTab('open')}
              >
                Em aberto ({openRequests.length})
              </button>
              <button
                type="button"
                role="tab"
                className="client-sessions__tab"
                data-active={requestTab === 'history'}
                onClick={() => setRequestTab('history')}
              >
                Histórico ({closedRequests.length})
              </button>
            </div>
          </header>

          {(requestTab === 'open' ? openRequests : closedRequests).length ? (
            <div className="neo-table-wrapper" role="region" aria-live="polite">
              <table className="neo-table client-sessions__table client-sessions__table--requests">
                <thead>
                  <tr>
                    <th>Pedido</th>
                    <th>PT</th>
                    <th>Estado</th>
                    <th>Mensagem</th>
                    <th>Resposta do PT</th>
                    <th className="neo-table__cell--right">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {(requestTab === 'open' ? openRequests : closedRequests).map(renderRequestRow)}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="neo-empty client-sessions__empty">
              <span className="neo-empty__icon" aria-hidden>
                <RefreshCcw size={32} />
              </span>
              <p className="neo-empty__title">
                {requestTab === 'open' ? 'Sem pedidos pendentes' : 'Sem histórico de pedidos'}
              </p>
              <p className="neo-empty__description">
                {requestTab === 'open'
                  ? 'Quando criares um pedido de sessão, podes acompanhá-lo aqui e aceitar remarcações.'
                  : 'Assim que um pedido for resolvido, fica disponível neste separador para consulta futura.'}
              </p>
            </div>
          )}
        </section>

        <section className="neo-panel client-sessions__panel client-sessions__panel--insights" aria-label="Insights adicionais">
          <header className="neo-panel__header">
            <div className="neo-panel__meta">
              <h2 className="neo-panel__title">Insights rápidos</h2>
              <p className="neo-panel__subtitle">
                Distribuição de presenças, ranking de PT e actividades recentes para planear o próximo ciclo.
              </p>
            </div>
          </header>

          <div className="client-sessions__insightsGrid">
            <article className="client-sessions__insight">
              <h3>Estado das sessões</h3>
              <ul>
                {dashboard.attendance.map((item) => (
                  <li key={item.key}>
                    <span className="status-pill" data-state={item.tone}>
                      {item.label}
                    </span>
                    <span className="client-sessions__insightValue">{item.count}</span>
                    <span className="client-sessions__insightHint">{item.percentage}%</span>
                  </li>
                ))}
              </ul>
            </article>
            <article className="client-sessions__insight">
              <h3>Top PT</h3>
              <ul>
                {dashboard.trainers.length ? (
                  dashboard.trainers.map((trainer) => (
                    <li key={trainer.trainerId}>
                      <span className="client-sessions__insightLabel">
                        {trainer.trainerName ?? trainer.trainerEmail ?? 'Personal trainer'}
                      </span>
                      <span className="client-sessions__insightValue">{trainer.upcoming} agendada(s)</span>
                      <span className="client-sessions__insightHint">{trainer.completed} concluída(s)</span>
                    </li>
                  ))
                ) : (
                  <li className="client-sessions__insightEmpty">Sem dados suficientes.</li>
                )}
              </ul>
            </article>
            <article className="client-sessions__insight client-sessions__insight--activity">
              <h3>Atividade recente</h3>
              <ol>
                {dashboard.activities.length ? (
                  dashboard.activities.map((activity) => (
                    <li key={activity.id}>
                      <span className="client-sessions__activityTitle">{activity.title}</span>
                      <span className="client-sessions__activityMeta">{activity.description}</span>
                      <span className="client-sessions__activityTime">{formatRelative(activity.at)}</span>
                    </li>
                  ))
                ) : (
                  <li className="client-sessions__insightEmpty">Sem actividade nos últimos dias.</li>
                )}
              </ol>
            </article>
          </div>
        </section>
      </div>

      {requestDialogOpen ? (
        <div className="neo-dialog-backdrop" role="dialog" aria-modal="true" aria-labelledby={dialogTitleId}>
          <div className="neo-dialog sessions-request-dialog" role="document">
            <header className="neo-dialog__header">
              <div>
                <h2 id={dialogTitleId} className="neo-dialog__title">
                  Solicitar nova sessão
                </h2>
                <p className="neo-dialog__subtitle">
                  Escolhe o profissional, define data e partilha notas relevantes para acelerar a confirmação.
                </p>
              </div>
              <button
                type="button"
                className="btn"
                data-variant="ghost"
                data-size="sm"
                onClick={() => {
                  if (!requestBusy) {
                    setRequestDialogOpen(false);
                    setRequestError(null);
                  }
                }}
              >
                Fechar
              </button>
            </header>

            {requestError ? <Alert tone="danger" title={requestError} /> : null}

            <form id={dialogFormId} className="neo-dialog__content sessions-request-form" onSubmit={submitRequest}>
              <label className="sessions-field">
                <span className="sessions-field__label">Personal trainer</span>
                <select
                  className="neo-field"
                  value={requestForm.trainerId}
                  onChange={(event) => setRequestForm((prev) => ({ ...prev, trainerId: event.target.value }))}
                  disabled={requestBusy}
                  required
                >
                  <option value="">Selecciona o PT</option>
                  {availableTrainers.map((trainer) => (
                    <option key={trainer.id} value={trainer.id}>
                      {trainer.name ?? trainer.email ?? trainer.id}
                    </option>
                  ))}
                </select>
                <span className="sessions-field__hint">
                  {loadingTrainers ? 'A carregar treinadores…' : 'Escolhe o profissional com quem queres treinar.'}
                </span>
              </label>

              <label className="sessions-field">
                <span className="sessions-field__label">Data e hora pretendidas</span>
                <input
                  type="datetime-local"
                  className="neo-field"
                  value={requestForm.start}
                  onChange={(event) => setRequestForm((prev) => ({ ...prev, start: event.target.value }))}
                  disabled={requestBusy}
                  required
                />
              </label>

              <label className="sessions-field">
                <span className="sessions-field__label">Duração (minutos)</span>
                <input
                  type="number"
                  className="neo-field"
                  min={15}
                  step={5}
                  value={requestForm.duration}
                  onChange={(event) => setRequestForm((prev) => ({ ...prev, duration: Number(event.target.value || 0) }))}
                  disabled={requestBusy}
                />
              </label>

              <label className="sessions-field sessions-field--full">
                <span className="sessions-field__label">Notas para o PT</span>
                <textarea
                  className="neo-field sessions-field__textarea"
                  rows={3}
                  value={requestForm.note}
                  onChange={(event) => setRequestForm((prev) => ({ ...prev, note: event.target.value }))}
                  placeholder="Objetivo da sessão, local preferido, etc."
                  disabled={requestBusy}
                />
              </label>
            </form>

            <footer className="neo-dialog__footer">
              <Button
                variant="ghost"
                type="button"
                onClick={() => {
                  if (!requestBusy) {
                    setRequestDialogOpen(false);
                    setRequestError(null);
                  }
                }}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                form={dialogFormId}
                variant="primary"
                loading={requestBusy}
                loadingText="A enviar…"
                leftIcon={requestBusy ? <Loader2 size={16} className="icon-spin" aria-hidden /> : <CheckCircle2 size={16} aria-hidden />}
              >
                Enviar pedido
              </Button>
            </footer>
          </div>
        </div>
      ) : null}
    </div>
  );
}
