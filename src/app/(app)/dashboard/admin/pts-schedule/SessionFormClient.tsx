'use client';

import * as React from 'react';
import {
  Box, Stack, TextField, Autocomplete, Button, Alert, Snackbar,
  CircularProgress, MenuItem,
} from '@mui/material';
import { useSearchParams } from 'next/navigation';
import { z } from 'zod';

/* ---------------------------------------------
 * Schema (Zod)
 * ------------------------------------------- */
const SessionSchema = z.object({
  id: z.string().optional(),
  trainer_id: z.string().min(1, 'Selecione um PT'),
  client_id: z.string().min(1, 'Selecione um cliente'),
  start_time: z.string().min(1, 'Início obrigatório'),
  end_time: z.string().min(1, 'Fim obrigatório'),
  status: z.enum(['scheduled', 'done', 'cancelled']).default('scheduled'),
  location: z.string().optional(),
  notes: z.string().optional(),
});

type Option = { id: string; name?: string | null; email?: string | null };
type Values = z.infer<typeof SessionSchema>;

type Props = {
  mode: 'create' | 'edit';
  initial?: Partial<Values>;
  /** ✅ novo: fecha dialog/refresh grelha após sucesso */
  onSuccess?: () => void;
};

export default function SessionFormClient({ mode, initial, onSuccess }: Props) {
  /* -------------------------------------------
   * State
   * ----------------------------------------- */
  const [values, setValues] = React.useState<Values>(() => ({
    id: initial?.id,
    trainer_id: initial?.trainer_id ?? '',
    client_id: initial?.client_id ?? '',
    start_time: initial?.start_time ?? '',
    end_time: initial?.end_time ?? '',
    status: (initial?.status as any) ?? 'scheduled',
    location: initial?.location ?? '',
    notes: initial?.notes ?? '',
  }));
  const [errors, setErrors] = React.useState<Partial<Record<keyof Values, string>>>({});
  const [saving, setSaving] = React.useState(false);
  const [snack, setSnack] = React.useState<{ open: boolean; msg: string; sev: 'success'|'error'|'info'|'warning' }>({
    open: false, msg: '', sev: 'success',
  });
  const closeSnack = () => setSnack((s) => ({ ...s, open: false }));

  /* -------------------------------------------
   * Prefill (?from|start|start_time, ?to|end|end_time)
   * ----------------------------------------- */
  const searchParams = useSearchParams();
  const hasPrefilledRef = React.useRef(false);

  React.useEffect(() => {
    if (hasPrefilledRef.current) return;
    const from = searchParams.get('from') || searchParams.get('start') || searchParams.get('start_time');
    const to   = searchParams.get('to')   || searchParams.get('end')   || searchParams.get('end_time');
    if (!from && !to) return;
    setValues((v) => ({ ...v, start_time: from ?? v.start_time, end_time: to ?? v.end_time }));
    hasPrefilledRef.current = true;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* -------------------------------------------
   * Options (Autocomplete) com debounce
   * ----------------------------------------- */
  const [trainers, setTrainers] = React.useState<Option[]>([]);
  const [clients,  setClients]  = React.useState<Option[]>([]);
  const [loadingTr, setLoadingTr] = React.useState(false);
  const [loadingCl, setLoadingCl] = React.useState(false);

  const fetchOptions = React.useCallback(
    (url: string, setter: (r: Option[]) => void, setLoading: (b: boolean) => void, q?: string) => {
      const u = new URL(url, window.location.origin);
      if (q) u.searchParams.set('q', q);
      const ctrl = new AbortController();
      setLoading(true);
      fetch(u.toString(), { cache: 'no-store', signal: ctrl.signal })
        .then((r) => r.json())
        .then((j) => {
          const rows = Array.isArray(j.rows) ? j.rows : Array.isArray(j) ? j : [];
          const mapped: Option[] = rows.map((row: any) => ({
            id: String(row.id),
            name: row.name ?? row.label ?? null,
            email: row.email ?? null,
          }));
          setter(mapped);
        })
        .catch(() => setter([]))
        .finally(() => setLoading(false));
      return () => ctrl.abort();
    },
    []
  );

  const searchTrainers = React.useMemo(() => {
    let t: number | undefined;
    return (q?: string) => { if (t) clearTimeout(t); t = window.setTimeout(() => {
      fetchOptions('/api/admin/trainers', setTrainers, setLoadingTr, q);
    }, 200); };
  }, [fetchOptions]);

  const searchClients = React.useMemo(() => {
    let t: number | undefined;
    return (q?: string) => { if (t) clearTimeout(t); t = window.setTimeout(() => {
      fetchOptions('/api/admin/clients', setClients, setLoadingCl, q);
    }, 200); };
  }, [fetchOptions]);

  React.useEffect(() => { searchTrainers(); searchClients(); }, [searchTrainers, searchClients]);

  /* -------------------------------------------
   * Validação de conflitos (debounced)
   * ----------------------------------------- */
  const [conflict, setConflict] = React.useState<{ busy: boolean; has: boolean }>({ busy: false, has: false });

  React.useEffect(() => {
    if (!values.start_time || !values.end_time || (!values.trainer_id && !values.client_id)) {
      setConflict({ busy: false, has: false });
      return;
    }
    const u = new URL('/api/admin/pts-schedule/conflicts', window.location.origin);
    u.searchParams.set('start_time', values.start_time);
    u.searchParams.set('end_time', values.end_time);
    if (values.trainer_id) u.searchParams.set('trainer_id', values.trainer_id);
    if (values.client_id)  u.searchParams.set('client_id', values.client_id);
    if (values.id)         u.searchParams.set('exclude_id', values.id);

    const ctrl = new AbortController();
    setConflict({ busy: true, has: false });
    const t = window.setTimeout(() => {
      fetch(u.toString(), { cache: 'no-store', signal: ctrl.signal })
        .then((r) => r.json())
        .then((j) => setConflict({ busy: false, has: Boolean(j?.hasConflict) }))
        .catch(() => setConflict({ busy: false, has: false }));
    }, 250);

    return () => { ctrl.abort(); clearTimeout(t); };
  }, [values.start_time, values.end_time, values.trainer_id, values.client_id, values.id]);

  /* -------------------------------------------
   * Helpers
   * ----------------------------------------- */
  function setField<K extends keyof Values>(k: K, v: Values[K]) {
    setValues((prev) => ({ ...prev, [k]: v }));
    setErrors((prev) => ({ ...prev, [k]: undefined }));
  }

  // Fim > início
  function validateChronology(v: Values): string | null {
    const a = v.start_time && new Date(v.start_time).getTime();
    const b = v.end_time   && new Date(v.end_time).getTime();
    if (a && b && b <= a) return 'O fim deve ser posterior ao início';
    return null;
  }

  /* -------------------------------------------
   * Submit
   * ----------------------------------------- */
  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErrors({});
    const parsed = SessionSchema.safeParse(values);

    if (!parsed.success) {
      const err: Partial<Record<keyof Values, string>> = {};
      for (const i of parsed.error.issues) { const k = i.path[0] as keyof Values; err[k] = i.message; }
      setErrors(err);
      setSnack({ open: true, msg: 'Verifique os campos', sev: 'error' });
      return;
    }

    const chrono = validateChronology(parsed.data);
    if (chrono) {
      setErrors((prev) => ({ ...prev, end_time: chrono }));
      setSnack({ open: true, msg: chrono, sev: 'error' });
      return;
    }

    if (conflict.has) {
      setSnack({ open: true, msg: 'Conflito de agenda — ajuste o horário/PT/Cliente', sev: 'error' });
      return;
    }

    setSaving(true);
    try {
      const url = values.id ? `/api/admin/pts-schedule/${values.id}` : '/api/admin/pts-schedule';
      const method = values.id ? 'PATCH' : 'POST';
      const body = JSON.stringify({
        trainer_id: values.trainer_id,
        client_id: values.client_id,
        start_time: values.start_time,
        end_time: values.end_time,
        status: values.status,
        location: values.location || null,
        notes: values.notes || null,
      });

      const r = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, cache: 'no-store', body });
      if (!r.ok) throw new Error(await r.text());

      setSnack({ open: true, msg: values.id ? 'Sessão atualizada ✅' : 'Sessão criada ✅', sev: 'success' });
      onSuccess?.(); // ✅ dispara o fecho/refresh no chamador
    } catch (e: any) {
      setSnack({ open: true, msg: e?.message || 'Falha ao gravar', sev: 'error' });
    } finally {
      setSaving(false);
    }
  }

  /* -------------------------------------------
   * Render
   * ----------------------------------------- */
  return (
    <Box component="form" onSubmit={onSubmit} sx={{ display: 'grid', gap: 2 }}>
      {conflict.has && <Alert severity="error">Conflito detetado para o intervalo selecionado.</Alert>}

      <Autocomplete<Option>
        options={trainers}
        loading={loadingTr}
        getOptionLabel={(o) => o?.name || o?.email || ''}
        isOptionEqualToValue={(a, b) => a.id === b.id}
        value={trainers.find((t) => t.id === values.trainer_id) ?? null}
        onChange={(_, v) => setField('trainer_id', v?.id || '')}
        onInputChange={(_, q) => searchTrainers(q)}
        renderInput={(p) => (
          <TextField
            {...p}
            label="PT"
            required
            error={!!errors.trainer_id}
            helperText={errors.trainer_id || ' '}
            InputProps={{
              ...p.InputProps,
              endAdornment: (<>
                {loadingTr ? <CircularProgress size={18} /> : null}
                {p.InputProps.endAdornment}
              </>),
            }}
          />
        )}
      />

      <Autocomplete<Option>
        options={clients}
        loading={loadingCl}
        getOptionLabel={(o) => o?.name || o?.email || ''}
        isOptionEqualToValue={(a, b) => a.id === b.id}
        value={clients.find((c) => c.id === values.client_id) ?? null}
        onChange={(_, v) => setField('client_id', v?.id || '')}
        onInputChange={(_, q) => searchClients(q)}
        renderInput={(p) => (
          <TextField
            {...p}
            label="Cliente"
            required
            error={!!errors.client_id}
            helperText={errors.client_id || ' '}
            InputProps={{
              ...p.InputProps,
              endAdornment: (<>
                {loadingCl ? <CircularProgress size={18} /> : null}
                {p.InputProps.endAdornment}
              </>),
            }}
          />
        )}
      />

      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
        <TextField
          type="datetime-local"
          label="Início"
          value={values.start_time}
          onChange={(e) => setField('start_time', e.target.value)}
          error={!!errors.start_time}
          helperText={errors.start_time || ' '}
          fullWidth
          InputLabelProps={{ shrink: true }}
        />
        <TextField
          type="datetime-local"
          label="Fim"
          value={values.end_time}
          onChange={(e) => setField('end_time', e.target.value)}
          error={!!errors.end_time}
          helperText={errors.end_time || ' '}
          fullWidth
          InputLabelProps={{ shrink: true }}
        />
      </Stack>

      <TextField
        select
        label="Estado"
        value={values.status}
        onChange={(e) => setField('status', e.target.value as Values['status'])}
        helperText={errors.status || ' '}
        error={!!errors.status}
      >
        <MenuItem value="scheduled">scheduled</MenuItem>
        <MenuItem value="done">done</MenuItem>
        <MenuItem value="cancelled">cancelled</MenuItem>
      </TextField>

      <TextField label="Local" value={values.location || ''} onChange={(e) => setField('location', e.target.value)} />
      <TextField label="Notas"  value={values.notes || ''}    onChange={(e) => setField('notes', e.target.value)} multiline minRows={3} />

      <Stack direction="row" spacing={1} justifyContent="flex-end">
        <Button type="button" onClick={() => history.back()} disabled={saving}>Cancelar</Button>
        <Button variant="contained" type="submit" disabled={saving || conflict.busy}>
          {saving ? (values.id ? 'A atualizar…' : 'A criar…') : (values.id ? 'Guardar alterações' : 'Criar')}
        </Button>
      </Stack>

      <Snackbar open={snack.open} autoHideDuration={3000} onClose={closeSnack}>
        <Alert onClose={closeSnack} severity={snack.sev} variant="filled">{snack.msg}</Alert>
      </Snackbar>
    </Box>
  );
}
