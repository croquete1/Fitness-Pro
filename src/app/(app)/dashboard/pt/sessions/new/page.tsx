'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';

import Alert from '@/components/ui/Alert';
import Button from '@/components/ui/Button';
import DataSourceBadge from '@/components/ui/DataSourceBadge';
import { toast } from '@/components/ui/Toaster';
import { toDatetimeLocalInput } from '@/lib/datetime/datetimeLocal';
import { formatRelativeTime } from '@/lib/datetime/relative';
import { getFallbackTrainerClientOptions, type TrainerClientScheduleFallback } from '@/lib/fallback/trainer-clients';
import { getFallbackClientSessions } from '@/lib/fallback/sessions';

type ClientOption = TrainerClientScheduleFallback & {
  fullName: string;
};

type SessionLite = {
  id: string;
  startISO: string;
  endISO: string | null;
  durationMin: number;
};

type SourceMeta = {
  source: 'supabase' | 'fallback';
  fetchedAt: string | null;
  error?: string | null;
};

type FormValues = {
  clientId: string;
  title: string;
  start: string;
  duration: number;
  kind: 'presencial' | 'online' | 'outro';
  location: string;
  notes: string;
};

type FormErrors = Partial<Record<keyof FormValues, string>>;

const DEFAULT_FORM: FormValues = {
  clientId: '',
  title: '',
  start: '',
  duration: 60,
  kind: 'presencial',
  location: '',
  notes: '',
};

function normaliseSessions(items: any[]): SessionLite[] {
  return items
    .map((raw) => {
      const startISO = typeof raw.start_at === 'string' ? raw.start_at : raw.startISO ?? raw.start ?? null;
      if (!startISO) return null;
      const endISO =
        typeof raw.end_at === 'string'
          ? raw.end_at
          : typeof raw.endISO === 'string'
            ? raw.endISO
            : null;
      const durationMinRaw =
        typeof raw.duration_min === 'number'
          ? raw.duration_min
          : typeof raw.durationMin === 'number'
            ? raw.durationMin
            : endISO
              ? Math.max(15, Math.round((new Date(endISO).getTime() - new Date(startISO).getTime()) / 60000))
              : 60;
      return {
        id: String(raw.id ?? `session-${startISO}`),
        startISO,
        endISO,
        durationMin: Number.isFinite(durationMinRaw) && durationMinRaw > 0 ? durationMinRaw : 60,
      } satisfies SessionLite;
    })
    .filter(Boolean) as SessionLite[];
}

function enrichClients(
  items: Array<{ id: string; full_name?: string | null }>,
  fallback: TrainerClientScheduleFallback[],
): ClientOption[] {
  if (!items.length) {
    return fallback.map((item) => ({ ...item, fullName: item.name }));
  }
  const fallbackMap = new Map(fallback.map((item) => [item.id, item] as const));
  const cycle = fallback.length > 0 ? fallback : [];
  return items.map((client, index) => {
    const base = fallbackMap.get(client.id) ?? cycle[index % (cycle.length || 1)] ?? fallback[0]!;
    return {
      ...base,
      id: client.id,
      fullName: client.full_name?.trim() || base.name,
    } satisfies ClientOption;
  });
}

function computeMetrics(sessions: SessionLite[]): {
  upcomingCount: number;
  totalMinutes: number;
  nextStartRelative: string | null;
  nextStartAbsolute: string | null;
  nextStartISO: string | null;
} {
  const now = new Date();
  const inSevenDays = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  const upcoming = sessions.filter((session) => {
    const start = new Date(session.startISO);
    return !Number.isNaN(start.getTime()) && start >= now && start <= inSevenDays;
  });
  const totalMinutes = upcoming.reduce((acc, session) => acc + session.durationMin, 0);
  const sorted = [...upcoming].sort((a, b) => new Date(a.startISO).getTime() - new Date(b.startISO).getTime());
  const next = sorted[0] ?? null;
  return {
    upcomingCount: upcoming.length,
    totalMinutes,
    nextStartRelative: formatRelativeTime(next?.startISO ?? null),
    nextStartAbsolute: next
      ? new Date(next.startISO).toLocaleString('pt-PT', { dateStyle: 'medium', timeStyle: 'short' })
      : null,
    nextStartISO: next ? next.startISO : null,
  };
}

export default function NewSessionPage() {
  const router = useRouter();
  const [clients, setClients] = React.useState<ClientOption[]>([]);
  const [clientMeta, setClientMeta] = React.useState<SourceMeta>({ source: 'supabase', fetchedAt: null });
  const [sessions, setSessions] = React.useState<SessionLite[]>([]);
  const [sessionMeta, setSessionMeta] = React.useState<SourceMeta>({ source: 'supabase', fetchedAt: null });
  const [loading, setLoading] = React.useState(true);
  const [form, setForm] = React.useState<FormValues>({ ...DEFAULT_FORM });
  const [errors, setErrors] = React.useState<FormErrors>({});
  const [feedback, setFeedback] = React.useState<{ tone: 'success' | 'danger'; message: string } | null>(null);
  const [submitting, setSubmitting] = React.useState(false);

  React.useEffect(() => {
    const fallbackClients = getFallbackTrainerClientOptions();
    const abort = new AbortController();
    async function loadClients() {
      try {
        const response = await fetch('/api/pt/clients', { cache: 'no-store', signal: abort.signal });
        const now = new Date().toISOString();
        if (!response.ok) {
          throw new Error(await response.text());
        }
        const json = await response.json();
        const items = Array.isArray(json.items) ? json.items : [];
        setClients(enrichClients(items, fallbackClients));
        setClientMeta({ source: 'supabase', fetchedAt: now, error: null });
        if (!items.length) {
          setFeedback({ tone: 'danger', message: 'Sem clientes atribuídos para agendar sessões.' });
        }
      } catch (error: any) {
        if (abort.signal.aborted) return;
        const fallback = fallbackClients;
        setClients(fallback.map((item) => ({ ...item, fullName: item.name })));
        setClientMeta({
          source: 'fallback',
          fetchedAt: new Date().toISOString(),
          error: error?.message ?? 'Falha a carregar clientes do Supabase.',
        });
      }
    }

    async function loadSessions() {
      try {
        const now = new Date();
        const from = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0).toISOString();
        const to = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000).toISOString();
        const response = await fetch(`/api/pt/sessions?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`, {
          cache: 'no-store',
          signal: abort.signal,
        });
        const fetchedAt = new Date().toISOString();
        if (!response.ok) {
          throw new Error(await response.text());
        }
        const json = await response.json();
        setSessions(normaliseSessions(Array.isArray(json.items) ? json.items : []));
        setSessionMeta({ source: 'supabase', fetchedAt });
      } catch (error: any) {
        if (abort.signal.aborted) return;
        const fallback = getFallbackClientSessions();
        setSessions(normaliseSessions(fallback));
        setSessionMeta({
          source: 'fallback',
          fetchedAt: new Date().toISOString(),
          error: error?.message ?? 'Falha a carregar métricas de sessões do Supabase.',
        });
      } finally {
        setLoading(false);
      }
    }

    loadClients();
    loadSessions();

    return () => {
      abort.abort();
    };
  }, []);

  React.useEffect(() => {
    if (!feedback) return;
    const timeout = window.setTimeout(() => setFeedback(null), feedback.tone === 'success' ? 3500 : 5500);
    return () => window.clearTimeout(timeout);
  }, [feedback]);

  const metrics = React.useMemo(() => computeMetrics(sessions), [sessions]);

  const topClients = React.useMemo(() => clients.slice(0, 5), [clients]);

  function setField<K extends keyof FormValues>(field: K, value: FormValues[K]) {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  }

  function validate(values: FormValues): FormErrors {
    const nextErrors: FormErrors = {};
    if (!values.clientId) nextErrors.clientId = 'Escolhe o cliente da sessão.';
    if (!values.title.trim()) nextErrors.title = 'Indica um título para a sessão.';
    if (!values.start) nextErrors.start = 'Define a data e hora de início.';
    if (!Number.isFinite(values.duration) || values.duration <= 0) {
      nextErrors.duration = 'A duração deve ser positiva.';
    }
    return nextErrors;
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFeedback(null);
    const nextErrors = validate(form);
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      setFeedback({ tone: 'danger', message: 'Verifica os campos destacados antes de continuar.' });
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        client_id: form.clientId || null,
        title: form.title.trim(),
        kind: form.kind,
        start: new Date(form.start).toISOString(),
        durationMin: Number(form.duration),
        location_id: form.location ? form.location : undefined,
        notes: form.notes?.trim() ? form.notes.trim() : undefined,
      };
      const response = await fetch('/api/pt/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!response.ok) {
        throw new Error((await response.text()) || 'Falha ao criar sessão.');
      }
      toast('Sessão criada com sucesso ✅', 3200, 'success');
      setFeedback({ tone: 'success', message: 'Sessão criada e agendada no calendário do PT.' });
      setForm({ ...DEFAULT_FORM, clientId: form.clientId, kind: form.kind });
      router.push('/dashboard/pt/sessions');
    } catch (error: any) {
      setFeedback({ tone: 'danger', message: error?.message ?? 'Não foi possível criar a sessão.' });
    } finally {
      setSubmitting(false);
    }
  }

  const nextSuggestedStart = React.useMemo(() => {
    if (form.start) return form.start;
    const nextFromMetrics = metrics.nextStartISO ? toDatetimeLocalInput(metrics.nextStartISO) : '';
    if (nextFromMetrics) return nextFromMetrics;
    const now = new Date();
    now.setMinutes(0, 0, 0);
    now.setHours(now.getHours() + 1);
    return toDatetimeLocalInput(now.toISOString());
  }, [form.start, metrics.nextStartAbsolute]);

  return (
    <div className="pt-session-form" aria-live="polite">
      <header className="pt-session-form__header">
        <div className="neo-stack neo-stack--xs">
          <p className="neo-breadcrumb">Dashboard · PT · Sessões</p>
          <h1 className="pt-session-form__title">Marcar nova sessão</h1>
          <p className="pt-session-form__subtitle">
            Agenda uma sessão com dados reais de disponibilidade e histórico do cliente.
          </p>
        </div>
        <Button variant="ghost" size="sm" onClick={() => router.back()}>
          Voltar
        </Button>
      </header>

      <section className="pt-session-form__meta">
        <DataSourceBadge source={clientMeta.source} generatedAt={clientMeta.fetchedAt} />
        <DataSourceBadge source={sessionMeta.source} generatedAt={sessionMeta.fetchedAt} />
      </section>

      {clientMeta.error ? (
        <Alert tone="warning" role="alert">
          {clientMeta.error}
        </Alert>
      ) : null}
      {sessionMeta.error ? (
        <Alert tone="warning" role="alert">
          {sessionMeta.error}
        </Alert>
      ) : null}
      {feedback ? <Alert tone={feedback.tone}>{feedback.message}</Alert> : null}

      <div className="pt-session-form__grid">
        <form className="neo-panel pt-session-form__panel" onSubmit={onSubmit} noValidate>
          <header className="neo-panel__header">
            <div>
              <h2 className="neo-panel__title">Detalhes da sessão</h2>
              <p className="neo-panel__subtitle">
                Preenche os campos para reservar o slot na tua agenda. Conflitos são validados em tempo real.
              </p>
            </div>
          </header>
          <div className="neo-panel__body neo-stack neo-stack--lg">
            <div className="neo-input-group" data-error={Boolean(errors.clientId)}>
              <label htmlFor="client" className="neo-input-group__label">
                Cliente
              </label>
              <select
                id="client"
                name="client"
                className="neo-input"
                value={form.clientId}
                onChange={(event) => setField('clientId', event.target.value)}
                disabled={!clients.length}
                required
              >
                <option value="" disabled>
                  {clients.length ? 'Selecciona um cliente' : loading ? 'A carregar…' : 'Sem clientes disponíveis'}
                </option>
                {clients.map((client) => (
                  <option key={client.id} value={client.id}>
                    {client.fullName}
                  </option>
                ))}
              </select>
              <p className="neo-input-hint">
                Ligado ao PT desde{' '}
                {clients.length && form.clientId
                  ? new Date(clients.find((c) => c.id === form.clientId)?.linkedAt ?? '').toLocaleDateString('pt-PT')
                  : '—'}
              </p>
              {errors.clientId ? <p className="neo-input-error">{errors.clientId}</p> : null}
            </div>

            <div className="neo-input-group" data-error={Boolean(errors.title)}>
              <label htmlFor="title" className="neo-input-group__label">
                Título
              </label>
              <input
                id="title"
                className="neo-input"
                value={form.title}
                placeholder="Treino de força nível 2"
                onChange={(event) => setField('title', event.target.value)}
                required
              />
              <p className="neo-input-hint">Visível na agenda do cliente e nos lembretes automáticos.</p>
              {errors.title ? <p className="neo-input-error">{errors.title}</p> : null}
            </div>

            <div className="neo-grid neo-grid--cols2 neo-grid--stack-sm">
              <div className="neo-input-group" data-error={Boolean(errors.start)}>
                <label htmlFor="start" className="neo-input-group__label">
                  Início
                </label>
                <input
                  id="start"
                  type="datetime-local"
                  className="neo-input"
                  value={form.start || nextSuggestedStart}
                  onChange={(event) => setField('start', event.target.value)}
                  required
                />
                <p className="neo-input-hint">Sugestão baseada na disponibilidade e sessões marcadas.</p>
                {errors.start ? <p className="neo-input-error">{errors.start}</p> : null}
              </div>
              <div className="neo-input-group" data-error={Boolean(errors.duration)}>
                <label htmlFor="duration" className="neo-input-group__label">
                  Duração (min)
                </label>
                <input
                  id="duration"
                  type="number"
                  min={15}
                  step={5}
                  className="neo-input"
                  value={form.duration}
                  onChange={(event) => setField('duration', Number(event.target.value))}
                  required
                />
                <p className="neo-input-hint">Usado para validar conflitos na agenda do Supabase.</p>
                {errors.duration ? <p className="neo-input-error">{errors.duration}</p> : null}
              </div>
            </div>

            <div className="neo-grid neo-grid--cols2 neo-grid--stack-sm">
              <div className="neo-input-group">
                <label htmlFor="kind" className="neo-input-group__label">
                  Tipo
                </label>
                <select
                  id="kind"
                  className="neo-input"
                  value={form.kind}
                  onChange={(event) => setField('kind', event.target.value as FormValues['kind'])}
                >
                  <option value="presencial">Presencial</option>
                  <option value="online">Online</option>
                  <option value="outro">Outro</option>
                </select>
              </div>
              <div className="neo-input-group">
                <label htmlFor="location" className="neo-input-group__label">
                  Local (opcional)
                </label>
                <input
                  id="location"
                  className="neo-input"
                  value={form.location}
                  placeholder="Estúdio Neo B / Sala HIIT"
                  onChange={(event) => setField('location', event.target.value)}
                />
              </div>
            </div>

            <div className="neo-input-group">
              <label htmlFor="notes" className="neo-input-group__label">
                Nota interna (opcional)
              </label>
              <textarea
                id="notes"
                className="neo-input"
                rows={3}
                placeholder="Ex.: aquecer com assault bike · finalizar com alongamentos de cadeia posterior"
                value={form.notes}
                onChange={(event) => setField('notes', event.target.value)}
              />
              <p className="neo-input-hint">Apenas visível para o PT. Utilizado no resumo do dia.</p>
            </div>
          </div>
          <footer className="neo-panel__footer pt-session-form__actions">
            <Button type="button" variant="ghost" onClick={() => router.back()}>
              Cancelar
            </Button>
            <Button type="submit" variant="primary" loading={submitting} disabled={submitting || !clients.length}>
              Criar sessão
            </Button>
          </footer>
        </form>

        <aside className="neo-panel pt-session-form__sidebar" aria-label="Resumo operacional">
          <header className="neo-panel__header">
            <div>
              <h2 className="neo-panel__title">Carga das próximas semanas</h2>
              <p className="neo-panel__subtitle">
                Indicadores calculados com base nas sessões confirmadas e reservas pendentes.
              </p>
            </div>
          </header>
          <div className="neo-panel__body pt-session-form__stats">
            <dl className="pt-session-form__metrics">
              <div>
                <dt>Sessões marcadas (7 dias)</dt>
                <dd>{metrics.upcomingCount}</dd>
              </div>
              <div>
                <dt>Minutos planeados</dt>
                <dd>{metrics.totalMinutes}</dd>
              </div>
              <div>
                <dt>Próxima sessão</dt>
                <dd>{metrics.nextStartRelative ?? 'Sem sessão marcada'}</dd>
                {metrics.nextStartAbsolute ? (
                  <small className="pt-session-form__metricHint">{metrics.nextStartAbsolute}</small>
                ) : null}
              </div>
            </dl>
            <div className="pt-session-form__clientListHeader">
              <h3>Clientes activos</h3>
              <span>{topClients.length}</span>
            </div>
            <ul className="pt-session-form__clientList" role="list">
              {topClients.map((client) => (
                <li key={client.id} className="pt-session-form__clientItem">
                  <div className="neo-stack neo-stack--xxs">
                    <p className="pt-session-form__clientName">{client.fullName}</p>
                    <p className="pt-session-form__clientGoal">{client.goal}</p>
                  </div>
                  <dl className="pt-session-form__clientMeta">
                    <div>
                      <dt>Última sessão</dt>
                      <dd>{formatRelativeTime(client.lastSessionAt) ?? '—'}</dd>
                    </div>
                    <div>
                      <dt>Próxima sessão</dt>
                      <dd>{formatRelativeTime(client.nextSessionAt) ?? 'Sem agendamento'}</dd>
                    </div>
                  </dl>
                </li>
              ))}
            </ul>
          </div>
        </aside>
      </div>
    </div>
  );
}
