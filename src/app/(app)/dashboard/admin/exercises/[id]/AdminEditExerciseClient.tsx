'use client';

import * as React from 'react';
import { Container } from '@mui/material';
import AdminExerciseFormClient, {
  type ExerciseFormValues,
  type Difficulty,
} from '@/app/(app)/dashboard/admin/exercises/AdminExerciseFormClient';

// Normalização robusta da dificuldade (reutilizada se necessário)
function normalizeDifficulty(
  v?: string | null
): Difficulty | undefined {
  if (!v) return undefined;
  const s = v.toString().normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase().trim();
  if (s.startsWith('fac')) return 'Fácil';
  if (s.startsWith('med')) return 'Média';
  if (s.startsWith('dif')) return 'Difícil';
  return undefined;
}

export default function AdminEditExerciseClient({
  initial,
}: {
  initial: ExerciseFormValues;
}) {
  // Garante shape correto (defensivo)
  const safeInitial: Partial<ExerciseFormValues> = {
    id: initial.id,
    name: initial.name ?? '',
    muscle_group: initial.muscle_group ?? '',
    equipment: initial.equipment ?? '',
    difficulty: normalizeDifficulty(initial.difficulty),
    description: initial.description ?? '',
    video_url: initial.video_url ?? '',
  };

  return (
    <Container maxWidth="sm" sx={{ display: 'grid', gap: 2 }}>
      {/* ✅ props corretas e componente certo */}
      <AdminExerciseFormClient mode="edit" initial={safeInitial} />
    </Container>
  );
}
