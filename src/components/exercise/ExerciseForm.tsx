'use client';

import * as React from 'react';
import clsx from 'clsx';
import {
  Sparkles,
  BookOpenCheck,
  PlayCircle,
  Video,
  Tag,
} from 'lucide-react';

import Alert from '@/components/ui/Alert';
import Button from '@/components/ui/Button';
import {
  DIFFICULTY_OPTIONS,
  ExerciseFormSchema,
  type ExerciseFormValues,
  type Difficulty,
} from '@/lib/exercises/schema';
import { getExerciseMediaInfo } from '@/lib/exercises/media';
import { parseTagList } from '@/lib/exercises/tags';

export type ExerciseFormMessages = {
  successCreate: string;
  successEdit: string;
  errorGeneric: string;
  validationError: string;
};

export type ExerciseFormCopy = {
  badgeCreate: string;
  badgeEdit: string;
  titleCreate: string;
  titleEdit: string;
  subtitle: string;
  nameLabel: string;
  nameHelper: string;
  muscleLabel: string;
  muscleHelper: string;
  equipmentLabel: string;
  equipmentHelper: string;
  difficultyLabel: string;
  difficultyHelper: string;
  descriptionLabel: string;
  descriptionHelper: string;
  descriptionCount: (count: number) => string;
  videoLabel: string;
  videoHelper: string;
  emptyPreview: string;
  previewInstructionsFallback: string;
  previewCta: string;
  cancelLabel: string;
  createLabel: string;
  updateLabel: string;
  creatingLabel: string;
  updatingLabel: string;
};

export type ExerciseFormProps = {
  mode: 'create' | 'edit';
  initial?: Partial<ExerciseFormValues>;
  onSuccess?: () => void;
  onCancel?: () => void;
  submit: (payload: ExerciseFormValues) => Promise<void>;
  messages?: Partial<ExerciseFormMessages>;
  copy?: Partial<ExerciseFormCopy>;
};

const DEFAULT_MESSAGES: ExerciseFormMessages = {
  successCreate: 'Exercício criado ✅',
  successEdit: 'Exercício actualizado ✅',
  errorGeneric: 'Falha ao gravar exercício',
  validationError: 'Revê os campos destacados.',
};

const DEFAULT_COPY: ExerciseFormCopy = {
  badgeCreate: 'Nova entrada global',
  badgeEdit: 'Edição avançada',
  titleCreate: 'Detalhes do exercício',
  titleEdit: '✏️ Editar exercício',
  subtitle:
    'Preenche os detalhes do exercício. Mantivemos os campos essenciais agrupados e adicionámos uma pré-visualização com dados reais do catálogo.',
  nameLabel: 'Nome',
  nameHelper: 'Obrigatório. Usa um nome claro e objectivo.',
  muscleLabel: 'Grupo muscular',
  muscleHelper: 'Usa vírgulas para separar vários grupos (ex.: Peito, Ombros).',
  equipmentLabel: 'Equipamento',
  equipmentHelper: 'Indica o material necessário (opcional).',
  difficultyLabel: 'Dificuldade',
  difficultyHelper: 'Classifica o nível para ajustar planos e filtragens.',
  descriptionLabel: 'Instruções',
  descriptionHelper: 'Resume as orientações principais. Mantém frases curtas e accionáveis.',
  descriptionCount: (count) => `${count} caracteres`,
  videoLabel: 'Vídeo URL',
  videoHelper: 'Opcional. Aceita links http(s) para vídeos ou ficheiros.',
  emptyPreview: 'Começa por preencher o nome ou as instruções para veres aqui um resumo instantâneo.',
  previewInstructionsFallback: 'Adiciona instruções para orientar a execução.',
  previewCta: 'Abrir vídeo de demonstração',
  cancelLabel: 'Cancelar',
  createLabel: 'Criar exercício',
  updateLabel: 'Guardar alterações',
  creatingLabel: 'A criar…',
  updatingLabel: 'A actualizar…',
};

const DIFFICULTY_DESCRIPTORS: Record<Difficulty, string> = {
  Fácil: 'Introdução e mobilidade',
  Média: 'Progressão técnica',
  Difícil: 'Alta intensidade',
};

type HighlightDefinition = {
  key: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  title: string;
  description: string;
};

const HERO_HIGHLIGHTS: HighlightDefinition[] = [
  {
    key: 'identity',
    icon: Sparkles,
    title: 'Identidade consistente',
    description: 'Garante uma nomenclatura alinhada entre equipas e planos.',
  },
  {
    key: 'context',
    icon: BookOpenCheck,
    title: 'Contexto imediato',
    description: 'Tags e dificuldade aceleram a filtragem na biblioteca real.',
  },
  {
    key: 'media',
    icon: PlayCircle,
    title: 'Guia multimédia',
    description: 'Adiciona vídeo para reforçar a execução sempre que possível.',
  },
];

type FeedbackState = {
  tone: 'success' | 'danger' | 'info';
  message: string;
};

type FieldErrors = Partial<Record<keyof ExerciseFormValues, string>>;

type TagPreviewProps = { label: string; items: string[] };

function TagPreview({ label, items }: TagPreviewProps) {
  if (!items.length) return null;
  return (
    <section className="exercise-form__tags" aria-label={label}>
      <header>
        <span className="exercise-form__tagsLabel">
          <Tag aria-hidden /> {label}
        </span>
      </header>
      <ul>
        {items.map((item) => (
          <li key={`${label}-${item}`}>{item}</li>
        ))}
      </ul>
    </section>
  );
}

export default function ExerciseForm({
  mode,
  initial,
  onSuccess,
  onCancel,
  submit,
  messages: providedMessages,
  copy: providedCopy,
}: ExerciseFormProps) {
  const messages = { ...DEFAULT_MESSAGES, ...providedMessages };
  const copy = { ...DEFAULT_COPY, ...providedCopy };

  const [values, setValues] = React.useState<ExerciseFormValues>(() => ({
    id: initial?.id,
    name: initial?.name ?? '',
    muscle_group: initial?.muscle_group ?? '',
    equipment: initial?.equipment ?? '',
    difficulty: initial?.difficulty ?? undefined,
    description: initial?.description ?? '',
    video_url: initial?.video_url ?? '',
  }));

  const [errors, setErrors] = React.useState<FieldErrors>({});
  const [saving, setSaving] = React.useState(false);
  const [feedback, setFeedback] = React.useState<FeedbackState | null>(null);
  const statusId = React.useId();

  const descriptionLength = values.description?.length ?? 0;
  const previewMedia = React.useMemo(() => getExerciseMediaInfo(values.video_url), [values.video_url]);
  const previewDescription = values.description?.trim() ?? '';
  const muscleTags = React.useMemo(() => parseTagList(values.muscle_group), [values.muscle_group]);
  const equipmentTags = React.useMemo(() => parseTagList(values.equipment), [values.equipment]);

  const hasPreviewContent = React.useMemo(
    () =>
      Boolean(
        values.name ||
          muscleTags.length > 0 ||
          equipmentTags.length > 0 ||
          values.difficulty ||
          previewDescription ||
          previewMedia.kind !== 'none',
      ),
    [equipmentTags.length, muscleTags.length, previewDescription, previewMedia.kind, values.difficulty, values.name],
  );

  const primaryVideoUrl = React.useMemo(() => {
    const original = values.video_url?.trim();
    if (original) return original;
    if (previewMedia.kind === 'none') return undefined;
    return previewMedia.src;
  }, [previewMedia, values.video_url]);

  function setField<K extends keyof ExerciseFormValues>(key: K, value: ExerciseFormValues[K]) {
    setValues((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFeedback(null);
    setSaving(true);
    setErrors({});

    const parsed = ExerciseFormSchema.safeParse(values);
    if (!parsed.success) {
      const fieldErrors: FieldErrors = {};
      for (const issue of parsed.error.issues) {
        const path = issue.path[0] as keyof ExerciseFormValues | undefined;
        if (path) fieldErrors[path] = issue.message;
      }
      setErrors(fieldErrors);
      setSaving(false);
      setFeedback({ tone: 'danger', message: messages.validationError });
      return;
    }

    const payload = parsed.data;

    try {
      await submit(payload);
      setFeedback({
        tone: 'success',
        message: mode === 'edit' ? messages.successEdit : messages.successCreate,
      });
      onSuccess?.();
    } catch (error: any) {
      setFeedback({ tone: 'danger', message: error?.message || messages.errorGeneric });
    } finally {
      setSaving(false);
    }
  }

  return (
    <form className="exercise-form" onSubmit={onSubmit} noValidate aria-describedby={statusId}>
      <section className="neo-panel exercise-form__hero" aria-labelledby="exercise-form-hero-title">
        <div className="exercise-form__heroContent">
          <span className="exercise-form__badge" data-mode={mode}>
            {mode === 'edit' ? copy.badgeEdit : copy.badgeCreate}
          </span>
          <h1 id="exercise-form-hero-title">{mode === 'edit' ? copy.titleEdit : copy.titleCreate}</h1>
          <p>{copy.subtitle}</p>
        </div>
        <ul className="exercise-form__highlights">
          {HERO_HIGHLIGHTS.map((highlight) => {
            const Icon = highlight.icon;
            return (
              <li key={highlight.key}>
                <span className="exercise-form__highlightIcon" aria-hidden>
                  <Icon />
                </span>
                <div>
                  <p className="exercise-form__highlightTitle">{highlight.title}</p>
                  <p className="exercise-form__highlightDescription">{highlight.description}</p>
                </div>
              </li>
            );
          })}
        </ul>
      </section>

      {feedback ? (
        <Alert tone={feedback.tone} role="status">
          {feedback.message}
        </Alert>
      ) : null}

      <div className="exercise-form__layout">
        <section className="neo-panel exercise-form__panel" aria-labelledby="exercise-form-details">
          <header className="neo-panel__header">
            <div className="neo-panel__meta">
              <h2 id="exercise-form-details" className="neo-panel__title">
                Informação principal
              </h2>
              <p className="neo-panel__subtitle">
                Garante dados consistentes – serão sincronizados com o catálogo real e usados nos planos activos.
              </p>
            </div>
          </header>

          <div className="neo-panel__body exercise-form__grid">
            <div className="neo-input-group" data-error={Boolean(errors.name)}>
              <label className="neo-input-group__label" htmlFor="exercise-name">
                {copy.nameLabel}
              </label>
              <input
                id="exercise-name"
                className="neo-input"
                value={values.name}
                onChange={(event) => setField('name', event.target.value)}
                placeholder="Agachamento com barra"
                required
              />
              <p className="neo-input-hint">{errors.name ?? copy.nameHelper}</p>
            </div>

            <div className="neo-grid neo-grid--cols2 neo-grid--stack-sm">
              <div className="neo-input-group" data-error={Boolean(errors.muscle_group)}>
                <label className="neo-input-group__label" htmlFor="exercise-muscle">
                  {copy.muscleLabel}
                </label>
                <input
                  id="exercise-muscle"
                  className="neo-input"
                  value={values.muscle_group ?? ''}
                  onChange={(event) => setField('muscle_group', event.target.value)}
                  placeholder="Pernas, Peito, Costas…"
                />
                <p className="neo-input-hint">{errors.muscle_group ?? copy.muscleHelper}</p>
              </div>
              <div className="neo-input-group" data-error={Boolean(errors.equipment)}>
                <label className="neo-input-group__label" htmlFor="exercise-equipment">
                  {copy.equipmentLabel}
                </label>
                <input
                  id="exercise-equipment"
                  className="neo-input"
                  value={values.equipment ?? ''}
                  onChange={(event) => setField('equipment', event.target.value)}
                  placeholder="Barra, Máquina, Halteres…"
                />
                <p className="neo-input-hint">{errors.equipment ?? copy.equipmentHelper}</p>
              </div>
            </div>

            <div className="exercise-form__segmented">
              <div className="exercise-form__segmentedHeader">
                <span>{copy.difficultyLabel}</span>
                <p>{copy.difficultyHelper}</p>
              </div>
              <div className="neo-segmented" role="radiogroup" aria-label={copy.difficultyLabel}>
                {[...DIFFICULTY_OPTIONS].map((option) => (
                  <button
                    key={option}
                    type="button"
                    className="neo-segmented__btn"
                    data-active={values.difficulty === option}
                    onClick={() =>
                      setField('difficulty', values.difficulty === option ? undefined : (option as Difficulty))
                    }
                  >
                    <strong>{option}</strong>
                    <span className="neo-segmented__count">{DIFFICULTY_DESCRIPTORS[option]}</span>
                  </button>
                ))}
              </div>
              {errors.difficulty ? <p className="neo-input-error">{errors.difficulty}</p> : null}
            </div>

            <div className="neo-input-group" data-error={Boolean(errors.description)}>
              <label className="neo-input-group__label" htmlFor="exercise-description">
                {copy.descriptionLabel}
              </label>
              <textarea
                id="exercise-description"
                className="neo-input neo-input--textarea"
                rows={6}
                value={values.description ?? ''}
                onChange={(event) => setField('description', event.target.value)}
                placeholder="Sequência de 3 séries de 8 repetições com pausa de 90s. Foco em estabilidade do core."
              />
              <div className="exercise-form__descriptionMeta">
                <p className="neo-input-hint">{errors.description ?? copy.descriptionHelper}</p>
                <span className="exercise-form__counter">{copy.descriptionCount(descriptionLength)}</span>
              </div>
            </div>

            <div className="neo-input-group" data-error={Boolean(errors.video_url)}>
              <label className="neo-input-group__label" htmlFor="exercise-video">
                {copy.videoLabel}
              </label>
              <input
                id="exercise-video"
                className="neo-input"
                value={values.video_url ?? ''}
                onChange={(event) => setField('video_url', event.target.value)}
                placeholder="https://videos.fitbox.pt/exemplo.mp4"
              />
              <p className="neo-input-hint">{errors.video_url ?? copy.videoHelper}</p>
            </div>
          </div>
        </section>

        <aside className="neo-panel exercise-form__preview" aria-live="polite">
          <header className="neo-panel__header">
            <div className="neo-panel__meta">
              <h2 className="neo-panel__title">Pré-visualização</h2>
              <p className="neo-panel__subtitle">
                Mostra exactamente como o exercício aparece nas dashboards admin/PT e nos planos partilhados.
              </p>
            </div>
          </header>
          <div className="neo-panel__body exercise-form__previewBody">
            {hasPreviewContent ? (
              <div className="exercise-form__previewContent">
                <div className="exercise-form__previewHeader">
                  <h3>{values.name || 'Sem nome'}</h3>
                  <p>{previewDescription || copy.previewInstructionsFallback}</p>
                </div>

                <div className="exercise-form__previewTags">
                  {muscleTags.map((tag) => (
                    <span key={`preview-muscle-${tag}`} className="exercise-form__chip" data-tone="primary">
                      {tag}
                    </span>
                  ))}
                  {equipmentTags.map((tag) => (
                    <span key={`preview-equipment-${tag}`} className="exercise-form__chip" data-tone="neutral">
                      {tag}
                    </span>
                  ))}
                  {values.difficulty ? (
                    <span className="exercise-form__chip" data-tone="warning">
                      {values.difficulty}
                    </span>
                  ) : null}
                </div>

                {previewMedia.kind !== 'none' ? (
                  <div className="exercise-form__media">
                    <div className="exercise-form__mediaFrame" data-kind={previewMedia.kind}>
                      {previewMedia.kind === 'image' ? (
                        <img
                          src={previewMedia.src}
                          alt={values.name ? `Pré-visualização de ${values.name}` : 'Pré-visualização do exercício'}
                        />
                      ) : null}
                      {previewMedia.kind === 'video' ? (
                        <video
                          src={previewMedia.src}
                          autoPlay
                          loop
                          muted
                          playsInline
                          controls
                        />
                      ) : null}
                      {previewMedia.kind === 'embed' ? (
                        <iframe
                          src={previewMedia.src}
                          title={values.name || 'Pré-visualização do exercício'}
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                        />
                      ) : null}
                    </div>
                    {primaryVideoUrl ? (
                      <a
                        className="exercise-form__mediaLink"
                        href={primaryVideoUrl}
                        target="_blank"
                        rel="noreferrer"
                      >
                        <Video aria-hidden /> {copy.previewCta}
                      </a>
                    ) : null}
                  </div>
                ) : (
                  <p className="neo-text--muted">{copy.emptyPreview}</p>
                )}

                <div className="exercise-form__previewInsights">
                  <TagPreview label="Grupos musculares" items={muscleTags} />
                  <TagPreview label="Equipamento" items={equipmentTags} />
                </div>
              </div>
            ) : (
              <p className="neo-text--muted">{copy.emptyPreview}</p>
            )}
          </div>
        </aside>
      </div>

      <footer className="exercise-form__actions">
        <div className="exercise-form__status" role="status" id={statusId} aria-live="polite">
          {feedback ? (
            <span className={clsx('exercise-form__statusMessage', `tone-${feedback.tone}`)}>{feedback.message}</span>
          ) : (
            <span className="neo-text--muted">Preenche os campos obrigatórios para activar a submissão.</span>
          )}
        </div>
        <div className="exercise-form__buttons">
          {onCancel ? (
            <Button
              type="button"
              variant="ghost"
              onClick={onCancel}
              disabled={saving}
            >
              {copy.cancelLabel}
            </Button>
          ) : null}
          <Button
            type="submit"
            variant="primary"
            loading={saving}
            loadingText={mode === 'edit' ? copy.updatingLabel : copy.creatingLabel}
          >
            {mode === 'edit' ? copy.updateLabel : copy.createLabel}
          </Button>
        </div>
      </footer>
    </form>
  );
}
