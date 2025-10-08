'use client';

import * as React from 'react';
import {
  Box, Stack, TextField, MenuItem, Button, Alert, Snackbar, FormControlLabel, Switch,
} from '@mui/material';
import { z } from 'zod';
import { useRouter, useSearchParams } from 'next/navigation';

export type PlanValues = {
  id?: string;
  name: string;
  description?: string;
  difficulty?: 'Fácil' | 'Média' | 'Difícil';
  duration_weeks?: number | null;
  is_public?: boolean;
};

export function mapRow(r: any): PlanValues {
  return {
    id: String(r.id),
    name: (r.name ?? r.title ?? '') as string,
    description: (r.description ?? r.details ?? '') as string,
    difficulty: (r.difficulty ?? r.level ?? '') || undefined,
    duration_weeks: (r.duration_weeks ?? r.duration ?? null) as number | null,
    is_public: Boolean(r.is_public ?? r.public ?? false),
  };
}

// Zod compatível com versões antigas (sem required_error)
const Diff = z.union([z.literal('Fácil'), z.literal('Média'), z.literal('Difícil')]);
const PlanSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, 'Nome é obrigatório').min(2, 'Nome muito curto'),
  description: z.string().optional(),
  difficulty: Diff.optional(),
  duration_weeks: z.coerce.number().int().positive().max(104).optional().nullable(),
  is_public: z.boolean().optional(),
});

export default function PlanFormClient({
  mode,
  initial,
}: {
  mode: 'create' | 'edit';
  initial?: Partial<PlanValues>;
}) {
  const router = useRouter();
  const qs = useSearchParams();

  const [values, setValues] = React.useState<PlanValues>(() => ({
    id: initial?.id,
    name: initial?.name ?? '',
    description: initial?.description ?? '',
    difficulty: (initial?.difficulty as any) ?? undefined,
    duration_weeks: initial?.duration_weeks ?? null,
    is_public: Boolean(initial?.is_public ?? false),
  }));

  const [errors, setErrors] = React.useState<Partial<Record<keyof PlanValues, string>>>({});
  const [saving, setSaving] = React.useState(false);
  const [err, setErr] = React.useState<string | null>(null);
  const [snack, setSnack] = React.useState<{ open: boolean; msg: string; sev: 'success' | 'error' | 'info' | 'warning' }>({
    open: false, msg: '', sev: 'success',
  });
  const closeSnack = () => setSnack((s) => ({ ...s, open: false }));

  function setField<K extends keyof PlanValues>(k: K, v: PlanValues[K]) {
    setValues((prev) => ({ ...prev, [k]: v }));
    setErrors((prev) => ({ ...prev, [k]: undefined }));
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErr(null); setSaving(true); setErrors({});

    const parsed = PlanSchema.safeParse(values);
    if (!parsed.success) {
      const fieldErrors: Partial<Record<keyof PlanValues, string>> = {};
      for (const issue of parsed.error.issues) {
        const p = issue.path[0] as keyof PlanValues | undefined;
        if (p) fieldErrors[p] = issue.message;
      }
      setErrors(fieldErrors);
      setSaving(false);
      setSnack({ open: true, msg: 'Verifique os campos destacados.', sev: 'error' });
      return;
    }

    const payload = parsed.data;

    try {
      let res: Response;
      if (mode === 'edit' && payload.id) {
        res = await fetch(`/api/admin/plans/${payload.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      } else {
        res = await fetch('/api/admin/plans', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      }

      if (!res.ok) throw new Error((await res.text()) || 'Falha ao gravar');
      setSnack({ open: true, msg: mode === 'edit' ? 'Plano atualizado ✅' : 'Plano criado ✅', sev: 'success' });

      // redireciona: se o utilizador abriu em nova aba via preset (não aplicável aqui), mantinha-se;
      // aqui simplesmente voltamos à lista.
      router.push('/dashboard/admin/plans');
    } catch (e: any) {
      setErr(e?.message || 'Falha ao gravar plano');
      setSnack({ open: true, msg: 'Erro ao gravar', sev: 'error' });
    } finally {
      setSaving(false);
    }
  }

  return (
    <Box sx={{ display: 'grid', gap: 2 }}>
      <Box component="form" onSubmit={onSubmit} sx={{ display: 'grid', gap: 2 }}>
        {err && <Alert severity="error">{err}</Alert>}

        <TextField
          label="Nome"
          value={values.name}
          onChange={(e) => setField('name', e.target.value)}
          required
          error={Boolean(errors.name)}
          helperText={errors.name || ' '}
        />

        <TextField
          label="Descrição"
          value={values.description ?? ''}
          onChange={(e) => setField('description', e.target.value)}
          multiline
          minRows={3}
          error={Boolean((errors as any).description)}
          helperText={(errors as any).description || ' '}
        />

        <TextField
          select
          label="Dificuldade"
          value={values.difficulty ?? ''}
          onChange={(e) => setField('difficulty', (e.target.value || undefined) as PlanValues['difficulty'])}
          helperText="Opcional"
        >
          <MenuItem value="">—</MenuItem>
          <MenuItem value="Fácil">Fácil</MenuItem>
          <MenuItem value="Média">Média</MenuItem>
          <MenuItem value="Difícil">Difícil</MenuItem>
        </TextField>

        <TextField
          type="number"
          label="Duração (semanas)"
          value={values.duration_weeks ?? ''}
          onChange={(e) => setField('duration_weeks', e.target.value === '' ? null : Number(e.target.value))}
          inputProps={{ min: 1, max: 104 }}
          helperText="Opcional (1–104)"
        />

        <FormControlLabel
          control={<Switch checked={Boolean(values.is_public)} onChange={(e) => setField('is_public', e.target.checked)} />}
          label="Plano público"
        />

        <Stack direction="row" spacing={1} justifyContent="flex-end">
          <Button type="button" onClick={() => history.back()} disabled={saving}>Cancelar</Button>
          <Button variant="contained" type="submit" disabled={saving}>
            {saving ? (mode === 'edit' ? 'A atualizar…' : 'A criar…') : (mode === 'edit' ? 'Guardar alterações' : 'Criar plano')}
          </Button>
        </Stack>
      </Box>

      {/* Editor de exercícios apenas quando já existe ID (modo editar) */}
      {mode === 'edit' && values.id && (
        <React.Suspense fallback={null}>
          {/* import dinâmico para evitar pesar a página de "Novo" */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <Box sx={{ mt: 1 }}>
            {React.createElement(require('./PlanExercisesEditor').default, { planId: values.id })}
          </Box>
        </React.Suspense>
      )}

      <Snackbar open={snack.open} autoHideDuration={3000} onClose={closeSnack}>
        <Alert severity={snack.sev} variant="filled" onClose={closeSnack} sx={{ width: '100%' }}>
          {snack.msg}
        </Alert>
      </Snackbar>
    </Box>
  );
}