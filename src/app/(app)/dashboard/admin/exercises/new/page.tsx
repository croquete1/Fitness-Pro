'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Box, Button, Container, MenuItem, Stack, TextField, Typography, Alert } from '@mui/material';
import { toast } from '@/components/ui/Toaster';

export default function NewExercisePage() {
  const router = useRouter();
  const [err, setErr] = React.useState<string | null>(null);
  const [saving, setSaving] = React.useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErr(null); setSaving(true);
    const f = new FormData(e.currentTarget);
    const payload = Object.fromEntries(f.entries());
    try {
      const res = await fetch('/api/admin/exercises', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(payload) });
      if (!res.ok) throw new Error(await res.text());
      toast('Exercício criado ✅', 2000, 'success');
      router.push('/dashboard/admin/exercises');
    } catch (e: any) {
      setErr(e.message || 'Falha ao criar exercício'); toast('Falha ao criar', 2500, 'error');
    } finally {
      setSaving(false);
    }
  }

  return (
    <Container maxWidth="sm" sx={{ display:'grid', gap:2 }}>
      <Typography variant="h5" fontWeight={800}>➕ Novo exercício</Typography>
      <Box component="form" onSubmit={onSubmit} sx={{ p:3, borderRadius:3, bgcolor:'background.paper', border:'1px solid', borderColor:'divider', display:'grid', gap:2 }}>
        {err && <Alert severity="error">{err}</Alert>}
        <TextField name="name" label="Nome" required placeholder="Agachamento" />
        <TextField name="muscle_group" label="Grupo muscular" placeholder="Perna/Glúteo" />
        <TextField name="equipment" label="Equipamento" placeholder="Barra, Máquina, Halteres" />
        <TextField select name="difficulty" label="Dificuldade" defaultValue="média">
          <MenuItem value="fácil">Fácil</MenuItem>
          <MenuItem value="média">Média</MenuItem>
          <MenuItem value="difícil">Difícil</MenuItem>
        </TextField>
        <Stack direction="row" gap={1} justifyContent="flex-end">
          <Button onClick={()=>router.back()}>❌ Cancelar</Button>
          <Button variant="contained" type="submit" disabled={saving}>{saving ? 'A criar…' : '💾 Guardar'}</Button>
        </Stack>
      </Box>
    </Container>
  );
}
