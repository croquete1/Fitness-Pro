import { createServerClient } from '@/lib/supabaseServer';
import ExercisesGrid, { type ExerciseRow } from './exercises.client';

export const dynamic = 'force-dynamic';

export default async function AdminExercisesPage() {
  const sb = createServerClient();

  let rows: ExerciseRow[] = [];
  try {
    const { data, error } = await sb
      .from('exercises' as any)
      .select('id, name, muscle_group, equipment, difficulty, is_active, updated_at')
      .order('name', { ascending: true });

    if (!error && Array.isArray(data)) {
      rows = data.map((e: any) => ({
        id: String(e.id),
        name: e.name ?? '',
        muscle: e.muscle_group ?? null,
        equipment: e.equipment ?? null,
        difficulty: String(e.difficulty ?? 'MEDIUM').toUpperCase(),
        active: Boolean(e.is_active ?? true),
        updated_at: e.updated_at ?? null,
      }));
    }
  } catch {}

  return <ExercisesGrid rows={rows} />;
}
