'use client';

import * as React from 'react';
import {
  Box, Stack, TextField, MenuItem, Button, IconButton, Tooltip, Paper, Divider,
  CircularProgress, Snackbar, Alert, Dialog, DialogTitle, DialogContent, DialogActions,
  Chip, Typography,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteOutline from '@mui/icons-material/DeleteOutline';
import EditOutlined from '@mui/icons-material/EditOutlined';
import FileDownloadOutlined from '@mui/icons-material/FileDownloadOutlined';
import PrintOutlined from '@mui/icons-material/PrintOutlined';
import ContentCopyOutlined from '@mui/icons-material/ContentCopyOutlined';
import { DataGrid, GridColDef, GridToolbar, GridToolbarQuickFilter, GridFilterModel } from '@mui/x-data-grid';
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
  last_login_at?: string | null;
  last_seen_at?: string | null;
  online?: boolean;
};

export default function UsersClient({ pageSize = 20 }: { pageSize?: number }) {
  const router = useRouter();

  // Estado da grelha
  const [rows, setRows] = React.useState<Row[]>([]);
  const [count, setCount] = React.useState(0);
  const [loading, setLoading] = React.useState(false);
  const [paginationModel, setPaginationModel] = React.useState({ page: 0, pageSize });
  const [filterModel, setFilterModel] = React.useState<GridFilterModel>({ items: [], quickFilterValues: [] });

  // Dialogs
  const [openClone, setOpenClone] = React.useState<{ open: boolean; from?: Row }>({ open: false });
  const [openCreate, setOpenCreate] = React.useState(false);

  // Feedback
  const [snack, setSnack] = React.useState<{ open:boolean; msg:string; sev:'success'|'error'|'info'|'warning' }>({ open:false, msg:'', sev:'success' });
  const closeSnack = () => setSnack(s => ({ ...s, open:false }));

  const quickFilter = filterModel.quickFilterValues?.[0]?.trim() ?? '';

  async function fetchRows() {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set('page', String(paginationModel.page));
      params.set('pageSize', String(paginationModel.pageSize));
      if (quickFilter) params.set('q', quickFilter);
      const r = await fetch(`/api/admin/users?${params.toString()}`, { cache: 'no-store' });
      const j = await r.json();
      if (j?._supabaseConfigured === false) {
        setSnack({ open: true, msg: 'Supabase não está configurado — a lista mostra dados locais.', sev: 'info' });
      }

      const mapped: Row[] = (j.rows ?? []).map((x: any) => ({
        id: String(x.id),
        name: x.name ?? null,
        email: x.email ?? null,
        role: (x.role ?? x.profile ?? '') as Role,
        status: (x.status ?? x.state ?? '')
          ? (String(x.status ?? x.state ?? '').toLowerCase() as Status)
          : ('' as Status),
        approved: Boolean(x.approved ?? x.is_approved ?? false),
        active: Boolean(x.active ?? x.is_active ?? x.enabled ?? false),
        created_at: x.created_at ?? x.createdAt ?? null,
        last_login_at: x.lastLoginAt ?? x.last_login_at ?? null,
        last_seen_at: x.lastSeenAt ?? x.last_seen_at ?? null,
        online: Boolean(x.online ?? false),
      }));
      setRows(mapped);
      setCount(j.count ?? mapped.length);
    } catch (e: any) {
      setRows([]); setCount(0);
      setSnack({ open:true, msg: e?.message || 'Falha ao carregar utilizadores', sev:'error' });
    } finally {
      setLoading(false);
    }
  }

  React.useEffect(() => { void fetchRows(); }, [paginationModel.page, paginationModel.pageSize, quickFilter]);

  // --------- Helpers UI ----------
  const roleColor = (role?: Role) => {
    switch (role) {
      case 'ADMIN': return 'error';
      case 'TRAINER': return 'primary';
      case 'CLIENT': return 'success';
      default: return 'default';
    }
  };

  const statusColor = (s?: Status) => {
    switch (s) {
      case 'active': return 'success';
      case 'invited': return 'warning';
      case 'blocked': return 'default';
      default: return 'default';
    }
  };

  function exportCSV() {
    const header = ['id','name','email','role','status','approved','active','created_at','last_login_at','last_seen_at','online'];
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
        r.last_login_at ?? '',
        r.last_seen_at ?? '',
        r.online ? 'true' : 'false',
      ].map(v => `"${String(v).replace(/"/g, '""')}"`).join(',')),
    ].join('\n');

    const blob = new Blob([lines], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `users-page${paginationModel.page + 1}.csv`; a.click();
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
        r.last_login_at ? new Date(String(r.last_login_at)).toLocaleString() : '',
        r.last_seen_at ? new Date(String(r.last_seen_at)).toLocaleString() : '',
        r.online ? 'Online' : 'Offline',
      ].map(c => `<td>${String(c)}</td>`).join('');
      return `<tr>${cells}</tr>`;
    }).join('');

    const title = 'Lista de Utilizadores';
    const html =
      '<html><head><meta charset="utf-8" />' +
      `<title>${title}</title>` +
      '<style>body{font-family:system-ui,-apple-system,Segoe UI,Roboto,Ubuntu,Cantarell,Helvetica Neue,Arial,Noto Sans; padding:16px;}h1{font-size:18px;margin:0 0 12px;}table{border-collapse:collapse;width:100%;}th,td{border:1px solid #e5e7eb;padding:6px 8px;text-align:left;font-size:12px;}th{background:#f8fafc;}@media print{@page{margin:12mm;}}</style></head>' +
      `<body><h1>${title}</h1><table><thead><tr><th>Nome</th><th>Email</th><th>Perfil</th><th>Estado</th><th>Aprovado</th><th>Ativo</th><th>Criado</th><th>Último login</th><th>Última atividade</th><th>Status</th></tr></thead><tbody>${rowsHtml}</tbody></table><script>window.onload=function(){window.print();}</script></body></html>`;
    w.document.open(); w.document.write(html); w.document.close();
  }

  // --------- Clone form (dialog) ----------
  function CloneUserForm({ from, onSuccess }: { from: Row; onSuccess?: () => void }) {
    const [name, setName] = React.useState(from.name ?? '');
    const [email, setEmail] = React.useState('');
    const [role, setRole] = React.useState<Role>((from.role as Role) ?? 'CLIENT');
    const [saving, setSaving] = React.useState(false);

    async function submit() {
      setSaving(true);
      try {
        const res = await fetch('/api/admin/users', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name,
            email,
            role,
            approved: false,
            active: true,
          }),
        });
        if (!res.ok) throw new Error(await res.text());
        onSuccess?.();
      } catch (e: any) {
        setSnack({ open:true, msg: e?.message || 'Falha ao criar utilizador', sev:'error' });
      } finally {
        setSaving(false);
      }
    }

    return (
      <Stack spacing={1.5} sx={{ mt: 1 }}>
        <TextField label="Nome" value={name} onChange={(e)=>setName(e.target.value)} />
        <TextField label="Email" value={email} onChange={(e)=>setEmail(e.target.value)} required />
        <TextField select label="Perfil" value={role} onChange={(e)=>setRole(e.target.value as Role)}>
          <MenuItem value="ADMIN">ADMIN</MenuItem>
          <MenuItem value="TRAINER">TRAINER</MenuItem>
          <MenuItem value="CLIENT">CLIENT</MenuItem>
        </TextField>
        <Stack direction="row" justifyContent="flex-end" spacing={1}>
          <Button onClick={() => setOpenClone({ open:false })}>Cancelar</Button>
          <Button variant="contained" onClick={submit} disabled={saving}>
            {saving ? 'A criar…' : 'Criar utilizador'}
          </Button>
        </Stack>
      </Stack>
    );
  }

  // --------- Colunas ----------
  const columns: GridColDef<Row>[] = [
    { field: 'name', headerName: 'Nome', flex: 1.2, minWidth: 180 },
    { field: 'email', headerName: 'Email', flex: 1.5, minWidth: 200 },
    {
      field: 'role', headerName: 'Perfil', width: 120,
      renderCell: (p) => <Chip size="small" label={String(p?.value ?? '')} color={roleColor(p?.value as Role)} variant="outlined" />,
      valueGetter: (v, r) => r.role ?? '',
    },
    {
      field: 'status', headerName: 'Estado', width: 120,
      renderCell: (p) => <Chip size="small" label={String(p?.value ?? '')} color={statusColor(p?.value as Status)} variant="outlined" />,
      valueGetter: (v, r) => r.status ?? '',
    },
    {
      field: 'online', headerName: 'Online', width: 110,
      valueGetter: (_v, r) => Boolean(r.online),
      renderCell: (p) => (
        <Chip
          size="small"
          label={p?.value ? 'Online' : 'Offline'}
          color={p?.value ? 'success' : 'default'}
          variant={p?.value ? 'filled' : 'outlined'}
        />
      ),
    },
    {
      field: 'last_login_at', headerName: 'Último login', minWidth: 180,
      valueFormatter: (p: any) => (p?.value ? new Date(String(p.value)).toLocaleString() : ''),
    },
    {
      field: 'last_seen_at', headerName: 'Última atividade', minWidth: 180,
      valueFormatter: (p: any) => (p?.value ? new Date(String(p.value)).toLocaleString() : ''),
    },
    {
      field: 'created_at', headerName: 'Criado em', minWidth: 160,
      valueFormatter: (p: any) => (p?.value ? new Date(String(p.value)).toLocaleString() : ''),
    },
    {
      field: 'actions',
      headerName: 'Ações',
      width: 200,
      sortable: false,
      filterable: false,
      renderCell: (p) => (
        <Stack direction="row" spacing={0.5}>
          <Tooltip title="Duplicar (Criar a partir de…)">
            <IconButton size="small" onClick={() => setOpenClone({ open:true, from:p.row })}>
              <ContentCopyOutlined fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Editar">
            <IconButton size="small" onClick={() => router.push(`/dashboard/admin/users/${p.row.id}`)}>
              <EditOutlined fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Remover">
            <IconButton
              size="small"
              color="error"
              onClick={async () => {
                if (!confirm('Remover utilizador?')) return;
                try {
                  const res = await fetch(`/api/admin/users/${p.row.id}`, { method: 'DELETE' });
                  if (!res.ok) throw new Error(await res.text());
                  setSnack({ open:true, msg: 'Utilizador removido', sev:'success' });
                  void fetchRows();
                } catch (e:any) {
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
  ];

  // --------- Render ----------
  return (
    <Box sx={{ display:'grid', gap:1.5 }}>
      <Paper variant="outlined" sx={{ p:1.5, borderRadius:2 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={1}>
          <Typography variant="h6" fontWeight={800}>Utilizadores</Typography>
          <Stack direction="row" spacing={1}>
            <Tooltip title="Exportar CSV"><IconButton onClick={exportCSV}><FileDownloadOutlined /></IconButton></Tooltip>
            <Tooltip title="Imprimir"><IconButton onClick={printList}><PrintOutlined /></IconButton></Tooltip>
            <Button variant="contained" startIcon={<AddIcon />} onClick={() => setOpenCreate(true)}>Novo utilizador</Button>
          </Stack>
        </Stack>
      </Paper>

      <Divider />

      <DataGrid
        rows={rows}
        columns={columns}
        loading={loading}
        rowCount={count}
        paginationMode="server"
        paginationModel={paginationModel}
        onPaginationModelChange={setPaginationModel}
        filterModel={filterModel}
        onFilterModelChange={setFilterModel}
        disableRowSelectionOnClick
        autoHeight
        density="compact"
        sx={{
          width: '100%',
          '& .MuiDataGrid-main': { overflowX: 'auto' },
        }}
        slots={{
          toolbar: () => (
            <Stack direction={{ xs:'column', sm:'row' }} spacing={1} sx={{ p: 1 }}>
              <GridToolbarQuickFilter debounceMs={300} />
              <Box sx={{ flex: 1 }} />
              <GridToolbar />
            </Stack>
          ),
          loadingOverlay: () => <CircularProgress size={24} />,
        }}
        pageSizeOptions={[10, 20, 50, 100]}
      />

      {/* Dialog: Novo (atalho para página dedicada) */}
      <Dialog open={openCreate} onClose={() => setOpenCreate(false)} fullWidth maxWidth="sm">
        <DialogTitle>Novo utilizador</DialogTitle>
        <DialogContent dividers>
          <Alert severity="info">Para criar completo, usa a página “Novo utilizador”.</Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenCreate(false)}>Fechar</Button>
          <Button variant="contained" onClick={() => router.push('/dashboard/admin/users/new')}>Abrir página</Button>
        </DialogActions>
      </Dialog>

      {/* Dialog: Duplicar */}
      <Dialog open={openClone.open} onClose={() => setOpenClone({ open:false })} fullWidth maxWidth="sm">
        <DialogTitle>📄 Criar utilizador a partir de…</DialogTitle>
        <DialogContent dividers>
          {openClone.from && (
            <CloneUserForm
              from={openClone.from}
              onSuccess={() => { setOpenClone({ open:false }); void fetchRows(); }}
            />
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenClone({ open:false })}>Fechar</Button>
        </DialogActions>
      </Dialog>

      {/* Feedback */}
      <Snackbar open={snack.open} autoHideDuration={3000} onClose={closeSnack}>
        <Alert severity={snack.sev} variant="filled" onClose={closeSnack} sx={{ width: '100%' }}>
          {snack.msg}
        </Alert>
      </Snackbar>
    </Box>
  );
}
