import * as React from 'react';
import { createServerClient } from '@/lib/supabaseServer';

export const dynamic = 'force-dynamic';

type Log = {
  id: string | number;
  created_at: string | null;
  actor?: string | null;
  action?: string | null;
  target?: string | null;
  meta?: any | null;
};

export default async function AdminHistoryPage() {
  const sb = createServerClient();

  let logs: Log[] = [];
  let errorMessage: string | null = null;

  try {
    const { data, error } = await sb
      .from('audit_logs')
      .select('id, created_at, actor, action, target, meta')
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) errorMessage = error.message;
    else logs = (data ?? []) as Log[];
  } catch (e: any) {
    errorMessage = e?.message ?? 'Erro ao carregar o histórico.';
  }

  return (
    <div style={{ padding: 16 }}>
      <h1 style={{ marginBottom: 12 }}>Histórico</h1>

      {errorMessage ? (
        <div
          style={{
            padding: 12,
            border: '1px solid #e2e8f0',
            borderRadius: 8,
            background: '#fffbe6',
          }}
        >
          Não foi possível carregar o histórico: {errorMessage}
        </div>
      ) : logs.length === 0 ? (
        <div>Sem registos para mostrar.</div>
      ) : (
        <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: 8 }}>
          {logs.map((l) => {
            const ts = l.created_at
              ? new Date(l.created_at)
              : new Date();
            return (
              <li
                key={String(l.id)}
                style={{
                  border: '1px solid #e2e8f0',
                  borderRadius: 8,
                  padding: '8px 12px',
                }}
              >
                <div style={{ fontSize: 13, color: '#6b7280' }}>
                  {ts.toLocaleString('pt-PT')}
                </div>
                <div style={{ fontSize: 14 }}>
                  <strong>{l.actor ?? 'Sistema'}</strong>{' '}
                  {l.action ?? 'executou uma ação'}
                  {l.target ? ` em "${l.target}"` : ''}.
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
