// src/app/(app)/dashboard/pt/settings/locations/page.tsx
export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

import React from 'react';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { createServerClient } from '@/lib/supabaseServer';
import LocationForm from './LocationForm';

export default async function LocationsPage() {
  const session = await getServerSession(authOptions);
  const meId = (session as any)?.user?.id as string | undefined;

  if (!meId) {
    return (
      <div style={{ padding: 16 }}>
        <div className="badge-danger">Não autenticado.</div>
      </div>
    );
  }

  const sb = createServerClient();
  const { data } = await sb
    .from('trainer_locations')
    .select('id,name,travel_min')
    .eq('trainer_id', meId)
    .order('name', { ascending: true });

  const items = data ?? [];

  return (
    <div style={{ padding: 16, display: 'grid', gap: 12 }}>
      <h1 style={{ margin: 0 }}>Locais</h1>

      <div className="card" style={{ padding: 12, display: 'grid', gap: 10 }}>
        <h3 style={{ margin: 0 }}>Novo local</h3>
        <LocationForm />
      </div>

      <div className="card" style={{ padding: 12 }}>
        <h3 style={{ marginTop: 0 }}>Os meus locais</h3>
        {items.length === 0 ? (
          <div className="text-muted small">Ainda não registaste locais.</div>
        ) : (
          <table className="table" style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 0 }}>
            <thead>
              <tr>
                <th style={{ textAlign: 'left', padding: 8 }}>Nome</th>
                <th style={{ textAlign: 'left', padding: 8 }}>Deslocação típica</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {items.map((l: any) => (
                <tr key={l.id} style={{ borderTop: '1px solid var(--border)' }}>
                  <td style={{ padding: 8 }}>{l.name}</td>
                  <td style={{ padding: 8 }}>{typeof l.travel_min === 'number' ? `${l.travel_min} min` : '—'}</td>
                  <td style={{ padding: 8, textAlign: 'right' }}>
                    <button
                      className="btn chip"
                      onClick={async () => {
                        if (!confirm('Apagar este local?')) return;
                        await fetch(`/api/pt/locations/${l.id}`, { method: 'DELETE' });
                        location.reload();
                      }}
                    >
                      🗑️ Apagar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
