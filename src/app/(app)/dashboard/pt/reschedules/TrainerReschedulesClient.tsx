'use client';

import * as React from 'react';
import { CalendarClock, CheckCircle2, Clock3, RefreshCcw, Repeat2, XCircle } from 'lucide-react';

import PageHeader from '@/components/ui/PageHeader';
import Button from '@/components/ui/Button';
import Alert from '@/components/ui/Alert';
import DataSourceBadge, { describeDataSourceRelative } from '@/components/ui/DataSourceBadge';
import { formatRelativeTime } from '@/lib/datetime/relative';
import type {
  TrainerRescheduleRequestView,
  TrainerRescheduleAgendaDay,
  TrainerRescheduleInsight,
} from '@/lib/trainer/reschedules/types';
import type { TrainerReschedulesResponse } from '@/lib/trainer/reschedules/server';

const DASHBOARD_ENDPOINT = '/api/pt/reschedules/dashboard';
const SESSION_REQUEST_ENDPOINT = '/api/trainer/session-requests';

type Props = {
  initialData: TrainerReschedulesResponse;
};

type Feedback = { tone: 'success' | 'danger'; message: string } | null;

type DeclineState = { id: string; note: string } | null;
type RescheduleState = { id: string; start: string; duration: number; note: string } | null;

function toneToPill(tone: TrainerRescheduleRequestView['statusTone']): 'ok' | 'warn' | 'down' | 'neutral' {
  switch (tone) {
    case 'positive':
      return 'ok';
    case 'warning':
      return 'warn';
    case 'critical':
      return 'down';
    default:
      return 'neutral';
  }
}

function toInputValue(value: string | null): string {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  const offset = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 16);
}

function inferDuration(request: TrainerRescheduleRequestView): number {
  if (request.requestedStart && request.requestedEnd) {
    const start = new Date(request.requestedStart);
    const end = new Date(request.requestedEnd);
    if (!Number.isNaN(start.getTime()) && !Number.isNaN(end.getTime())) {
      const minutes = Math.round((end.getTime() - start.getTime()) / 60000);
      if (minutes > 0) return minutes;
    }
  }
  return 60;
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="trainer-reschedules__empty" role="status">
      <span className="neo-text--muted neo-text--sm">{message}</span>
    </div>
  );
}

export default function TrainerReschedulesClient({ initialData }: Props) {
  const [data, setData] = React.useState(initialData);
  const [loading, setLoading] = React.useState(false);
  const [feedback, setFeedback] = React.useState<Feedback>(null);
  const [actionBusy, setActionBusy] = React.useState<string | null>(null);
  const [declineDialog, setDeclineDialog] = React.useState<DeclineState>(null);
  const [rescheduleDialog, setRescheduleDialog] = React.useState<RescheduleState>(null);

  const updatedRelative = React.useMemo(() => formatRelativeTime(data.updatedAt), [data.updatedAt]);
  const generatedRelative = React.useMemo(() => describeDataSourceRelative(data.generatedAt), [data.generatedAt]);

  async function refresh(manual = false) {
    setLoading(true);
    try {
      const response = await fetch(DASHBOARD_ENDPOINT, { cache: 'no-store' });
      if (!response.ok) {
        throw new Error((await response.text()) || 'Não foi possível sincronizar os dados.');
      }
      const payload = (await response.json()) as TrainerReschedulesResponse;
      if (!payload?.ok) {
        throw new Error('Resposta inválida da API de remarcações.');
      }
      setData(payload);
      if (manual) {
        setFeedback({ tone: 'success', message: 'Dados actualizados com sucesso.' });
      }
    } catch (error: any) {
      setFeedback({ tone: 'danger', message: error?.message ?? 'Não foi possível actualizar os dados.' });
    } finally {
      setLoading(false);
    }
  }

  async function mutateRequest(id: string, payload: Record<string, unknown>, successMessage: string) {
    setActionBusy(`${id}:${payload.action ?? 'update'}`);
    setFeedback(null);
    try {
      const response = await fetch(`${SESSION_REQUEST_ENDPOINT}/${id}`, {
        method: 'PATCH',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const raw = await response.text();
      let json: any = {};
      if (raw) {
        try {
          json = JSON.parse(raw);
        } catch (error) {
          console.warn('[trainer-reschedules] resposta inesperada', error);
        }
      }
      if (!response.ok) {
        throw new Error(json?.details || json?.error || raw || 'Operação falhou.');
      }
      await refresh(true);
      setFeedback({ tone: 'success', message: successMessage });
    } catch (error: any) {
      setFeedback({ tone: 'danger', message: error?.message ?? 'Não foi possível actualizar o pedido.' });
    } finally {
      setActionBusy(null);
    }
  }

  function openDecline(request: TrainerRescheduleRequestView) {
    if (!request.canDecline) return;
    setDeclineDialog({ id: request.id, note: '' });
  }

  function openReschedule(request: TrainerRescheduleRequestView) {
    if (!request.canPropose && !request.canAccept) return;
    const baseStart = request.proposedStart ?? request.requestedStart ?? null;
    setRescheduleDialog({
      id: request.id,
      start: toInputValue(baseStart),
      duration: inferDuration(request),
      note: request.rescheduleNote ?? '',
    });
  }

  function renderRequests(requests: TrainerRescheduleRequestView[], variant: 'pending' | 'history') {
    if (!requests.length) {
      return <EmptyState message={variant === 'pending' ? 'Sem pedidos em espera. Boa gestão!' : 'Sem histórico recente.'} />;
    }

    return (
      <ul className="trainer-reschedules__requestList">
        {requests.map((request) => (
          <li key={request.id} className="trainer-reschedules__requestItem">
            <article className="trainer-reschedules__requestCard">
              <header className="trainer-reschedules__requestHeader">
                <div>
                  <h3 className="trainer-reschedules__requestTitle">{request.clientLabel}</h3>
                  <p className="trainer-reschedules__requestSubtitle">{request.requestedRange}</p>
                  {request.message ? (
                    <p className="trainer-reschedules__requestMessage">Mensagem: {request.message}</p>
                  ) : null}
                </div>
                <span className="status-pill" data-state={toneToPill(request.statusTone)}>{request.statusLabel}</span>
              </header>

              {request.proposedLabel ? (
                <p className="trainer-reschedules__requestMeta" data-highlight={request.awaitingClient || undefined}>
                  Última proposta: {request.proposedLabel}
                </p>
              ) : null}
              {request.rescheduleNote ? (
                <p className="trainer-reschedules__requestMeta">Nota enviada: {request.rescheduleNote}</p>
              ) : null}
              {request.trainerNote ? (
                <p className="trainer-reschedules__requestMeta">Nota anterior: {request.trainerNote}</p>
              ) : null}
              {request.respondedLabel ? (
                <p className="trainer-reschedules__requestMeta">Actualizado {request.respondedLabel}</p>
              ) : null}

              <footer className="trainer-reschedules__requestFooter">
                {request.awaitingClient ? (
                  <span className="neo-text--muted neo-text--sm">
                    Aguardando confirmação do cliente.
                  </span>
                ) : null}

                <div className="trainer-reschedules__requestActions">
                  {request.canAccept && (
                    <Button
                      size="sm"
                      variant="success"
                      leftIcon={<CheckCircle2 size={16} aria-hidden />}
                      loading={actionBusy === `${request.id}:accept`}
                      onClick={() =>
                        mutateRequest(request.id, { action: 'accept' }, 'Sessão aceite e agendada.')
                      }
                    >
                      Aceitar pedido
                    </Button>
                  )}
                  {request.canDecline && (
                    <Button
                      size="sm"
                      variant="danger"
                      leftIcon={<XCircle size={16} aria-hidden />}
                      onClick={() => openDecline(request)}
                    >
                      Recusar
                    </Button>
                  )}
                  {request.canPropose && (
                    <Button
                      size="sm"
                      variant="secondary"
                      leftIcon={<Repeat2 size={16} aria-hidden />}
                      loading={actionBusy === `${request.id}:propose_reschedule`}
                      onClick={() => openReschedule(request)}
                    >
                      Propor nova remarcação
                    </Button>
                  )}
                </div>
              </footer>
            </article>
          </li>
        ))}
      </ul>
    );
  }

  function renderInsights(insights: TrainerRescheduleInsight[]) {
    if (!insights.length) {
      return <EmptyState message="Sem insights disponíveis." />;
    }
    return (
      <ul className="trainer-reschedules__insightList">
        {insights.map((insight) => (
          <li key={insight.id} className="trainer-reschedules__insight" data-tone={insight.tone}>
            <div className="trainer-reschedules__insightBody">
              <span className="trainer-reschedules__insightTitle">{insight.title}</span>
              <span className="trainer-reschedules__insightDescription">{insight.description}</span>
            </div>
            {insight.value ? (
              <span className="trainer-reschedules__insightValue">{insight.value}</span>
            ) : null}
          </li>
        ))}
      </ul>
    );
  }

  function renderAgenda(days: TrainerRescheduleAgendaDay[]) {
    if (!days.length) {
      return <EmptyState message="Ainda não há sessões marcadas para esta semana." />;
    }
    return (
      <ul className="trainer-reschedules__agendaList">
        {days.map((day) => (
          <li key={day.id} className="trainer-reschedules__agendaDay">
            <header className="trainer-reschedules__agendaHeader">
              <CalendarClock size={18} aria-hidden />
              <span className="trainer-reschedules__agendaLabel">{day.label}</span>
            </header>
            <ul className="trainer-reschedules__agendaSessions">
              {day.sessions.map((session) => (
                <li key={session.id} className="trainer-reschedules__agendaSession">
                  <div>
                    <span className="trainer-reschedules__agendaClient">{session.clientName}</span>
                    <span className="trainer-reschedules__agendaTime">{session.rangeLabel}</span>
                    {session.location ? (
                      <span className="trainer-reschedules__agendaLocation">{session.location}</span>
                    ) : null}
                  </div>
                  <span className="status-pill" data-state={session.statusTone}>{session.statusLabel}</span>
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ul>
    );
  }

  return (
    <div className="trainer-reschedules">
      <PageHeader
        sticky={false}
        title="Remarcações de sessões"
        subtitle="Acompanha pedidos pendentes, decisões recentes e a agenda semanal com dados em tempo real."
        actions={
          <span className="trainer-reschedules__supabaseState">
            <span className="status-pill" data-state={data.source === 'supabase' ? 'ok' : 'warn'}>
              {data.source === 'supabase' ? 'Servidor activo' : 'Modo fallback'}
            </span>
          </span>
        }
      />

      <section className="neo-panel trainer-reschedules__summary">
        <header className="trainer-reschedules__summaryHeader">
          <div className="trainer-reschedules__meta">
            <DataSourceBadge source={data.source} generatedAt={data.generatedAt} />
            <span className="trainer-reschedules__metaItem">
              Última actualização {updatedRelative ?? 'agora'}
            </span>
            {generatedRelative ? (
              <span className="trainer-reschedules__metaItem">Snapshot {generatedRelative}</span>
            ) : null}
          </div>
          <div className="trainer-reschedules__actions">
            <Button
              size="sm"
              variant="ghost"
              leftIcon={<RefreshCcw size={16} aria-hidden />}
              loading={loading}
              onClick={() => refresh(true)}
            >
              Actualizar
            </Button>
          </div>
        </header>
        <div className="trainer-reschedules__hero" role="list">
          {data.hero.map((metric) => (
            <article key={metric.id} className="trainer-reschedules__heroCard" data-tone={metric.tone ?? 'neutral'}>
              <div className="trainer-reschedules__heroIcon" aria-hidden>
                {metric.id === 'pending-total' && <Clock3 size={18} />}
                {metric.id === 'awaiting-client' && <Repeat2 size={18} />}
                {metric.id === 'response-time' && <CalendarClock size={18} />}
                {metric.id === 'acceptance-rate' && <CheckCircle2 size={18} />}
              </div>
              <span className="trainer-reschedules__heroLabel">{metric.label}</span>
              <strong className="trainer-reschedules__heroValue">{metric.value}</strong>
              {metric.hint ? <span className="trainer-reschedules__heroHint">{metric.hint}</span> : null}
            </article>
          ))}
        </div>
      </section>

      {feedback ? (
        <Alert tone={feedback.tone === 'success' ? 'success' : 'danger'} title={feedback.tone === 'success' ? 'Tudo pronto' : 'Atenção'}>
          {feedback.message}
        </Alert>
      ) : null}

      <section className="trainer-reschedules__grid">
        <article className="neo-panel trainer-reschedules__panel">
          <header className="trainer-reschedules__panelHeader">
            <h2 className="neo-panel__title">Pedidos por aprovar</h2>
            <p className="neo-panel__subtitle">Processa pedidos pendentes dos clientes antes que expirem.</p>
          </header>
          {renderRequests(data.pending, 'pending')}
        </article>
        <article className="neo-panel trainer-reschedules__panel">
          <header className="trainer-reschedules__panelHeader">
            <h2 className="neo-panel__title">Insights rápidos</h2>
            <p className="neo-panel__subtitle">Resumo automático com foco na carga da semana e decisões recentes.</p>
          </header>
          {renderInsights(data.insights)}
        </article>
      </section>

      <section className="trainer-reschedules__grid trainer-reschedules__grid--wide">
        <article className="neo-panel trainer-reschedules__panel">
          <header className="trainer-reschedules__panelHeader">
            <h2 className="neo-panel__title">Histórico recente</h2>
            <p className="neo-panel__subtitle">Consulta remarcações já tratadas para manter o contexto.</p>
          </header>
          {renderRequests(data.history, 'history')}
        </article>
        <article className="neo-panel trainer-reschedules__panel">
          <header className="trainer-reschedules__panelHeader">
            <h2 className="neo-panel__title">Agenda da semana</h2>
            <p className="neo-panel__subtitle">Sessões confirmadas com estado e localização.</p>
          </header>
          {renderAgenda(data.agenda)}
        </article>
      </section>

      {declineDialog ? (
        <div className="neo-dialog-backdrop" role="dialog" aria-modal="true">
          <div className="neo-dialog trainer-reschedules__dialog" role="document">
            <header className="neo-dialog__header">
              <h2 className="neo-dialog__title">Recusar pedido</h2>
              <p className="neo-dialog__subtitle">Partilha uma nota opcional para o cliente saber o motivo.</p>
            </header>
            <div className="neo-dialog__content">
              <label className="neo-input-group__field">
                <span className="neo-input-group__label">Nota para o cliente</span>
                <textarea
                  className="neo-input neo-input--textarea"
                  value={declineDialog.note}
                  onChange={(event) => setDeclineDialog({ id: declineDialog.id, note: event.target.value })}
                  rows={4}
                />
              </label>
            </div>
            <footer className="neo-dialog__footer">
              <Button variant="ghost" onClick={() => setDeclineDialog(null)}>
                Cancelar
              </Button>
              <Button
                variant="danger"
                leftIcon={<XCircle size={16} aria-hidden />}
                loading={actionBusy === `${declineDialog.id}:decline`}
                onClick={() => {
                  void mutateRequest(
                    declineDialog.id,
                    { action: 'decline', note: declineDialog.note || undefined },
                    'Pedido recusado com sucesso.',
                  );
                  setDeclineDialog(null);
                }}
              >
                Confirmar recusa
              </Button>
            </footer>
          </div>
        </div>
      ) : null}

      {rescheduleDialog ? (
        <div className="neo-dialog-backdrop" role="dialog" aria-modal="true">
          <div className="neo-dialog trainer-reschedules__dialog" role="document">
            <header className="neo-dialog__header">
              <h2 className="neo-dialog__title">Propor nova remarcação</h2>
              <p className="neo-dialog__subtitle">Define a nova data/hora e partilha contexto com o cliente.</p>
            </header>
            <div className="neo-dialog__content trainer-reschedules__dialogContent">
              <label className="neo-input-group__field">
                <span className="neo-input-group__label">Novo início</span>
                <input
                  className="neo-input"
                  type="datetime-local"
                  value={rescheduleDialog.start}
                  onChange={(event) => setRescheduleDialog((prev) => (prev ? { ...prev, start: event.target.value } : prev))}
                  required
                />
              </label>
              <label className="neo-input-group__field">
                <span className="neo-input-group__label">Duração (minutos)</span>
                <input
                  className="neo-input"
                  type="number"
                  min={15}
                  step={5}
                  value={rescheduleDialog.duration}
                  onChange={(event) =>
                    setRescheduleDialog((prev) =>
                      prev ? { ...prev, duration: Number(event.target.value) || prev.duration } : prev,
                    )
                  }
                />
              </label>
              <label className="neo-input-group__field">
                <span className="neo-input-group__label">Nota para o cliente</span>
                <textarea
                  className="neo-input neo-input--textarea"
                  rows={3}
                  value={rescheduleDialog.note}
                  onChange={(event) => setRescheduleDialog((prev) => (prev ? { ...prev, note: event.target.value } : prev))}
                  placeholder="Sugere o motivo ou logística da nova data."
                />
              </label>
            </div>
            <footer className="neo-dialog__footer">
              <Button variant="ghost" onClick={() => setRescheduleDialog(null)}>
                Cancelar
              </Button>
              <Button
                variant="primary"
                leftIcon={<Repeat2 size={16} aria-hidden />}
                loading={actionBusy === `${rescheduleDialog.id}:propose_reschedule`}
                onClick={() => {
                  if (!rescheduleDialog.start) {
                    setFeedback({ tone: 'danger', message: 'Indica a data para a remarcação.' });
                    return;
                  }
                  const duration = Number(rescheduleDialog.duration);
                  if (!duration || duration <= 0) {
                    setFeedback({ tone: 'danger', message: 'Define uma duração válida.' });
                    return;
                  }
                  const startDate = new Date(rescheduleDialog.start);
                  if (Number.isNaN(startDate.getTime())) {
                    setFeedback({ tone: 'danger', message: 'Data/hora inválida.' });
                    return;
                  }
                  const endDate = new Date(startDate.getTime() + duration * 60000);
                  void mutateRequest(
                    rescheduleDialog.id,
                    {
                      action: 'propose_reschedule',
                      start: startDate.toISOString(),
                      end: endDate.toISOString(),
                      note: rescheduleDialog.note || undefined,
                    },
                    'Proposta de remarcação enviada ao cliente.',
                  );
                  setRescheduleDialog(null);
                }}
              >
                Enviar proposta
              </Button>
            </footer>
          </div>
        </div>
      ) : null}
    </div>
  );
}
