'use client';

import * as React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Box, Button, Container, MenuItem, Stack, Switch, TextField, Typography, Alert, FormControlLabel } from '@mui/material';
import { toast } from '@/components/ui/Toaster';

export default function EditExercisePage() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  const [item, setItem] = React.useState<any | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [err, setErr] = React.useState<string | null>(null);
  const [saving, setSaving] = React.useState(false);

  React.useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`/api/admin/exercises/${id}`, { cache: 'no-store' });
        const j = res.ok ? await res.json() : null;
        setItem(j?.item ?? null);
      } catch {}
      setLoading(false);
    })();
  }, [id]);

  async function onSave(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault(); setErr(null); setSaving(true);
    const f = new FormData(e.currentTarget);
    const payload = Object.fromEntries(f.entries());
    try {
      const res = await fetch(`/api/admin/exercises/${id}`, { method: 'PATCH', headers: { 'content-type':'application/json' }, body: JSON.stringify(payload) });
      if (!res.ok) throw new Error(await res.text());
      toast('Exercício guardado 💾', 2000, 'success');
      router.push('/dashboard/admin/exercises');
    } catch (e: any) {
      setErr(e.message || 'Falha ao guardar'); toast('Falha ao guardar', 2500, 'error');
    } finally { setSaving(false); }
  }

  async function onDelete() {
    if (!confirm('Apagar exercício?')) return;
    try {
      const res = await fetch(`/api/admin/exercises/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error(await res.text());
      toast('Exercício apagado 🗑️', 2000, 'success');
      router.push('/dashboard/admin/exercises');
    } catch (e: any) {
      toast('Falha ao apagar', 2500, 'error'); setErr(e.message || 'Falha ao apagar');
    }
  }

  if (loading) return <Container maxWidth="sm"><Typography>Carregando…</Typography></Container>;
  if (!item) return <Container maxWidth="sm"><Typography>Não encontrado.</Typography></Container>;

  return (
    <Container maxWidth="sm" sx={{ display:'grid', gap:2 }}>
      <Typography variant="h5" fontWeight={800}>✏️ Editar exercício</Typography>
      <Box component="form" onSubmit={onSave} sx={{ p:3, borderRadius:3, bgcolor:'background.paper', border:'1px solid', borderColor:'divider', display:'grid', gap:2 }}>
        {err && <Alert severity="error">{err}</Alert>}
        <TextField name="name" label="Nome" defaultValue={item.name} required />
        <TextField name="muscle_group" label="Grupo muscular" defaultValue={item.muscle_group ?? ''} />
        <TextField name="equipment" label="Equipamento" defaultValue={item.equipment ?? ''} />
        <TextField select name="difficulty" label="Dificuldade" defaultValue={item.difficulty ?? 'média'}>
          <MenuItem value="fácil">Fácil</MenuItem>
          <MenuItem value="média">Média</MenuItem>
          <MenuItem value="difícil">Difícil</MenuItem>
        </TextField>
        <FormControlLabel control={<Switch name="is_active" defaultChecked={!!item.is_active} />} label="Ativo" />
        <Stack direction="row" gap={1} justifyContent="flex-end">
          <Button onClick={()=>history.back()}>❌ Cancelar</Button>
          <Button color="error" onClick={onDelete}>🗑️ Apagar</Button>
          <Button variant="contained" type="submit" disabled={saving}>{saving ? 'A guardar…' : '💾 Guardar'}</Button>
        </Stack>
      </Box>
    </Container>
  );
}
