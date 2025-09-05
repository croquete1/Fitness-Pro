'use client';

import { useEffect, useMemo, useState } from 'react';

type Row = { id: string; name: string | null; email: string; role: string; status: string; createdAt: string };

export default function UsersClient() {
  const [q, setQ] = useState('');
  const [role, setRole] = useState<'ALL'|'CLIENT'|'TRAINER'|'ADMIN'>('ALL');
  const [page, setPage] = useState(1);
  const [rows, setRows] = useState<Row[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  const pageSize = 20;
  const fetchData = useMemo(() => {
    let timer: any;
    return (query: string, r: typeof role, p: number) => {
      clearTimeout(timer);
      timer = setTimeout(async () => {
        setLoading(true);
        const params = new URLSearchParams();
        if (query) params.set('q', query);
        if (r !== 'ALL') params.set('role', r);
        params.set('page', String(p));
        params.set('pageSize', String(pageSize));
        const res = await fetch(`/api/admin/users?${params.toString()}`, { cache: 'no-store' });
        const data = await res.json();
        setRows(data.items ?? []);
        setTotal(data.total ?? 0);
        setLoading(false);
      }, 250); // debounce
    };
  }, []);

  useEffect(() => {
    fetchData(q, role, page);
  }, [q, role, page, fetchData]);

  return (
    <div className="space-y-4">
      <div className="flex gap-2 items-center">
        <input
          value={q}
          onChange={(e) => { setPage(1); setQ(e.target.value); }}
          placeholder="Pesquisar por nome ou email…"
          className="w-full md:max-w-sm h-10 rounded-lg border border-neutral-300 dark:border-neutral-700 px-3"
        />
        <select
          value={role}
          onChange={(e) => { setPage(1); setRole(e.target.value as any); }}
          className="h-10 rounded-lg border border-neutral-300 dark:border-neutral-700 px-3"
        >
          <option value="ALL">Todos</option>
          <option value="CLIENT">Clientes</option>
          <option value="TRAINER">Treinadores</option>
          <option value="ADMIN">Admins</option>
        </select>
      </div>

      <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 overflow-hidden bg-white dark:bg-neutral-900">
        <table className="w-full text-sm">
          <thead className="bg-neutral-50 dark:bg-neutral-950/50 text-neutral-600">
            <tr>
              <th className="text-left px-4 py-3">Nome</th>
              <th className="text-left px-4 py-3">Email</th>
              <th className="text-left px-4 py-3">Role</th>
              <th className="text-left px-4 py-3">Estado</th>
              <th className="text-left px-4 py-3">Criado</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(r => (
              <tr key={r.id} className="border-t border-neutral-200 dark:border-neutral-800 hover:bg-neutral-50/60">
                <td className="px-4 py-3">
                  <a href={`/dashboard/admin/users/${r.id}`} className="underline underline-offset-2">{r.name ?? '—'}</a>
                </td>
                <td className="px-4 py-3">{r.email}</td>
                <td className="px-4 py-3">{r.role}</td>
                <td className="px-4 py-3">{r.status}</td>
                <td className="px-4 py-3">{new Date(r.createdAt).toLocaleDateString()}</td>
              </tr>
            ))}
            {!loading && rows.length === 0 && (
              <tr><td colSpan={5} className="px-4 py-10 text-center text-neutral-500">Sem resultados.</td></tr>
            )}
          </tbody>
        </table>
        {loading && <div className="px-4 py-3 text-sm text-neutral-500">A carregar…</div>}
      </div>

      <div className="flex items-center justify-between">
        <div className="text-sm text-neutral-500">Total: {total}</div>
        <div className="flex gap-2">
          <button
            className="h-9 px-3 rounded-lg border border-neutral-300 disabled:opacity-50"
            onClick={() => setPage(p => Math.max(1, p-1))}
            disabled={page === 1}
          >Anterior</button>
          <button
            className="h-9 px-3 rounded-lg border border-neutral-300 disabled:opacity-50"
            onClick={() => setPage(p => p + 1)}
            disabled={page * pageSize >= total}
          >Seguinte</button>
        </div>
      </div>
    </div>
  );
}
