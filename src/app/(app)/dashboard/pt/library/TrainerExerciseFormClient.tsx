'use client';

import * as React from 'react';
import {
  Box,
  Stack,
  TextField,
  MenuItem,
  Button,
  Snackbar,
  Alert,
  Typography,
} from '@mui/material';
import {
  DIFFICULTY_OPTIONS,
  ExerciseFormSchema,
  type ExerciseFormValues,
  type Difficulty,
  normalizeDifficulty,
} from '@/lib/exercises/schema';

interface Props {
  mode: 'create' | 'edit';
  initial?: Partial<ExerciseFormValues>;
  onSuccess?: () => void;
}

export default function TrainerExerciseFormClient({ mode, initial, onSuccess }: Props) {
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
  const [snack, setSnack] = React.useState<{ open: boolean; msg: string; sev: 'success' | 'error' | 'info' | 'warning' }>(
    { open: false, msg: '', sev: 'success' },
  );

  function setField<K extends keyof ExerciseFormValues>(k: K, v: ExerciseFormValues[K]) {
    setValues((prev) => ({ ...prev, [k]: v }));
    setErrors((prev) => ({ ...prev, [k]: undefined }));
  }

  const closeSnack = () => setSnack((s) => ({ ...s, open: false }));

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
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
      setSnack({ open: true, msg: 'Revê os campos destacados.', sev: 'error' });
      return;
    }

    const payload = parsed.data;

    try {
      let res: Response;
      if (mode === 'edit' && payload.id) {
        res = await fetch(`/api/pt/library/exercises/${payload.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: payload.name,
            muscle_group: payload.muscle_group ?? null,
            equipment: payload.equipment ?? null,
            difficulty: payload.difficulty ?? null,
            description: payload.description ?? null,
            video_url: payload.video_url ?? null,
          }),
        });
      } else {
        res = await fetch('/api/pt/library/exercises', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: payload.name,
            muscle_group: payload.muscle_group ?? null,
            equipment: payload.equipment ?? null,
            difficulty: payload.difficulty ?? null,
            description: payload.description ?? null,
            video_url: payload.video_url ?? null,
          }),
        });
      }

      if (!res.ok) {
        const msg = (await res.text()) || 'Falha ao gravar exercício';
        throw new Error(msg);
      }

      setSnack({
        open: true,
        msg: mode === 'edit' ? 'Exercício atualizado ✅' : 'Exercício criado ✅',
        sev: 'success',
      });
      onSuccess?.();
    } catch (e: any) {
      setErr(e?.message || 'Falha ao gravar exercício');
      setSnack({ open: true, msg: 'Erro ao gravar', sev: 'error' });
    } finally {
      setSaving(false);
    }
  }

  return (
    <Box component="form" onSubmit={onSubmit} sx={{ display: 'grid', gap: 2 }}>
      <Typography variant="h6" fontWeight={800}>
        {mode === 'edit' ? '✏️ Editar exercício' : '➕ Novo exercício'}
      </Typography>

      {err && <Alert severity="error">{err}</Alert>}

      <TextField
        label="Nome"
        value={values.name}
        onChange={(e) => setField('name', e.target.value)}
        required
        placeholder="Agachamento"
        error={Boolean(errors.name)}
        helperText={errors.name || ' '}
      />

      <TextField
        label="Grupo muscular"
        value={values.muscle_group ?? ''}
        onChange={(e) => setField('muscle_group', e.target.value)}
        placeholder="Pernas / Peito / Costas…"
        error={Boolean(errors.muscle_group)}
        helperText={errors.muscle_group || ' '}
      />

      <TextField
        label="Equipamento"
        value={values.equipment ?? ''}
        onChange={(e) => setField('equipment', e.target.value)}
        placeholder="Barra, Máquina, Halteres…"
        error={Boolean(errors.equipment)}
        helperText={errors.equipment || ' '}
      />

      <TextField
        select
        label="Dificuldade"
        value={values.difficulty ?? ''}
        onChange={(e) => setField('difficulty', (e.target.value || undefined) as Difficulty | undefined)}
        helperText={errors.difficulty || ' '}
        error={Boolean(errors.difficulty)}
      >
        <MenuItem value="">(sem dificuldade)</MenuItem>
        {DIFFICULTY_OPTIONS.map((d) => (
          <MenuItem key={d} value={d}>
            {d}
          </MenuItem>
        ))}
      </TextField>

      <TextField
        label="Instruções"
        value={values.description ?? ''}
        onChange={(e) => setField('description', e.target.value)}
        placeholder="Notas / execução / séries…"
        multiline
        minRows={3}
        error={Boolean(errors.description)}
        helperText={errors.description || ' '}
      />

      <TextField
        label="Vídeo (URL)"
        value={values.video_url ?? ''}
        onChange={(e) => setField('video_url', e.target.value)}
        placeholder="https://…"
        error={Boolean(errors.video_url)}
        helperText={errors.video_url || ' '}
      />

      <Stack direction="row" spacing={1} justifyContent="flex-end">
        <Button type="button" onClick={() => history.back()} disabled={saving}>
          Cancelar
        </Button>
        <Button variant="contained" type="submit" disabled={saving}>
          {saving ? (mode === 'edit' ? 'A atualizar…' : 'A criar…') : mode === 'edit' ? 'Guardar alterações' : 'Criar exercício'}
        </Button>
      </Stack>

      <Snackbar open={snack.open} autoHideDuration={3000} onClose={closeSnack}>
        <Alert severity={snack.sev} variant="filled" onClose={closeSnack} sx={{ width: '100%' }}>
          {snack.msg}
        </Alert>
      </Snackbar>
    </Box>
  );
}
