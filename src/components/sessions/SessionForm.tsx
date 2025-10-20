'use client';

import * as React from 'react';
import clsx from 'clsx';
import { useSearchParams } from 'next/navigation';
import { z } from 'zod';

const SessionSchema = z.object({
  id: z.string().optional(),
  trainer_id: z.string().min(1, 'Selecione um PT'),
  client_id: z.string().min(1, 'Selecione um cliente'),
  start_time: z.string().min(1, 'Início obrigatório'),
  end_time: z.string().min(1, 'Fim obrigatório'),
  status: z.enum(['scheduled', 'done', 'cancelled', 'confirmed']).default('scheduled'),
  location: z.string().optional(),
  notes: z.string().optional(),
});

type Option = { id: string; name?: string | null; email?: string | null };
type Values = z.infer<typeof SessionSchema>;

type Scope = 'admin' | 'trainer';

export type SessionFormProps = {
  mode: 'create' | 'edit';
  initial?: Partial<Values>;
  scope?: Scope;
  onCompleted?: () => void;
  onCancelled?: () => void;
  submitLabel?: string;
  prefillFromSearch?: boolean;
};

const STATUS_OPTIONS: Array<{ value: Values['status']; label: string }> = [
  { value: 'scheduled', label: 'Agendado' },
  { value: 'confirmed', label: 'Confirmado' },
  { value: 'done', label: 'Concluído' },
  { value: 'cancelled', label: 'Cancelado' },
];

function optionLabel(option: Option) {
  return option?.name ?? option?.email ?? option?.id ?? '';
}

export default function SessionForm({
  mode,
  initial,
  scope = 'admin',
  onCompleted,
  onCancelled,
  submitLabel,
  prefillFromSearch = false,
}: SessionFormProps) {
  const [values, setValues] = React.useState<Values>(() => ({
    id: initial?.id,
    trainer_id: initial?.trainer_id ?? '',
    client_id: initial?.client_id ?? '',
    start_time: initial?.start_time ?? '',
    end_time: initial?.end_time ?? '',
    status: (initial?.status as Values['status']) ?? 'scheduled',
    location: initial?.location ?? '',
    notes: initial?.notes ?? '',
  }));
  const [errors, setErrors] = React.useState<Partial<Record<keyof Values, string>>>({});
  const [saving, setSaving] = React.useState(false);
  const [feedback, setFeedback] = React.useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const [trainers, setTrainers] = React.useState<Option[]>([]);
  const [clients, setClients] = React.useState<Option[]>([]);
  const [loadingTr, setLoadingTr] = React.useState(false);
  const [loadingCl, setLoadingCl] = React.useState(false);
  const [trainerQuery, setTrainerQuery] = React.useState('');
  const [clientQuery, setClientQuery] = React.useState('');

  const [conflict, setConflict] = React.useState<{ busy: boolean; has: boolean }>({ busy: false, has: false });

  const searchParams = useSearchParams();
  const hasPrefilledRef = React.useRef(false);

  React.useEffect(() => {
    setValues((prev) => ({
      ...prev,
      id: initial?.id,
      trainer_id: initial?.trainer_id ?? prev.trainer_id,
      client_id: initial?.client_id ?? prev.client_id,
      start_time: initial?.start_time ?? prev.start_time,
      end_time: initial?.end_time ?? prev.end_time,
      status: (initial?.status as Values['status']) ?? prev.status,
      location: initial?.location ?? prev.location,
      notes: initial?.notes ?? prev.notes,
    }));
  }, [initial?.id, initial?.trainer_id, initial?.client_id, initial?.start_time, initial?.end_time, initial?.status, initial?.location, initial?.notes]);

  React.useEffect(() => {
    if (!prefillFromSearch || hasPrefilledRef.current) return;
    const from = searchParams.get('from') || searchParams.get('start') || searchParams.get('start_time');
    const to = searchParams.get('to') || searchParams.get('end') || searchParams.get('end_time');
    const trainer = searchParams.get('trainer') || searchParams.get('trainer_id');
    const client = searchParams.get('client') || searchParams.get('client_id');
    if (!from && !to && !trainer && !client) return;
    setValues((prev) => ({
      ...prev,
      start_time: from ?? prev.start_time,
      end_time: to ?? prev.end_time,
      trainer_id: trainer ?? prev.trainer_id,
      client_id: client ?? prev.client_id,
    }));
    hasPrefilledRef.current = true;
  }, [prefillFromSearch, searchParams]);

  const clearFeedback = React.useCallback(() => setFeedback(null), []);

  React.useEffect(() => {
    if (!feedback) return;
    const timer = window.setTimeout(() => setFeedback(null), 3200);
    return () => window.clearTimeout(timer);
  }, [feedback]);

  const fetchOptions = React.useCallback(
    (url: string, setter: (options: Option[]) => void, setLoading: (state: boolean) => void, q?: string) => {
      if (typeof window === 'undefined') return () => {};
      const request = new URL(url, window.location.origin);
      if (q) request.searchParams.set('q', q);
      const controller = new AbortController();
      setLoading(true);
      fetch(request.toString(), { cache: 'no-store', signal: controller.signal })
        .then((response) => response.json())
        .then((payload) => {
          const rows = Array.isArray(payload?.rows)
            ? payload.rows
            : Array.isArray(payload?.data)
            ? payload.data
            : Array.isArray(payload)
            ? payload
            : [];
          const options: Option[] = rows.map((row: any) => ({
            id: String(row?.id ?? row?.value ?? ''),
            name: row?.name ?? row?.label ?? row?.full_name ?? null,
            email: row?.email ?? null,
          }));
          setter(options);
        })
        .catch(() => setter([]))
        .finally(() => setLoading(false));
      return () => controller.abort();
    },
    [],
  );

  React.useEffect(() => fetchOptions('/api/admin/trainers', setTrainers, setLoadingTr, trainerQuery), [
    fetchOptions,
    trainerQuery,
  ]);
  React.useEffect(() => fetchOptions('/api/admin/clients', setClients, setLoadingCl, clientQuery), [
    fetchOptions,
    clientQuery,
  ]);

  React.useEffect(() => {
    if (!values.start_time || !values.end_time || (!values.trainer_id && !values.client_id)) {
      setConflict({ busy: false, has: false });
      return;
    }
    const request = new URL('/api/admin/pts-schedule/conflicts', window.location.origin);
    request.searchParams.set('start_time', values.start_time);
    request.searchParams.set('end_time', values.end_time);
    if (values.trainer_id) request.searchParams.set('trainer_id', values.trainer_id);
    if (values.client_id) request.searchParams.set('client_id', values.client_id);
    if (values.id) request.searchParams.set('exclude_id', values.id);

    const controller = new AbortController();
    setConflict({ busy: true, has: false });
    const timeout = window.setTimeout(() => {
      fetch(request.toString(), { cache: 'no-store', signal: controller.signal })
        .then((response) => response.json())
        .then((payload) => setConflict({ busy: false, has: Boolean(payload?.hasConflict) }))
        .catch(() => setConflict({ busy: false, has: false }));
    }, 240);

    return () => {
      controller.abort();
      window.clearTimeout(timeout);
    };
  }, [values.start_time, values.end_time, values.trainer_id, values.client_id, values.id]);

  const setField = React.useCallback(<K extends keyof Values>(key: K, value: Values[K]) => {
    setValues((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
    clearFeedback();
  }, [clearFeedback]);

  const chronologyError = React.useMemo(() => {
    if (!values.start_time || !values.end_time) return null;
    const start = new Date(values.start_time).getTime();
    const end = new Date(values.end_time).getTime();
    if (Number.isNaN(start) || Number.isNaN(end)) return null;
    if (end <= start) {
      return 'O fim deve ser posterior ao início';
    }
    return null;
  }, [values.start_time, values.end_time]);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrors({});
    setFeedback(null);

    const parsed = SessionSchema.safeParse(values);
    if (!parsed.success) {
      const nextErrors: Partial<Record<keyof Values, string>> = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path[0] as keyof Values;
        nextErrors[key] = issue.message;
      }
      setErrors(nextErrors);
      setFeedback({ type: 'error', message: 'Verifica os campos em destaque.' });
      return;
    }

    if (chronologyError) {
      setFeedback({ type: 'error', message: chronologyError });
      return;
    }

    if (conflict.has) {
      setFeedback({ type: 'error', message: 'Conflito detectado — ajusta horário, PT ou cliente.' });
      return;
    }

    setSaving(true);
    try {
      const baseUrl = scope === 'trainer' ? '/api/trainer/pts-schedule' : '/api/admin/pts-schedule';
      const url = values.id ? `${baseUrl}/${values.id}` : baseUrl;
      const method = values.id ? 'PATCH' : 'POST';
      const body = JSON.stringify({
        trainer_id: values.trainer_id,
        client_id: values.client_id,
        start_time: values.start_time,
        end_time: values.end_time,
        status: values.status,
        location: values.location || null,
        notes: values.notes || null,
      });
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body,
      });
      if (!response.ok) throw new Error(await response.text());

      setFeedback({
        type: 'success',
        message: values.id ? 'Sessão actualizada com sucesso.' : 'Sessão agendada com sucesso.',
      });

      onCompleted?.();
    } catch (error: any) {
      const message = typeof error?.message === 'string' && error.message.length > 0
        ? error.message
        : 'Não foi possível gravar a sessão.';
      setFeedback({ type: 'error', message });
    } finally {
      setSaving(false);
    }
  }

  return (
    <form className="grid gap-5" onSubmit={onSubmit} noValidate>
      {feedback && (
        <div
          className={clsx(
            'rounded-2xl border px-4 py-3 text-sm',
            feedback.type === 'success'
              ? 'border-emerald-300/60 bg-emerald-50/70 text-emerald-700 dark:border-emerald-400/40 dark:bg-emerald-500/10 dark:text-emerald-200'
              : 'border-red-300/60 bg-red-50/70 text-red-700 dark:border-red-400/40 dark:bg-red-500/10 dark:text-red-200',
          )}
          role="status"
          aria-live="polite"
        >
          {feedback.message}
        </div>
      )}

      {conflict.has && (
        <div className="rounded-2xl border border-red-300/70 bg-red-50/80 px-4 py-3 text-sm text-red-700 dark:border-red-400/40 dark:bg-red-500/10 dark:text-red-200">
          Existe um conflito para o intervalo seleccionado. Escolhe outro horário ou participante.
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <label className="text-xs font-semibold uppercase tracking-wide text-muted" htmlFor="trainer-search">
            Personal trainer
          </label>
          <input
            id="trainer-search"
            className="neo-input"
            placeholder="Pesquisar PT pelo nome ou email"
            value={trainerQuery}
            onChange={(event) => setTrainerQuery(event.target.value)}
          />
          <select
            className={clsx('neo-input', errors.trainer_id && 'neo-input--error')}
            value={values.trainer_id}
            onChange={(event) => setField('trainer_id', event.target.value)}
            required
          >
            <option value="">Seleciona um PT</option>
            {trainers.map((trainer) => (
              <option key={trainer.id} value={trainer.id}>
                {optionLabel(trainer)}
              </option>
            ))}
          </select>
          <p className="neo-input__helper">
            {loadingTr ? 'A carregar opções…' : errors.trainer_id ?? 'Define quem conduz esta sessão.'}
          </p>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-semibold uppercase tracking-wide text-muted" htmlFor="client-search">
            Cliente
          </label>
          <input
            id="client-search"
            className="neo-input"
            placeholder="Pesquisar cliente pelo nome ou email"
            value={clientQuery}
            onChange={(event) => setClientQuery(event.target.value)}
          />
          <select
            className={clsx('neo-input', errors.client_id && 'neo-input--error')}
            value={values.client_id}
            onChange={(event) => setField('client_id', event.target.value)}
            required
          >
            <option value="">Seleciona um cliente</option>
            {clients.map((client) => (
              <option key={client.id} value={client.id}>
                {optionLabel(client)}
              </option>
            ))}
          </select>
          <p className="neo-input__helper">
            {loadingCl ? 'A carregar opções…' : errors.client_id ?? 'Liga o plano ao atleta certo.'}
          </p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <label className="text-xs font-semibold uppercase tracking-wide text-muted" htmlFor="session-start">
            Início
          </label>
          <input
            id="session-start"
            type="datetime-local"
            className={clsx('neo-input', errors.start_time && 'neo-input--error')}
            value={values.start_time}
            onChange={(event) => setField('start_time', event.target.value)}
            required
          />
          <p className="neo-input__helper text-danger">{errors.start_time}</p>
        </div>
        <div className="space-y-2">
          <label className="text-xs font-semibold uppercase tracking-wide text-muted" htmlFor="session-end">
            Fim
          </label>
          <input
            id="session-end"
            type="datetime-local"
            className={clsx('neo-input', errors.end_time && 'neo-input--error')}
            value={values.end_time}
            onChange={(event) => setField('end_time', event.target.value)}
            required
          />
          <p className="neo-input__helper text-danger">{errors.end_time ?? chronologyError ?? ''}</p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <label className="text-xs font-semibold uppercase tracking-wide text-muted" htmlFor="session-status">
            Estado
          </label>
          <select
            id="session-status"
            className="neo-input"
            value={values.status}
            onChange={(event) => setField('status', event.target.value as Values['status'])}
          >
            {STATUS_OPTIONS.map((status) => (
              <option key={status.value} value={status.value}>
                {status.label}
              </option>
            ))}
          </select>
          <p className="neo-input__helper">Actualiza o estado conforme o progresso da sessão.</p>
        </div>
        <div className="space-y-2">
          <label className="text-xs font-semibold uppercase tracking-wide text-muted" htmlFor="session-location">
            Local
          </label>
          <input
            id="session-location"
            className="neo-input"
            placeholder="Estúdio, online, outdoor…"
            value={values.location ?? ''}
            onChange={(event) => setField('location', event.target.value)}
          />
          <p className="neo-input__helper">Partilha o local ou o link do encontro.</p>
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-xs font-semibold uppercase tracking-wide text-muted" htmlFor="session-notes">
          Notas adicionais
        </label>
        <textarea
          id="session-notes"
          className="neo-input neo-input--textarea"
          placeholder="Briefing da sessão, materiais necessários, checkpoints…"
          value={values.notes ?? ''}
          onChange={(event) => setField('notes', event.target.value)}
        />
      </div>

      <div className="flex flex-wrap justify-end gap-2">
        <button
          type="button"
          className="btn ghost"
          onClick={() => {
            if (onCancelled) onCancelled();
            else window.history.back();
          }}
          disabled={saving}
        >
          Cancelar
        </button>
        <button type="submit" className="btn primary" disabled={saving || conflict.busy}>
          {saving
            ? mode === 'edit'
              ? 'A actualizar…'
              : 'A agendar…'
            : submitLabel ?? (mode === 'edit' ? 'Guardar alterações' : 'Agendar sessão')}
        </button>
      </div>
    </form>
  );
}
