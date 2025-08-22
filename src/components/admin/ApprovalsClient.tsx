'use client';

import React, { useOptimistic, useTransition } from 'react';
import { useToast } from '@/components/ui/Toaster';
import { useRouter } from 'next/navigation';

type Row = {
  id: string;
  name: string | null;
  email: string | null;
  role: string;
  status: string;
  createdAt: string;
};

// ——— helpers ———
function displayRole(role: string): string {
  const r = String(role ?? '').trim().toUpperCase();
  switch (r) {
    case 'ADMIN':
      return 'Administrador';
    case 'TRAINER':
    case 'PT':
      return 'Personal Trainer';
    case 'CLIENT':
      return 'Cliente';
    default:
      // fallback: mostra o que vier
      return role || '—';
  }
}

function Spinner({ size = 14 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      aria-hidden="true"
      style={{ verticalAlign: 'middle', animation: 'spin .6s linear infinite' }}
    >
      <circle
        cx="12"
        cy="12"
        r="10"
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
        opacity="0.25"
      />
      <path
        d="M22 12a10 10 0 0 0-10-10"
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  );
}

export default function ApprovalsClient({ initial }: { initial: Row[] }) {
  const [isPending, start] = useTransition();
  const [rows, setRows] = useOptimistic<Row[], { id: string }>(
    initial,
    (state, payload) => state.filter((r) => r.id !== payload.id)
  );
  const { push } = useToast();
  const router = useRouter();

  async function act(id: string, action: 'approve' | 'suspend') {
    // otimista: remove a linha de imediato
    start(() => setRows({ id }));

    try {
      const res = await fetch(`/api/admin/approvals/${id}`, {
        method: 'PATCH',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ action }),
      });

      if (res.ok) {
        push({
          title: action === 'approve' ? 'Conta aprovada' : 'Conta suspensa',
          variant: action === 'approve' ? 'success' : 'error',
        });
        router.refresh(); // sincroniza contadores/listas
      } else {
        router.refresh(); // repõe estado real
        push({ title: 'Falhou a ação', variant: 'error' });
      }
    } catch {
      router.refresh();
      push({ title: 'Erro de rede', variant: 'error' });
    }
  }

  return (
    <div className="card" style={{ padding: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
        <h1 style={{ margin: 0, fontSize: 20, fontWeight: 700 }}>Aprovações de conta</h1>
        <div style={{ flex: 1 }} />
        <button
          className="btn"
          onClick={() => start(() => router.refresh())}
          disabled={isPending}
          title="Recarregar"
          style={{
            padding: '8px 10px',
            borderRadius: 10,
            border: '1px solid var(--border)',
            background: 'var(--btn-bg)',
          }}
        >
          {isPending ? (
            <>
              <Spinner /> <span style={{ marginLeft: 8 }}>A atualizar…</span>
            </>
          ) : (
            'Recarregar'
          )}
        </button>
      </div>

      {rows.length === 0 ? (
        <p>Sem contas pendentes 🎉</p>
      ) : (
        <div style={{ overflow: 'auto' }}>
          <table
            className="table"
            style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 0 }}
          >
            <thead>
              <tr>
                <th style={{ textAlign: 'left', padding: 8 }}>Nome</th>
                <th style={{ textAlign: 'left', padding: 8 }}>Email</th>
                <th style={{ textAlign: 'left', padding: 8 }}>Role</th>
                <th style={{ textAlign: 'left', padding: 8 }}>Criado em</th>
                <th style={{ padding: 8, textAlign: 'right' }}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className="row-in" style={{ borderTop: '1px solid var(--border)' }}>
                  <td style={{ padding: 8 }}>{r.name ?? '—'}</td>
                  <td style={{ padding: 8 }}>{r.email ?? '—'}</td>
                  <td style={{ padding: 8 }}>{displayRole(r.role)}</td>
                  <td style={{ padding: 8 }}>
                    {new Date(r.createdAt).toLocaleString('pt-PT')}
                  </td>
                  <td style={{ padding: 8 }}>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
                      <button
                        className="btn icon"
                        onClick={() => act(r.id, 'approve')}
                        disabled={isPending}
                        aria-busy={isPending}
                        title="Aprovar"
                        style={{ width: 36, height: 36 }}
                      >
                        {isPending ? <Spinner /> : '✅'}
                      </button>
                      <button
                        className="btn icon"
                        onClick={() => act(r.id, 'suspend')}
                        disabled={isPending}
                        aria-busy={isPending}
                        title="Suspender"
                        style={{ width: 36, height: 36 }}
                      >
                        {isPending ? <Spinner /> : '⛔'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <style jsx global>{`
            .row-in {
              animation: row-in 180ms cubic-bezier(0.2, 0.8, 0.2, 1);
            }
            @keyframes row-in {
              from {
                opacity: 0;
                transform: translateY(4px);
              }
              to {
                opacity: 1;
                transform: translateY(0);
              }
            }
            @keyframes spin {
              from {
                transform: rotate(0deg);
              }
              to {
                transform: rotate(360deg);
              }
            }
          `}</style>
        </div>
      )}
    </div>
  );
}
