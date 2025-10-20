// src/app/(app)/dashboard/pt/exercises/page.tsx
export const dynamic = 'force-dynamic';

import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getSessionUserSafe } from '@/lib/session-bridge';
import { toAppRole, type AppRole } from '@/lib/roles';
import { createServerClient } from '@/lib/supabaseServer';
import PTExercisesClient, { type PTExercise } from './PTExercisesClient';
import { getPTExercisesFallback } from '@/lib/fallback/pt-exercises';

export const metadata: Metadata = { title: 'Exercícios (PT) · HMS' };

export default async function PTExercisesPage() {
  // Sessão
  const sessionUser = await getSessionUserSafe();
  if (!sessionUser?.user?.id) redirect('/login');

  // Guard de role
  const role = (toAppRole(sessionUser.user.role) ?? 'CLIENT') as AppRole;
  if (role !== 'PT' && role !== 'ADMIN') redirect('/dashboard');

  // Supabase (scoped ao utilizador; não precisamos do service-role aqui)
  const sb = createServerClient();

  const { data, error } = await sb
    .from('exercises')
    .select('id,name,muscle_group,equipment,difficulty,updated_at,created_at')
    .order('name', { ascending: true });

  let supabase = true;
  let rows: PTExercise[];

  if (error) {
    supabase = false;
    rows = getPTExercisesFallback().map((row) => ({
      id: row.id,
      name: row.name,
      muscleGroup: row.muscle_group,
      equipment: row.equipment,
      difficulty: row.difficulty,
      updatedAt: row.updated_at,
      createdAt: row.updated_at,
    }));
  } else {
    rows = (data ?? []).map((row) => ({
      id: String(row.id),
      name: row.name ?? 'Exercício',
      muscleGroup: row.muscle_group ?? null,
      equipment: row.equipment ?? null,
      difficulty: row.difficulty ?? null,
      updatedAt: row.updated_at ?? null,
      createdAt: row.created_at ?? null,
    }));
  }

  return <PTExercisesClient exercises={rows} supabase={supabase} />;
}
