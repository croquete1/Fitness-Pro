// src/components/admin/ApprovalsClient.tsx
'use client';

import * as React from 'react';

export type ApprovalItem = {
  id: string;
  name: string | null;
  email: string | null;
  role: 'ADMIN' | 'TRAINER' | 'CLIENT';
  status: 'PENDING' | 'ACTIVE' | 'SUSPENDED';
  createdAt: string; // ISO
};

type Props = { initial: ApprovalItem[] };

export default function ApprovalsClient({ initial }: Props) {
  const [items, setItems] = React.useState<ApprovalItem[]>(initial);
  const [busy, setBusy] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  async function act(id: string, action: 'approve' | 'reject') {
    setBusy(id);
    setError(null);
    try {
      const res = await fetch(`/api/admin/users/${id}/${action}`, { method: 'POST' });
      if (!res.ok) throw new Error(await res.text());
      setItems((curr) => curr.filter((x) => x.id !== id));
    } catch (e: any) {
      setError(e?.message || 'Falha na operação.');
    } finally {
      setBusy(null);
    }
  }

  return (
    <div style={{ display: 'grid', gap: 12 }}>
      {error && (
        <div
          style={{
            border: '1px solid var(--border-strong)',
            background: 'rgba(239,68,68,.08)',
            color: '#ef4444',
            padding: 10,
            borderRadius: 10,
          }}
        >
          {error}
        </div>
      )}

      {items.length === 0 ? (
        <div style={{ color: 'var(--muted)' }}>Sem contas pendentes de aprovação.</div>
      ) : (
        <div
          style={{
            overflow: 'auto',
            border: '1px solid var(--border)',
            borderRadius: 12,
            background: 'var(--card-bg)',
          }}
        >
          <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 0 }}>
            <thead>
              <tr style={{ background: 'var(--hover)' }}>
                <th style={th}>Nome</th>
                <th style={th}>Email</th>
                <th style={th}>Função</th>
                <th style={th}>Criado em</th>
                <th style={{ ...th, width: 180 }}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {items.map((u) => (
                <tr key={u.id} style={{ borderTop: '1px solid var(--border)' }}>
                  <td style={td}>{u.name ?? '—'}</td>
                  <td style={td}>{u.email ?? '—'}</td>
                  <td style={td}>{u.role}</td>
                  <td style={td}>{new Date(u.createdAt).toLocaleString('pt-PT')}</td>
                  <td style={{ ...td }}>
                    <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                      <button
                        disabled={busy === u.id}
                        onClick={() => act(u.id, 'reject')}
                        className="btn"
                        style={btnGhost}
                      >
                        Rejeitar
                      </button>
                      <button
                        disabled={busy === u.id}
                        onClick={() => act(u.id, 'approve')}
                        className="btn"
                        style={btnPrimary}
                      >
                        {busy === u.id ? 'A aprovar…' : 'Aprovar'}
                      </button>
                    </div>
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

const th: React.CSSProperties = {
  textAlign: 'left',
  padding: '10px 12px',
  color: 'var(--muted)',
  fontWeight: 600,
  borderBottom: '1px solid var(--border)',
};

const td: React.CSSProperties = {
  padding: '10px 12px',
  borderBottom: '1px solid var(--border)',
  verticalAlign: 'middle',
};

const btnBase: React.CSSProperties = {
  padding: '8px 12px',
  borderRadius: 10,
  border: '1px solid var(--border)',
  cursor: 'pointer',
};

const btnPrimary: React.CSSProperties = {
  ...btnBase,
  background: 'var(--active)',
  fontWeight: 700,
};

const btnGhost: React.CSSProperties = {
  ...btnBase,
  background: 'var(--btn-bg)',
};
