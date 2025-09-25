'use client';

import * as React from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Box, Button, Container, MenuItem, Stack, TextField, Typography, Alert } from '@mui/material';
import { toast } from '@/components/ui/Toaster';

type Sess = { id: string; title: string; start_at: string; end_at?: string|null; kind?: string|null; status?: string|null; core_exercise?: string|null; client_id: string };

export default function EditSessionPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [session, setSession] = React.useState<Sess | null>(null);
  const [clients, setClients] = React.useState<{ id: string; full_name: string | null }[]>([]);
  const [err, setErr] = React.useState<string | null>(null);

  React.useEffect(() => {
    (async () => {
      try {
        const [sRes, cRes] = await Promise.all([
          fetch(`/api/pt/sessions/${params.id}`, { cache: 'no-store' }),
          fetch('/api/pt/clients', { cache: 'no-store' }),
        ]);
        const sJson = sRes.ok ? await sRes.json() : null;
        const cJson = cRes.ok ? await cRes.json() : { items: [] };
        setSession(sJson?.item ?? null);
        setClients(Array.isArray(cJson.items) ? cJson.items : []);
      } catch {
        setErr('Falha ao carregar sessão');
      } finally {
        setLoading(false);
      }
    })();
  }, [params.id]);

  async function onSave(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault(); setErr(null); setSaving(true);
    const f = new FormData(e.currentTarget);
    const payload = Object.fromEntries(f.entries());
    try {
      const res = await fetch(`/api/pt/sessions/${params.id}`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ _method: 'PATCH', ...payload }),
      });
      if (!res.ok) throw new Error(await res.text());
      toast('Sessão guardada 💾'); router.push('/dashboard/pt/sessions');
    } catch {
      toast('Falha ao guardar'); setErr('Falha ao guardar');
    } finally {
      setSaving(false);
    }
  }

  async function onDelete() {
    if (!confirm('Apagar sessão?')) return;
    try {
      const res = await fetch(`/api/pt/sessions/${params.id}`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ _method: 'DELETE' }),
      });
      if (!res.ok) throw new Error(await res.text());
      toast('Sessão apagada 🗑️'); router.push('/dashboard/pt/sessions');
    } catch {
      toast('Falha ao apagar'); setErr('Falha ao apagar');
    }
  }

  if (loading) return <Container maxWidth="sm"><Typography>Carregando…</Typography></Container>;
  if (!session) return <Container maxWidth="sm"><Typography>Não encontrado.</Typography></Container>;

  return (
    <Container maxWidth="sm" sx={{ display:'grid', gap:2 }}>
      <Typography variant="h5" fontWeight={800}>✏️ Editar sessão</Typography>
      <Box component="form" onSubmit={onSave} sx={{ p: 3, borderRadius: 3, bgcolor:'background.paper', border:'1px solid', borderColor:'divider', display:'grid', gap:2 }}>
        {err && <Alert severity="error">{err}</Alert>}
        <TextField select name="client_id" label="Cliente" required defaultValue={session.client_id}>
          {clients.length === 0
            ? <MenuItem value="" disabled>Sem clientes</MenuItem>
            : clients.map(c => <MenuItem key={c.id} value={c.id}>{c.full_name ?? c.id}</MenuItem>)
          }
        </TextField>
        <TextField name="title" label="Título" required defaultValue={session.title} />
        <TextField name="start_at" label="Início" type="datetime-local" required InputLabelProps={{ shrink: true }} defaultValue={new Date(session.start_at).toISOString().slice(0,16)} />
        <TextField name="end_at" label="Fim (opcional)" type="datetime-local" InputLabelProps={{ shrink: true }} defaultValue={session.end_at ? new Date(session.end_at).toISOString().slice(0,16) : ''} />
        <TextField select name="kind" label="Tipo" defaultValue={session.kind ?? 'presencial'}>
          <MenuItem value="presencial">Presencial</MenuItem>
          <MenuItem value="online">Online</MenuItem>
          <MenuItem value="outro">Outro</MenuItem>
        </TextField>
        <TextField select name="status" label="Estado" defaultValue={session.status ?? 'scheduled'}>
          <MenuItem value="scheduled">Marcada</MenuItem>
          <MenuItem value="done">Concluída</MenuItem>
          <MenuItem value="canceled">Cancelada</MenuItem>
        </TextField>
        <TextField name="core_exercise" label="Exercício core (opcional)" defaultValue={session.core_exercise ?? ''} />
        <Stack direction="row" gap={1} justifyContent="flex-end">
          <Button variant="outlined" onClick={()=>history.back()}>❌ Cancelar</Button>
          <Button color="error" onClick={onDelete}>🗑️ Apagar</Button>
          <Button variant="contained" type="submit" disabled={saving}>{saving ? 'A guardar…' : '💾 Guardar'}</Button>
        </Stack>
      </Box>
    </Container>
  );
}
