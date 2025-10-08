'use client';

import * as React from 'react';
import {
  Box, Stack, TextField, MenuItem, Button, IconButton, Tooltip, Paper, Divider,
  CircularProgress, Snackbar, Alert, Dialog, DialogTitle, DialogContent, DialogActions,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteOutline from '@mui/icons-material/DeleteOutline';
import EditOutlined from '@mui/icons-material/EditOutlined';
import ContentCopyOutlined from '@mui/icons-material/ContentCopyOutlined';
import FileDownloadOutlined from '@mui/icons-material/FileDownloadOutlined';
import PrintOutlined from '@mui/icons-material/PrintOutlined';
import { DataGrid, GridColDef, GridToolbar } from '@mui/x-data-grid';
import { useRouter } from 'next/navigation';

export type Role = 'ADMIN' | 'TRAINER' | 'CLIENT' | string;
export type Status = 'active' | 'invited' | 'blocked' | string;

export type Row = {
  id: string;
  name?: string | null;
  email?: string | null;
  role?: Role;
  status?: Status;
  approved?: boolean;
  active?: boolean;
  created_at?: string | null;
};

const RoleOptions: Role[] = ['ADMIN', 'TRAINER', 'CLIENT'];
const StatusOptions: Status[] = ['active', 'invited', 'blocked'];

export default function UsersClient({
  pageSize = 20,
}: {
  pageSize?: number;
}) {
  const router = useRouter();

  const [q, setQ] = React.useState('');
  const [role, setRole] = React.useState<Role | ''>('');
  const [status, setStatus] = React.useState<Status | ''>('');

  const [rows, setRows] = React.useState<Row[]>([]);
  const [count, setCount] = React.useState(0);
  const [loading, setLoading] = React.useState(false);
  const [paginationModel, setPaginationModel] = React.useState({ page: 0, pageSize });
  const [openInNew, setOpenInNew] = React.useState(false);

  const [snack, setSnack] = React.useState<{ open:boolean; msg:string; sev:'success'|'error'|'info'|'warning' }>({ open:false, msg:'', sev:'success' });
  const closeSnack = () => setSnack(s => ({ ...s, open:false }));

  // UNDO
  const [undo, setUndo] = React.useState<{ open:boolean; row?: Row }>({ open:false });
  const closeUndo = () => setUndo({ open:false });

  // Dialog “Criar a partir deste”
  const [openClone, setOpenClone] = React.useState(false);
  const [cloneInitial, setCloneInitial] = React.useState<Partial<Row> | null>(null);
  const closeClone = (refresh?: boolean) => {
    setOpenClone(false);
    setCloneInitial(null);
    if (refresh) void fetchRows();
  };

  async function fetchRows(signal?: AbortSignal) {
    setLoading(true);
    try {
      const u = new URL('/api/admin/users', window.location.origin);
      u.searchParams.set('page', String(paginationModel.page));
      u.searchParams.set('pageSize', String(paginationModel.pageSize));
      if (q) u.searchParams.set('q', q);
      if (role) u.searchParams.set('role', String(role));
      if (status) u.searchParams.set('status', String(status));

      const r = await fetch(u.toString(), { cache: 'no-store', signal });
      const j = await r.json();
      const mapped: Row[] = (j.rows ?? []).map((r:any) => ({
        id: String(r.id),
        name: r.name ?? null,
        email: r.email ?? null,
        role: (r.role ?? r.profile ?? '') as Role,
        status: (r.status ?? r.state ?? '') as Status,
        approved: Boolean(r.approved ?? r.is_approved ?? false),
        active: Boolean(r.active ?? r.is_active ?? r.enabled ?? false),
        created_at: r.created_at ?? null,
      }));
      setRows(mapped);
      setCount(j.count ?? mapped.length);
    } catch {
      setRows([]); setCount(0);
      setSnack({ open:true, msg:'Falha ao carregar utilizadores', sev:'error' });
    } finally {
      setLoading(false);
    }
  }

  React.useEffect(() => {
    const ctrl = new AbortController();
    void fetchRows(ctrl.signal);
    return () => ctrl.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q, role, status, paginationModel.page, paginationModel.pageSize]);

  const columns = React.useMemo<GridColDef<Row>[]>(() => [
    { field: 'name', headerName: 'Nome', flex: 1.1, minWidth: 180, valueFormatter: (p:any) => String(p?.value ?? '') },
    { field: 'email', headerName: 'Email', flex: 1.2, minWidth: 220, valueFormatter: (p:any) => String(p?.value ?? '') },
    { field: 'role', headerName: 'Perfil', width: 120, valueFormatter: (p:any) => String(p?.value ?? '') },
    { field: 'status', headerName: 'Estado', width: 120, valueFormatter: (p:any) => String(p?.value ?? '') },
    { field: 'approved', headerName: 'Aprovado', width: 110, valueFormatter: (p:any) => (p?.value ? 'Sim' : 'Não') },
    { field: 'active', headerName: 'Ativo', width: 90, valueFormatter: (p:any) => (p?.value ? 'Sim' : 'Não') },
    { field: 'created_at', headerName: 'Criado em', minWidth: 180, valueFormatter: (p:any) => (p?.value ? new Date(String(p.value)).toLocaleString() : '') },
    {
      field: 'actions',
      headerName: 'Ações',
      width: 210,
      sortable: false,
      filterable: false,
      renderCell: (p) => (
        <Stack direction="row" spacing={0.5}>
          <Tooltip title="Editar">
            <IconButton size="small" onClick={() => router.push(`/dashboard/admin/users/${p.row.id}`)}>
              <EditOutlined fontSize="small" />
            </IconButton>
          </Tooltip>

          {/* ➕ Criar a partir deste (Dialog com sombra) */}
          <Tooltip title="Criar a partir deste">
            <IconButton
              size="small"
              onClick={() => {
                setCloneInitial({
                  name: p.row.name ?? '',
                  email: (p.row.email ?? '').replace(/(\+clone)?@/, '+clone@'), // evita conflito trivial
                  role: (p.row.role as Role) ?? 'CLIENT',
                  status: (p.row.status as Status) ?? 'active',
                });
                setOpenClone(true);
              }}
            >
              <ContentCopyOutlined fontSize="small" />
            </IconButton>
          </Tooltip>

          <Tooltip title="Remover">
            <IconButton
              size="small"
              color="error"
              onClick={async () => {
                const removed = p.row as Row;
                if (!confirm(`Remover utilizador "${removed.email || removed.name || removed.id}"?`)) return;

                // Optimistic + UNDO
                setRows(prev => prev.filter(r => r.id !== removed.id));
                setUndo({ open: true, row: removed });

                try {
                  const res = await fetch(`/api/admin/users/${removed.id}`, { method: 'DELETE' });
                  if (!res.ok) throw new Error(await res.text());
                } catch (e:any) {
                  // rollback
                  setRows(prev => [removed, ...prev]);
                  setUndo({ open:false });
                  setSnack({ open:true, msg: e?.message || 'Falha ao remover', sev:'error' });
                }
              }}
            >
              <DeleteOutline fontSize="small" />
            </IconButton>
          </Tooltip>
        </Stack>
      ),
    },
  ], [router]);

  function exportCSV() {
    const header = ['id','name','email','role','status','approved','active','created_at'];
    const lines = [
      header.join(','),
      ...rows.map(r => [
        r.id,
        r.name ?? '',
        r.email ?? '',
        r.role ?? '',
        r.status ?? '',
        r.approved ? 'true' : 'false',
        r.active ? 'true' : 'false',
        r.created_at ?? '',
      ].map(v => `"${String(v).replace(/"/g, '""')}"`).join(',')),
    ].join('\n');

    const blob = new Blob([lines], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const name = `users${q?`-q-${q}`:''}${role?`-role-${role}`:''}${status?`-status-${status}`:''}.csv`;
    a.href = url; a.download = name; a.click();
    URL.revokeObjectURL(url);
  }

  function printList() {
    const w = window.open('', '_blank', 'noopener,noreferrer,width=1000,height=700');
    if (!w) return;

    const rowsHtml = rows.map(r => {
      const cells = [
        r.name ?? '',
        r.email ?? '',
        r.role ?? '',
        r.status ?? '',
        r.approved ? 'Sim' : 'Não',
        r.active ? 'Sim' : 'Não',
        r.created_at ? new Date(String(r.created_at)).toLocaleString() : '',
      ].map(c => `<td>${String(c)}</td>`).join('');
      return `<tr>${cells}</tr>`;
    }).join('');

    const title = 'Lista de Utilizadores';
    const html =
      '<html><head><meta charset="utf-8" />' +
      `<title>${title}</title>` +
      '<style>body{font-family:system-ui,-apple-system,Segoe UI,Roboto,Ubuntu,Cantarell,Helvetica Neue,Arial,Noto Sans; padding:16px;}h1{font-size:18px;margin:0 0 12px;}table{border-collapse:collapse;width:100%;}th,td{border:1px solid #e5e7eb;padding:6px 8px;text-align:left;font-size:12px;}th{background:#f8fafc;}@media print{@page{margin:12mm;}}</style></head>' +
      `<body><h1>${title}</h1><table><thead><tr><th>Nome</th><th>Email</th><th>Perfil</th><th>Estado</th><th>Aprovado</th><th>Ativo</th><th>Criado</th></tr></thead><tbody>${rowsHtml}</tbody></table><script>window.onload=function(){window.print();}</script></body></html>`;
    w.document.open(); w.document.write(html); w.document.close();
  }

  async function undoDelete() {
    const r = undo.row;
    if (!r) { closeUndo(); return; }
    try {
      // recria o utilizador com os dados básicos que tínhamos
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: r.name ?? null,
          email: r.email ?? null,
          role: r.role ?? 'CLIENT',
          status: r.status ?? 'active',
          approved: Boolean(r.approved),
          active: Boolean(r.active),
        }),
      });
      if (!res.ok) throw new Error(await res.text());
      setSnack({ open:true, msg:'Utilizador restaurado', sev:'success' });
      void fetchRows();
    } catch (e:any) {
      setSnack({ open:true, msg: e?.message || 'Falha ao restaurar', sev:'error' });
    } finally {
      closeUndo();
    }
  }

  return (
    <Box sx={{ display: 'grid', gap: 1.5 }}>
      <Paper variant="outlined" sx={{ p: 1.5, borderRadius: 2 }}>
        <Stack direction={{ xs:'column', sm:'row' }} spacing={1} alignItems="center" justifyContent="space-between">
          <Stack direction="row" spacing={1} sx={{ flexWrap:'wrap' }}>
            <TextField label="Pesquisar" value={q} onChange={(e)=>setQ(e.target.value)} sx={{ minWidth: 220 }} />
            <TextField select label="Perfil" value={role} onChange={(e)=>setRole(e.target.value as Role| '')} sx={{ minWidth: 160 }}>
              <MenuItem value="">Todos</MenuItem>
              {RoleOptions.map(r => <MenuItem key={r} value={r}>{r}</MenuItem>)}
            </TextField>
            <TextField select label="Estado" value={status} onChange={(e)=>setStatus(e.target.value as Status| '')} sx={{ minWidth: 160 }}>
              <MenuItem value="">Todos</MenuItem>
              {StatusOptions.map(s => <MenuItem key={s} value={s}>{s}</MenuItem>)}
            </TextField>
          </Stack>
          <Stack direction="row" spacing={1}>
            <Tooltip title="Exportar CSV"><IconButton onClick={exportCSV}><FileDownloadOutlined /></IconButton></Tooltip>
            <Tooltip title="Imprimir"><IconButton onClick={printList}><PrintOutlined /></IconButton></Tooltip>
            <Button variant="contained" startIcon={<AddIcon />} onClick={() => router.push('/dashboard/admin/users/new')}>Novo utilizador</Button>
          </Stack>
        </Stack>
      </Paper>

      <Divider />

      <div style={{ width: '100%' }}>
        <DataGrid
          rows={rows}
          columns={columns as unknown as GridColDef[]}
          loading={loading}
          rowCount={count}
          paginationMode="server"
          paginationModel={paginationModel}
          onPaginationModelChange={setPaginationModel}
          disableRowSelectionOnClick
          slots={{ toolbar: GridToolbar, loadingOverlay: () => <CircularProgress size={24} /> }}
          autoHeight
          density="compact"
          pageSizeOptions={[10, 20, 50, 100]}
        />
      </div>

      {/* UNDO */}
      <Snackbar open={undo.open} autoHideDuration={4000} onClose={closeUndo} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert severity="info" variant="filled" onClose={closeUndo} action={<Button color="inherit" size="small" onClick={undoDelete}>Desfazer</Button>} sx={{ width:'100%' }}>
          Utilizador removido
        </Alert>
      </Snackbar>

      {/* Feedback */}
      <Snackbar open={snack.open} autoHideDuration={3000} onClose={closeSnack}>
        <Alert severity={snack.sev} variant="filled" onClose={closeSnack} sx={{ width: '100%' }}>
          {snack.msg}
        </Alert>
      </Snackbar>

      {/* Dialog: Criar a partir deste (mini-form inline) */}
      <Dialog
        open={openClone}
        onClose={() => closeClone()}
        fullWidth
        maxWidth="sm"
        PaperProps={{ elevation: 8, sx: { borderRadius: 2 } }}
      >
        <DialogTitle>Criar utilizador a partir deste</DialogTitle>
        <DialogContent dividers>
          <QuickUserCreateForm
            initial={{
              name: cloneInitial?.name ?? '',
              email: cloneInitial?.email ?? '',
              role: (cloneInitial?.role as Role) ?? 'CLIENT',
              status: (cloneInitial?.status as Status) ?? 'active',
              approved: true,
              active: true,
            }}
            onDone={() => closeClone(true)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => closeClone()}>Fechar</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

/* --- Mini-form inline para criação rápida -------------------------------- */

function QuickUserCreateForm(props: {
  initial: { name?: string; email?: string; role?: Role; status?: Status; approved?: boolean; active?: boolean };
  onDone?: () => void;
}) {
  const [v, setV] = React.useState(props.initial);
  const [saving, setSaving] = React.useState(false);
  const [err, setErr] = React.useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    if (!v.email) { setErr('Email é obrigatório'); return; }
    if (!v.role) { setErr('Perfil é obrigatório'); return; }

    setSaving(true);
    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type':'application/json' },
        body: JSON.stringify({
          name: v.name ?? null,
          email: v.email ?? null,
          role: v.role ?? 'CLIENT',
          status: v.status ?? 'active',
          approved: Boolean(v.approved ?? true),
          active: Boolean(v.active ?? true),
        }),
      });
      if (!res.ok) throw new Error(await res.text());
      props.onDone?.();
    } catch (e:any) {
      setErr(e?.message || 'Falha ao criar');
    } finally {
      setSaving(false);
    }
  }

  return (
    <Box component="form" onSubmit={submit} sx={{ display:'grid', gap: 1.5 }}>
      {err && <Alert severity="error">{err}</Alert>}

      <TextField label="Nome" value={v.name ?? ''} onChange={(e)=>setV(s=>({ ...s, name:e.target.value }))} />
      <TextField label="Email" value={v.email ?? ''} onChange={(e)=>setV(s=>({ ...s, email:e.target.value }))} required />

      <TextField select label="Perfil" value={v.role ?? ''} onChange={(e)=>setV(s=>({ ...s, role: e.target.value as Role }))} required sx={{ minWidth: 180 }}>
        {RoleOptions.map(r => <MenuItem key={r} value={r}>{r}</MenuItem>)}
      </TextField>

      <TextField select label="Estado" value={v.status ?? 'active'} onChange={(e)=>setV(s=>({ ...s, status: e.target.value as Status }))} sx={{ minWidth: 180 }}>
        {StatusOptions.map(s => <MenuItem key={s} value={s}>{s}</MenuItem>)}
      </TextField>

      <Stack direction="row" spacing={1} justifyContent="flex-end">
        <Button type="button" onClick={()=>props.onDone?.()} disabled={saving}>Cancelar</Button>
        <Button variant="contained" type="submit" disabled={saving}>{saving ? 'A criar…' : 'Criar'}</Button>
      </Stack>
    </Box>
  );
}
