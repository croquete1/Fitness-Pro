'use client';

import * as React from 'react';
import {
  Box, Stack, TextField, MenuItem, Button, Alert, Snackbar, Typography, Autocomplete, CircularProgress,
} from '@mui/material';
import { z } from 'zod';

type DifficultyNever = never; // apenas para manter coerência com outros módulos

export type SessionFormValues = {
  id?: string;
  trainer_id?: string;
  client_id?: string;
  start_time: string; // ISO
  end_time: string;   // ISO
  status?: 'scheduled' | 'completed' | 'cancelled';
  location?: string;
  notes?: string;
};

const StatusOpts: Array<NonNullable<SessionFormValues['status']>> = [
  'scheduled', 'completed', 'cancelled',
];

// ===== Zod (sem required_error; validações encadeadas) =====
const SessionSchema = z.object({
  id: z.string().optional(),
  trainer_id: z.string().min(1, 'Selecione um PT'),
  client_id: z.string().min(1, 'Selecione um cliente'),
  start_time: z.string().min(1, 'Início é obrigatório'),
  end_time: z.string().min(1, 'Fim é obrigatório'),
  status: z.enum(StatusOpts as [SessionFormValues['status'], ...SessionFormValues['status'][]]).optional(),
  location: z.string().optional().nullable().transform((v) => (v ?? '') || undefined),
  notes: z.string().optional().nullable().transform((v) => (v ?? '') || undefined),
}).refine((val) => {
  const s = new Date(val.start_time).getTime();
  const e = new Date(val.end_time).getTime();
  return Number.isFinite(s) && Number.isFinite(e) && e > s;
}, { path: ['end_time'], message: 'Hora de fim deve ser posterior ao início' });

// Helpers
function toIsoLocal(input: string | Date): string {
  const d = typeof input === 'string' ? new Date(input) : input;
  return new Date(d).toISOString();
}

async function fetchPeople(role: 'trainer' | 'client', q: string) {
  const url = `/api/admin/lookup/people?role=${role}&q=${encodeURIComponent(q)}`;
  const res = await fetch(url);
  const data = await res.json().catch(() => ({}));
  const rows = (data?.rows ?? []) as { id: string; name?: string | null; email?: string | null }[];
  return rows;
}

export default function SessionFormClient({
  mode,
  initial,
}: {
  mode: 'create' | 'edit';
  initial?: Partial<SessionFormValues>;
}) {
  const [values, setValues] = React.useState<SessionFormValues>(() => {
    const now = new Date();
    const later = new Date(now.getTime() + 60 * 60 * 1000);
    return {
      id: initial?.id,
      trainer_id: initial?.trainer_id ?? '',
      client_id: initial?.client_id ?? '',
      start_time: initial?.start_time ? toIsoLocal(initial.start_time) : toIsoLocal(now),
      end_time: initial?.end_time ? toIsoLocal(initial.end_time) : toIsoLocal(later),
      status: (initial?.status as any) ?? 'scheduled',
      location: initial?.location ?? '',
      notes: initial?.notes ?? '',
    };
  });

  const [errors, setErrors] = React.useState<Partial<Record<keyof SessionFormValues, string>>>({});
  const [saving, setSaving] = React.useState(false);
  const [err, setErr] = React.useState<string | null>(null);
  const [snack, setSnack] = React.useState<{open:boolean; msg:string; sev:'success'|'error'|'info'|'warning'}>({
    open: false, msg: '', sev: 'success',
  });
  const closeSnack = () => setSnack((s) => ({ ...s, open: false }));

  // Autocomplete state
  const [trainerInput, setTrainerInput] = React.useState('');
  const [clientInput, setClientInput] = React.useState('');
  const [trainerOpts, setTrainerOpts] = React.useState<{ id: string; name?: string | null; email?: string | null }[]>([]);
  const [clientOpts, setClientOpts] = React.useState<{ id: string; name?: string | null; email?: string | null }[]>([]);
  const [loadingTrainers, setLoadingTrainers] = React.useState(false);
  const [loadingClients, setLoadingClients] = React.useState(false);

  React.useEffect(() => {
    let alive = true;
    (async () => {
      if (trainerInput.length < 1 && !values.trainer_id) return;
      setLoadingTrainers(true);
      try {
        const rows = await fetchPeople('trainer', trainerInput);
        if (alive) setTrainerOpts(rows);
      } finally {
        if (alive) setLoadingTrainers(false);
      }
    })();
    return () => { alive = false; };
  }, [trainerInput, values.trainer_id]);

  React.useEffect(() => {
    let alive = true;
    (async () => {
      if (clientInput.length < 1 && !values.client_id) return;
      setLoadingClients(true);
      try {
        const rows = await fetchPeople('client', clientInput);
        if (alive) setClientOpts(rows);
      } finally {
        if (alive) setLoadingClients(false);
      }
    })();
    return () => { alive = false; };
  }, [clientInput, values.client_id]);

  function setField<K extends keyof SessionFormValues>(k: K, v: SessionFormValues[K]) {
    setValues((prev) => ({ ...prev, [k]: v }));
    setErrors((prev) => ({ ...prev, [k]: undefined }));
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErr(null);
    setSaving(true);
    setErrors({});

    const parsed = SessionSchema.safeParse(values);
    if (!parsed.success) {
      const fieldErrors: Partial<Record<keyof SessionFormValues, string>> = {};
      for (const issue of parsed.error.issues) {
        const path = issue.path[0] as keyof SessionFormValues | undefined;
        if (path) fieldErrors[path] = issue.message;
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
        res = await fetch(`/api/admin/pts-schedule/${payload.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            trainer_id: payload.trainer_id,
            client_id: payload.client_id,
            start_time: payload.start_time,
            end_time: payload.end_time,
            status: payload.status ?? 'scheduled',
            location: payload.location ?? null,
            notes: payload.notes ?? null,
          }),
        });
      } else {
        res = await fetch('/api/admin/pts-schedule', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            trainer_id: payload.trainer_id,
            client_id: payload.client_id,
            start_time: payload.start_time,
            end_time: payload.end_time,
            status: payload.status ?? 'scheduled',
            location: payload.location ?? null,
            notes: payload.notes ?? null,
          }),
        });
      }
      if (!res.ok) throw new Error((await res.text()) || 'Falha ao gravar sessão');

      setSnack({ open: true, msg: mode === 'edit' ? 'Sessão atualizada ✅' : 'Sessão criada ✅', sev: 'success' });
    } catch (e: any) {
      setErr(e?.message || 'Falha ao gravar sessão');
      setSnack({ open: true, msg: 'Erro ao gravar', sev: 'error' });
    } finally {
      setSaving(false);
    }
  }

  return (
    <Box component="form" onSubmit={onSubmit} sx={{ display: 'grid', gap: 2 }}>
      <Typography variant="h6" fontWeight={800}>
        {mode === 'edit' ? '✏️ Editar sessão' : '➕ Nova sessão'}
      </Typography>

      {err && <Alert severity="error">{err}</Alert>}

      {/* PT */}
      <Autocomplete
        options={trainerOpts}
        loading={loadingTrainers}
        getOptionLabel={(o) => String(o?.name || o?.email || '')}
        value={trainerOpts.find(o => o.id === values.trainer_id) ?? null}
        onInputChange={(_e, v) => setTrainerInput(v || '')}
        onChange={(_e, v) => setField('trainer_id', (v?.id ?? '') as string)}
        renderInput={(params) => (
          <TextField
            {...params}
            label="PT"
            placeholder="Nome ou email do PT"
            error={Boolean(errors.trainer_id)}
            helperText={errors.trainer_id || ' '}
            InputProps={{
              ...params.InputProps,
              endAdornment: (
                <>
                  {loadingTrainers ? <CircularProgress size={16} /> : null}
                  {params.InputProps.endAdornment}
                </>
              ),
            }}
          />
        )}
      />

      {/* Cliente */}
      <Autocomplete
        options={clientOpts}
        loading={loadingClients}
        getOptionLabel={(o) => String(o?.name || o?.email || '')}
        value={clientOpts.find(o => o.id === values.client_id) ?? null}
        onInputChange={(_e, v) => setClientInput(v || '')}
        onChange={(_e, v) => setField('client_id', (v?.id ?? '') as string)}
        renderInput={(params) => (
          <TextField
            {...params}
            label="Cliente"
            placeholder="Nome ou email do cliente"
            error={Boolean(errors.client_id)}
            helperText={errors.client_id || ' '}
            InputProps={{
              ...params.InputProps,
              endAdornment: (
                <>
                  {loadingClients ? <CircularProgress size={16} /> : null}
                  {params.InputProps.endAdornment}
                </>
              ),
            }}
          />
        )}
      />

      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
        <TextField
          fullWidth
          type="datetime-local"
          label="Início"
          value={values.start_time.slice(0, 16)}
          onChange={(e) => setField('start_time', new Date(e.target.value).toISOString())}
          InputLabelProps={{ shrink: true }}
          error={Boolean(errors.start_time)}
          helperText={errors.start_time || ' '}
        />
        <TextField
          fullWidth
          type="datetime-local"
          label="Fim"
          value={values.end_time.slice(0, 16)}
          onChange={(e) => setField('end_time', new Date(e.target.value).toISOString())}
          InputLabelProps={{ shrink: true }}
          error={Boolean(errors.end_time)}
          helperText={errors.end_time || ' '}
        />
      </Stack>

      <TextField
        select
        label="Estado"
        value={values.status ?? 'scheduled'}
        onChange={(e) => setField('status', (e.target.value || 'scheduled') as SessionFormValues['status'])}
        error={Boolean(errors.status)}
        helperText={errors.status || ' '}
      >
        {StatusOpts.map((s) => (
          <MenuItem key={s} value={s}>{s}</MenuItem>
        ))}
      </TextField>

      <TextField
        label="Local"
        value={values.location ?? ''}
        onChange={(e) => setField('location', e.target.value)}
        placeholder="Sala 2, Piso -1…"
        error={Boolean(errors.location)}
        helperText={errors.location || ' '}
      />

      <TextField
        label="Notas"
        value={values.notes ?? ''}
        onChange={(e) => setField('notes', e.target.value)}
        placeholder="Observações para o PT…"
        multiline minRows={3}
        error={Boolean(errors.notes)}
        helperText={errors.notes || ' '}
      />

      <Stack direction="row" spacing={1} justifyContent="flex-end">
        <Button type="button" onClick={() => history.back()} disabled={saving}>Cancelar</Button>
        <Button variant="contained" type="submit" disabled={saving}>
          {saving ? (mode === 'edit' ? 'A atualizar…' : 'A criar…') : (mode === 'edit' ? 'Guardar alterações' : 'Criar sessão')}
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
