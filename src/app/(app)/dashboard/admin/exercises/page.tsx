// src/app/(app)/dashboard/admin/exercises/page.tsx
export const dynamic = 'force-dynamic';

import { redirect } from 'next/navigation';
import { getSessionUser } from '@/lib/sessions';
import { toAppRole } from '@/lib/roles';
import { createServerClient } from '@/lib/supabaseServer';
import ExerciseCatalogClient from './ExerciseCatalogClient';

export default async function AdminExercisesPage() {
  const user = await getSessionUser();
  if (!user) redirect('/login');
  if (toAppRole(user.role) !== 'ADMIN') redirect('/dashboard');

  const supabase = createServerClient();
  const { data } = await supabase
    .from('exercises')
    .select('id, name, muscle_group, level, published, created_at, updated_at')
    .order('created_at', { ascending: false })
    .limit(100);

  return (
    <div style={{ padding: 16, display: 'grid', gap: 12 }}>
      <h1 style={{ fontSize: 22, fontWeight: 700 }}>Catálogo de Exercícios</h1>
      <p style={{ opacity: .7, marginTop: -6 }}>
        Publica/retira exercícios do catálogo global disponível para os PTs.
      </p>
      <ExerciseCatalogClient initial={data ?? []} />
    </div>
  );
}