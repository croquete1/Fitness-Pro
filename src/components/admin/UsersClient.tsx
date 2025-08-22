'use client';

import React, { useEffect, useMemo, useState, useTransition } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useToast } from '@/components/ui/Toaster';

type Role = 'ADMIN' | 'TRAINER' | 'CLIENT';
type Status = 'ACTIVE' | 'PENDING' | 'SUSPENDED';

type Row = {
  id: string;
  name: string | null;
  email: string | null;
  role: Role;
  status: Status;
  createdAt: string;
};
type Payload = {
  page: number;
  pageSize: number;
  total: number;
  pages: number;
  items: Row[];
};

const roleOptions = [
  { label: 'Admin', value: 'ADMIN' },
  { label: 'Personal Trainer', value: 'TRAINER' },
  { label: 'Cliente', value: 'CLIENT' },
] as const;

const statusOptions = [
  { label: 'Ativo', value: 'ACTIVE' },
  { label: 'Pendente', value: 'PENDING' },
  { label: 'Suspenso', value: 'SUSPENDED' },
] as const;

const sortOptions = [
  { label: 'Mais recentes', value: 'createdAt:desc' },
  { label: 'Mais antigos', value: 'createdAt:asc' },
  { label: 'Nome A-Z', value: 'name:asc' },
  { label: 'Nome Z-A', value: 'name:desc' },
] as const;

export default function UsersClient({ initial }: { initial: Payload }) {
  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();
  const { push } = useToast();

  const [data, setData] = useState<Payload>(initial);
  const [isPending, start] = useTransition();

  // filtros/estado da URL
  const qInit = sp.get('q') ?? '';
  const roleInit = sp.get('role') ?? '';
  const statusInit = sp.get('status') ?? '';
  const sortInit = sp.get('sort') ?? 'createdAt:desc';
  const pageInit = parseInt(sp.get('page') || '1', 10) || 1;
  const pageSizeInit = parseInt(sp.get('pageSize') || '20', 10) || 20;

  const [q, setQ] = useState(qInit);
  const [role, setRole] = useState(roleInit);
  const [status, setStatus] = useState(statusInit);
  const [sort, setSort] = useState(sortInit);
  const [page, setPage] = useState(pageInit);
  const [pageSize, setPageSize] = useState(pageSizeInit);

  // modal
  const [modalId, setModalId] = useState<string | null>(null);
  const [modalData, setModalData] = useState<Row | null>(null);
  const [modalLoading, setModalLoading] = useState(false);

  const fetchNow = useMemo(
    () => async (params: URLSearchParams) => {
      const url = `/api/admin/users?${params.toString()}`;
      const res = await fetch(url, { cache: 'no-store' });
      const json = (await res.json()) as Payload;
      setData(json);
    },
    []
  );

  function pushURL() {
    const params = new URLSearchParams();
    if (q) params.set('q', q);
    if (role) params.set('role', role);
    if (status) params.set('status', status);
    if (sort) params.set('sort', sort);
    params.set('page', String(page));
    params.set('pageSize', String(pageSize));
    router.replace(`${pathname}?${params.toString()}`);
    start(() => fetchNow(params));
  }

  // debounce search
  useEffect(() => {
    const t = setTimeout(() => {
      setPage(1);
      pushURL();
    }, 300);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q]);

  useEffect(() => {
    setPage(1);
    pushURL();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [role, status, sort, pageSize]);

  useEffect(() => {
    pushURL();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  // --------- AÇÕES INLINE ---------
  async function patchUser(id: string, patch: Partial<Pick<Row, 'role' | 'status'>>) {
    const res = await fetch(`/api/admin/users/${id}`, {
      method: 'PATCH',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(patch),
    });
    return res.ok;
  }

  function updateLocal(id: string, patch: Partial<Pick<Row, 'role' | 'status'>>) {
    setData((D) => ({
      ...D,
      items: D.items.map((it) => (it.id === id ? { ...it, ...patch } : it)),
    }));
  }

  async function onChangeRole(id: string, value: Role) {
    const prev = data.items.find((x) => x.id === id)?.role;
    updateLocal(id, { role: value });
    const ok = await patchUser(id, { role: value });
    if (ok) {
      push({ title: 'Role atualizado', variant: 'success' });
      router.refresh(); // força atualização dos contadores no header
    } else {
      updateLocal(id, { role: prev as Role });
      push({ title: 'Falha a atualizar role', variant: 'error' });
    }
  }

  async function onChangeStatus(id: string, value: Status) {
    const prev = data.items.find((x) => x.id === id)?.status;
    updateLocal(id, { status: value });
    const ok = await patchUser(id, { status: value });
    if (ok) {
      push({ title: 'Estado atualizado', variant: 'success' });
      router.refresh();
    } else {
      updateLocal(id, { status: prev as Status });
      push({ title: 'Falha a atualizar estado', variant: 'error' });
    }
  }

  // --------- MODAL “VER PERFIL” ---------
  async function openModal(id: string) {
    setModalId(id);
    setModalLoading(true);
    setModalData(null);
    try {
      const res = await fetch(`/api/admin/users/${id}`, { cache: 'no-store' });
      if (res.ok) {
        const j = await res.json();
        setModalData(j);
      }
    } finally {
      setModalLoading(false);
    }
  }
  function closeModal() {
    setModalId(null);
    setModalData(null);
  }

  // --------- EXPORT CSV ---------
  async function exportCSV() {
    // busca “tudo” com os mesmos filtros (até 10k por segurança)
    const params = new URLSearchParams();
    if (q) params.set('q', q);
    if (role) params.set('role', role);
    if (status) params.set('status', status);
    if (sort) params.set('sort', sort);
    params.set('page', '1');
    params.set('pageSize', '10000');

    const res = await fetch(`/api/admin/users?${params.toString()}`, { cache: 'no-store' });
    const json = (await res.json()) as Payload;

    const rows = json.items;
    const header = ['id', 'name', 'email', 'role', 'status', 'createdAt'];
    const lines = [
      header.join(','),
      ...rows.map((r) =>
        [
          r.id,
          safeCsv(r.name),
          safeCsv(r.email),
          r.role,
          r.status,
          new Date(r.createdAt).toISOString(),
        ].join(',')
      ),
    ];
    const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `utilizadores_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    push({ title: 'CSV exportado', variant: 'success' });
  }

  function safeCsv(v: string | null) {
    if (v == null) return '';
    const needsWrap = /[",\n]/.test(v);
    const escaped = v.replaceAll('"', '""');
    return needsWrap ? `"${escaped}"` : escaped;
  }

  return (
    <div className="card" style={{ padding: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
        <h1 style={{ marginRight: 'auto' }}>Utilizadores</h1>
        <button className="btn icon" onClick={exportCSV} title="Exportar CSV">⬇️</button>
      </div>

      {/* Filtros */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr repeat(4, minmax(140px, 200px))', gap: 8, marginBottom: 12 }}>
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Procurar por nome/email…"
          style={{ padding: 10, borderRadius: 10, border: '1px solid var(--border)' }}
        />
        <select value={role} onChange={(e) => setRole(e.target.value)} style={{ padding: 10, borderRadius: 10, border: '1px solid var(--border)' }}>
          <option value="">Todos os perfis</option>
          {roleOptions.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
        </select>
        <select value={status} onChange={(e) => setStatus(e.target.value)} style={{ padding: 10, borderRadius: 10, border: '1px solid var(--border)' }}>
          <option value="">Todos os estados</option>
          {statusOptions.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
        </select>
        <select value={sort} onChange={(e) => setSort(e.target.value)} style={{ padding: 10, borderRadius: 10, border: '1px solid var(--border)' }}>
          {sortOptions.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
        </select>
        <select value={pageSize} onChange={(e) => setPageSize(parseInt(e.target.value, 10))} style={{ padding: 10, borderRadius: 10, border: '1px solid var(--border)' }}>
          {[10, 20, 50, 100].map((n) => <option key={n} value={n}>{n}/página</option>)}
        </select>
      </div>

      {/* Tabela */}
      <div style={{ overflow: 'auto', position: 'relative' }}>
        {isPending && (
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,.03)', display: 'grid', placeItems: 'center', zIndex: 1, pointerEvents: 'none' }}>
            <div className="spinner" />
          </div>
        )}
        <table className="table" style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 0 }}>
          <thead>
            <tr>
              <th style={{ textAlign: 'left', padding: 8 }}>Nome</th>
              <th style={{ textAlign: 'left', padding: 8 }}>Email</th>
              <th style={{ textAlign: 'left', padding: 8, width: 180 }}>Perfil</th>
              <th style={{ textAlign: 'left', padding: 8, width: 180 }}>Estado</th>
              <th style={{ textAlign: 'left', padding: 8 }}>Criado em</th>
              <th style={{ padding: 8 }}>Ações</th>
            </tr>
          </thead>
          <tbody>
            {data.items.map((u) => (
              <tr key={u.id} style={{ borderTop: '1px solid var(--border)' }}>
                <td style={{ padding: 8 }}>{u.name ?? '—'}</td>
                <td style={{ padding: 8 }}>{u.email ?? '—'}</td>
                <td style={{ padding: 8 }}>
                  <select
                    value={u.role}
                    onChange={(e) => onChangeRole(u.id, e.target.value as Role)}
                    style={{ padding: 8, borderRadius: 10, border: '1px solid var(--border)', width: '100%' }}
                  >
                    {roleOptions.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
                  </select>
                </td>
                <td style={{ padding: 8 }}>
                  <select
                    value={u.status}
                    onChange={(e) => onChangeStatus(u.id, e.target.value as Status)}
                    style={{ padding: 8, borderRadius: 10, border: '1px solid var(--border)', width: '100%' }}
                  >
                    {statusOptions.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
                  </select>
                </td>
                <td style={{ padding: 8 }}>{new Date(u.createdAt).toLocaleString()}</td>
                <td style={{ padding: 8, whiteSpace: 'nowrap' }}>
                  <button className="btn icon" onClick={() => openModal(u.id)} title="Ver perfil">👁️</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Paginação */}
      <div style={{ display: 'flex', gap: 8, alignItems: 'center', justifyContent: 'space-between', marginTop: 12 }}>
        <div>Mostrando {(data.page - 1) * data.pageSize + 1}–{Math.min(data.page * data.pageSize, data.total)} de {data.total}</div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn icon" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={data.page <= 1}>◀</button>
          <div style={{ padding: '6px 10px', border: '1px solid var(--border)', borderRadius: 10 }}>
            Página {data.page} / {data.pages}
          </div>
          <button className="btn icon" onClick={() => setPage((p) => Math.min(data.pages, p + 1))} disabled={data.page >= data.pages}>▶</button>
        </div>
      </div>

      {/* Modal */}
      {modalId && (
        <div role="dialog" aria-modal="true"
          onClick={closeModal}
          style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,.35)',
            display: 'grid', placeItems: 'center', zIndex: 1000,
            animation: 'fadeIn 160ms ease',
          }}>
          <div onClick={(e) => e.stopPropagation()}
            style={{
              width: 'min(560px, 96vw)', borderRadius: 14, border: '1px solid var(--border)',
              background: 'var(--card-bg)', padding: 16, boxShadow: '0 20px 60px rgba(0,0,0,.2)',
              animation: 'popIn 160ms cubic-bezier(.2,.8,.2,1)',
            }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <h3 style={{ marginRight: 'auto' }}>Perfil</h3>
              <button className="btn icon" onClick={closeModal}>✖️</button>
            </div>

            {modalLoading ? (
              <div style={{ display: 'grid', placeItems: 'center', padding: 24 }}>
                <div className="spinner" />
              </div>
            ) : modalData ? (
              <div style={{ display: 'grid', gap: 8 }}>
                <Item label="Nome" value={modalData.name ?? '—'} />
                <Item label="Email" value={modalData.email ?? '—'} />
                <Item label="Perfil" value={labelRole(modalData.role)} />
                <Item label="Estado" value={labelStatus(modalData.status)} />
                <Item label="Criado em" value={new Date(modalData.createdAt).toLocaleString()} />
              </div>
            ) : (
              <p>Não foi possível carregar.</p>
            )}
          </div>
        </div>
      )}

      <style jsx global>{`
        .spinner {
          width: 26px; height: 26px; border-radius: 50%;
          border: 3px solid var(--border); border-top-color: var(--text);
          animation: spin 900ms linear infinite;
        }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }
        @keyframes popIn { from { transform: translateY(6px) scale(.98); opacity:.7 } to { transform: translateY(0) scale(1); opacity:1 } }
      `}</style>
    </div>
  );
}

function Item({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '160px 1fr', gap: 12 }}>
      <div style={{ color: 'var(--muted)' }}>{label}</div>
      <div>{value}</div>
    </div>
  );
}

function labelRole(r: Role) {
  return r === 'ADMIN' ? 'Admin' : r === 'TRAINER' ? 'Personal Trainer' : 'Cliente';
}
function labelStatus(s: Status) {
  return s === 'ACTIVE' ? 'Ativo' : s === 'PENDING' ? 'Pendente' : 'Suspenso';
}
