import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { supabaseAdmin } from '@/lib/supabase.server';
import { getSessionUserSafe, assertRole } from '@/lib/session-bridge';
import PTExerciseNote from './PTExerciseNote';

export const metadata: Metadata = { title: 'Exercícios (PT) · Fitness Pro' };

export default async function PTExercisesPage() {
  const user = await getSessionUserSafe();
  if (!assertRole(user, ['PT', 'ADMIN'])) redirect('/dashboard');

  const s = supabaseAdmin();
  const { data, error } = await s
    .from('exercises')
    .select('id, name, muscle_group, equipment, difficulty')
    .order('name', { ascending: true });

  if (error) {
    return (
      <div className="card" style={{ padding: 12 }}>
        <h1 style={{ margin: 0, fontSize: 20, fontWeight: 800 }}>Exercícios</h1>
        <p className="small text-muted" style={{ marginTop: 8, color: 'var(--danger)' }}>
          Falha a carregar: {error.message}
        </p>
      </div>
    );
  }

  const items = data ?? [];

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
