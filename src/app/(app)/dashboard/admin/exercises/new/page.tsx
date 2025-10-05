'use client';

import * as React from 'react';
import { Container, Box, Typography } from '@mui/material';
import AdminExerciseFormClient, { type Difficulty } from '@/app/(app)/dashboard/admin/exercises/AdminExerciseFormClient';

export default function NewExercisePage({ searchParams }: {
  searchParams?: { name?: string; muscle_group?: string; equipment?: string; difficulty?: string; description?: string; video_url?: string; }
}) {
  function normalizeDiff(v?: string | null): Difficulty | undefined {
    if (!v) return undefined;
    const s = v.toString().normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase().trim();
    if (s.startsWith('fac')) return 'Fácil';
    if (s.startsWith('med')) return 'Média';
    if (s.startsWith('dif')) return 'Difícil';
    return undefined;
  }

  const initial = {
    name: searchParams?.name ?? '',
    muscle_group: searchParams?.muscle_group ?? '',
    equipment: searchParams?.equipment ?? '',
    difficulty: normalizeDiff(searchParams?.difficulty),
    description: searchParams?.description ?? '',
    video_url: searchParams?.video_url ?? '',
  };

  return (
    <Container maxWidth="sm" sx={{ display: 'grid', gap: 2 }}>
      <Box sx={{ p: 0 }}>
        <Typography variant="h5" fontWeight={800}>➕ Novo exercício</Typography>
      </Box>
      <Box sx={{ p: 3, borderRadius: 3, bgcolor: 'background.paper', border: '1px solid', borderColor: 'divider' }}>
        <AdminExerciseFormClient mode="create" initial={initial} />
      </Box>
    </Container>
  );
}
