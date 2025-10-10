import * as React from 'react';
import { notFound } from 'next/navigation';
import { Container, Typography, Paper } from '@mui/material';
import { createServerClient } from '@/lib/supabaseServer';
import AdminExerciseFormClient from '../AdminExerciseFormClient';

export const dynamic = 'force-dynamic';

function mapRow(r: any) {
  return {
    id: String(r.id),
    name: r.name ?? '',
    muscle_group: r.muscle_group ?? r.muscle ?? null,
    equipment: r.equipment ?? null,
    difficulty: r.difficulty ?? r.level ?? null,
    description: r.description ?? r.instructions ?? null,
    video_url: r.video_url ?? r.video ?? null,
  };
}

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const sb = createServerClient();
  const { data, error } = await sb.from('exercises').select('*').eq('id', id).maybeSingle();
  if (error || !data) return notFound();

  const initial = mapRow(data);

  return (
    <Container maxWidth="sm" sx={{ display:'grid', gap:2, py:2 }}>
      <Typography variant="h5" fontWeight={800}>✏️ Editar exercício</Typography>
      <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 3 }}>
        <AdminExerciseFormClient mode="edit" initial={initial} />
      </Paper>
    </Container>
  );
}
