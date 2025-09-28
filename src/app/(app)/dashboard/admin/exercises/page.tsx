import { createServerClient } from '@/lib/supabaseServer';
import ExercisesGrid, { type ExerciseRow } from './exercises.client';

export const dynamic = 'force-dynamic';

export default async function AdminExercisesPage() {
  const sb = createServerClient();

  const { data, error } = await sb
    .from('exercises')
    .select('id, name, muscle, equipment, created_at, updated_at') // ✅ inclui created_at
    .order('updated_at', { ascending: false, nullsFirst: false });

  if (error) {
    // fallback simples; opcionalmente podes lançar erro para mostrar um error boundary
    return <div style={{ padding: 16 }}>Falha a carregar exercícios: {error.message}</div>;
  }

  const initial: ExerciseRow[] = (data ?? []).map((e: any) => ({
    id: String(e.id),
    name: e.name ?? null,
    muscle: e.muscle ?? null,
    equipment: e.equipment ?? null,
    created_at: e.created_at ?? null,   // ✅ agora presente
    updated_at: e.updated_at ?? null,
  }));

  return <ExercisesGrid initial={initial} />;
}
