'use client';

import * as React from 'react';
import { Container } from '@mui/material';
import AdminExerciseFormClient from '@/app/(app)/dashboard/admin/exercises/AdminExerciseFormClient';
import {
  type ExerciseFormValues,
  normalizeDifficulty,
} from '@/lib/exercises/schema';

export default function AdminEditExerciseClient({
  initial,
}: {
  /** Aceita parcial para ser à prova de dados incompletos vindos da BD/SSR */
  initial: Partial<ExerciseFormValues>;
}) {
  // Garante shape correto (defensivo)
  const safeInitial: Partial<ExerciseFormValues> = {
    id: initial.id,
    name: initial.name ?? '',
    muscle_group: initial.muscle_group ?? '',
    equipment: initial.equipment ?? '',
    difficulty: normalizeDifficulty(initial.difficulty as any),
    description: initial.description ?? '',
    video_url: initial.video_url ?? '',
  };

  return (
    <Container maxWidth="sm" sx={{ display: 'grid', gap: 2 }}>
      {/* O form já valida com Zod e faz PATCH/POST conforme `mode` */}
      <AdminExerciseFormClient mode="edit" initial={safeInitial} />
    </Container>
  );
}
