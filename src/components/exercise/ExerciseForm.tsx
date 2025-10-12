'use client';

import * as React from 'react';
import {
  Alert,
  Box,
  Button,
  Chip,
  Divider,
  Grid,
  MenuItem,
  Paper,
  Snackbar,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import {
  DIFFICULTY_OPTIONS,
  ExerciseFormSchema,
  type ExerciseFormValues,
  type Difficulty,
  normalizeDifficulty,
} from '@/lib/exercises/schema';

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
  titleCreate: '➕ Novo exercício',
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

  const closeSnack = () => setSnack((s) => ({ ...s, open: false }));

  function setField<K extends keyof ExerciseFormValues>(key: K, value: ExerciseFormValues[K]) {
    setValues((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  }

  const handleCancel = React.useCallback(() => {
    if (onCancel) {
      onCancel();
      return;
    }

    if (typeof window !== 'undefined') {
      window.history.back();
    }
  }, [onCancel]);

  const hasVideoUrl = React.useMemo(() => isValidHttpUrl(values.video_url ?? ''), [values.video_url]);
  const previewDescription = React.useMemo(() => values.description?.trim() ?? '', [values.description]);
  const hasPreviewContent = React.useMemo(
    () =>
      Boolean(
        values.name ||
          values.muscle_group ||
          values.equipment ||
          values.difficulty ||
          previewDescription ||
          hasVideoUrl,
      ),
    [hasVideoUrl, previewDescription, values.difficulty, values.equipment, values.muscle_group, values.name],
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
        <Grid container spacing={{ xs: 2, md: 3 }} alignItems="stretch">
          <Grid item xs={12} md={7}>
            <Stack spacing={{ xs: 2, md: 2.5 }}>
              <TextField
                label="Nome"
                value={values.name}
                onChange={(e) => setField('name', e.target.value)}
                required
                placeholder="Agachamento com barra"
                error={Boolean(errors.name)}
                helperText={errors.name ?? copy.nameHelper}
                autoFocus
                fullWidth
              />

              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Grupo muscular"
                    value={values.muscle_group ?? ''}
                    onChange={(e) => setField('muscle_group', e.target.value)}
                    placeholder="Pernas, Peito, Costas…"
                    error={Boolean(errors.muscle_group)}
                    helperText={errors.muscle_group ?? copy.muscleHelper}
                    fullWidth
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Equipamento"
                    value={values.equipment ?? ''}
                    onChange={(e) => setField('equipment', e.target.value)}
                    placeholder="Barra, máquina, halteres…"
                    error={Boolean(errors.equipment)}
                    helperText={errors.equipment ?? copy.equipmentHelper}
                    fullWidth
                  />
                </Grid>
              </Grid>

              <TextField
                select
                label="Dificuldade"
                value={values.difficulty ?? ''}
                onChange={(event) =>
                  setField('difficulty', (event.target.value || undefined) as Difficulty | undefined)
                }
                helperText={errors.difficulty ?? copy.difficultyHelper}
                error={Boolean(errors.difficulty)}
                fullWidth
              >
                <MenuItem value="">Sem dificuldade definida</MenuItem>
                {DIFFICULTY_OPTIONS.map((option) => (
                  <MenuItem key={option} value={option}>
                    {option}
                  </MenuItem>
                ))}
              </TextField>

              <TextField
                label="Instruções"
                value={values.description ?? ''}
                onChange={(e) => setField('description', e.target.value)}
                placeholder="Notas, séries, repetições, técnica…"
                multiline
                minRows={4}
                maxRows={8}
                error={Boolean(errors.description)}
                helperText={errors.description ?? copy.descriptionHelper}
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
          </Grid>

          <Grid item xs={12} md={5}>
            <Stack spacing={2} sx={{ height: '100%' }}>
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
                        {values.muscle_group && (
                          <Chip label={values.muscle_group} color="default" size="small" variant="outlined" />
                        )}
                        {values.equipment && (
                          <Chip label={values.equipment} color="default" size="small" variant="outlined" />
                        )}
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
                      <Button
                        component="a"
                        href={values.video_url ?? '#'}
                        target="_blank"
                        rel="noreferrer"
                        variant="outlined"
                        size="small"
                      >
                        {copy.previewCta}
                      </Button>
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

function isValidHttpUrl(url: string) {
  if (!url) return false;
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}
