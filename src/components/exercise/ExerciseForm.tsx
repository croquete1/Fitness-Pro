'use client';

import * as React from 'react';
import {
  Alert,
  Box,
  Button,
  Chip,
  Divider,
  Grid,
  Paper,
  Snackbar,
  Stack,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import LibraryBooksOutlinedIcon from '@mui/icons-material/LibraryBooksOutlined';
import PlayCircleOutlineIcon from '@mui/icons-material/PlayCircleOutline';
import {
  DIFFICULTY_OPTIONS,
  ExerciseFormSchema,
  type ExerciseFormValues,
  type Difficulty,
  normalizeDifficulty,
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
  titleCreate: string;
  titleEdit: string;
  subtitle: string;
  nameHelper: string;
  muscleHelper: string;
  equipmentHelper: string;
  difficultyHelper: string;
  descriptionHelper: string;
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
  successEdit: 'Exercício atualizado ✅',
  errorGeneric: 'Falha ao gravar exercício',
  validationError: 'Revê os campos destacados.',
};

const DEFAULT_COPY: ExerciseFormCopy = {
  titleCreate: 'Detalhes do exercício',
  titleEdit: '✏️ Editar exercício',
  subtitle:
    'Preenche os detalhes do exercício. Mantivemos os campos mais usados juntos e adicionámos uma pré-visualização para te ajudar a perceber como ficará na biblioteca.',
  nameHelper: 'Obrigatório. Usa um nome claro e objetivo.',
  muscleHelper: 'Ajuda-te a filtrar rapidamente.',
  equipmentHelper: 'Indica o material necessário (opcional).',
  difficultyHelper: 'Classifica o nível para ajustar planos facilmente.',
  descriptionHelper: 'Partilha as orientações essenciais para a execução.',
  videoHelper: 'Opcional. Aceita links http(s) para vídeos ou ficheiros.',
  emptyPreview: 'Começa por preencher o nome do exercício para veres aqui um resumo instantâneo.',
  previewInstructionsFallback: 'Adiciona instruções para orientar a execução.',
  previewCta: 'Abrir vídeo de demonstração',
  cancelLabel: 'Cancelar',
  createLabel: 'Criar exercício',
  updateLabel: 'Guardar alterações',
  creatingLabel: 'A criar…',
  updatingLabel: 'A atualizar…',
};

type FormSectionProps = {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
};

function FormSection({ title, subtitle, children }: FormSectionProps) {
  const theme = useTheme();
  const gradientStart = alpha(theme.palette.primary.light, theme.palette.mode === 'dark' ? 0.22 : 0.26);
  const gradientEnd = alpha(theme.palette.background.paper, theme.palette.mode === 'dark' ? 0.85 : 0.92);
  const borderColor = alpha(theme.palette.primary.main, theme.palette.mode === 'dark' ? 0.25 : 0.16);

  return (
    <Box
      sx={{
        borderRadius: 3,
        p: { xs: 2.5, sm: 3 },
        background: `linear-gradient(145deg, ${gradientStart} 0%, ${gradientEnd} 100%)`,
        border: `1px solid ${borderColor}`,
        boxShadow:
          theme.palette.mode === 'dark'
            ? '0 28px 56px rgba(8, 20, 48, 0.42)'
            : '0 28px 48px rgba(56, 92, 255, 0.14)',
        backdropFilter: 'blur(18px)',
      }}
    >
      <Stack spacing={2.5}>
        <Stack spacing={0.75}>
          <Typography
            variant="overline"
            color="primary"
            fontWeight={700}
            sx={{ letterSpacing: '0.18em', textTransform: 'uppercase' }}
          >
            {title}
          </Typography>
          {subtitle ? (
            <Typography variant="body2" color="text.secondary">
              {subtitle}
            </Typography>
          ) : null}
        </Stack>
        {children}
      </Stack>
    </Box>
  );
}

type TagPreviewProps = { label: string; items: string[] };

function TagPreview({ label, items }: TagPreviewProps) {
  if (items.length === 0) return null;
  const theme = useTheme();
  const chipBorder = alpha(theme.palette.primary.main, theme.palette.mode === 'dark' ? 0.4 : 0.26);
  const chipBg = alpha(theme.palette.primary.light, theme.palette.mode === 'dark' ? 0.12 : 0.18);
  return (
    <Stack spacing={0.75}>
      <Typography variant="caption" color="text.secondary" fontWeight={600} textTransform="uppercase">
        {label}
      </Typography>
      <Stack direction="row" spacing={0.5} rowGap={0.5} flexWrap="wrap">
        {items.map((tag) => (
          <Chip
            key={`${label}-${tag}`}
            label={tag}
            size="small"
            variant="outlined"
            sx={{
              borderRadius: 1.75,
              borderColor: chipBorder,
              backgroundColor: chipBg,
              color: theme.palette.text.primary,
              fontWeight: 600,
            }}
          />
        ))}
      </Stack>
    </Stack>
  );
}

type HighlightDefinition = {
  key: string;
  icon: React.ElementType;
  title: string;
  description: string;
};

const HERO_HIGHLIGHTS: HighlightDefinition[] = [
  {
    key: 'identity',
    icon: AutoAwesomeIcon,
    title: 'Identidade consistente',
    description: 'Garante uma nomenclatura alinhada entre equipas e planos.',
  },
  {
    key: 'context',
    icon: LibraryBooksOutlinedIcon,
    title: 'Contexto imediato',
    description: 'Tags e dificuldade ajudam-te a encontrar o exercício certo.',
  },
  {
    key: 'media',
    icon: PlayCircleOutlineIcon,
    title: 'Guia multimédia',
    description: 'Adiciona vídeo para reforçar a execução sempre que possível.',
  },
];

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
  const theme = useTheme();

  const [values, setValues] = React.useState<ExerciseFormValues>(() => ({
    id: initial?.id,
    name: initial?.name ?? '',
    muscle_group: initial?.muscle_group ?? '',
    equipment: initial?.equipment ?? '',
    difficulty: normalizeDifficulty(initial?.difficulty as any),
    description: initial?.description ?? '',
    video_url: initial?.video_url ?? '',
  }));

  const [errors, setErrors] = React.useState<Partial<Record<keyof ExerciseFormValues, string>>>({});
  const [saving, setSaving] = React.useState(false);
  const [err, setErr] = React.useState<string | null>(null);
  const [snack, setSnack] = React.useState<{
    open: boolean;
    msg: string;
    sev: 'success' | 'error' | 'info' | 'warning';
  }>({ open: false, msg: '', sev: 'success' });

  const descriptionLength = React.useMemo(() => values.description?.length ?? 0, [values.description]);

  const closeSnack = () => setSnack((s) => ({ ...s, open: false }));

  function setField<K extends keyof ExerciseFormValues>(key: K, value: ExerciseFormValues[K]) {
    setValues((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  }

  const handleCancel = React.useCallback(() => {
    onCancel?.();
  }, [onCancel]);

  const previewMedia = React.useMemo(() => getExerciseMediaInfo(values.video_url), [values.video_url]);
  const hasVideoUrl = previewMedia.kind !== 'none';
  const previewDescription = React.useMemo(() => values.description?.trim() ?? '', [values.description]);
  const muscleTags = React.useMemo(() => parseTagList(values.muscle_group), [values.muscle_group]);
  const equipmentTags = React.useMemo(() => parseTagList(values.equipment), [values.equipment]);
  const primaryVideoUrl = React.useMemo(() => {
    const original = values.video_url?.trim();
    if (original) return original;
    if (previewMedia.kind === 'none') return undefined;
    return previewMedia.src;
  }, [previewMedia, values.video_url]);
  const hasPreviewContent = React.useMemo(
    () =>
      Boolean(
        values.name ||
          muscleTags.length > 0 ||
          equipmentTags.length > 0 ||
          values.difficulty ||
          previewDescription ||
          hasVideoUrl,
      ),
    [
      equipmentTags.length,
      hasVideoUrl,
      muscleTags.length,
      previewDescription,
      values.difficulty,
      values.name,
    ],
  );

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErr(null);
    setSaving(true);
    setErrors({});

    const parsed = ExerciseFormSchema.safeParse(values);
    if (!parsed.success) {
      const fieldErrors: Partial<Record<keyof ExerciseFormValues, string>> = {};
      for (const issue of parsed.error.issues) {
        const path = issue.path[0] as keyof ExerciseFormValues | undefined;
        if (path) fieldErrors[path] = issue.message;
      }
      setErrors(fieldErrors);
      setSaving(false);
      setSnack({ open: true, msg: messages.validationError, sev: 'error' });
      return;
    }

    const payload = parsed.data;

    try {
      await submit(payload);
      setSnack({
        open: true,
        msg: mode === 'edit' ? messages.successEdit : messages.successCreate,
        sev: 'success',
      });
      onSuccess?.();
    } catch (error: any) {
      setErr(error?.message || messages.errorGeneric);
      setSnack({ open: true, msg: messages.errorGeneric, sev: 'error' });
    } finally {
      setSaving(false);
    }
  }

  const heroBackground = React.useMemo(
    () =>
      theme.palette.mode === 'dark'
        ? 'linear-gradient(140deg, rgba(84, 112, 255, 0.22) 0%, rgba(30, 64, 175, 0.32) 48%, rgba(12, 32, 92, 0.75) 100%)'
        : 'linear-gradient(140deg, rgba(180, 224, 255, 0.7) 0%, rgba(135, 176, 255, 0.42) 52%, rgba(255, 255, 255, 0.95) 100%)',
    [theme],
  );

  const previewBorder = alpha(theme.palette.secondary.main, theme.palette.mode === 'dark' ? 0.34 : 0.2);
  const previewBackground =
    theme.palette.mode === 'dark'
      ? 'linear-gradient(155deg, rgba(14, 24, 54, 0.92) 0%, rgba(18, 33, 68, 0.9) 50%, rgba(9, 18, 39, 0.94) 100%)'
      : 'linear-gradient(155deg, rgba(255, 255, 255, 0.98) 0%, rgba(233, 238, 255, 0.92) 54%, rgba(255, 255, 255, 0.98) 100%)';

  return (
    <Box component="form" onSubmit={onSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 4, width: '100%' }}>
      <Paper
        variant="outlined"
        sx={{
          position: 'relative',
          overflow: 'hidden',
          borderRadius: 4,
          p: { xs: 3, sm: 3.5, md: 4 },
          borderColor: alpha(theme.palette.primary.main, theme.palette.mode === 'dark' ? 0.38 : 0.22),
          backgroundImage: heroBackground,
          boxShadow:
            theme.palette.mode === 'dark'
              ? '0 40px 90px rgba(4, 16, 44, 0.6)'
              : '0 40px 90px rgba(60, 98, 255, 0.22)',
        }}
      >
        <Stack spacing={3}>
          <Stack spacing={1.5}>
            <Chip
              label={mode === 'edit' ? 'Edição avançada' : 'Nova entrada global'}
              color="primary"
              sx={{
                alignSelf: 'flex-start',
                fontWeight: 600,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                backgroundColor: alpha(theme.palette.primary.main, theme.palette.mode === 'dark' ? 0.4 : 0.85),
                color: theme.palette.primary.contrastText,
              }}
            />
            <Typography variant="h4" fontWeight={800} sx={{ letterSpacing: '-0.02em' }}>
              {mode === 'edit' ? copy.titleEdit : copy.titleCreate}
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 720 }}>
              {copy.subtitle}
            </Typography>
          </Stack>

          <Grid container spacing={2}>
            {HERO_HIGHLIGHTS.map((highlight) => {
              const Icon = highlight.icon;
              return (
                <Grid item xs={12} sm={4} key={highlight.key}>
                  <Stack direction="row" spacing={1.5} alignItems="center">
                    <Box
                      sx={{
                        width: 48,
                        height: 48,
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: alpha(theme.palette.primary.main, theme.palette.mode === 'dark' ? 0.32 : 0.24),
                        color: theme.palette.primary.contrastText,
                        boxShadow:
                          theme.palette.mode === 'dark'
                            ? '0 18px 42px rgba(8, 20, 48, 0.55)'
                            : '0 18px 38px rgba(70, 104, 255, 0.18)',
                      }}
                    >
                      <Icon fontSize="small" />
                    </Box>
                    <Stack spacing={0.5}>
                      <Typography variant="subtitle2" fontWeight={700}>
                        {highlight.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {highlight.description}
                      </Typography>
                    </Stack>
                  </Stack>
                </Grid>
              );
            })}
          </Grid>
        </Stack>
      </Paper>

      {err ? <Alert severity="error">{err}</Alert> : null}

      <Grid container spacing={{ xs: 3, md: 4 }} alignItems="stretch">
        <Grid item xs={12} lg={7}>
          <Paper
            variant="outlined"
            sx={{
              borderRadius: 4,
              p: { xs: 3, sm: 3.5 },
              display: 'flex',
              flexDirection: 'column',
              gap: { xs: 3, sm: 3.5 },
              height: '100%',
              borderColor: alpha(theme.palette.primary.main, theme.palette.mode === 'dark' ? 0.28 : 0.16),
            }}
          >
            <Stack spacing={{ xs: 3, sm: 3.5 }} flexGrow={1}>
              <FormSection
                title="Informação principal"
                subtitle="Garante um nome claro – será como atletas e colegas encontram o exercício."
              >
                <TextField
                  label="Nome"
                  value={values.name}
                  onChange={(e) => setField('name', e.target.value)}
                  required
                  placeholder="Agachamento com barra"
                  error={Boolean(errors.name)}
                  helperText={errors.name ?? copy.nameHelper}
                  fullWidth
                />
              </FormSection>

              <FormSection
                title="Classificação e tags"
                subtitle="Usa vírgulas para adicionar várias tags de uma só vez (ex.: Peito, Ombros)."
              >
                <Stack spacing={2.5}>
                  <Grid
                    container
                    spacing={2}
                    sx={{
                      alignItems: 'stretch',
                      '& .MuiGrid-item': {
                        display: 'flex',
                      },
                    }}
                  >
                    <Grid item xs={12} sm={6}>
                      <Stack spacing={1.25} sx={{ width: '100%' }}>
                        <TextField
                          label="Grupo muscular"
                          value={values.muscle_group ?? ''}
                          onChange={(e) => setField('muscle_group', e.target.value)}
                          placeholder="Pernas, Peito, Costas…"
                          error={Boolean(errors.muscle_group)}
                          helperText={errors.muscle_group ?? copy.muscleHelper}
                          fullWidth
                        />
                        {muscleTags.length > 0 && (
                          <TagPreview label="Tags sugeridas" items={muscleTags} />
                        )}
                      </Stack>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Stack spacing={1.25} sx={{ width: '100%' }}>
                        <TextField
                          label="Equipamento"
                          value={values.equipment ?? ''}
                          onChange={(e) => setField('equipment', e.target.value)}
                          placeholder="Barra, máquina, halteres…"
                          error={Boolean(errors.equipment)}
                          helperText={errors.equipment ?? copy.equipmentHelper}
                          fullWidth
                        />
                        {equipmentTags.length > 0 && (
                          <TagPreview label="Material" items={equipmentTags} />
                        )}
                      </Stack>
                    </Grid>
                  </Grid>

                  <Stack spacing={1.5}>
                    <Stack spacing={0.5}>
                      <Typography variant="subtitle2" fontWeight={600}>
                        Dificuldade
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {copy.difficultyHelper}
                      </Typography>
                    </Stack>
                    <ToggleButtonGroup
                      color="primary"
                      exclusive
                      fullWidth
                      value={values.difficulty ?? null}
                      onChange={(_, newValue: Difficulty | null) => {
                        if (!newValue) {
                          setField('difficulty', undefined);
                          return;
                        }
                        setField('difficulty', newValue);
                      }}
                      sx={{
                        '& .MuiToggleButton-root': {
                          flex: 1,
                          minWidth: 0,
                          textTransform: 'none',
                          py: 1.2,
                          borderRadius: 2,
                        },
                        gap: 1,
                        display: 'flex',
                      }}
                    >
                      {DIFFICULTY_OPTIONS.map((option) => (
                        <ToggleButton key={option} value={option}>
                          {option}
                        </ToggleButton>
                      ))}
                    </ToggleButtonGroup>
                    <Typography variant="caption" color={errors.difficulty ? 'error' : 'text.secondary'}>
                      {errors.difficulty ?? 'Opcional — deixa em branco se não fizer sentido classificar.'}
                    </Typography>
                  </Stack>
                </Stack>
              </FormSection>

              <FormSection
                title="Detalhes e instruções"
                subtitle="Resume séries, repetições, ritmo, notas de execução e pontos de atenção."
              >
                <Stack spacing={2}>
                  <TextField
                    label="Instruções"
                    value={values.description ?? ''}
                    onChange={(e) => setField('description', e.target.value)}
                    placeholder="Notas, séries, repetições, técnica…"
                    multiline
                    minRows={4}
                    maxRows={8}
                    error={Boolean(errors.description)}
                    helperText={
                      errors.description ?? (
                        <Stack direction="row" justifyContent="space-between" alignItems="baseline">
                          <span>{copy.descriptionHelper}</span>
                          <Typography component="span" variant="caption" color="text.secondary">
                            {descriptionLength} caractere{descriptionLength === 1 ? '' : 's'}
                          </Typography>
                        </Stack>
                      )
                    }
                    fullWidth
                  />

                  <TextField
                    label="Vídeo (URL)"
                    value={values.video_url ?? ''}
                    onChange={(e) => setField('video_url', e.target.value)}
                    placeholder="https://…"
                    error={Boolean(errors.video_url)}
                    helperText={errors.video_url ?? copy.videoHelper}
                    fullWidth
                  />
                </Stack>
              </FormSection>
            </Stack>

            <Divider sx={{ borderColor: alpha(theme.palette.primary.main, theme.palette.mode === 'dark' ? 0.18 : 0.12) }} />

            <Stack
              direction={{ xs: 'column-reverse', sm: 'row' }}
              spacing={1.5}
              justifyContent="flex-end"
              alignItems={{ xs: 'stretch', sm: 'center' }}
            >
              <Button
                type="button"
                onClick={handleCancel}
                disabled={saving}
                variant="text"
                sx={{ width: { xs: '100%', sm: 'auto' }, fontWeight: 600 }}
              >
                {copy.cancelLabel}
              </Button>
              <Button
                variant="contained"
                type="submit"
                disabled={saving}
                sx={{ minWidth: { sm: 200 }, width: { xs: '100%', sm: 'auto' } }}
              >
                {saving
                  ? mode === 'edit'
                    ? copy.updatingLabel
                    : copy.creatingLabel
                  : mode === 'edit'
                  ? copy.updateLabel
                  : copy.createLabel}
              </Button>
            </Stack>
          </Paper>
        </Grid>

        <Grid item xs={12} lg={5}>
          <Paper
            variant="outlined"
            sx={{
              borderRadius: 4,
              p: { xs: 3, sm: 3.5 },
              display: 'flex',
              flexDirection: 'column',
              gap: 2.5,
              height: '100%',
              position: { lg: 'sticky' },
              top: { lg: 24 },
              borderColor: previewBorder,
              backgroundImage: previewBackground,
            }}
          >
            <Stack spacing={0.75}>
              <Chip
                label="Pré-visualização"
                color="secondary"
                sx={{
                  alignSelf: 'flex-start',
                  fontWeight: 600,
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  backgroundColor: alpha(theme.palette.secondary.main, theme.palette.mode === 'dark' ? 0.45 : 0.85),
                  color: theme.palette.secondary.contrastText,
                }}
              />
              <Typography variant="h6" fontWeight={700}>
                Como ficará na biblioteca
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Atualizada em tempo real para validar se a descrição e as tags estão completas.
              </Typography>
            </Stack>

            <Box
              sx={{
                flexGrow: 1,
                borderRadius: 3,
                border: '1px dashed',
                borderColor: hasPreviewContent
                  ? alpha(theme.palette.primary.main, theme.palette.mode === 'dark' ? 0.5 : 0.32)
                  : alpha(theme.palette.text.disabled, theme.palette.mode === 'dark' ? 0.32 : 0.24),
                backgroundColor: alpha(theme.palette.background.default, theme.palette.mode === 'dark' ? 0.18 : 0.12),
                p: { xs: 2.5, sm: 3 },
                display: 'flex',
                flexDirection: 'column',
                gap: 2,
                justifyContent: hasPreviewContent ? 'flex-start' : 'center',
                alignItems: hasPreviewContent ? 'stretch' : 'center',
                textAlign: hasPreviewContent ? 'left' : 'center',
              }}
            >
              {hasPreviewContent ? (
                <Stack spacing={2}>
                  <Stack spacing={0.75}>
                    <Typography variant="h6" fontWeight={700}>
                      {values.name || 'Sem nome'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {previewDescription || copy.previewInstructionsFallback}
                    </Typography>
                  </Stack>

                  <Stack direction="row" spacing={1} rowGap={1} flexWrap="wrap">
                    {muscleTags.map((tag) => (
                      <Chip key={`prev-muscle-${tag}`} label={tag} size="small" color="primary" variant="outlined" />
                    ))}
                    {equipmentTags.map((tag) => (
                      <Chip key={`prev-equipment-${tag}`} label={tag} size="small" color="secondary" variant="outlined" />
                    ))}
                    {values.difficulty && (
                      <Chip key="prev-difficulty" label={values.difficulty} size="small" variant="outlined" />
                    )}
                  </Stack>

                  {hasVideoUrl ? (
                    <Button
                      variant="outlined"
                      color="primary"
                      href={primaryVideoUrl}
                      target="_blank"
                      rel="noreferrer"
                    >
                      {copy.previewCta}
                    </Button>
                  ) : null}

                  {hasVideoUrl ? (
                    <Box
                      sx={{
                        position: 'relative',
                        borderRadius: 2.5,
                        overflow: 'hidden',
                        border: '1px solid',
                        borderColor: alpha(theme.palette.primary.main, theme.palette.mode === 'dark' ? 0.35 : 0.18),
                        backgroundColor: 'background.default',
                        '&::after': {
                          content: '""',
                          display: 'block',
                          paddingTop: '56.25%',
                        },
                      }}
                    >
                      {previewMedia.kind === 'image' && (
                        <Box
                          component="img"
                          src={previewMedia.src}
                          alt={values.name ? `Pré-visualização de ${values.name}` : 'Pré-visualização do exercício'}
                          sx={{
                            position: 'absolute',
                            inset: 0,
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                          }}
                        />
                      )}
                      {previewMedia.kind === 'video' && (
                        <Box
                          component="video"
                          src={previewMedia.src}
                          autoPlay
                          loop
                          muted
                          playsInline
                          controls
                          sx={{
                            position: 'absolute',
                            inset: 0,
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                          }}
                        />
                      )}
                      {previewMedia.kind === 'embed' && (
                        <Box
                          component="iframe"
                          src={previewMedia.src}
                          title={values.name || 'Pré-visualização do exercício'}
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                          sx={{
                            position: 'absolute',
                            inset: 0,
                            width: '100%',
                            height: '100%',
                            border: 0,
                          }}
                        />
                      )}
                    </Box>
                  ) : (
                    <Typography variant="caption" color="text.secondary">
                      Partilha um link de vídeo para reforçar a explicação (opcional).
                    </Typography>
                  )}
                </Stack>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  {copy.emptyPreview}
                </Typography>
              )}
            </Box>
          </Paper>
        </Grid>
      </Grid>

      <Snackbar open={snack.open} autoHideDuration={3000} onClose={closeSnack}>
        <Alert severity={snack.sev} variant="filled" onClose={closeSnack} sx={{ width: '100%' }}>
          {snack.msg}
        </Alert>
      </Snackbar>
    </Box>
  );
}
