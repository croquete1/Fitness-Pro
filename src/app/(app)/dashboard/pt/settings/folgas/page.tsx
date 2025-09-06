// src/app/(app)/dashboard/pt/settings/folgas/page.tsx
export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

import React from 'react';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { createServerClient } from '@/lib/supabaseServer';
import FolgaForm from './FolgaForm';
import EditFolgaButton from './EditFolgaButton';

export default async function FolgasPage() {
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
    .from('trainer_blocks')
    .select('id,start_at,end_at,title')
    .eq('trainer_id', meId)
    .order('start_at', { ascending: false });

  const items = data ?? [];

  return (
    <div style={{ padding: 16, display: 'grid', gap: 12 }}>
      <h1 style={{ margin: 0 }}>Folgas</h1>

      <div className="card" style={{ padding: 12, display: 'grid', gap: 10 }}>
        <h3 style={{ margin: 0 }}>Nova folga</h3>
        <FolgaForm />
      </div>

      <div className="card" style={{ padding: 12 }}>
        <h3 style={{ marginTop: 0 }}>As minhas folgas</h3>
        {items.length === 0 ? (
          <div className="text-muted small">Ainda não registaste folgas.</div>
        ) : (
          <table className="table" style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 0 }}>
            <thead>
              <tr>
                <th style={{ textAlign: 'left', padding: 8 }}>Título</th>
                <th style={{ textAlign: 'left', padding: 8 }}>Início</th>
                <th style={{ textAlign: 'left', padding: 8 }}>Fim</th>
                <th style={{ textAlign: 'right', padding: 8 }}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {items.map((b: any) => (
                <tr key={b.id} style={{ borderTop: '1px solid var(--border)' }}>
                  <td style={{ padding: 8 }}>{b.title || 'Folga'}</td>
                  <td style={{ padding: 8 }}>{new Date(b.start_at).toLocaleString('pt-PT')}</td>
                  <td style={{ padding: 8 }}>{new Date(b.end_at).toLocaleString('pt-PT')}</td>
                  <td style={{ padding: 8, textAlign: 'right', display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                    <EditFolgaButton
                      id={b.id}
                      initial={{
                        title: b.title ?? 'Folga',
                        start: b.start_at,
                        end: b.end_at,
                      }}
                    />
                    <button
                      className="btn chip"
                      onClick={async () => {
                        if (!confirm('Anular esta folga?')) return;
                        await fetch(`/api/pt/folgas/${b.id}`, { method: 'DELETE' });
                        location.reload();
                      }}
                    >
                      ❌ Anular
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
