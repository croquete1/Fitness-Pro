// src/app/(app)/dashboard/pt/exercises/page.tsx
export const dynamic = 'force-dynamic';

import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getSessionUserSafe } from '@/lib/session-bridge';
import { toAppRole, type AppRole } from '@/lib/roles';
import { createServerClient } from '@/lib/supabaseServer';
import PTExerciseNote from './PTExerciseNote';

export const metadata: Metadata = { title: 'Exercícios (PT) · Fitness Pro' };

type ExerciseRow = {
  id: string;
  name: string;
  muscle_group: string | null;
  equipment: string | null;
  difficulty: string | null;
};

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
    .select('id,name,muscle_group,equipment,difficulty')
    .order('name', { ascending: true })
    .returns<ExerciseRow[]>();

  if (error) {
    return (
      <div className="card" style={{ padding: 12 }}>
        <h1 style={{ margin: 0, fontSize: 20, fontWeight: 800 }}>Exercícios</h1>
        <p className="small text-muted" style={{ marginTop: 8, color: 'var(--danger)' }}>
          Ocorreu um erro ao carregar a lista de exercícios. Tenta novamente mais tarde.
        </p>
      </div>
    );
  }

  const items = Array.isArray(data) ? data : [];

  return (
    <div style={{ display: 'grid', gap: 12 }}>
      <div className="card" style={{ padding: 12 }}>
        <h1 style={{ margin: 0, fontSize: 20, fontWeight: 800 }}>Exercícios</h1>
      </div>

      <div className="card" style={{ padding: 12 }}>
        <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
          {items.map((e) => (
            <li
              key={e.id}
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr auto auto auto',
                gap: 8,
                padding: '10px 0',
                borderTop: '1px solid var(--border)',
                alignItems: 'center',
              }}
            >
              <div style={{ fontWeight: 700 }}>{e.name}</div>
              <div className="small text-muted">{e.muscle_group ?? '—'}</div>
              <div className="small text-muted">{e.equipment ?? '—'}</div>
              <PTExerciseNote exerciseId={e.id} />
            </li>
          ))}
          {items.length === 0 && <li className="small text-muted">Sem exercícios.</li>}
        </ul>
      </div>
    </div>
  );
}
