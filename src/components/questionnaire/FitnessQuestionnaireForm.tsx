// src/components/questionnaire/FitnessQuestionnaireForm.tsx
'use client';

import * as React from 'react';

import Alert from '@/components/ui/Alert';
import Button from '@/components/ui/Button';
import DataSourceBadge from '@/components/ui/DataSourceBadge';
import type { FitnessQuestionnaireRow, QuestionnaireFormState } from '@/lib/questionnaire';
import {
  buildFormState,
  normalizeQuestionnaire,
  serializeQuestionnaireForm,
  validateQuestionnairePayload,
  QUESTIONNAIRE_WEEK_DAYS,
  QUESTIONNAIRE_WEEKDAY_LABEL,
} from '@/lib/questionnaire';

type Mode = 'client' | 'admin';

type QuestionnaireRowInput = Parameters<typeof buildFormState>[0];

type Props = {
  initial: FitnessQuestionnaireRow | null;
  viewerName?: string | null;
  mode?: Mode;
  targetUserId?: string;
};

type Feedback = { tone: 'success' | 'danger' | 'info'; message: string } | null;

type SectionProps = {
  state: QuestionnaireFormState;
  disabled: boolean;
  onChange: React.Dispatch<React.SetStateAction<QuestionnaireFormState>>;
};

const WEEKDAY_ORDER = QUESTIONNAIRE_WEEK_DAYS;

export default function FitnessQuestionnaireForm({
  initial,
  viewerName,
  mode = 'client',
  targetUserId,
}: Props) {
  const initialState = React.useMemo(() => buildFormState(initial), [initial]);
  const baseline = React.useRef<QuestionnaireFormState>(initialState);
  const [form, setForm] = React.useState<QuestionnaireFormState>(initialState);
  const [savedRow, setSavedRow] = React.useState<QuestionnaireRowInput>(initial);
  const [feedback, setFeedback] = React.useState<Feedback>(null);
  const [busy, setBusy] = React.useState(false);
  const [dirty, setDirty] = React.useState(false);
  const [recordId, setRecordId] = React.useState<string | null>(initial?.id ?? null);
  const [status, setStatus] = React.useState<'draft' | 'submitted'>(initial?.status === 'submitted' ? 'submitted' : 'draft');

  React.useEffect(() => {
    baseline.current = initialState;
    setForm(initialState);
    setStatus(initial?.status === 'submitted' ? 'submitted' : 'draft');
    setDirty(false);
    setSavedRow(initial);
    setRecordId(initial?.id ?? null);
  }, [initialState, initial]);

  const updateForm = React.useCallback((next: React.SetStateAction<QuestionnaireFormState>) => {
    setForm((prev) => {
      const value =
        typeof next === 'function' ? (next as (prev: QuestionnaireFormState) => QuestionnaireFormState)(prev) : next;
      setDirty(!areStatesEqual(value, baseline.current));
      return value;
    });
  }, []);

  const viewerGreeting = viewerName ? `Olá ${viewerName.split(' ')[0]}!` : 'Olá!';
  const readOnly = mode === 'client' && status === 'submitted';
  const heading = mode === 'client' ? 'Avaliação física inicial' : 'Avaliação física do cliente';
  const helper = readOnly
    ? 'Questionário submetido. Contacta o teu PT para actualizações.'
    : 'Preenche todos os campos com informação actual e concreta.';
  const submitLabel = mode === 'client' ? 'Submeter questionário' : 'Guardar alterações';
  const canSubmit = !readOnly && (dirty || status !== 'submitted' || !recordId);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy || !canSubmit) return;
    const payload = serializeQuestionnaireForm(form, { status: 'submitted' });
    const validationErrors = validateQuestionnairePayload(payload);
    if (validationErrors.length) {
      setFeedback({ tone: 'danger', message: validationErrors[0] });
      return;
    }

    setBusy(true);
    setFeedback(null);

    try {
      const body: Record<string, unknown> = { ...payload };
      if (mode === 'admin' && targetUserId) body.user_id = targetUserId;
      const response = await fetch('/api/onboarding/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const json = await response.json().catch(() => ({}));
      if (!response.ok || !json?.ok) {
        const message = typeof json?.error === 'string' && json.error ? json.error : 'Não foi possível guardar o formulário.';
        throw new Error(message);
      }

      const timestamp = new Date().toISOString();
      const persistedId =
        (json?.id as string | undefined) ?? recordId ?? savedRow?.id ?? initial?.id ?? null;

      const nextRowLike = {
        ...(savedRow ?? initial ?? {}),
        id: persistedId ?? undefined,
        status: 'submitted' as const,
        ...payload,
        schedule: payload.schedule,
        metrics: payload.metrics,
        updated_at: timestamp,
      } as QuestionnaireRowInput;

      const cleanState = buildFormState(nextRowLike);
      baseline.current = cleanState;
      setForm(cleanState);
      setDirty(false);
      setStatus('submitted');
      if (persistedId) setRecordId(persistedId);
      setSavedRow((prev) => {
        const base: Partial<FitnessQuestionnaireRow> = {
          ...(prev ?? {}),
          ...(initial ?? {}),
        };

        const next: Partial<FitnessQuestionnaireRow> = {
          ...base,
          ...nextRowLike,
          id: persistedId ?? base.id,
          status: 'submitted',
          wellbeing_0_to_5: payload.wellbeing_0_to_5,
          objective: payload.objective,
          job: payload.job,
          active: payload.active,
          sport: payload.sport,
          sport_time: payload.sport_time,
          pathologies: payload.pathologies,
          schedule: payload.schedule,
          metrics: payload.metrics,
          updated_at: timestamp,
          created_at: base.created_at ?? timestamp,
        };

        if (!next.user_id && mode === 'admin' && targetUserId) {
          next.user_id = targetUserId;
        }

        return next;
      });

      setFeedback({
        tone: 'success',
        message: mode === 'client' ? 'Questionário submetido com sucesso.' : 'Questionário actualizado com sucesso.',
      });
    } catch (error: any) {
      console.error('[questionnaire] submit failed', error);
      setFeedback({ tone: 'danger', message: error?.message ?? 'Erro inesperado ao guardar o questionário.' });
    } finally {
      setBusy(false);
    }
  }

  const statusBadge = status === 'submitted' ? 'success' : 'warning';
  const statusLabel = status === 'submitted' ? 'Submetido' : 'Pendente';
  const lastUpdate =
    savedRow?.updated_at ??
    savedRow?.created_at ??
    initial?.updated_at ??
    initial?.created_at ??
    null;
  const normalized = React.useMemo(() => normalizeQuestionnaire(savedRow), [savedRow]);

  React.useEffect(() => {
    if (feedback && dirty) {
      setFeedback(null);
    }
  }, [dirty, feedback]);

  return (
    <section className="questionnaire-form neo-stack neo-stack--xl" aria-live="polite">
      <header className="neo-panel questionnaire-form__hero">
        <div className="questionnaire-form__heroCopy">
          <span className="caps-tag">Questionário obrigatório</span>
          <h1 className="heading-solid">{viewerGreeting} {heading}.</h1>
          <p className="neo-text--sm neo-text--muted">{helper}</p>
        </div>
        <div className="questionnaire-form__heroMeta">
          <span className="status-pill" data-state={statusBadge}>
            {statusLabel}
          </span>
          <DataSourceBadge source="supabase" generatedAt={lastUpdate} />
          <p className="neo-text--xs neo-text--muted">
            {lastUpdate ? `Actualizado em ${formatDate(lastUpdate)}` : 'Sem submissões anteriores.'}
          </p>
        </div>
      </header>

      {mode === 'admin' && normalized ? (
        <aside className="neo-panel questionnaire-form__summary" aria-label="Resumo actual">
          <h2 className="questionnaire-form__sectionTitle">Resumo dos dados</h2>
          <dl className="questionnaire-form__summaryGrid">
            <div>
              <dt>Profissão</dt>
              <dd>{normalized.job ?? '—'}</dd>
            </div>
            <div>
              <dt>Nível de actividade</dt>
              <dd>{normalized.activity}</dd>
            </div>
            <div>
              <dt>Objectivo principal</dt>
              <dd>{normalized.objective ?? '—'}</dd>
            </div>
            <div>
              <dt>Bem-estar (0-5)</dt>
              <dd>{normalized.wellbeing ?? '—'}</dd>
            </div>
            <div className="questionnaire-form__summarySpan">
              <dt>Notas de patologias</dt>
              <dd>{normalized.summary ?? 'Sem registos adicionais.'}</dd>
            </div>
          </dl>
        </aside>
      ) : null}

      <form className="neo-panel neo-stack neo-stack--xl questionnaire-form__panel" onSubmit={handleSubmit}>
        <section className="neo-stack neo-stack--lg">
          <header>
            <h2 className="questionnaire-form__sectionTitle">Dados gerais</h2>
            <p className="neo-text--sm neo-text--muted">
              Esta secção ajuda a alinhar expectativas, hábitos e contexto profissional.
            </p>
          </header>

          <QuestionnaireGeneralSection state={form} disabled={readOnly || busy} onChange={updateForm} />
        </section>

        <section className="neo-stack neo-stack--lg">
          <header>
            <h2 className="questionnaire-form__sectionTitle">Avaliação inicial</h2>
            <p className="neo-text--sm neo-text--muted">
              Responde de forma honesta para que o plano seja seguro e adaptado às tuas necessidades.
            </p>
          </header>
          <QuestionnaireAnamnesisSection state={form} disabled={readOnly || busy} onChange={updateForm} />
        </section>

        <section className="neo-stack neo-stack--lg">
          <header>
            <h2 className="questionnaire-form__sectionTitle">Disponibilidade semanal</h2>
            <p className="neo-text--sm neo-text--muted">
              Selecciona os dias preferidos para treinar e partilha restrições específicas de horários.
            </p>
          </header>
          <QuestionnaireScheduleSection state={form} disabled={readOnly || busy} onChange={updateForm} />
        </section>

        <section className="neo-stack neo-stack--lg">
          <header>
            <h2 className="questionnaire-form__sectionTitle">Métricas corporais</h2>
            <p className="neo-text--sm neo-text--muted">
              Introduz medições actualizadas para monitorizar progressos e ajustar cargas.
            </p>
          </header>
          <QuestionnaireMetricsSection state={form} disabled={readOnly || busy} onChange={updateForm} />
        </section>

        <footer className="questionnaire-form__actions">
          <div className="questionnaire-form__feedback">
            {feedback ? (
              <Alert tone={feedback.tone} className="neo-alert--inline" title={feedback.message} />
            ) : (
              <p className="neo-text--sm neo-text--muted">
                {readOnly ? 'Consulta os dados submetidos ou contacta o administrador para alterações.' : 'Revisa antes de submeter.'}
              </p>
            )}
          </div>
          <div className="questionnaire-form__buttons">
            {mode === 'admin' ? (
              <Button type="button" variant="ghost" onClick={() => { setForm(baseline.current); setDirty(false); setFeedback(null); }} disabled={!dirty || busy}>
                Repor alterações
              </Button>
            ) : null}
            <Button type="submit" variant="primary" loading={busy} disabled={!canSubmit || busy}>
              {submitLabel}
            </Button>
          </div>
        </footer>
      </form>
    </section>
  );
}

function QuestionnaireGeneralSection({ state, disabled, onChange }: SectionProps) {
  return (
    <div className="questionnaire-grid">
      <label className="questionnaire-field">
        <span className="questionnaire-label">Atividade profissional</span>
        <input
          className="questionnaire-input"
          value={state.job}
          onChange={(event) => onChange((prev) => ({ ...prev, job: event.target.value }))}
          placeholder="Ex.: Designer, Enfermeira, Estudante…"
          disabled={disabled}
        />
      </label>

      <fieldset className="questionnaire-field">
        <legend className="questionnaire-label">Nível de actividade diária</legend>
        <div className="questionnaire-inline">
          <label>
            <input
              type="radio"
              name="activity-level"
              value="active"
              checked={state.activityLevel === 'active'}
              onChange={() => onChange((prev) => ({ ...prev, activityLevel: 'active' }))}
              disabled={disabled}
            />{' '}
            Ativo
          </label>
          <label>
            <input
              type="radio"
              name="activity-level"
              value="sedentary"
              checked={state.activityLevel === 'sedentary'}
              onChange={() => onChange((prev) => ({ ...prev, activityLevel: 'sedentary' }))}
              disabled={disabled}
            />{' '}
            Sedentário
          </label>
        </div>
      </fieldset>

      <fieldset className="questionnaire-field questionnaire-field--wide">
        <legend className="questionnaire-label">Pratica exercício físico actualmente?</legend>
        <div className="questionnaire-inline">
          <label>
            <input
              type="radio"
              name="exercise-practice"
              value="yes"
              checked={state.exercise.practice}
              onChange={() => onChange((prev) => ({ ...prev, exercise: { ...prev.exercise, practice: true } }))}
              disabled={disabled}
            />{' '}
            Sim
          </label>
          <label>
            <input
              type="radio"
              name="exercise-practice"
              value="no"
              checked={!state.exercise.practice}
              onChange={() =>
                onChange((prev) => ({
                  ...prev,
                  exercise: { practice: false, sport: '', duration: '' },
                }))
              }
              disabled={disabled}
            />{' '}
            Não
          </label>
        </div>
        {state.exercise.practice ? (
          <div className="questionnaire-grid">
            <label className="questionnaire-field">
              <span className="questionnaire-label">Qual modalidade?</span>
              <input
                className="questionnaire-input"
                value={state.exercise.sport}
                onChange={(event) =>
                  onChange((prev) => ({
                    ...prev,
                    exercise: { ...prev.exercise, sport: event.target.value },
                  }))
                }
                placeholder="Ex.: Corrida, Crossfit, Natação…"
                disabled={disabled}
              />
            </label>
            <label className="questionnaire-field">
              <span className="questionnaire-label">Há quanto tempo / frequência?</span>
              <input
                className="questionnaire-input"
                value={state.exercise.duration}
                onChange={(event) =>
                  onChange((prev) => ({
                    ...prev,
                    exercise: { ...prev.exercise, duration: event.target.value },
                  }))
                }
                placeholder="Ex.: 3x por semana há 2 anos"
                disabled={disabled}
              />
            </label>
          </div>
        ) : null}
      </fieldset>

      <label className="questionnaire-field questionnaire-field--wide">
        <span className="questionnaire-label">Objetivo principal</span>
        <textarea
          className="questionnaire-input questionnaire-input--textarea"
          rows={3}
          value={state.objective}
          onChange={(event) => onChange((prev) => ({ ...prev, objective: event.target.value }))}
          placeholder="Ex.: Perder 5kg, preparar meia maratona, melhorar mobilidade…"
          disabled={disabled}
        />
      </label>

      <fieldset className="questionnaire-field questionnaire-field--wide">
        <legend className="questionnaire-label">Como avalias o teu bem-estar geral (0 a 5)?</legend>
        <div className="questionnaire-rating">
          {Array.from({ length: 6 }).map((_, index) => (
            <label key={index}>
              <input
                type="radio"
                name="wellbeing"
                value={index}
                checked={state.wellbeing === index}
                onChange={() => onChange((prev) => ({ ...prev, wellbeing: index }))}
                disabled={disabled}
              />
              <span>{index}</span>
            </label>
          ))}
        </div>
      </fieldset>
    </div>
  );
}

function QuestionnaireAnamnesisSection({ state, disabled, onChange }: SectionProps) {
  const fields: Array<{ key: keyof QuestionnaireFormState['anamnesis']; label: string; placeholder?: string }> = [
    { key: 'cardiac', label: 'Patologias cardíacas?' },
    { key: 'familyHistory', label: 'Histórico familiar relevante?' },
    { key: 'hypertension', label: 'Hipertensão arterial?' },
    { key: 'respiratory', label: 'Patologias respiratórias?' },
    { key: 'diabetes', label: 'Diabetes?' },
    { key: 'cholesterol', label: 'Colesterol elevado?' },
    { key: 'other', label: 'Outras patologias / lesões?' },
    { key: 'smokeDrink', label: 'Consumo de tabaco ou álcool?' },
    { key: 'recentSurgery', label: 'Alguma cirurgia recente?' },
    { key: 'medication', label: 'Medicação habitual?' },
  ];

  return (
    <div className="questionnaire-grid questionnaire-grid--anamnesis">
      {fields.map((field) => (
        <label key={field.key} className="questionnaire-field">
          <span className="questionnaire-label">{field.label}</span>
          <input
            className="questionnaire-input"
            value={state.anamnesis[field.key]}
            onChange={(event) =>
              onChange((prev) => ({
                ...prev,
                anamnesis: { ...prev.anamnesis, [field.key]: event.target.value },
              }))
            }
            placeholder={field.placeholder ?? 'Responde Sim/Não e acrescenta detalhes.'}
            disabled={disabled}
          />
        </label>
      ))}
    </div>
  );
}

function QuestionnaireScheduleSection({ state, disabled, onChange }: SectionProps) {
  return (
    <div className="questionnaire-grid questionnaire-grid--schedule">
      <fieldset className="questionnaire-field questionnaire-field--wide">
        <legend className="questionnaire-label">Dias preferidos para treinar</legend>
        <div className="questionnaire-week">
          {WEEKDAY_ORDER.map((day) => (
            <label key={day}>
              <input
                type="checkbox"
                checked={state.schedule.days[day]}
                onChange={(event) =>
                  onChange((prev) => ({
                    ...prev,
                    schedule: {
                      ...prev.schedule,
                      days: { ...prev.schedule.days, [day]: event.target.checked },
                    },
                  }))
                }
                disabled={disabled}
              />
              <span>{QUESTIONNAIRE_WEEKDAY_LABEL[day]}</span>
            </label>
          ))}
        </div>
      </fieldset>

      <label className="questionnaire-field questionnaire-field--wide">
        <span className="questionnaire-label">Observações sobre horários</span>
        <textarea
          className="questionnaire-input questionnaire-input--textarea"
          rows={2}
          value={state.schedule.notes}
          onChange={(event) =>
            onChange((prev) => ({
              ...prev,
              schedule: { ...prev.schedule, notes: event.target.value },
            }))
          }
          placeholder="Ex.: Disponível apenas após as 19h ou fins-de-semana."
          disabled={disabled}
        />
      </label>
    </div>
  );
}

function QuestionnaireMetricsSection({ state, disabled, onChange }: SectionProps) {
  const bodyFields: Array<{ key: keyof QuestionnaireFormState['metrics']['body']; label: string }> = [
    { key: 'height', label: 'Altura' },
    { key: 'bodyWeight', label: 'Peso corporal' },
    { key: 'bodyFat', label: '% Massa gorda' },
    { key: 'leanMass', label: '% Massa magra' },
    { key: 'bmi', label: 'IMC' },
    { key: 'metabolicAge', label: 'Idade metabólica' },
    { key: 'basalMetabolism', label: 'Metabolismo basal' },
    { key: 'waterPercent', label: '% Água' },
    { key: 'visceralFat', label: 'Gordura visceral' },
    { key: 'bloodPressure', label: 'Pressão arterial' },
  ];

  const perimeterFields: Array<{ key: keyof QuestionnaireFormState['metrics']['perimeters']; label: string }> = [
    { key: 'shoulder', label: 'Perímetro ombro' },
    { key: 'bicep', label: 'Perímetro bíceps' },
    { key: 'chest', label: 'Perímetro peitoral' },
    { key: 'waist', label: 'Perímetro cintura' },
    { key: 'hip', label: 'Perímetro anca' },
    { key: 'glute', label: 'Perímetro glúteo' },
    { key: 'thigh', label: 'Perímetro coxa' },
  ];

  return (
    <div className="questionnaire-metrics">
      <div className="questionnaire-grid questionnaire-grid--metrics">
        {bodyFields.map((field) => (
          <label key={field.key} className="questionnaire-field">
            <span className="questionnaire-label">{field.label}</span>
            <input
              className="questionnaire-input"
              value={state.metrics.body[field.key]}
              onChange={(event) =>
                onChange((prev) => ({
                  ...prev,
                  metrics: {
                    ...prev.metrics,
                    body: { ...prev.metrics.body, [field.key]: event.target.value },
                  },
                }))
              }
              placeholder="Ex.: 1,75 m / 72 kg"
              disabled={disabled}
            />
          </label>
        ))}
      </div>

      <div className="questionnaire-grid questionnaire-grid--metrics">
        {perimeterFields.map((field) => (
          <label key={field.key} className="questionnaire-field">
            <span className="questionnaire-label">{field.label}</span>
            <input
              className="questionnaire-input"
              value={state.metrics.perimeters[field.key]}
              onChange={(event) =>
                onChange((prev) => ({
                  ...prev,
                  metrics: {
                    ...prev.metrics,
                    perimeters: { ...prev.metrics.perimeters, [field.key]: event.target.value },
                  },
                }))
              }
              placeholder="cm"
              disabled={disabled}
            />
          </label>
        ))}
      </div>

      <label className="questionnaire-field questionnaire-field--wide">
        <span className="questionnaire-label">Notas adicionais</span>
        <textarea
          className="questionnaire-input questionnaire-input--textarea"
          rows={3}
          value={state.metrics.notes}
          onChange={(event) =>
            onChange((prev) => ({
              ...prev,
              metrics: { ...prev.metrics, notes: event.target.value },
            }))
          }
          placeholder="Notas relevantes sobre medições ou factores externos."
          disabled={disabled}
        />
      </label>

      <label className="questionnaire-field questionnaire-field--wide">
        <span className="questionnaire-label">Observações gerais</span>
        <textarea
          className="questionnaire-input questionnaire-input--textarea"
          rows={3}
          value={state.metrics.observations}
          onChange={(event) =>
            onChange((prev) => ({
              ...prev,
              metrics: { ...prev.metrics, observations: event.target.value },
            }))
          }
          placeholder="Notas para comunicação com o teu PT ou alertas importantes."
          disabled={disabled}
        />
      </label>
    </div>
  );
}

function areStatesEqual(a: QuestionnaireFormState, b: QuestionnaireFormState) {
  return JSON.stringify(a) === JSON.stringify(b);
}

function formatDate(iso: string) {
  try {
    return new Intl.DateTimeFormat('pt-PT', {
      dateStyle: 'short',
      timeStyle: 'short',
    }).format(new Date(iso));
  } catch {
    return '—';
  }
}

