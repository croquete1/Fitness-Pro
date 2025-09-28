import { createServerClient } from '@/lib/supabaseServer';
import ExercisesGrid, { type ExerciseRow } from './exercises.client';

export const dynamic = 'force-dynamic';

export default async function AdminExercisesPage() {
  const sb = createServerClient();
  const { data, error } = await sb
    .from('exercises')
    .select('id, name, muscle, equipment, created_at, updated_at')
    .order('updated_at', { ascending: false, nullsFirst: false })
    .limit(500);
  if (error) console.warn('[admin/exercises] fetch error:', error);

  const rows: ExerciseRow[] = (data ?? []).map((e: any) => ({
    id: String(e.id),
    name: e.name ?? '',
    muscle: e.muscle ?? null,
    equipment: e.equipment ?? null,
    created_at: e.created_at ?? null,
    updated_at: e.updated_at ?? null,
  }));

  return <ExercisesGrid initial={rows} />;
}
