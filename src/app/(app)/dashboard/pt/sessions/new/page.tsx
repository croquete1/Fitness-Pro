'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Box, Button, Container, MenuItem, Stack, TextField, Typography, Alert } from '@mui/material';
import { toast } from '@/components/ui/Toaster';

export default function NewSessionPage() {
  const router = useRouter();
  const [loading, setLoading] = React.useState(false);
  const [clients, setClients] = React.useState<{ id: string; full_name: string | null }[]>([]);
  const [err, setErr] = React.useState<string | null>(null);
  const [exercises, setExercises] = React.useState<string>('');

  React.useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/pt/clients', { cache: 'no-store' });
        const json = res.ok ? await res.json() : { items: [] };
        setClients(Array.isArray(json.items) ? json.items : []);
      } catch { setClients([]); }
    })();
  }, []);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErr(null); setLoading(true);
    const f = new FormData(e.currentTarget);
    const start = String(f.get('start') || '');
    const end = String(f.get('end') || '');
    const clientId = String(f.get('client_id') || '');
    const durationField = Number(f.get('durationMin') || 60);
    let durationMin = Number.isFinite(durationField) && durationField > 0 ? durationField : 60;
    if (start && end) {
      const diff = (new Date(end).getTime() - new Date(start).getTime()) / 60000;
      if (Number.isFinite(diff) && diff > 0) durationMin = diff;
    }
    const exerciseList = exercises
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean);

    const payload = {
      start,
      title: String(f.get('title') || ''),
      kind: String(f.get('kind') || 'presencial'),
      client_id: clientId || undefined,
      durationMin,
      exercises: exerciseList.length > 0 ? exerciseList : undefined,
    };
    try {
      const res = await fetch('/api/pt/sessions', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error(await res.text());
      toast('Sessão criada ✅');
      router.push('/dashboard/pt/sessions');
    } catch {
      setErr('Falha ao criar sessão'); toast('Falha ao criar sessão');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Container maxWidth="sm" sx={{ display:'grid', gap:2 }}>
      <Typography variant="h5" fontWeight={800}>➕ Marcar sessão</Typography>
      <Box component="form" onSubmit={onSubmit} sx={{ p: 3, borderRadius: 3, bgcolor:'background.paper', border:'1px solid', borderColor:'divider', display:'grid', gap:2 }}>
        {err && <Alert severity="error">{err}</Alert>}
        <TextField select name="client_id" label="Cliente" helperText="Escolhe o cliente para esta sessão">
          <MenuItem value="">Sem cliente</MenuItem>
          {clients.length === 0
            ? <MenuItem value="" disabled>Sem clientes associados</MenuItem>
            : clients.map(c => <MenuItem key={c.id} value={c.id}>{c.full_name ?? c.id}</MenuItem>)
          }
        </TextField>
        <TextField name="title" label="Título" required placeholder="Treino presencial" />
        <TextField name="start" label="Início" type="datetime-local" required InputLabelProps={{ shrink: true }} />
        <TextField name="end" label="Fim (opcional)" type="datetime-local" InputLabelProps={{ shrink: true }} />
        <TextField
          name="durationMin"
          label="Duração (min)"
          type="number"
          inputProps={{ min: 15, step: 15 }}
          defaultValue={60}
        />
        <TextField select name="kind" label="Tipo" defaultValue="presencial">
          <MenuItem value="presencial">Presencial</MenuItem>
          <MenuItem value="online">Online</MenuItem>
          <MenuItem value="outro">Outro</MenuItem>
        </TextField>
        <TextField
          label="Exercícios planeados (um por linha)"
          multiline
          minRows={3}
          value={exercises}
          onChange={(e) => setExercises(e.target.value)}
          placeholder="Ex.: Aquecimento
Agachamento — 4x8"
        />
        <Stack direction="row" gap={1} justifyContent="flex-end">
          <Button variant="outlined" onClick={()=>router.back()}>❌ Cancelar</Button>
          <Button variant="contained" type="submit" disabled={loading}>{loading ? 'A criar…' : '➕ Criar sessão'}</Button>
        </Stack>
      </Box>
    </Container>
  );
}
