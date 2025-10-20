'use client';

import * as React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { CalendarClock, Clock4, GripVertical, Loader2, NotebookPen, Plus, Trash2 } from 'lucide-react';

import Alert from '@/components/ui/Alert';
import Button from '@/components/ui/Button';
import DataSourceBadge from '@/components/ui/DataSourceBadge';
import { toast } from '@/components/ui/Toaster';
import { toDatetimeLocalInput } from '@/lib/datetime/datetimeLocal';
import { formatRelativeTime } from '@/lib/datetime/relative';

type SessionPayload = {
  id: string;
  title: string | null;
  kind: string | null;
  start_at: string | null;
  end_at: string | null;
  duration_min: number | null;
  exercises: string[] | null;
  client_id: string | null;
};

type SessionFormState = {
  title: string;
  kind: string;
  start: string;
  end: string;
  duration: number;
  exercises: string[];
};

type FormErrors = Partial<Record<keyof SessionFormState, string>>;

const DEFAULT_STATE: SessionFormState = {
  title: '',
  kind: 'presencial',
  start: '',
  end: '',
  duration: 60,
  exercises: [],
};

function fromApi(data: SessionPayload): SessionFormState {
  const durationFromApi =
    typeof data.duration_min === 'number' && data.duration_min > 0
      ? data.duration_min
      : data.start_at && data.end_at
        ? Math.max(15, Math.round((new Date(data.end_at).getTime() - new Date(data.start_at).getTime()) / 60000))
        : 60;
  return {
    title: data.title ?? '',
    kind: data.kind ?? 'presencial',
    start: toDatetimeLocalInput(data.start_at),
    end: toDatetimeLocalInput(data.end_at),
    duration: durationFromApi,
    exercises: Array.isArray(data.exercises) ? data.exercises.map((value) => String(value)) : [],
  } satisfies SessionFormState;
}

function toIso(value: string): string | null {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toISOString();
}

export default function EditSessionPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const id = React.useMemo(() => (Array.isArray(params?.id) ? params?.id[0] : params?.id) ?? '', [params]);

  const [loading, setLoading] = React.useState(true);
  const [sessionMeta, setSessionMeta] = React.useState<{ fetchedAt: string | null; source: 'supabase' | 'fallback' }>({
    fetchedAt: null,
    source: 'supabase',
  });
  const [form, setForm] = React.useState<SessionFormState>({ ...DEFAULT_STATE });
  const [errors, setErrors] = React.useState<FormErrors>({});
  const [feedback, setFeedback] = React.useState<{ tone: 'success' | 'danger'; message: string } | null>(null);
  const [loadingError, setLoadingError] = React.useState<string | null>(null);
  const [saving, setSaving] = React.useState(false);
  const [removing, setRemoving] = React.useState(false);
  const [newExercise, setNewExercise] = React.useState('');

  const dragIndex = React.useRef<number | null>(null);

  React.useEffect(() => {
    const abort = new AbortController();
    async function load() {
      setLoading(true);
      setLoadingError(null);
      try {
        const response = await fetch(`/api/pt/sessions/${id}`, { cache: 'no-store', signal: abort.signal });
        if (!response.ok) {
          throw new Error((await response.text()) || 'Não foi possível obter a sessão.');
        }
        const json = await response.json();
        const payload = json.item as SessionPayload | undefined;
        if (!payload) {
          throw new Error('Sessão não encontrada.');
        }
        setForm(fromApi(payload));
        setSessionMeta({ fetchedAt: new Date().toISOString(), source: 'supabase' });
      } catch (error: any) {
        if (abort.signal.aborted) return;
        setLoadingError(error?.message ?? 'Não foi possível carregar a sessão.');
      } finally {
        if (!abort.signal.aborted) {
          setLoading(false);
        }
      }
    }

    if (id) {
      load();
    }

    return () => abort.abort();
  }, [id]);

  React.useEffect(() => {
    if (!feedback) return;
    const timeout = window.setTimeout(() => setFeedback(null), feedback.tone === 'success' ? 3200 : 5200);
    return () => window.clearTimeout(timeout);
  }, [feedback]);

  function setField<K extends keyof SessionFormState>(field: K, value: SessionFormState[K]) {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  }

  function validate(values: SessionFormState): FormErrors {
    const nextErrors: FormErrors = {};
    if (!values.title.trim()) nextErrors.title = 'Indica um título para a sessão.';
    if (!values.start) nextErrors.start = 'Define a data e hora de início.';
    if (!Number.isFinite(values.duration) || values.duration <= 0) {
      nextErrors.duration = 'A duração tem de ser positiva.';
    }
    return nextErrors;
  }

  async function handleSave() {
    setFeedback(null);
    const nextErrors = validate(form);
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      setFeedback({ tone: 'danger', message: 'Verifica os campos destacados antes de gravar.' });
      return;
    }

    setSaving(true);
    try {
      const payload: Record<string, unknown> = {
        title: form.title.trim(),
        kind: form.kind,
        start_at: toIso(form.start),
        end_at: toIso(form.end),
        duration_min: Number(form.duration),
        exercises: form.exercises,
      };

      const response = await fetch(`/api/pt/sessions/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!response.ok) {
        throw new Error((await response.text()) || 'Falha ao guardar a sessão.');
      }
      toast('Sessão actualizada 💾', 3000, 'success');
      setFeedback({ tone: 'success', message: 'Sessão actualizada com sucesso.' });
      router.push('/dashboard/pt/sessions');
    } catch (error: any) {
      setFeedback({ tone: 'danger', message: error?.message ?? 'Não foi possível guardar a sessão.' });
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!id || removing) return;
    const confirmed = window.confirm('Eliminar sessão definitivamente?');
    if (!confirmed) return;
    setRemoving(true);
    try {
      const response = await fetch(`/api/pt/sessions/${id}`, { method: 'DELETE' });
      if (!response.ok) {
        throw new Error((await response.text()) || 'Falha ao eliminar a sessão.');
      }
      toast('Sessão eliminada 🗑️', 3200, 'success');
      router.push('/dashboard/pt/sessions');
    } catch (error: any) {
      setFeedback({ tone: 'danger', message: error?.message ?? 'Não foi possível eliminar a sessão.' });
      setRemoving(false);
    }
  }

  function handleAddExercise() {
    const value = newExercise.trim();
    if (!value) return;
    setForm((prev) => ({ ...prev, exercises: [...prev.exercises, value] }));
    setNewExercise('');
  }

  function handleRemoveExercise(index: number) {
    setForm((prev) => ({ ...prev, exercises: prev.exercises.filter((_, position) => position !== index) }));
  }

  function handleDragStart(index: number) {
    return () => {
      dragIndex.current = index;
    };
  }

  function handleDragOver(event: React.DragEvent<HTMLLIElement>) {
    event.preventDefault();
  }

  function handleDrop(index: number) {
    return (event: React.DragEvent<HTMLLIElement>) => {
      event.preventDefault();
      const from = dragIndex.current;
      if (from == null || from === index) return;
      setForm((prev) => {
        const nextExercises = [...prev.exercises];
        const [moved] = nextExercises.splice(from, 1);
        nextExercises.splice(index, 0, moved);
        return { ...prev, exercises: nextExercises };
      });
      dragIndex.current = null;
    };
  }

  const metrics = React.useMemo(() => {
    const start = toIso(form.start);
    const end = toIso(form.end);
    const duration = Number.isFinite(form.duration) ? form.duration : 0;
    return {
      startRelative: formatRelativeTime(start),
      endRelative: formatRelativeTime(end),
      duration,
      exercises: form.exercises.length,
    };
  }, [form.start, form.end, form.duration, form.exercises]);

  if (loading) {
    return (
      <div className="pt-session-editor">
        <div className="neo-panel neo-panel--skeleton">
          <div className="neo-panel__body neo-stack neo-stack--md">
            <Loader2 className="neo-icon neo-icon--spin" aria-hidden />
            <p className="neo-text--muted">A carregar sessão…</p>
          </div>
        </div>
      </div>
    );
  }

  if (loadingError) {
    return (
      <div className="pt-session-editor">
        <Alert tone="danger" role="alert">
          {loadingError}
        </Alert>
        <div className="pt-session-editor__errorActions">
          <Button variant="ghost" onClick={() => router.back()}>
            Voltar
          </Button>
          <Button variant="primary" onClick={() => router.refresh?.()}>
            Tentar novamente
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-session-editor" aria-live="polite">
      <header className="pt-session-editor__header">
        <div className="neo-stack neo-stack--xs">
          <p className="neo-breadcrumb">Dashboard · PT · Sessões</p>
          <h1 className="pt-session-editor__title">Editar sessão</h1>
          <p className="pt-session-editor__subtitle">
            Actualiza os detalhes operacionais, reorganiza os exercícios e mantém o histórico consistente.
          </p>
        </div>
        <div className="pt-session-editor__headerActions">
          <Button variant="ghost" size="sm" onClick={() => router.back()}>
            Cancelar
          </Button>
          <Button variant="danger" size="sm" onClick={handleDelete} loading={removing} disabled={removing}>
            <Trash2 className="neo-icon" aria-hidden /> Apagar
          </Button>
          <Button variant="primary" size="sm" onClick={handleSave} loading={saving} disabled={saving}>
            <NotebookPen className="neo-icon" aria-hidden /> Guardar
          </Button>
        </div>
      </header>

      <section className="pt-session-editor__metaBar">
        <DataSourceBadge source={sessionMeta.source} generatedAt={sessionMeta.fetchedAt} />
      </section>

      {feedback ? <Alert tone={feedback.tone}>{feedback.message}</Alert> : null}

      <div className="pt-session-editor__grid">
        <form className="neo-panel pt-session-editor__panel" onSubmit={(event) => event.preventDefault()} noValidate>
          <header className="neo-panel__header">
            <div>
              <h2 className="neo-panel__title">Detalhes</h2>
              <p className="neo-panel__subtitle">Altera a informação essencial desta sessão.</p>
            </div>
          </header>
          <div className="neo-panel__body neo-stack neo-stack--lg">
            <div className="neo-input-group" data-error={Boolean(errors.title)}>
              <label htmlFor="title" className="neo-input-group__label">
                Título da sessão
              </label>
              <input
                id="title"
                className="neo-input"
                value={form.title}
                placeholder="Treino de força nível 2"
                onChange={(event) => setField('title', event.target.value)}
                required
              />
              <p className="neo-input-hint">Visível no calendário do cliente e nos lembretes automáticos.</p>
              {errors.title ? <p className="neo-input-error">{errors.title}</p> : null}
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
                  onChange={(event) => setField('kind', event.target.value)}
                >
                  <option value="presencial">Presencial</option>
                  <option value="online">Online</option>
                  <option value="outro">Outro</option>
                </select>
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
                <p className="neo-input-hint">Utilizado para validar conflitos e gerar o resumo semanal.</p>
                {errors.duration ? <p className="neo-input-error">{errors.duration}</p> : null}
              </div>
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
                  value={form.start}
                  onChange={(event) => setField('start', event.target.value)}
                  required
                />
                <p className="neo-input-hint">Ajusta automaticamente os lembretes do cliente.</p>
                {errors.start ? <p className="neo-input-error">{errors.start}</p> : null}
              </div>
              <div className="neo-input-group">
                <label htmlFor="end" className="neo-input-group__label">
                  Fim (opcional)
                </label>
                <input
                  id="end"
                  type="datetime-local"
                  className="neo-input"
                  value={form.end}
                  onChange={(event) => setField('end', event.target.value)}
                />
                <p className="neo-input-hint">Se omisso, o fim é calculado com base na duração.</p>
              </div>
            </div>

            <section className="pt-session-editor__exercises">
              <header className="pt-session-editor__exercisesHeader">
                <div className="neo-stack neo-stack--xxs">
                  <h3>Exercícios</h3>
                  <p className="neo-text--muted">Arrasta para ordenar e adapta a sequência ao cliente.</p>
                </div>
                <div className="pt-session-editor__exerciseInput">
                  <input
                    className="neo-input"
                    value={newExercise}
                    placeholder="Ex.: Agachamento frontal · 4x8"
                    onChange={(event) => setNewExercise(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter') {
                        event.preventDefault();
                        handleAddExercise();
                      }
                    }}
                  />
                  <Button type="button" size="sm" variant="ghost" onClick={handleAddExercise}>
                    <Plus className="neo-icon" aria-hidden /> Adicionar
                  </Button>
                </div>
              </header>
              <ul className="pt-session-editor__exerciseList" role="list">
                {form.exercises.length === 0 ? (
                  <li className="pt-session-editor__exerciseEmpty">Nenhum exercício registado para esta sessão.</li>
                ) : (
                  form.exercises.map((exercise, index) => (
                    <li
                      key={`${exercise}-${index}`}
                      className="pt-session-editor__exerciseItem"
                      draggable
                      onDragStart={handleDragStart(index)}
                      onDragOver={handleDragOver}
                      onDrop={handleDrop(index)}
                      aria-grabbed="true"
                    >
                      <span className="pt-session-editor__exerciseDrag" aria-hidden>
                        <GripVertical className="neo-icon" aria-hidden />
                      </span>
                      <span className="pt-session-editor__exerciseText">{exercise}</span>
                      <button
                        type="button"
                        className="pt-session-editor__exerciseRemove"
                        onClick={() => handleRemoveExercise(index)}
                        aria-label={`Remover exercício ${exercise}`}
                      >
                        <Trash2 className="neo-icon" aria-hidden />
                      </button>
                    </li>
                  ))
                )}
              </ul>
            </section>
          </div>
          <footer className="neo-panel__footer pt-session-editor__footer">
            <Button type="button" variant="ghost" onClick={() => router.back()}>
              Cancelar
            </Button>
            <Button type="button" variant="primary" onClick={handleSave} loading={saving} disabled={saving}>
              Guardar alterações
            </Button>
          </footer>
        </form>

        <aside className="neo-panel pt-session-editor__sidebar" aria-label="Métricas da sessão">
          <header className="neo-panel__header">
            <div>
              <h2 className="neo-panel__title">Resumo da sessão</h2>
              <p className="neo-panel__subtitle">Dados calculados em tempo real com base no formulário.</p>
            </div>
          </header>
          <div className="neo-panel__body">
            <ul className="pt-session-editor__metrics" role="list">
              <li>
                <CalendarClock className="neo-icon" aria-hidden />
                <div>
                  <p className="pt-session-editor__metricLabel">Inicia</p>
                  <p className="pt-session-editor__metricValue">
                    {form.start ? new Date(form.start).toLocaleString('pt-PT', { dateStyle: 'medium', timeStyle: 'short' }) : '—'}
                  </p>
                  <p className="pt-session-editor__metricHint">{metrics.startRelative ?? 'Sem data definida'}</p>
                </div>
              </li>
              <li>
                <Clock4 className="neo-icon" aria-hidden />
                <div>
                  <p className="pt-session-editor__metricLabel">Duração planeada</p>
                  <p className="pt-session-editor__metricValue">{metrics.duration} min</p>
                  <p className="pt-session-editor__metricHint">
                    {form.end
                      ? `Termina ${metrics.endRelative ?? 'no horário definido'}`
                      : 'Fim calculado automaticamente a partir da duração'}
                  </p>
                </div>
              </li>
              <li>
                <NotebookPen className="neo-icon" aria-hidden />
                <div>
                  <p className="pt-session-editor__metricLabel">Blocos na sessão</p>
                  <p className="pt-session-editor__metricValue">{metrics.exercises}</p>
                  <p className="pt-session-editor__metricHint">Reordena arrastando os cartões acima.</p>
                </div>
              </li>
            </ul>
          </div>
        </aside>
      </div>
    </div>
  );
}
