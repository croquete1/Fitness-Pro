'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

type PendingUser = {
  id: string;
  name: string | null;
  email: string;
  createdAt: string;
  status: 'PENDING' | 'ACTIVE' | 'SUSPENDED';
  role?: string | null;
};

export default function ApprovalsClient() {
  const [data, setData] = useState<PendingUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchList = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/approvals', { cache: 'no-store' });
      if (!res.ok) throw new Error(await res.text());
      const json = await res.json();
      setData(json.users as PendingUser[]);
      setError(null);
    } catch (e: any) {
      setError(e?.message || 'Falha ao obter aprovações');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // first load
    fetchList();
    // polling ~tempo real
    timer.current = setInterval(fetchList, 5000);
    return () => {
      if (timer.current) clearInterval(timer.current);
    };
  }, [fetchList]);

  const onAction = useCallback(
    async (id: string, action: 'approve' | 'reject') => {
      setBusyId(id);
      // optimista: remove já da lista
      const prev = data;
      setData((list) => list.filter((u) => u.id !== id));
      try {
        const res = await fetch('/api/admin/approvals', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id, action }),
        });
        if (!res.ok) throw new Error(await res.text());
      } catch (e) {
        // rollback se falhar
        setData(prev);
        alert('Não foi possível concluir a operação.');
      } finally {
        setBusyId(null);
      }
    },
    [data]
  );

  const empty = useMemo(() => !loading && data.length === 0, [loading, data.length]);

  return (
    <div className="card" style={{ padding: 16 }}>
      <div className="flex items-center justify-between mb-3">
        <div className="font-semibold">Pedidos pendentes</div>
        <div className="text-muted small">
          {loading ? 'A carregar…' : `${data.length} pendente(s)`}
        </div>
      </div>

      {error && (
        <div className="badge-danger" style={{ marginBottom: 12 }}>
          {error}
        </div>
      )}

      {empty ? (
        <div className="text-muted" style={{ padding: '12px 4px' }}>
          Sem pedidos pendentes.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 0 }}>
            <thead>
              <tr className="text-muted small" style={{ textAlign: 'left' }}>
                <th style={{ padding: '8px 10px' }}>Utilizador</th>
                <th style={{ padding: '8px 10px' }}>Email</th>
                <th style={{ padding: '8px 10px' }}>Criado</th>
                <th style={{ padding: '8px 10px' }}>Perfil</th>
                <th style={{ padding: '8px 10px', width: 200 }}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {data.map((u) => (
                <tr key={u.id} style={{ borderTop: '1px solid var(--border)' }}>
                  <td style={{ padding: '10px' }}>{u.name || '—'}</td>
                  <td style={{ padding: '10px' }}>{u.email}</td>
                  <td style={{ padding: '10px' }}>
                    {new Date(u.createdAt).toLocaleString()}
                  </td>
                  <td style={{ padding: '10px' }}>{u.role || '—'}</td>
                  <td style={{ padding: '10px' }}>
                    <div className="flex gap-2">
                      <button
                        disabled={busyId === u.id}
                        onClick={() => onAction(u.id, 'approve')}
                        className="btn"
                        style={{
                          background: 'var(--primary)',
                          color: '#fff',
                          padding: '8px 12px',
                          borderRadius: 10,
                        }}
                      >
                        Aprovar
                      </button>
                      <button
                        disabled={busyId === u.id}
                        onClick={() => onAction(u.id, 'reject')}
                        className="btn ghost"
                        style={{
                          padding: '8px 12px',
                          borderRadius: 10,
                          border: '1px solid var(--border)',
                        }}
                      >
                        Rejeitar
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {loading && (
                <tr>
                  <td colSpan={5} style={{ padding: 12 }} className="text-muted">
                    A carregar…
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
