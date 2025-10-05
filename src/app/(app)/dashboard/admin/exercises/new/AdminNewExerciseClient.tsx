'use client';

import * as React from 'react';
import { Stack, TextField, Button, Alert, Snackbar, Autocomplete } from '@mui/material';
import { useRouter } from 'next/navigation';
import { z } from 'zod';
import { useToast } from '@/components/ui/ToastProvider';

const schema = z.object({
  name: z.string().min(1, 'O nome é obrigatório').max(120, 'Máx. 120 caracteres'),
  muscle_group: z.string().optional().nullable(),
  equipment: z.string().optional().nullable(),
  difficulty: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  video_url: z.string().url('URL inválida').optional().nullable().or(z.literal('').transform(() => null)),
});
type FormState = z.infer<typeof schema>;

export default function AdminNewExerciseClient() {
  const router = useRouter();
  const toast = useToast();
  const [saving, setSaving] = React.useState(false);
  const [err, setErr] = React.useState<string | null>(null);
  const [snack, setSnack] = React.useState<{open:boolean; msg:string; sev:'success'|'error'|'info'|'warning'}>({ open: false, msg: '', sev: 'success' });

  const [f, setF] = React.useState<FormState>({ name: '', muscle_group: '', equipment: '', difficulty: '', description: '', video_url: '' });

  const [muscles, setMuscles] = React.useState<string[]>([]);
  const [difficulties, setDifficulties] = React.useState<string[]>([]);
  const [equipments, setEquipments] = React.useState<string[]>([]);

  React.useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/admin/exercises?facets=1');
        const data = await res.json();
        setMuscles((data?.muscles ?? []).filter(Boolean));
        setDifficulties((data?.difficulties ?? []).filter(Boolean));
        setEquipments((data?.equipments ?? []).filter(Boolean));
      } catch {}
    })();
  }, []);

  const on = (k: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setF((s) => ({ ...s, [k]: e.target.value }));

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);

    const parsed = schema.safeParse({
      ...f,
      muscle_group: f.muscle_group || null,
      equipment: f.equipment || null,
      difficulty: f.difficulty || null,
      description: f.description || null,
      video_url: f.video_url || null,
    });

    if (!parsed.success) {
      const first = parsed.error.issues[0]?.message ?? 'Dados inválidos';
      setErr(first);
      setSnack({ open: true, msg: first, sev: 'error' });
      return;
    }

    setSaving(true);
    try {
      const res = await fetch('/api/admin/exercises', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(parsed.data),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || `HTTP ${res.status}`);

      setSnack({ open: true, msg: 'Exercício criado', sev: 'success' });
      toast.success('Exercício criado');
      setTimeout(() => {
        router.push('/dashboard/admin/exercises');
        router.refresh();
      }, 250);
    } catch (e: any) {
      const msg = e.message || 'Falha ao criar exercício.';
      setErr(msg);
      setSnack({ open: true, msg, sev: 'error' });
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={onSubmit}>
      <Stack spacing={2}>
        {err && <Alert severity="error">{err}</Alert>}

        <TextField label="Nome *" value={f.name ?? ''} onChange={on('name')} required />

        <Autocomplete
          freeSolo options={muscles} value={(f.muscle_group as string) ?? ''}
          onChange={(_e, val) => setF((s) => ({ ...s, muscle_group: (val as string) ?? '' }))}
          onInputChange={(_e, val) => setF((s) => ({ ...s, muscle_group: val as string }))}
          renderInput={(params) => <TextField {...params} label="Grupo muscular" />}
        />

        <Autocomplete
          freeSolo options={equipments} value={(f.equipment as string) ?? ''}
          onChange={(_e, val) => setF((s) => ({ ...s, equipment: (val as string) ?? '' }))}
          onInputChange={(_e, val) => setF((s) => ({ ...s, equipment: val as string }))}
          renderInput={(params) => <TextField {...params} label="Equipamento" />}
        />

        <Autocomplete
          freeSolo options={difficulties} value={(f.difficulty as string) ?? ''}
          onChange={(_e, val) => setF((s) => ({ ...s, difficulty: (val as string) ?? '' }))}
          onInputChange={(_e, val) => setF((s) => ({ ...s, difficulty: val as string }))}
          renderInput={(params) => <TextField {...params} label="Dificuldade" />}
        />

        <TextField label="Vídeo URL" value={f.video_url ?? ''} onChange={on('video_url')} />
        <TextField label="Instruções" value={f.description ?? ''} onChange={on('description')} multiline rows={5} />

        <Stack direction="row" spacing={1} justifyContent="flex-end">
          <Button variant="outlined" onClick={() => history.back()} disabled={saving}>Cancelar</Button>
          <Button variant="contained" type="submit" disabled={saving}>{saving ? 'A criar…' : 'Criar exercício'}</Button>
        </Stack>
      </Stack>

      <Snackbar open={snack.open} autoHideDuration={3000} onClose={() => setSnack((s) => ({ ...s, open: false }))}>
        <Alert severity={snack.sev} variant="filled" onClose={() => setSnack((s) => ({ ...s, open: false }))}>{snack.msg}</Alert>
      </Snackbar>
    </form>
  );
}
