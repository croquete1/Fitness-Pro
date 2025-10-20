// src/components/onboarding/ClientOnboardingFormClient.tsx
'use client';

import * as React from 'react';
import Button from '@/components/ui/Button';
import DataSourceBadge from '@/components/ui/DataSourceBadge';

type JsonLike = unknown;

type FormRow = {
  id?: string;
  user_id?: string;
  status?: 'draft' | 'submitted' | null;
  goals?: JsonLike;
  injuries?: JsonLike;
  medical?: JsonLike;
  activity_level?: 'low' | 'medium' | 'high' | null;
  experience?: 'beginner' | 'intermediate' | 'advanced' | null;
  availability?: JsonLike;
  created_at?: string | null;
  updated_at?: string | null;
};

type Props = {
  initial: FormRow | null;
  viewerName?: string | null;
};

type FormStatus = 'draft' | 'submitted';

type FormState = {
  goals: string;
  injuries: string;
  medical: string;
  activity_level: 'low' | 'medium' | 'high';
  experience: 'beginner' | 'intermediate' | 'advanced';
  availability: string;
};

type Feedback = { tone: 'success' | 'danger' | 'info'; message: string };

const ACTIVITY_OPTIONS = [
  { value: 'low', label: 'Baixo', description: 'Vida sedentária, actividade ligeira 1-2x por semana.' },
  { value: 'medium', label: 'Moderado', description: 'Pratica exercício regular 3-4x por semana.' },
  { value: 'high', label: 'Elevado', description: 'Atleta amador/profissional com treinos 5x+/semana.' },
] as const;

const EXPERIENCE_OPTIONS = [
  { value: 'beginner', label: 'Iniciante', description: 'Menos de 1 ano de treino estruturado.' },
  { value: 'intermediate', label: 'Intermédio', description: '1-3 anos de treino consistente.' },
  { value: 'advanced', label: 'Avançado', description: 'Mais de 3 anos de treino com periodização.' },
] as const;

const STATUS_META: Record<FormStatus, { label: string; hint: string; tone: 'ok' | 'warn' }> = {
  draft: {
    label: 'Rascunho',
    hint: 'Completa todas as secções e submete para que o teu PT veja o plano.',
    tone: 'warn',
  },
  submitted: {
    label: 'Submetido',
    hint: 'O teu PT já consegue trabalhar com estas informações. Actualiza se houver alterações.',
    tone: 'ok',
  },
};

const TOTAL_FIELDS = 6;

function toText(value: JsonLike): string {
  if (value == null) return '';
  if (typeof value === 'string') return value;
  if (Array.isArray(value)) {
    return value
      .map((entry) => (typeof entry === 'string' ? entry : entry && typeof entry === 'object' ? JSON.stringify(entry) : String(entry)))
      .join(', ');
  }
  if (typeof value === 'object') {
    try {
      const entries = Object.values(value as Record<string, unknown>);
      if (entries.every((entry) => typeof entry === 'string')) {
        return entries.filter((entry): entry is string => typeof entry === 'string').join(', ');
      }
      return JSON.stringify(value);
    } catch {
      return String(value);
    }
  }
  return String(value);
}

function normaliseActivity(value: string | null | undefined): FormState['activity_level'] {
  return value === 'low' || value === 'high' ? value : 'medium';
}

function normaliseExperience(value: string | null | undefined): FormState['experience'] {
  if (value === 'intermediate' || value === 'advanced') return value;
  return 'beginner';
}

function buildInitialState(initial: FormRow | null): FormState {
  return {
    goals: toText(initial?.goals).trim(),
    injuries: toText(initial?.injuries).trim(),
    medical: toText(initial?.medical).trim(),
    activity_level: normaliseActivity(initial?.activity_level ?? null),
    experience: normaliseExperience(initial?.experience ?? null),
    availability: toText(initial?.availability).trim(),
  };
}

function sanitise(state: FormState): FormState {
  return {
    ...state,
    goals: state.goals.trim(),
    injuries: state.injuries.trim(),
    medical: state.medical.trim(),
    availability: state.availability.trim(),
  };
}

function formatDateTime(iso: string | null | undefined): string {
  if (!iso) return 'Nunca submetido';
  try {
    return new Intl.DateTimeFormat('pt-PT', {
      dateStyle: 'short',
      timeStyle: 'short',
    }).format(new Date(iso));
  } catch {
    return '—';
  }
}

function formatRelative(iso: string | null | undefined): string | null {
  if (!iso) return null;
  try {
    const target = new Date(iso);
    const diff = target.getTime() - Date.now();
    if (!Number.isFinite(diff)) return null;
    const minute = 60_000;
    const hour = 60 * minute;
    const day = 24 * hour;
    const rtf = new Intl.RelativeTimeFormat('pt-PT', { numeric: 'auto' });
    if (Math.abs(diff) < hour) return rtf.format(Math.round(diff / minute), 'minute');
    if (Math.abs(diff) < day) return rtf.format(Math.round(diff / hour), 'hour');
    if (Math.abs(diff) < 30 * day) return rtf.format(Math.round(diff / day), 'day');
    return rtf.format(Math.round(diff / (30 * day)), 'month');
  } catch {
    return null;
  }
}

function describeProgress(state: FormState) {
  const checklist = [
    { id: 'goals', label: 'Objetivos principais', done: Boolean(state.goals) },
    { id: 'injuries', label: 'Lesões ou limitações', done: Boolean(state.injuries) },
    { id: 'medical', label: 'Condições médicas', done: Boolean(state.medical) },
    { id: 'activity_level', label: 'Nível de actividade', done: Boolean(state.activity_level) },
    { id: 'experience', label: 'Experiência de treino', done: Boolean(state.experience) },
    { id: 'availability', label: 'Disponibilidade semanal', done: Boolean(state.availability) },
  ];
  const completed = checklist.filter((item) => item.done).length;
  const percent = Math.round((completed / TOTAL_FIELDS) * 100);
  return { completed, percent, checklist };
}

export default function ClientOnboardingFormClient({ initial, viewerName }: Props) {
  const initialState = React.useMemo(() => buildInitialState(initial), [initial]);
  const baseline = React.useRef<FormState>(initialState);
  const [form, setForm] = React.useState<FormState>(initialState);
  const initialStatus: FormStatus = initial?.status === 'submitted' ? 'submitted' : 'draft';
  const [status, setStatus] = React.useState<FormStatus>(initialStatus);
  const [feedback, setFeedback] = React.useState<Feedback | null>(null);
  const [isSaving, setIsSaving] = React.useState(false);
  const [pendingIntent, setPendingIntent] = React.useState<FormStatus | null>(null);
  const [dirty, setDirty] = React.useState(false);
  const [lastSavedAt, setLastSavedAt] = React.useState<string | null>(initial?.updated_at ?? initial?.created_at ?? null);
  const feedbackId = React.useId();

  const progress = React.useMemo(() => describeProgress(form), [form]);
  const statusMeta = STATUS_META[status];
  const activityLabel = ACTIVITY_OPTIONS.find((option) => option.value === form.activity_level)?.label ?? '—';
  const experienceLabel = EXPERIENCE_OPTIONS.find((option) => option.value === form.experience)?.label ?? '—';
  const relativeSaved = formatRelative(lastSavedAt);

  function updateField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
    setDirty(true);
  }

  function resetToBaseline() {
    setForm(baseline.current);
    setDirty(false);
    setFeedback({ tone: 'info', message: 'Campos repostos para o último registo guardado.' });
  }

  async function submit(intent: FormStatus) {
    if (isSaving) return;
    setIsSaving(true);
    setPendingIntent(intent);
    setFeedback(null);
    const payload = sanitise(form);

    try {
      const response = await fetch('/api/onboarding/upsert', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...payload, status: intent }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok || !data?.ok) {
        const message = typeof data?.error === 'string' && data.error ? data.error : 'Não foi possível guardar o formulário.';
        throw new Error(message);
      }
      baseline.current = payload;
      setForm(payload);
      setStatus(intent);
      setDirty(false);
      const nowIso = new Date().toISOString();
      setLastSavedAt(nowIso);
      setFeedback({
        tone: 'success',
        message: intent === 'submitted' ? 'Avaliação submetida com sucesso.' : 'Rascunho guardado com sucesso.',
      });
    } catch (error: any) {
      console.error('[client-onboarding] submit failed', error);
      setFeedback({ tone: 'danger', message: error?.message ?? 'Erro inesperado ao guardar o formulário.' });
    } finally {
      setIsSaving(false);
      setPendingIntent(null);
    }
  }

  const viewerGreeting = viewerName ? `Olá ${viewerName.split(' ')[0]}!` : 'Olá!';
  const helperMessage = dirty
    ? 'Tens alterações por guardar.'
    : status === 'submitted'
      ? 'Avaliação submetida. Podes actualizar se algo mudar.'
      : 'Preenche os campos e guarda o rascunho sempre que precisares.';

  return (
    <section className="client-onboarding neo-stack neo-stack--xl" aria-describedby={feedback ? feedbackId : undefined}>
      <header className="neo-panel neo-panel--header client-onboarding__hero">
        <div className="client-onboarding__heroCopy">
          <span className="caps-tag">Avaliação física</span>
          <h1 className="heading-solid">{viewerGreeting} Vamos preparar o teu plano personalizado.</h1>
          <p className="neo-text--sm neo-text--muted">
            Partilha objectivos, historial e disponibilidade reais para que o teu Personal Trainer ajuste o treino sem adivinhas.
            Podes guardar rascunhos e submeter quando estiver completo.
          </p>
        </div>
        <div className="client-onboarding__heroStatus">
          <span className="status-pill" data-state={statusMeta.tone}>{statusMeta.label}</span>
          <DataSourceBadge source="supabase" generatedAt={lastSavedAt} />
          <p className="neo-text--xs neo-text--muted">{statusMeta.hint}</p>
        </div>
      </header>

      <div className="client-onboarding__layout">
        <section className="neo-panel client-onboarding__summary" aria-labelledby="client-onboarding-summary">
          <div className="neo-stack neo-stack--sm">
            <h2 id="client-onboarding-summary" className="client-onboarding__summaryTitle">
              Progresso do questionário
            </h2>
            <p className="neo-text--xs neo-text--muted">Actualizado {formatDateTime(lastSavedAt)}{relativeSaved ? ` (${relativeSaved})` : ''}.</p>
          </div>

          <div className="client-onboarding__progress" role="img" aria-label={`Preenchido ${progress.completed} de ${TOTAL_FIELDS} campos`}>
            <div className="client-onboarding__progressBar" data-value={progress.percent}>
              <span style={{ width: `${progress.percent}%` }} aria-hidden="true" />
            </div>
            <div className="client-onboarding__progressMeta">
              <span>{progress.percent}% completo</span>
              <span>
                {progress.completed} / {TOTAL_FIELDS} secções
              </span>
            </div>
          </div>

          <dl className="client-onboarding__metrics">
            <div className="neo-surface neo-surface--compact" data-variant="primary">
              <dt className="neo-text--xs neo-text--muted">Estado</dt>
              <dd className="client-onboarding__metricValue">{statusMeta.label}</dd>
              <span className="neo-text--xs neo-text--muted">{helperMessage}</span>
            </div>
            <div className="neo-surface neo-surface--compact" data-variant="teal">
              <dt className="neo-text--xs neo-text--muted">Nível de actividade</dt>
              <dd className="client-onboarding__metricValue">{activityLabel}</dd>
              <span className="neo-text--xs neo-text--muted">
                {ACTIVITY_OPTIONS.find((option) => option.value === form.activity_level)?.description}
              </span>
            </div>
            <div className="neo-surface neo-surface--compact" data-variant="orange">
              <dt className="neo-text--xs neo-text--muted">Experiência</dt>
              <dd className="client-onboarding__metricValue">{experienceLabel}</dd>
              <span className="neo-text--xs neo-text--muted">
                {EXPERIENCE_OPTIONS.find((option) => option.value === form.experience)?.description}
              </span>
            </div>
          </dl>

          <ul className="client-onboarding__checklist">
            {progress.checklist.map((item) => (
              <li key={item.id} data-complete={item.done}>
                <span aria-hidden="true">{item.done ? '✔︎' : '○'}</span>
                <span>{item.label}</span>
              </li>
            ))}
          </ul>
        </section>

        <form
          className="neo-panel client-onboarding__form neo-stack neo-stack--xl"
          onSubmit={(event) => {
            event.preventDefault();
            submit('submitted');
          }}
        >
          <div className="client-onboarding__formHeader">
            <h2 className="client-onboarding__formTitle">Informação detalhada</h2>
            <p className="neo-text--sm neo-text--muted">
              Foca-te em exemplos concretos. Quanto mais contexto, mais personalizado será o plano.
            </p>
          </div>

          <div className="client-onboarding__formGrid">
            <div className="neo-input-group">
              <label className="neo-input-group__field">
                <span className="neo-input-group__label">Objetivos principais</span>
                <textarea
                  className="neo-input neo-input--textarea"
                  rows={3}
                  value={form.goals}
                  onChange={(event) => updateField('goals', event.target.value)}
                  placeholder="Ex.: ganhar massa muscular, melhorar resistência, preparar prova específica…"
                />
                <span className="neo-input-group__hint">Descreve 2-3 metas com prazos ou eventos específicos.</span>
              </label>
            </div>

            <div className="neo-input-group">
              <label className="neo-input-group__field">
                <span className="neo-input-group__label">Lesões ou limitações</span>
                <textarea
                  className="neo-input neo-input--textarea"
                  rows={3}
                  value={form.injuries}
                  onChange={(event) => updateField('injuries', event.target.value)}
                  placeholder="Indica cirurgias, dores recorrentes ou restrições médicas."
                />
                <span className="neo-input-group__hint">Se não houver, escreve “Sem lesões” para registo.</span>
              </label>
            </div>

            <div className="neo-input-group">
              <label className="neo-input-group__field">
                <span className="neo-input-group__label">Condições médicas relevantes</span>
                <textarea
                  className="neo-input neo-input--textarea"
                  rows={3}
                  value={form.medical}
                  onChange={(event) => updateField('medical', event.target.value)}
                  placeholder="Ex.: asma, hipertensão controlada, alergias a indicar…"
                />
                <span className="neo-input-group__hint">Esta informação ajuda a ajustar intensidade, volume e recuperação.</span>
              </label>
            </div>

            <div className="client-onboarding__split">
              <div className="neo-input-group">
                <label className="neo-input-group__field">
                  <span className="neo-input-group__label">Nível de actividade</span>
                  <select
                    className="neo-input"
                    value={form.activity_level}
                    onChange={(event) => updateField('activity_level', event.target.value as FormState['activity_level'])}
                  >
                    {ACTIVITY_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  <span className="neo-input-group__hint">
                    {ACTIVITY_OPTIONS.find((option) => option.value === form.activity_level)?.description}
                  </span>
                </label>
              </div>

              <div className="neo-input-group">
                <label className="neo-input-group__field">
                  <span className="neo-input-group__label">Experiência de treino</span>
                  <select
                    className="neo-input"
                    value={form.experience}
                    onChange={(event) => updateField('experience', event.target.value as FormState['experience'])}
                  >
                    {EXPERIENCE_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  <span className="neo-input-group__hint">
                    {EXPERIENCE_OPTIONS.find((option) => option.value === form.experience)?.description}
                  </span>
                </label>
              </div>
            </div>

            <div className="neo-input-group client-onboarding__availability">
              <label className="neo-input-group__field">
                <span className="neo-input-group__label">Disponibilidade semanal</span>
                <textarea
                  className="neo-input neo-input--textarea"
                  rows={2}
                  value={form.availability}
                  onChange={(event) => updateField('availability', event.target.value)}
                  placeholder="Ex.: Segunda e quarta às 18h, sábado de manhã."
                />
                <span className="neo-input-group__hint">Indica dias preferidos, horários e restrições fixas.</span>
              </label>
            </div>
          </div>

          <div className="client-onboarding__actions">
            <div className="client-onboarding__feedback" aria-live="polite" id={feedbackId}>
              {feedback ? (
                <div className="neo-alert" data-tone={feedback.tone}>
                  <div className="neo-alert__content">
                    <p className="neo-alert__message">{feedback.message}</p>
                  </div>
                </div>
              ) : (
                <p className="neo-text--sm neo-text--muted">{helperMessage}</p>
              )}
            </div>
            <div className="client-onboarding__buttons">
              <Button type="button" variant="ghost" onClick={resetToBaseline} disabled={!dirty}>
                Repor dados iniciais
              </Button>
              <Button
                type="button"
                variant="secondary"
                loading={isSaving && pendingIntent === 'draft'}
                onClick={() => submit('draft')}
              >
                Guardar rascunho
              </Button>
              <Button type="submit" variant="primary" loading={isSaving && pendingIntent === 'submitted'}>
                Submeter avaliação
              </Button>
            </div>
          </div>
        </form>
      </div>
    </section>
  );
}
