'use client';

import React from 'react';
import {
  Box, Stack, TextField, IconButton, Tooltip,
  CircularProgress, Snackbar, Alert, InputAdornment, Chip, Switch, Dialog, DialogTitle, DialogContent, DialogActions, Button,
  Autocomplete,
} from '@mui/material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import SearchIcon from '@mui/icons-material/Search';
import VisibilityIcon from '@mui/icons-material/Visibility';
import EditIcon from '@mui/icons-material/Edit';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import { useRouter } from 'next/navigation';
import { useToast } from '@/components/ui/ToastProvider';

export type Role = string;
export type Status = string;

export type Row = {
  id: string;
  name: string | null;
  email: string | null;
  role: Role | null;
  status: Status | null;
  approved: boolean;
  active: boolean;
  created_at: string | null;
};

function roleLabel(v: string | null | undefined) {
  const s = String(v ?? '').toLowerCase();
  if (['admin', 'administrator', 'adm'].includes(s)) return 'Admin';
  if (['trainer', 'pt', 'personal', 'coach'].includes(s)) return 'PT';
  if (['client', 'aluno', 'utente', 'user'].includes(s)) return 'Cliente';
  return s || '—';
}

function mapUser(u: any): Row {
  return {
    id: String(u.id),
    name: u.name ?? u.full_name ?? null,
    email: u.email ?? null,
    role: (u.role ?? u.type ?? null),
    status: u.status ?? null,
    approved: Boolean(u.approved ?? u.is_approved ?? false),
    active: Boolean(u.active ?? u.is_active ?? false),
    created_at: u.created_at ?? u.createdAt ?? null,
  };
}

export default function UsersGrid({
  initial, total, pageSize: pageSizeProp,
}: { initial?: Row[]; total?: number; pageSize?: number; }) {
  const router = useRouter();
  const toast = useToast();

  const [rows, setRows] = React.useState<Row[]>(initial ?? []);
  const [count, setCount] = React.useState<number>(total ?? 0);
  const [loading, setLoading] = React.useState<boolean>(!initial);

  const [page, setPage] = React.useState(0);
  const [pageSize, setPageSize] = React.useState(pageSizeProp ?? 20);

  const [q, setQ] = React.useState('');
  const [roleFilter, setRoleFilter] = React.useState('');     // string para autocomplete
  const [statusFilter, setStatusFilter] = React.useState(''); // string para autocomplete

  const [roleOpts, setRoleOpts] = React.useState<string[]>([]);
  const [statusOpts, setStatusOpts] = React.useState<string[]>([]);
  const [optsLoading, setOptsLoading] = React.useState(false);

  const [snack, setSnack] = React.useState<{open:boolean; msg:string; sev:'success'|'error'|'info'|'warning'; action?: React.ReactNode}>({
    open: false, msg: '', sev: 'success', action: undefined,
  });
  const closeSnack = () => setSnack((s) => ({ ...s, open: false, action: undefined }));
  const show = (msg: string, sev: 'success'|'error'|'info'|'warning' = 'success', action?: React.ReactNode) =>
    setSnack({ open: true, msg, sev, action });

  const [delOpen, setDelOpen] = React.useState(false);
  const [delTarget, setDelTarget] = React.useState<Row | null>(null);
  const [lastDeleted, setLastDeleted] = React.useState<{row: Row; soft: boolean} | null>(null);

  // Carrega opções de role/status distintas da BD
  React.useEffect(() => {
    let alive = true;
    (async () => {
      setOptsLoading(true);
      try {
        const res = await fetch('/api/admin/users/distinct?fields=role,status');
        const data = await res.json().catch(() => ({}));
        if (alive && res.ok) {
          setRoleOpts(Array.isArray(data?.role) ? data.role : []);
          setStatusOpts(Array.isArray(data?.status) ? data.status : []);
        }
      } finally {
        if (alive) setOptsLoading(false);
      }
    })();
    return () => { alive = false; };
  }, []);

  const fetchData = React.useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page + 1), pageSize: String(pageSize) });
      if (q) params.set('q', q);
      if (roleFilter) params.set('role', roleFilter);
      if (statusFilter) params.set('status', statusFilter);
      const res = await fetch('/api/admin/users?' + params.toString());
      const data = await res.json();
      setRows((data.rows ?? []).map(mapUser));
      setCount(data.count ?? (data.rows?.length ?? 0));
    } catch (e: any) {
      show(e.message || 'Falha ao carregar utilizadores', 'error');
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, q, roleFilter, statusFilter]);

  React.useEffect(() => { if (!initial) fetchData(); /* eslint-disable-next-line */ }, []);
  React.useEffect(() => { fetchData(); }, [fetchData]);

  async function patchUser(id: string, payload: Partial<Pick<Row, 'approved'|'active'|'role'|'status'>>) {
    const res = await fetch(`/api/admin/users/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data?.error || 'Falha ao atualizar utilizador.');
  }

  async function toggleApproved(id: string, next: boolean) {
    try {
      await patchUser(id, { approved: next });
      setRows((prev) => prev.map((r) => r.id === id ? { ...r, approved: next } : r));
      show(next ? 'Utilizador aprovado' : 'Utilizador desmarcado como aprovado');
    } catch (e: any) { show(e.message || 'Erro ao atualizar aprovação', 'error'); }
  }
  async function toggleActive(id: string, next: boolean) {
    try {
      await patchUser(id, { active: next });
      setRows((prev) => prev.map((r) => r.id === id ? { ...r, active: next } : r));
      show(next ? 'Utilizador ativado' : 'Utilizador desativado');
    } catch (e: any) { show(e.message || 'Erro ao atualizar estado', 'error'); }
  }

  async function doDelete() {
    if (!delTarget) return;
    const target = delTarget;
    setDelOpen(false);
    try {
      const res = await fetch(`/api/admin/users/${target.id}`, { method: 'DELETE' });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || 'Falha ao remover utilizador.');
      const soft = Boolean(data?.soft);
      setRows((prev) => prev.filter((r) => r.id !== target.id));
      setLastDeleted({ row: target, soft });

      const undo = async () => {
        try {
          if (soft) {
            await patchUser(target.id, { active: true });
          } else {
            await fetch('/api/admin/users', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: target.id, name: target.name, email: target.email, role: target.role, status: target.status, approved: target.approved, active: true }) }).catch(() => {});
          }
          setRows((prev) => [target, ...prev]);
          show('Remoção anulada', 'success');
          setLastDeleted(null);
        } catch (e: any) {
          show(e.message || 'Falha ao anular remoção', 'error');
        }
      };

      show('Utilizador removido', 'success', <Button color="inherit" size="small" onClick={undo}>Anular</Button>);
    } catch (e: any) {
      show(e.message || 'Falha ao remover utilizador.', 'error');
    } finally {
      setDelTarget(null);
    }
  }

  const columns: GridColDef[] = React.useMemo(() => [
    { field: 'name', headerName: 'Nome', flex: 1, minWidth: 160, sortable: true, valueFormatter: (p: any) => String(p?.value ?? '') },
    { field: 'email', headerName: 'Email', flex: 1.2, minWidth: 200, sortable: true, valueFormatter: (p: any) => String(p?.value ?? '') },
    { field: 'role', headerName: 'Função', width: 130, sortable: true, valueFormatter: (p: any) => roleLabel(p?.value) },
    {
      field: 'approved', headerName: 'Aprovado', width: 120, sortable: false,
      renderCell: (p) => {
        const id = String((p as any).row?.id);
        const val = Boolean((p as any).row?.approved);
        return <Switch size="small" checked={val} onChange={(e) => toggleApproved(id, e.target.checked)} inputProps={{ 'aria-label': 'Aprovado' }} />;
      },
    },
    {
      field: 'active', headerName: 'Ativo', width: 100, sortable: false,
      renderCell: (p) => {
        const id = String((p as any).row?.id);
        const val = Boolean((p as any).row?.active);
        return <Switch size="small" checked={val} onChange={(e) => toggleActive(id, e.target.checked)} inputProps={{ 'aria-label': 'Ativo' }} />;
      },
    },
    {
      field: 'status', headerName: 'Estado', width: 140, sortable: true,
      renderCell: (p) => {
        const s = String((p as any).row?.status ?? '').toLowerCase();
        if (!s) return <Chip size="small" label="—" />;
        const sev = s.includes('blocked') || s.includes('ban') ? 'error' : s.includes('pending') ? 'warning' : 'success';
        return <Chip size="small" color={sev as any} label={s} />;
      },
    },
    {
      field: 'created_at', headerName: 'Criado em', width: 170,
      valueFormatter: (p: any) => {
        const v = p?.value as string | null;
        if (!v) return '';
        const d = new Date(v);
        if (Number.isNaN(d.getTime())) return v;
        return d.toLocaleString('pt-PT', { dateStyle: 'short', timeStyle: 'short' });
      },
    },
    {
      field: 'actions', headerName: 'Ações', width: 150, sortable: false, filterable: false,
      renderCell: (p) => {
        const id = String((p as any).row?.id ?? '');
        const row = (p as any).row as Row;
        return (
          <Stack direction="row" spacing={1}>
            <Tooltip title="Ver"><IconButton size="small" onClick={() => router.push(`/dashboard/admin/users/${id}`)}><VisibilityIcon fontSize="small" /></IconButton></Tooltip>
            <Tooltip title="Editar"><IconButton size="small" onClick={() => router.push(`/dashboard/admin/users/${id}?edit=1`)}><EditIcon fontSize="small" /></IconButton></Tooltip>
            <Tooltip title="Remover">
              <IconButton size="small" onClick={() => { setDelTarget(row); setDelOpen(true); }}>
                <DeleteOutlineIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Stack>
        );
      },
    },
  ], [router]);

  return (
    <Stack spacing={2}>
      {/* Barra de filtros com Autocomplete */}
      <Stack direction="row" spacing={1} alignItems="center" justifyContent="space-between" sx={{ flexWrap: 'wrap' }}>
        <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap' }}>
          <TextField
            size="small" label="Pesquisar" placeholder="Nome ou email…"
            value={q} onChange={(e) => { setQ(e.target.value); setPage(0); }}
            InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon fontSize="small" /></InputAdornment>,
                          endAdornment: loading ? <CircularProgress size={16} /> : undefined }}
          />

          <Autocomplete
            size="small"
            options={roleOpts}
            loading={optsLoading}
            value={roleFilter || ''}
            onChange={(_e, v) => { setRoleFilter((v as string) || ''); setPage(0); }}
            onInputChange={(_e, v) => { setRoleFilter(v || ''); }}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Função"
                placeholder="admin / pt / client…"
                InputProps={{
                  ...params.InputProps,
                  endAdornment: (
                    <>
                      {optsLoading ? <CircularProgress size={16} /> : null}
                      {params.InputProps.endAdornment}
                    </>
                  ),
                }}
                sx={{ minWidth: 180 }}
              />
            )}
            freeSolo
          />

          <Autocomplete
            size="small"
            options={statusOpts}
            loading={optsLoading}
            value={statusFilter || ''}
            onChange={(_e, v) => { setStatusFilter((v as string) || ''); setPage(0); }}
            onInputChange={(_e, v) => { setStatusFilter(v || ''); }}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Estado"
                placeholder="active / pending / blocked…"
                InputProps={{
                  ...params.InputProps,
                  endAdornment: (
                    <>
                      {optsLoading ? <CircularProgress size={16} /> : null}
                      {params.InputProps.endAdornment}
                    </>
                  ),
                }}
                sx={{ minWidth: 180 }}
              />
            )}
            freeSolo
          />
        </Stack>
      </Stack>

      <Box sx={{ height: 640, width: '100%', '& .MuiDataGrid-columnHeaders': { position: 'sticky', top: 0, zIndex: 1, bgcolor: 'background.paper' } }}>
        <DataGrid
          rows={rows}
          columns={columns}
          getRowId={(r) => r.id}
          loading={loading}
          rowCount={count}
          paginationMode="server"
          paginationModel={{ page, pageSize }}
          onPaginationModelChange={(m) => { setPage(m.page); setPageSize(m.pageSize); }}
          pageSizeOptions={[10, 20, 50, 100]}
          checkboxSelection={false}
          disableRowSelectionOnClick
          density="compact"
        />
      </Box>

      {/* Confirmação de remoção */}
      <Dialog open={delOpen} onClose={() => setDelOpen(false)}>
        <DialogTitle>Remover utilizador</DialogTitle>
        <DialogContent>
          Tem a certeza que pretende remover <b>{delTarget?.name || delTarget?.email || 'este utilizador'}</b>?
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDelOpen(false)}>Cancelar</Button>
          <Button color="error" variant="contained" startIcon={<DeleteOutlineIcon />} onClick={doDelete}>Remover</Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={snack.open} autoHideDuration={3000} onClose={closeSnack} action={snack.action}>
        <Alert severity={snack.sev} variant="filled" onClose={closeSnack} sx={{ width: '100%' }}>{snack.msg}</Alert>
      </Snackbar>
    </Stack>
  );
}
