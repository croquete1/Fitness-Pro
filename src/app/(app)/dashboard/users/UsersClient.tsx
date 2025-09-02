'use client';

import { useEffect, useMemo, useState } from 'react';

export type AdminUserRow = {
  id: string;
  name: string | null;
  email: string;
  role: 'ADMIN' | 'TRAINER' | 'CLIENT';
  status: 'ACTIVE' | 'SUSPENDED' | 'PENDING';
  createdAt?: string | null;
};

export default function UsersClient({ initial }: { initial: AdminUserRow[] }) {
  const [q, setQ] = useState('');
  const [role, setRole] = useState<'ALL' | 'ADMIN' | 'TRAINER' | 'CLIENT'>('ALL');
  const [status, setStatus] = useState<'ALL' | 'ACTIVE' | 'SUSPENDED' | 'PENDING'>('ALL');
  const [rows, setRows] = useState<AdminUserRow[]>(initial);

  // fetch com debounce quando há pesquisa (server continua a poder paginar se quiseres)
  useEffect(() => {
    const id = setTimeout(async () => {
      const url = `/api/admin/users/search?q=${encodeURIComponent(q)}&role=${role}&status=${status}`;
      const res = await fetch(url, { cache: 'no-store' });
      if (res.ok) {
        const data = (await res.json()) as AdminUserRow[];
        setRows(Array.isArray(data) ? data : []);
      }
    }, 200);
    return () => clearTimeout(id);
  }, [q, role, status]);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    return rows.filter(r => {
      const okRole = role === 'ALL' || r.role === role;
      const okStatus = status === 'ALL' || r.status === status;
      const okText = !s || (r.name ?? '').toLowerCase().includes(s) || r.email.toLowerCase().includes(s);
      return okRole && okStatus && okText;
    });
  }, [rows, q, role, status]);

  return (
    <div style={{ display: 'grid', gap: 12 }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center' }}>
        <div style={{ position: 'relative' }}>
          <input
            aria-label="Pesquisar utilizadores"
            placeholder="Pesquisar por nome ou email…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="input"
            style={{ paddingLeft: 28, minWidth: 260 }}
          />
          <span aria-hidden style={{ position: 'absolute', left: 8, top: 8, opacity: .5 }}>🔎</span>
        </div>
        <select aria-label="Filtrar por role" className="input" value={role} onChange={(e) => setRole(e.target.value as any)}>
          <option value="ALL">Todos os perfis</option>
          <option value="ADMIN">ADMIN</option>
          <option value="TRAINER">TRAINER</option>
          <option value="CLIENT">CLIENT</option>
        </select>
        <select aria-label="Filtrar por estado" className="input" value={status} onChange={(e) => setStatus(e.target.value as any)}>
          <option value="ALL">Todos os estados</option>
          <option value="ACTIVE">ACTIVE</option>
          <option value="SUSPENDED">SUSPENDED</option>
          <option value="PENDING">PENDING</option>
        </select>
      </div>

      <div className="card" role="table" aria-label="Lista de utilizadores">
        <div role="row" style={{ display: 'grid', gridTemplateColumns: '2fr 2fr 1fr 1fr 1fr', padding: '10px 12px', fontSize: 12, opacity: .6 }}>
          <div>Nome</div><div>Email</div><div>Role</div><div>Estado</div><div>Criado</div>
        </div>
        {filtered.map(u => (
          <div key={u.id} role="row" style={{ display: 'grid', gridTemplateColumns: '2fr 2fr 1fr 1fr 1fr', padding: '10px 12px', borderTop: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <div style={{ width: 26, height: 26, borderRadius: 999, background: '#eef2ff', display: 'grid', placeItems: 'center', fontSize: 12, fontWeight: 700 }}>
                {(u.name ?? u.email).slice(0,1).toUpperCase()}
              </div>
              <a href={`/dashboard/users/${u.id}`} className="link">{u.name ?? '—'}</a>
            </div>
            <div>{u.email}</div>
            <div><span className="chip">{u.role}</span></div>
            <div><span className="chip">{u.status}</span></div>
            <div style={{ fontSize: 12, opacity: .7 }}>{u.createdAt ? new Date(u.createdAt).toLocaleString('pt-PT') : '—'}</div>
          </div>
        ))}
        {filtered.length === 0 && <div style={{ padding: 16, opacity: .6 }}>Sem resultados.</div>}
      </div>
    </div>
  );
}