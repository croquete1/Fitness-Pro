// src/app/(app)/dashboard/pt/plans/[planId]/days/[dayId]/blocks/[blockId]/page.tsx
import * as React from 'react';
import { redirect } from 'next/navigation';
import { Container, Typography, Stack, TextField, Button, Paper } from '@mui/material';
import { createServerClient } from '@/lib/supabaseServer';

export const dynamic = 'force-dynamic';

type Params = { planId: string; dayId: string; blockId: string };

async function loadBlock(planId: string, dayId: string, blockId: string) {
  const sb = createServerClient();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return { user: null, block: null };

  const { data: block } = await sb
    .from('training_plan_blocks' as any)
    .select('id, title, notes, order_index')
    .eq('id', blockId)
    .single();

  return { user, block };
}

export default async function BlockPage({ params }: { params: Promise<Params> }) {
  const { planId, dayId, blockId } = await params;
  const { user, block } = await loadBlock(planId, dayId, blockId);
  if (!user) redirect('/login');

  if (!block) {
    return (
      <Container maxWidth="sm" sx={{ py: 3 }}>
        <Typography variant="h5" fontWeight={800}>🏋️ Bloco</Typography>
        <Typography color="text.secondary" sx={{ mt: 1 }}>Bloco não encontrado.</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="sm" sx={{ py: 3 }}>
      <Typography variant="h5" fontWeight={800} sx={{ mb: 2 }}>🏋️ Editar bloco</Typography>
      <EditForm planId={planId} dayId={dayId} block={block} />
    </Container>
  );
}

function EditForm({ planId, dayId, block }: { planId: string; dayId: string; block: any }) {
  'use client';
  const [title, setTitle] = React.useState<string>(block.title ?? '');
  const [notes, setNotes] = React.useState<string>(block.notes ?? '');
  const [loading, setLoading] = React.useState(false);

  async function onSave() {
    setLoading(true);
    try {
      const r = await fetch(`/api/pt/plans/${planId}/days/${dayId}/blocks/${block.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, notes }),
      });
      if (!r.ok) throw new Error('Falha ao guardar o bloco');
      location.href = `/dashboard/pt/plans/${planId}/days/${dayId}/blocks`;
    } catch (e) {
      alert((e as Error).message);
    } finally {
      setLoading(false);
    }
  }

  async function onDelete() {
    if (!confirm('Eliminar este bloco?')) return;
    setLoading(true);
    try {
      const r = await fetch(`/api/pt/plans/${planId}/days/${dayId}/blocks/${block.id}`, { method: 'DELETE' });
      if (!r.ok) throw new Error('Falha ao eliminar o bloco');
      location.href = `/dashboard/pt/plans/${planId}/days/${dayId}/blocks`;
    } catch (e) {
      alert((e as Error).message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Paper variant="outlined" sx={{ p: 2 }}>
      <Stack spacing={1.5}>
        <TextField label="Título" value={title} onChange={(e) => setTitle(e.target.value)} />
        <TextField label="Notas" value={notes} onChange={(e) => setNotes(e.target.value)} multiline minRows={3} />
        <Stack direction="row" spacing={1.5}>
          <Button variant="contained" onClick={onSave} disabled={loading}>💾 Guardar</Button>
          <Button variant="outlined" href={`/dashboard/pt/plans/${planId}/days/${dayId}/blocks`}>Cancelar</Button>
          <Button variant="text" color="error" onClick={onDelete} disabled={loading}>🗑️ Eliminar</Button>
        </Stack>
      </Stack>
    </Paper>
  );
}
