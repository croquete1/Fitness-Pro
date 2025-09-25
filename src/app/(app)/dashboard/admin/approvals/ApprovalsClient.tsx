'use client';

import * as React from 'react';
import {
  Box, Button, Chip, Container, Dialog, DialogActions, DialogContent, DialogTitle,
  MenuItem, Select, Stack, Table, TableBody, TableCell, TableHead, TableRow, TextField, Typography
} from '@mui/material';
import { toast } from '@/components/ui/Toaster';

type Role = 'ADMIN' | 'TRAINER' | 'CLIENT' | string;
type Status = 'PENDING' | 'ACTIVE' | 'SUSPENDED' | 'REJECTED' | string;

type PendingRow = {
  id: string;
  name: string;
  email?: string;
  requestedRole?: Role;
  status?: Status;          // normalmente "PENDING"
  createdAt?: string;
  meta?: any;
};

type PageResult = { items: any[]; total?: number };

/* =========================
   Utils – fetchers tolerantes
   ========================= */

async function fetchFirstOkPaged(page: number, limit: number): Promise<PageResult> {
  const urls = [
    `/api/admin/approvals?page=${page}&limit=${limit}`,
    `/api/admin/users?status=PENDING&page=${page}&limit=${limit}`,
    `/api/admin/pending-users?page=${page}&limit=${limit}`,
  ];
  for (const u of urls) {
    try {
      const r = await fetch(u, { credentials: 'include', cache: 'no-store' });
      if (r.ok) {
        const total = Number(r.headers.get('x-total-count') ?? '') || undefined;
        const j = await r.json();
        if (Array.isArray(j)) return { items: j, total };
        if (Array.isArray(j?.data)) return { items: j.data, total: j.total ?? total };
        if (Array.isArray(j?.users)) return { items: j.users, total: j.total ?? total };
        if (Array.isArray(j?.pending)) return { items: j.pending, total: j.total ?? total };
      }
    } catch {}
  }
  for (const u of ['/api/admin/approvals', '/api/admin/users?status=PENDING', '/api/admin/pending-users']) {
    try {
      const r = await fetch(u, { credentials: 'include', cache: 'no-store' });
      if (r.ok) {
        const j = await r.json();
        const arr =
          Array.isArray(j) ? j :
          Array.isArray(j?.data) ? j.data :
          Array.isArray(j?.users) ? j.users :
          Array.isArray(j?.pending) ? j.pending : [];
        const start = (page - 1) * limit;
        return { items: arr.slice(start, start + limit), total: arr.length };
      }
    } catch {}
  }
  return { items: [], total: 0 };
}

function coerce(items: any[]): PendingRow[] {
  return items.map((x: any, i: number) => ({
    id: String(x.id ?? x.userId ?? x._id ?? i),
    name: String(x.name ?? x.fullName ?? x.username ?? '—'),
    email: x.email ?? x.mail ?? undefined,
    requestedRole: (x.requestedRole ?? x.role ?? x.type ?? 'CLIENT') as Role,
    status: (x.status ?? x.state ?? 'PENDING') as Status,
    createdAt: x.createdAt ?? x.created_at ?? x.when ?? undefined,
    meta: x,
  }));
}

async function postApprove(id: string, role: Role) {
  const bodies = [
    { url: `/api/admin/approvals/${id}/approve`, method: 'POST', body: { role } },
    { url: `/api/admin/users/${id}/status`, method: 'POST', body: { status: 'ACTIVE', role } },
    { url: `/api/admin/users/${id}`, method: 'PATCH', body: { status: 'ACTIVE', role } },
  ];
  for (const b of bodies) {
    try {
      const r = await fetch(b.url, {
        method: b.method,
        headers: { 'content-type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(b.body),
      });
      if (r.ok) return await r.json().catch(() => ({}));
    } catch {}
  }
  throw new Error('Falha ao aprovar utilizador.');
}

async function postReject(id: string, reason?: string) {
  const bodies = [
    { url: `/api/admin/approvals/${id}/reject`, method: 'POST', body: { reason } },
    { url: `/api/admin/users/${id}/status`, method: 'POST', body: { status: 'SUSPENDED', reason } },
    { url: `/api/admin/users/${id}`, method: 'PATCH', body: { status: 'SUSPENDED', reason } },
  ];
  for (const b of bodies) {
    try {
      const r = await fetch(b.url, {
        method: b.method,
        headers: { 'content-type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(b.body),
      });
      if (r.ok) return await r.json().catch(() => ({}));
    } catch {}
  }
  throw new Error('Falha ao rejeitar pedido.');
}

/* =========================
   Componente (MUI)
   ========================= */

export default function ApprovalsClient() {
  const [items, setItems] = React.useState<PendingRow[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [q, setQ] = React.useState('');
  const [role, setRole] = React.useState<Role | 'ALL'>('ALL');
  const [page, setPage] = React.useState(1);
  const [limit, setLimit] = React.useState(20);
  const [total, setTotal] = React.useState(0);

  const [viewU, setViewU] = React.useState<PendingRow | null>(null);
  const [editU, setEditU] = React.useState<PendingRow | null>(null);
  const [approveRole, setApproveRole] = React.useState<Role>('CLIENT');
  const [busy, setBusy] = React.useState(false);
  const [rejectReason, setRejectReason] = React.useState('');

  // carregar página
  React.useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      const res = await fetchFirstOkPaged(page, limit);
      if (!cancelled) {
        setItems(coerce(res.items));
        setTotal(res.total ?? res.items.length);
        setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [page, limit]);

  // SSE (tempo-real)
  const esRef = React.useRef<EventSource | null>(null);
  React.useEffect(() => {
    const candidates = ['/api/admin/approvals/stream', '/api/events?topic=approvals'];
    let opened = false;
    for (const url of candidates) {
      try {
        const es = new EventSource(url, { withCredentials: true });
        es.onmessage = (ev) => {
          opened = true;
          try {
            const data = JSON.parse(ev.data);
            const arr = Array.isArray(data) ? data : [data];
            setItems((current) => {
              const map = new Map(current.map(x => [x.id, x]));
              for (const raw of arr) {
                const p = coerce([raw])[0];
                if (p.status && String(p.status).toUpperCase() !== 'PENDING') {
                  map.delete(p.id);
                } else {
                  map.set(p.id, { ...(map.get(p.id) ?? p), ...p });
                }
              }
              return Array.from(map.values());
            });
          } catch {}
        };
        es.onerror = () => {};
        esRef.current = es;
        break;
      } catch {}
    }
    const poll = setInterval(async () => {
      if (opened) return;
      try {
        const res = await fetchFirstOkPaged(page, limit);
        setItems(coerce(res.items));
        setTotal(res.total ?? res.items.length);
      } catch {}
    }, 10000);
    return () => {
      if (esRef.current) { esRef.current.close(); esRef.current = null; }
      clearInterval(poll);
    };
  }, [page, limit]);

  const view = React.useMemo(() => {
    const t = q.trim().toLowerCase();
    return items.filter(u => {
      const okRole = role === 'ALL' ? true : (u.requestedRole ?? '').toUpperCase().includes(String(role));
      const okQ = !t
        ? true
        : (u.name?.toLowerCase().includes(t) ||
           (u.email ?? '').toLowerCase().includes(t) ||
           (u.requestedRole ?? '').toLowerCase().includes(t));
      return okRole && okQ;
    });
  }, [items, q, role]);

  const effectiveTotal = total || view.length || 0;
  const pageCount = Math.max(1, Math.ceil(effectiveTotal / limit));

  async function handleApprove(u: PendingRow, r: Role) {
    setBusy(true);
    try {
      await postApprove(u.id, r);
      setItems(list => list.filter(x => x.id !== u.id));
      setEditU(null);
      toast('Utilizador aprovado ✅', 2500, 'success');
    } catch (e) {
      toast((e as Error).message || 'Falha ao aprovar', 3000, 'error');
    } finally {
      setBusy(false);
    }
  }

  async function handleReject(u: PendingRow, reason?: string) {
    setBusy(true);
    try {
      await postReject(u.id, reason);
      setItems(list => list.filter(x => x.id !== u.id));
      setEditU(null);
      toast('Pedido rejeitado 🗑️', 2500, 'success');
    } catch (e) {
      toast((e as Error).message || 'Falha ao rejeitar', 3000, 'error');
    } finally {
      setBusy(false);
    }
  }

  return (
    <Container maxWidth="lg" sx={{ display:'grid', gap: 2 }}>
      <Typography variant="h5" fontWeight={800}>Aprovações de Conta</Typography>

      {/* Filtros */}
      <Box sx={{ p: 2, borderRadius: 3, bgcolor:'background.paper', border:'1px solid', borderColor:'divider' }}>
        <Stack direction="row" gap={2} flexWrap="wrap" alignItems="center">
          <TextField
            type="search"
            label="🔎 Pesquisar"
            placeholder="nome, email, role…"
            value={q}
            onChange={(e) => { setQ(e.target.value); setPage(1); }}
            sx={{ minWidth: 280 }}
          />
          <Select
            value={role}
            onChange={(e) => { setRole(e.target.value as any); setPage(1); }}
            displayEmpty
            renderValue={(v) => (v === 'ALL' ? 'Todos os roles' : String(v))}
            sx={{ minWidth: 220 }}
          >
            <MenuItem value="ALL">Todos os roles</MenuItem>
            <MenuItem value="TRAINER">Personal Trainers</MenuItem>
            <MenuItem value="CLIENT">Clientes</MenuItem>
            <MenuItem value="ADMIN">Admins</MenuItem>
          </Select>

          <Stack direction="row" gap={1} sx={{ ml: 'auto' }} alignItems="center">
            <Typography variant="caption" sx={{ opacity:.75 }}>
              {view.length} itens nesta página • {effectiveTotal} total
            </Typography>
            <Select
              value={limit}
              onChange={(e) => { setLimit(Number(e.target.value)); setPage(1); }}
              size="small"
            >
              <MenuItem value={10}>10</MenuItem>
              <MenuItem value={20}>20</MenuItem>
              <MenuItem value={50}>50</MenuItem>
            </Select>
          </Stack>
        </Stack>
      </Box>

      {/* Tabela */}
      <Box sx={{ borderRadius: 3, bgcolor:'background.paper', border:'1px solid', borderColor:'divider', overflow:'hidden' }}>
        <Table size="small">
          <TableHead sx={{ bgcolor: 'action.hover' }}>
            <TableRow>
              <TableCell>Nome</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Role pedido</TableCell>
              <TableCell>Criado</TableCell>
              <TableCell align="right" width={280}>Ações</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading && (
              <TableRow><TableCell colSpan={5} align="center" sx={{ py: 4 }}>A carregar…</TableCell></TableRow>
            )}
            {!loading && view.length === 0 && (
              <TableRow><TableCell colSpan={5} align="center" sx={{ py: 4, opacity:.7 }}>Sem pedidos pendentes.</TableCell></TableRow>
            )}
            {view.map((u) => (
              <TableRow key={u.id} hover>
                <TableCell><strong>{u.name}</strong></TableCell>
                <TableCell>{u.email ?? '—'}</TableCell>
                <TableCell>
                  <Chip
                    label={u.requestedRole ?? 'CLIENT'}
                    size="small"
                    color={String(u.requestedRole).toUpperCase() === 'ADMIN' ? 'secondary' :
                           String(u.requestedRole).toUpperCase() === 'TRAINER' ? 'primary' : 'default'}
                  />
                </TableCell>
                <TableCell>{u.createdAt ? new Date(u.createdAt).toLocaleString() : '—'}</TableCell>
                <TableCell align="right">
                  <Stack direction="row" gap={1} justifyContent="flex-end">
                    <Button size="small" onClick={() => setViewU(u)}>👁️ Ver</Button>
                    <Button
                      size="small" variant="contained"
                      onClick={() => { setEditU(u); setApproveRole((u.requestedRole as Role) ?? 'CLIENT'); setRejectReason(''); }}
                    >
                      ✅ Aprovar / ❌ Rejeitar
                    </Button>
                  </Stack>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Box>

      {/* paginação */}
      <Stack direction="row" gap={1} alignItems="center" sx={{ ml:'auto' }}>
        <Button disabled={page<=1} onClick={() => setPage(p => Math.max(1, p-1))}>◀ Anterior</Button>
        <Typography variant="caption">Página {page} de {pageCount}</Typography>
        <Button disabled={page>=pageCount} onClick={() => setPage(p => Math.min(pageCount, p+1))}>Seguinte ▶</Button>
      </Stack>

      {/* Dialog Ver */}
      <Dialog open={!!viewU} onClose={() => setViewU(null)} fullWidth maxWidth="sm">
        <DialogTitle>👁️ {viewU?.name ?? 'Pedido'}</DialogTitle>
        <DialogContent dividers>
          <Stack gap={1} sx={{ fontSize: 14 }}>
            <div><b>Nome:</b> {viewU?.name}</div>
            <div><b>Email:</b> {viewU?.email ?? '—'}</div>
            <div><b>Role pedido:</b> {viewU?.requestedRole ?? 'CLIENT'}</div>
            <div><b>Criado:</b> {viewU?.createdAt ? new Date(viewU.createdAt).toLocaleString() : '—'}</div>
            {viewU?.meta && (
              <Box component="pre" sx={{ bgcolor:'action.hover', p:1.5, borderRadius:2, overflow:'auto' }}>
                {JSON.stringify(viewU.meta, null, 2)}
              </Box>
            )}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setViewU(null)}>Fechar</Button>
        </DialogActions>
      </Dialog>

      {/* Dialog Aprovar/Rejeitar */}
      <Dialog open={!!editU} onClose={() => setEditU(null)} fullWidth maxWidth="sm">
        <DialogTitle>✅ Aprovar / ❌ Rejeitar — {editU?.name}</DialogTitle>
        <DialogContent dividers>
          <Stack gap={2}>
            <TextField
              select label="Role a atribuir"
              value={approveRole}
              onChange={(e) => setApproveRole(e.target.value as Role)}
            >
              <MenuItem value="CLIENT">Cliente</MenuItem>
              <MenuItem value="TRAINER">Personal Trainer</MenuItem>
              <MenuItem value="ADMIN">Admin</MenuItem>
            </TextField>
            <Typography variant="caption" sx={{ opacity:.8 }}>
              Ao aprovar, o estado passa para <b>ACTIVE</b> com o papel escolhido.
            </Typography>
            <TextField
              label="Motivo da rejeição (opcional)"
              placeholder="ex.: dados inválidos"
              value={rejectReason}
              onChange={(e)=>setRejectReason(e.target.value)}
              multiline minRows={2}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditU(null)}>❌ Cancelar</Button>
          <Button color="error" disabled={busy || !editU} onClick={() => editU && handleReject(editU, rejectReason)}>
            {busy ? 'A rejeitar…' : '🗑️ Rejeitar'}
          </Button>
          <Button variant="contained" disabled={busy || !editU} onClick={() => editU && handleApprove(editU, approveRole)}>
            {busy ? 'A aprovar…' : '✅ Aprovar'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
