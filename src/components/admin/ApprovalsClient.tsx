'use client';

import React, { useOptimistic, useTransition } from 'react';

type Row = {
  id: string;
  name: string | null;
  email: string | null;
  role: string;
  status: string;
  createdAt: string;
};

export default function ApprovalsClient({ initial }: { initial: Row[] }) {
  const [isPending, start] = useTransition();
  const [rows, setRows] = useOptimistic<Row[], { id: string }>(
    initial,
    (state, payload) => state.filter(r => r.id !== payload.id)
  );

  async function act(id: string, action: 'approve' | 'suspend') {
    start(async () => {
      setRows({ id }); // otimista: remove da lista
      await fetch(`/api/admin/approvals/${id}`, {
        method: 'PATCH',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ action }),
      });
    });
  }

  return (
    <div className="card" style={{ padding: 16 }}>
      <h1 style={{ marginBottom: 12 }}>Aprovações de conta</h1>

      {rows.length === 0 ? (
        <p>Sem contas pendentes 🎉</p>
      ) : (
        <div style={{ overflow: 'auto' }}>
          <table className="table" style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 0 }}>
            <thead>
              <tr>
                <th style={{ textAlign: 'left', padding: 8 }}>Nome</th>
                <th style={{ textAlign: 'left', padding: 8 }}>Email</th>
                <th style={{ textAlign: 'left', padding: 8 }}>Role</th>
                <th style={{ textAlign: 'left', padding: 8 }}>Criado em</th>
                <th style={{ padding: 8 }}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {rows.map(r => (
                <tr key={r.id} style={{ borderTop: '1px solid var(--border)' }}>
                  <td style={{ padding: 8 }}>{r.name ?? '—'}</td>
                  <td style={{ padding: 8 }}>{r.email ?? '—'}</td>
                  <td style={{ padding: 8 }}>{r.role}</td>
                  <td style={{ padding: 8 }}>{new Date(r.createdAt).toLocaleString()}</td>
                  <td style={{ padding: 8, whiteSpace: 'nowrap' }}>
                    <button
                      className="btn icon"
                      onClick={() => act(r.id, 'approve')}
                      disabled={isPending}
                      title="Aprovar"
                      style={{ marginRight: 8 }}
                    >
                      ✅
                    </button>
                    <button
                      className="btn icon"
                      onClick={() => act(r.id, 'suspend')}
                      disabled={isPending}
                      title="Suspender"
                    >
                      ⛔
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
