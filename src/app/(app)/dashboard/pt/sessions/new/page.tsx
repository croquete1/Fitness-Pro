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
    const payload = Object.fromEntries(f.entries());
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
        <TextField select name="client_id" label="Cliente" required>
          {clients.length === 0
            ? <MenuItem value="" disabled>Sem clientes</MenuItem>
            : clients.map(c => <MenuItem key={c.id} value={c.id}>{c.full_name ?? c.id}</MenuItem>)
          }
        </TextField>
        <TextField name="title" label="Título" required placeholder="Treino presencial" />
        <TextField name="start_at" label="Início" type="datetime-local" required InputLabelProps={{ shrink: true }} />
        <TextField name="end_at" label="Fim (opcional)" type="datetime-local" InputLabelProps={{ shrink: true }} />
        <TextField select name="kind" label="Tipo" defaultValue="presencial">
          <MenuItem value="presencial">Presencial</MenuItem>
          <MenuItem value="online">Online</MenuItem>
          <MenuItem value="outro">Outro</MenuItem>
        </TextField>
        <TextField name="core_exercise" label="Exercício core (opcional)" />
        <Stack direction="row" gap={1} justifyContent="flex-end">
          <Button variant="outlined" onClick={()=>router.back()}>❌ Cancelar</Button>
          <Button variant="contained" type="submit" disabled={loading}>{loading ? 'A criar…' : '➕ Criar sessão'}</Button>
        </Stack>
      </Box>
    </Container>
  );
}
