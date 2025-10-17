'use client';

import * as React from 'react';
import {
  CalendarDays,
  CheckCircle2,
  CheckSquare,
  History,
  Loader2,
  MessageSquarePlus,
  RefreshCcw,
  ShieldCheck,
  UserRound,
  XCircle,
} from 'lucide-react';

import Alert from '@/components/ui/Alert';
import Button from '@/components/ui/Button';

export type AttendanceStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'no_show' | null;

export type ClientSession = {
  id: string;
  startISO: string | null;
  endISO: string | null;
  durationMin: number | null;
  location: string | null;
  notes: string | null;
  trainerName: string | null;
  trainerEmail: string | null;
  status: string | null;
  attendanceStatus: AttendanceStatus;
  attendanceAt: string | null;
};

export type SessionRequestStatus =
  | 'pending'
  | 'accepted'
  | 'declined'
  | 'cancelled'
  | 'reschedule_pending'
  | 'reschedule_declined';

export type SessionRequest = {
  id: string;
  sessionId: string | null;
  status: SessionRequestStatus;
  requestedStart: string | null;
  requestedEnd: string | null;
  proposedStart: string | null;
  proposedEnd: string | null;
  message: string | null;
  trainerNote: string | null;
  rescheduleNote: string | null;
  createdAt: string | null;
  updatedAt: string | null;
  respondedAt: string | null;
  proposedAt: string | null;
  trainer: { id: string; name: string | null; email: string | null } | null;
};

type TrainerOption = {
  id: string;
  name: string | null;
  email: string | null;
  status: string | null;
};

type Props = {
  initialSessions: ClientSession[];
  initialRequests: SessionRequest[];
};

const fullDateFormatter = new Intl.DateTimeFormat('pt-PT', {
  weekday: 'short',
  day: '2-digit',
  month: 'short',
  hour: '2-digit',
  minute: '2-digit',
});

const timeFormatter = new Intl.DateTimeFormat('pt-PT', {
  hour: '2-digit',
  minute: '2-digit',
});

const shortDateFormatter = new Intl.DateTimeFormat('pt-PT', {
  day: '2-digit',
  month: 'short',
  hour: '2-digit',
  minute: '2-digit',
});

function toDate(value: string | null) {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date;
}

function formatDateTime(value: string | null, fallback = 'Data por definir') {
  const date = toDate(value);
  if (!date) return fallback;
  try {
    return fullDateFormatter.format(date);
  } catch {
    return fallback;
  }
}

function formatDateShort(value: string | null, fallback = '—') {
  const date = toDate(value);
  if (!date) return fallback;
  try {
    return shortDateFormatter.format(date);
  } catch {
    return fallback;
  }
}

function formatTime(value: string | null) {
  const date = toDate(value);
  if (!date) return '—';
  try {
    return timeFormatter.format(date);
  } catch {
    return '—';
  }
}

function formatRange(startISO: string | null, endISO: string | null) {
  if (!startISO) return 'Data por definir';
  const start = formatDateTime(startISO);
  if (!endISO) return start;
  return `${start} — ${formatTime(endISO)}`;
}

function attendanceMeta(status: AttendanceStatus) {
  switch (status) {
    case 'confirmed':
      return { label: 'Confirmada', tone: 'ok' as const };
    case 'completed':
      return { label: 'Concluída', tone: 'ok' as const };
    case 'cancelled':
      return { label: 'Cancelada', tone: 'down' as const };
    case 'no_show':
      return { label: 'Faltou', tone: 'down' as const };
    case 'pending':
    default:
      return { label: 'Por confirmar', tone: 'warn' as const };
  }
}

function requestStatusMeta(status: SessionRequestStatus) {
  switch (status) {
    case 'accepted':
      return { label: 'Aceite', tone: 'ok' as const };
    case 'declined':
    case 'cancelled':
    case 'reschedule_declined':
      return { label: 'Recusado', tone: 'down' as const };
    case 'reschedule_pending':
      return { label: 'Remarcação pendente', tone: 'warn' as const };
    case 'pending':
    default:
      return { label: 'Aguardando aprovação', tone: 'warn' as const };
  }
}

function trainerDisplay(trainer: SessionRequest['trainer']) {
  if (!trainer) return 'Personal trainer';
  if (trainer.name && trainer.email) return `${trainer.name} (${trainer.email})`;
  return trainer.name ?? trainer.email ?? 'Personal trainer';
}

export default function SessionsClient({ initialSessions, initialRequests }: Props) {
  const [sessions, setSessions] = React.useState<ClientSession[]>(() => [...initialSessions]);
  const [requests, setRequests] = React.useState<SessionRequest[]>(() => [...initialRequests]);
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

  const requestHeadingId = React.useId();
  const upcomingHeadingId = React.useId();
  const historyHeadingId = React.useId();
  const dialogTitleId = React.useId();
  const dialogFormId = React.useId();

  const sortedSessions = React.useMemo(() => {
    return [...sessions].sort((a, b) => {
      const aTime = toDate(a.startISO)?.getTime() ?? 0;
      const bTime = toDate(b.startISO)?.getTime() ?? 0;
      return aTime - bTime;
    });
  }, [sessions]);

  const now = React.useMemo(() => Date.now(), []);

  const upcomingSessions = React.useMemo(() => {
    return sortedSessions.filter((session) => {
      const start = toDate(session.startISO);
      if (!start) return true;
      return start.getTime() >= now - 30 * 60 * 1000;
    });
  }, [sortedSessions, now]);

  const pastSessions = React.useMemo(() => {
    return sortedSessions
      .filter((session) => {
        const start = toDate(session.startISO);
        if (!start) return false;
        return start.getTime() < now - 30 * 60 * 1000;
      })
      .reverse()
      .slice(0, 20);
  }, [sortedSessions, now]);

  const sortedRequests = React.useMemo(() => {
    return [...requests].sort((a, b) => {
      const aTime = toDate(a.createdAt)?.getTime() ?? toDate(a.requestedStart)?.getTime() ?? 0;
      const bTime = toDate(b.createdAt)?.getTime() ?? toDate(b.requestedStart)?.getTime() ?? 0;
      return bTime - aTime;
    });
  }, [requests]);

  const openRequests = React.useMemo(
    () => sortedRequests.filter((request) => request.status === 'pending' || request.status === 'reschedule_pending'),
    [sortedRequests],
  );

  const historyRequests = React.useMemo(
    () => sortedRequests.filter((request) => !openRequests.includes(request)),
    [sortedRequests, openRequests],
  );

  async function updateAttendance(sessionId: string, status: NonNullable<AttendanceStatus>) {
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

  const availableTrainers = React.useMemo(() => {
    return trainerOptions.filter((trainer) => (trainer.status ?? '').toUpperCase() !== 'SUSPENDED');
  }, [trainerOptions]);

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

  function renderSession(session: ClientSession) {
    const attendance = attendanceMeta(session.attendanceStatus);
    const disableActions = pendingSessionId === session.id;

    return (
      <article key={session.id} className="sessions-card" aria-labelledby={`session-${session.id}`}> 
        <header className="sessions-card__header">
          <div className="sessions-card__meta">
            <h3 id={`session-${session.id}`} className="sessions-card__title">
              {formatDateTime(session.startISO)}
            </h3>
            <dl className="sessions-card__details">
              <div>
                <dt>Local</dt>
                <dd>{session.location ? session.location : '—'}</dd>
              </div>
              <div>
                <dt>Personal trainer</dt>
                <dd>{session.trainerName ?? session.trainerEmail ?? '—'}</dd>
              </div>
              {session.durationMin ? (
                <div>
                  <dt>Duração</dt>
                  <dd>{session.durationMin} min</dd>
                </div>
              ) : null}
            </dl>
          </div>
          <span className="status-pill" data-state={attendance.tone}>
            {attendance.label}
          </span>
        </header>

        {session.notes ? <p className="sessions-card__notes">{session.notes}</p> : null}

        <div className="sessions-card__actions">
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
            <span className="btn__label">Adicionar ao calendário</span>
          </a>
          <div className="sessions-card__actionsRow">
            {session.attendanceStatus !== 'confirmed' && session.attendanceStatus !== 'completed' ? (
              <Button
                size="sm"
                variant="success"
                leftIcon={
                  disableActions ? <Loader2 size={16} className="icon-spin" aria-hidden /> : <CheckCircle2 size={16} aria-hidden />
                }
                onClick={() => updateAttendance(session.id, 'confirmed')}
                loading={disableActions}
                loadingText="A atualizar…"
              >
                Confirmar presença
              </Button>
            ) : null}
            {session.attendanceStatus !== 'completed' ? (
              <Button
                size="sm"
                variant="primary"
                leftIcon={
                  disableActions ? <Loader2 size={16} className="icon-spin" aria-hidden /> : <ShieldCheck size={16} aria-hidden />
                }
                onClick={() => updateAttendance(session.id, 'completed')}
                loading={disableActions}
                loadingText="A atualizar…"
              >
                Marcar como concluída
              </Button>
            ) : null}
          </div>
        </div>

        {session.attendanceAt ? (
          <p className="sessions-card__foot">Última atualização: {formatDateShort(session.attendanceAt)}</p>
        ) : null}
      </article>
    );
  }

  function renderRequest(request: SessionRequest) {
    const status = requestStatusMeta(request.status);
    const key = (suffix: string) => `${request.id}:${suffix}`;

    return (
      <article key={request.id} className="sessions-card sessions-card--request" aria-labelledby={`request-${request.id}`}>
        <header className="sessions-card__header">
          <div className="sessions-card__meta">
            <h3 id={`request-${request.id}`} className="sessions-card__title">
              {trainerDisplay(request.trainer)}
            </h3>
            <dl className="sessions-card__details">
              <div>
                <dt>Pedido original</dt>
                <dd>{formatRange(request.requestedStart, request.requestedEnd)}</dd>
              </div>
              {request.status === 'reschedule_pending' ? (
                <div>
                  <dt>Proposta do PT</dt>
                  <dd>{formatRange(request.proposedStart, request.proposedEnd)}</dd>
                </div>
              ) : null}
              {request.respondedAt ? (
                <div>
                  <dt>Atualizado</dt>
                  <dd>{formatDateShort(request.respondedAt)}</dd>
                </div>
              ) : null}
            </dl>
          </div>
          <span className="status-pill" data-state={status.tone}>
            {status.label}
          </span>
        </header>

        <div className="sessions-card__notesStack">
          {request.message ? <p>Mensagem enviada: {request.message}</p> : null}
          {request.trainerNote ? <p>Nota do PT: {request.trainerNote}</p> : null}
          {request.rescheduleNote ? <p>Nota da remarcação: {request.rescheduleNote}</p> : null}
        </div>

        {(request.status === 'pending' || request.status === 'reschedule_pending') && (
          <div className="sessions-card__actionsRow">
            {request.status === 'pending' ? (
              <Button
                size="sm"
                variant="danger"
                leftIcon={
                  pendingRequestAction === key('cancel')
                    ? <Loader2 size={16} className="icon-spin" aria-hidden />
                    : <XCircle size={16} aria-hidden />
                }
                onClick={() => mutateRequest(request.id, 'cancel', 'Pedido cancelado.')}
                loading={pendingRequestAction === key('cancel')}
                loadingText="A cancelar…"
              >
                Cancelar pedido
              </Button>
            ) : null}
            {request.status === 'reschedule_pending' ? (
              <>
                <Button
                  size="sm"
                  variant="success"
                  leftIcon={
                    pendingRequestAction === key('accept_reschedule')
                      ? <Loader2 size={16} className="icon-spin" aria-hidden />
                      : <CheckSquare size={16} aria-hidden />
                  }
                  onClick={() => mutateRequest(request.id, 'accept_reschedule', 'Remarcação aceite com sucesso.')}
                  loading={pendingRequestAction === key('accept_reschedule')}
                  loadingText="A atualizar…"
                >
                  Aceitar proposta
                </Button>
                <Button
                  size="sm"
                  variant="warning"
                  leftIcon={
                    pendingRequestAction === key('decline_reschedule')
                      ? <Loader2 size={16} className="icon-spin" aria-hidden />
                      : <RefreshCcw size={16} aria-hidden />
                  }
                  onClick={() => mutateRequest(request.id, 'decline_reschedule', 'Remarcação recusada.')}
                  loading={pendingRequestAction === key('decline_reschedule')}
                  loadingText="A atualizar…"
                >
                  Recusar proposta
                </Button>
              </>
            ) : null}
          </div>
        )}
      </article>
    );
  }

  return (
    <div className="sessions-view">
      <header className="sessions-view__header">
        <div>
          <h1 className="sessions-view__title">As minhas sessões</h1>
          <p className="sessions-view__subtitle">
            Gere pedidos, acompanha confirmações e mantém o teu histórico sempre organizado.
          </p>
        </div>
        <Button
          variant="primary"
          leftIcon={<MessageSquarePlus size={18} aria-hidden />}
          onClick={() => {
            setRequestDialogOpen(true);
            setRequestError(null);
          }}
        >
          Solicitar sessão
        </Button>
      </header>

      {requestSuccess ? <Alert tone="success" title={requestSuccess} /> : null}
      {requestError && !requestDialogOpen ? <Alert tone="danger" title={requestError} /> : null}

      <div className="sessions-view__grid">
        <section className="neo-panel sessions-panel" aria-labelledby={requestHeadingId}>
          <header className="neo-panel__header">
            <div className="neo-panel__meta">
              <h2 id={requestHeadingId} className="neo-panel__title">
                Pedidos de sessão
              </h2>
              <p className="neo-panel__subtitle">Acompanha o estado das tuas solicitações em aberto e anteriores.</p>
            </div>
          </header>

          <div className="sessions-panel__section">
            <h3 className="sessions-panel__heading">Pendentes</h3>
            {openRequests.length ? (
              <div className="sessions-list">{openRequests.map(renderRequest)}</div>
            ) : (
              <div className="neo-empty">
                <span className="neo-empty__icon" aria-hidden>
                  <UserRound size={28} />
                </span>
                <p className="neo-empty__title">Sem pedidos pendentes</p>
                <p className="neo-empty__description">Assim que enviares um pedido, o estado aparece aqui automaticamente.</p>
              </div>
            )}
          </div>

          <div className="sessions-panel__section">
            <h3 className="sessions-panel__heading">Histórico</h3>
            {historyRequests.length ? (
              <div className="sessions-list sessions-list--history">{historyRequests.map(renderRequest)}</div>
            ) : (
              <div className="neo-empty">
                <span className="neo-empty__icon" aria-hidden>
                  <History size={28} />
                </span>
                <p className="neo-empty__title">Ainda sem histórico</p>
                <p className="neo-empty__description">Quando os pedidos forem tratados, ficam aqui para referência futura.</p>
              </div>
            )}
          </div>
        </section>

        <div className="sessions-schedule">
          <section className="neo-panel sessions-panel" aria-labelledby={upcomingHeadingId}>
            <header className="neo-panel__header">
              <div className="neo-panel__meta">
                <h2 id={upcomingHeadingId} className="neo-panel__title">
                  Próximas sessões
                </h2>
                <p className="neo-panel__subtitle">Confirma presença e adiciona os treinos rapidamente ao calendário.</p>
              </div>
            </header>

            {sessionError ? <Alert tone="danger" title={sessionError} /> : null}

            {upcomingSessions.length ? (
              <div className="sessions-list">{upcomingSessions.map(renderSession)}</div>
            ) : (
              <div className="neo-empty">
                <span className="neo-empty__icon" aria-hidden>
                  <CalendarDays size={28} />
                </span>
                <p className="neo-empty__title">Não tens sessões agendadas</p>
                <p className="neo-empty__description">Quando um treino for confirmado pelo teu PT, será mostrado imediatamente.</p>
              </div>
            )}
          </section>

          <section className="neo-panel sessions-panel" aria-labelledby={historyHeadingId}>
            <header className="neo-panel__header">
              <div className="neo-panel__meta">
                <h2 id={historyHeadingId} className="neo-panel__title">
                  Histórico recente
                </h2>
                <p className="neo-panel__subtitle">Revê as últimas sessões concluídas ou canceladas.</p>
              </div>
            </header>

            {pastSessions.length ? (
              <div className="sessions-list sessions-list--history">{pastSessions.map(renderSession)}</div>
            ) : (
              <div className="neo-empty">
                <span className="neo-empty__icon" aria-hidden>
                  <CalendarDays size={28} />
                </span>
                <p className="neo-empty__title">Sem sessões anteriores</p>
                <p className="neo-empty__description">Assim que terminares uma sessão, ela fica registada nesta secção.</p>
              </div>
            )}
          </section>
        </div>
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
                  Escolhe o profissional, define data e deixa notas relevantes para acelarar a confirmação.
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

            <form
              id={dialogFormId}
              className="neo-dialog__content sessions-request-form"
              onSubmit={submitRequest}
            >
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
                  onChange={(event) =>
                    setRequestForm((prev) => ({ ...prev, duration: Number(event.target.value || 0) }))
                  }
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
                leftIcon={requestBusy ? <Loader2 size={16} className="icon-spin" aria-hidden /> : <CheckCircle2 size={16} aria-hidden />}>
                Enviar pedido
              </Button>
            </footer>
          </div>
        </div>
      ) : null}
    </div>
  );
}
