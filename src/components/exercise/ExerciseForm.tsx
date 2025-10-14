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
  return (
    <Stack spacing={1.5}>
      <Stack spacing={0.5}>
        <Typography
          variant="overline"
          color="primary"
          fontWeight={700}
          sx={{ letterSpacing: 1, textTransform: 'uppercase' }}
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
  );
}

type TagPreviewProps = { label: string; items: string[] };

function TagPreview({ label, items }: TagPreviewProps) {
  if (items.length === 0) return null;
  return (
    <Stack spacing={0.5}>
      <Typography variant="caption" color="text.secondary" fontWeight={600} textTransform="uppercase">
        {label}
      </Typography>
      <Stack direction="row" spacing={0.5} rowGap={0.5} flexWrap="wrap">
        {items.map((tag) => (
          <Chip key={`${label}-${tag}`} label={tag} size="small" variant="outlined" />
        ))}
      </Stack>
    </Stack>
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

  return (
    <Box component="form" onSubmit={onSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 3, width: '100%' }}>
      <Stack spacing={0.5}>
        <Typography variant="h6" fontWeight={800}>
          {mode === 'edit' ? copy.titleEdit : copy.titleCreate}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {copy.subtitle}
        </Typography>
      </Stack>

      {err && <Alert severity="error">{err}</Alert>}

      <Paper variant="outlined" sx={{ p: { xs: 2, md: 3 }, borderRadius: 3, borderColor: 'divider' }}>
        <Grid container spacing={{ xs: 3, md: 4 }} alignItems="stretch">
          <Grid item xs={12} md={7}>
            <Stack spacing={{ xs: 3, md: 4 }}>
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
                <Stack spacing={2}>
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
                      <Stack spacing={1} sx={{ width: '100%' }}>
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
                      <Stack spacing={1} sx={{ width: '100%' }}>
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

                  <Stack spacing={1.25}>
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
                          py: 1.25,
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
          </Grid>

          <Grid item xs={12} md={5}>
            <Stack
              spacing={2}
              sx={{
                height: '100%',
                position: { md: 'sticky' },
                top: { md: 24 },
              }}
            >
              <Stack spacing={0.5}>
                <Typography variant="subtitle1" fontWeight={600}>
                  Pré-visualização rápida
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Atualizada em tempo real para te ajudar a validar se a descrição está completa.
                </Typography>
              </Stack>

              <Paper
                variant="outlined"
                sx={{
                  flexGrow: 1,
                  p: { xs: 2, sm: 2.5 },
                  borderRadius: 2,
                  borderStyle: 'dashed',
                  borderColor: hasPreviewContent ? 'divider' : 'action.disabledBackground',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 1.5,
                  justifyContent: hasPreviewContent ? 'flex-start' : 'center',
                  textAlign: hasPreviewContent ? 'left' : 'center',
                }}
              >
                {hasPreviewContent ? (
                  <Stack spacing={1.5}>
                    <Stack spacing={0.5}>
                      <Typography variant="h6" fontWeight={700} sx={{ wordBreak: 'break-word' }}>
                        {values.name || 'Exercício sem nome'}
                      </Typography>
                      <Stack direction="row" spacing={1} flexWrap="wrap">
                        {values.difficulty && <Chip label={values.difficulty} color="primary" size="small" />}
                        {muscleTags.map((tag) => (
                          <Chip key={`muscle-${tag}`} label={tag} color="default" size="small" variant="outlined" />
                        ))}
                        {equipmentTags.map((tag) => (
                          <Chip key={`equipment-${tag}`} label={tag} color="default" size="small" variant="outlined" />
                        ))}
                      </Stack>
                    </Stack>

                    {previewDescription ? (
                      <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                        {previewDescription}
                      </Typography>
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        {copy.previewInstructionsFallback}
                      </Typography>
                    )}

                    <Divider sx={{ borderStyle: 'dashed' }} />

                    {hasVideoUrl ? (
                      <Box
                        sx={{
                          position: 'relative',
                          borderRadius: 2,
                          overflow: 'hidden',
                          border: '1px solid',
                          borderColor: 'divider',
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
              </Paper>
            </Stack>
          </Grid>
        </Grid>

        <Divider sx={{ my: { xs: 2, md: 3 } }} />

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
            sx={{ width: { xs: '100%', sm: 'auto' } }}
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

      <Snackbar open={snack.open} autoHideDuration={3000} onClose={closeSnack}>
        <Alert severity={snack.sev} variant="filled" onClose={closeSnack} sx={{ width: '100%' }}>
          {snack.msg}
        </Alert>
      </Snackbar>
    </Box>
  );
}

