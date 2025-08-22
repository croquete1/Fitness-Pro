'use client';

import React, { useMemo, useOptimistic, useState, useTransition } from 'react';
import { useToast } from '@/components/ui/Toaster';
import { useRouter } from 'next/navigation';

type Row = {
  id: string;
  name: string | null;
  email: string | null;
  role: string;   // ADMIN/TRAINER/CLIENT (ou pt/admin/client)
  status: string; // PENDING/ACTIVE/SUSPENDED
  createdAt: string;
};

function displayRole(role: string): string {
  const r = String(role ?? '').trim().toUpperCase();
  if (r === 'ADMIN') return 'Administrador';
  if (r === 'TRAINER' || r === 'PT') return 'Personal Trainer';
  if (r === 'CLIENT') return 'Cliente';
  return '—';
}

function displayStatus(status: string): string {
  const s = String(status ?? '').trim().toUpperCase();
  if (s === 'PENDING') return 'Pendente';
  if (s === 'ACTIVE') return 'Ativo';
  if (s === 'SUSPENDED') return 'Suspenso';
  return '—';
}

function Spinner({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" style={{ verticalAlign: 'middle', animation: 'spin .6s linear infinite' }}>
      <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" strokeWidth="3" opacity="0.25" />
      <path d="M22 12a10 10 0 0 0-10-10" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

export default function ApprovalsClient({ initial }: { initial: Row[] }) {
  const [isPending, start] = useTransition();
  const [rows, setRows] = useOptimistic<Row[], { id: string }>(initial, (state, payload) =>
    state.filter((r) => r.id !== payload.id)
  );
  const { push } = useToast();
  const router = useRouter();

  // filtros
  const [q, setQ] = useState('');
  const [role, setRole] = useState<'ALL' | 'ADMIN' | 'TRAINER' | 'CLIENT'>('ALL');
  const [status, setStatus] = useState<'ALL' | 'PENDING' | 'ACTIVE' | 'SUSPENDED'>('ALL');

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    return rows.filter((r) => {
      const rRole = (r.role ?? '').toString().toUpperCase();
      const rStatus = (r.status ?? '').toString().toUpperCase();
      const matchQ =
        !term ||
        (r.name ?? '').toLowerCase().includes(term) ||
        (r.email ?? '').toLowerCase().includes(term);
      const matchRole = role === 'ALL' || rRole === role || (role === 'TRAINER' && rRole === 'PT');
      const matchStatus = status === 'ALL' || rStatus === status;
      return matchQ && matchRole && matchStatus;
    });
  }, [rows, q, role, status]);

  async function act(id: string, action: 'approve' | 'suspend') {
    start(() => setRows({ id })); // otimista
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
        router.refresh();
      } else {
        router.refresh();
        push({ title: 'Falhou a ação', variant: 'error' });
      }
    } catch {
      router.refresh();
      push({ title: 'Erro de rede', variant: 'error' });
    }
  }

  return (
    <div className="card" style={{ padding: 16 }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr auto auto auto', gap: 8, alignItems: 'center', marginBottom: 12 }}>
        <h1 style={{ margin: 0, fontSize: 20, fontWeight: 700 }}>Aprovações de conta</h1>

        <input
          placeholder="Pesquisar nome/email…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          style={{ padding: '8px 10px', borderRadius: 10, border: '1px solid var(--border)', background: 'var(--btn-bg)' }}
        />

        <select
          value={role}
          onChange={(e) => setRole(e.target.value as any)}
          style={{ padding: '8px 10px', borderRadius: 10, border: '1px solid var(--border)', background: 'var(--btn-bg)' }}
        >
          <option value="ALL">Todos os perfis</option>
          <option value="ADMIN">Administrador</option>
          <option value="TRAINER">Personal Trainer</option>
          <option value="CLIENT">Cliente</option>
        </select>

        <div style={{ display: 'flex', gap: 8 }}>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as any)}
            style={{ padding: '8px 10px', borderRadius: 10, border: '1px solid var(--border)', background: 'var(--btn-bg)' }}
          >
            <option value="ALL">Todos os estados</option>
            <option value="PENDING">Pendente</option>
            <option value="ACTIVE">Ativo</option>
            <option value="SUSPENDED">Suspenso</option>
          </select>

          <button
            className="btn"
            onClick={() => start(() => router.refresh())}
            disabled={isPending}
            title="Recarregar"
            style={{ padding: '8px 10px', borderRadius: 10, border: '1px solid var(--border)', background: 'var(--btn-bg)' }}
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
      </div>

      {filtered.length === 0 ? (
        <p>Sem resultados.</p>
      ) : (
        <div style={{ overflow: 'auto' }}>
          <table className="table" style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 0 }}>
            <thead>
              <tr>
                <th style={{ textAlign: 'left', padding: 8 }}>Nome</th>
                <th style={{ textAlign: 'left', padding: 8 }}>Email</th>
                <th style={{ textAlign: 'left', padding: 8 }}>Perfil</th>
                <th style={{ textAlign: 'left', padding: 8 }}>Estado</th>
                <th style={{ textAlign: 'left', padding: 8 }}>Criado em</th>
                <th style={{ padding: 8, textAlign: 'right' }}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r) => (
                <tr key={r.id} className="row-in" style={{ borderTop: '1px solid var(--border)' }}>
                  <td style={{ padding: 8 }}>{r.name ?? '—'}</td>
                  <td style={{ padding: 8 }}>{r.email ?? '—'}</td>
                  <td style={{ padding: 8 }}>{displayRole(r.role)}</td>
                  <td style={{ padding: 8 }}>{displayStatus(r.status)}</td>
                  <td style={{ padding: 8 }}>{new Date(r.createdAt).toLocaleString('pt-PT')}</td>
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
            .row-in { animation: row-in 180ms cubic-bezier(.2,.8,.2,1); }
            @keyframes row-in { from { opacity: 0; transform: translateY(4px);} to { opacity: 1; transform: translateY(0);} }
            @keyframes spin { from { transform: rotate(0deg);} to { transform: rotate(360deg);} }
          `}</style>
        </div>
      )}
    </div>
  );
}
