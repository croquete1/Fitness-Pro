'use client';

import * as React from 'react';
import Link from 'next/link';
import {
  Box, Stack, TextField, MenuItem, Button, IconButton, Tooltip, Paper, Divider,
  CircularProgress, Snackbar, Alert, Dialog, DialogTitle, DialogContent, DialogActions,
  Chip, Typography, useMediaQuery, useTheme,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteOutline from '@mui/icons-material/DeleteOutline';
import EditOutlined from '@mui/icons-material/EditOutlined';
import FileDownloadOutlined from '@mui/icons-material/FileDownloadOutlined';
import PrintOutlined from '@mui/icons-material/PrintOutlined';
import ContentCopyOutlined from '@mui/icons-material/ContentCopyOutlined';
import { DataGrid, GridColDef, GridToolbar, GridToolbarQuickFilter, GridFilterModel } from '@mui/x-data-grid';
import { alpha } from '@mui/material/styles';
import { useRouter } from 'next/navigation';
import { getSampleUsers } from '@/lib/fallback/users';
import AdminUserRowActions from '@/components/admin/AdminUserRowActions';
import { toAppRole } from '@/lib/roles';

export type Role = 'ADMIN' | 'TRAINER' | 'PT' | 'CLIENT' | string;
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
  const theme = useTheme();
  const isLight = theme.palette.mode === 'light';
  const downMd = useMediaQuery(theme.breakpoints.down('md'));
  const downSm = useMediaQuery(theme.breakpoints.down('sm'));

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

  const fetchRows = React.useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set('page', String(paginationModel.page));
      params.set('pageSize', String(paginationModel.pageSize));
      if (quickFilter) params.set('q', quickFilter);
      const endpoint = `/api/admin/users?${params.toString()}`;
      const r = await fetch(endpoint, { cache: 'no-store', credentials: 'same-origin' });

      if (r.status === 401 || r.status === 403) {
        const fallback = getSampleUsers({
          page: paginationModel.page,
          pageSize: paginationModel.pageSize,
          search: quickFilter,
          role: undefined,
          status: undefined,
        });
        const mapped = fallback.rows.map((user) => ({
          id: String(user.id),
          name: user.name,
          email: user.email,
          role: user.role,
          status: user.status.toLowerCase() as Status,
          approved: user.approved,
          active: user.active,
          created_at: user.created_at,
          last_login_at: user.last_login_at,
          last_seen_at: user.last_seen_at,
          online: user.online,
        }));
        setRows(mapped);
        setCount(fallback.count);
        setSnack({
          open: true,
          msg: 'Sessão expirada: a mostrar dados de exemplo. Faz login novamente para veres dados reais.',
          sev: 'warning',
        });
        return;
      }

      const j = await r.json();
      if (j?._supabaseConfigured === false) {
        setSnack({ open: true, msg: 'Supabase não está configurado — a lista mostra dados locais.', sev: 'info' });
      }

      const mapped: Row[] = (j.rows ?? []).map((x: any) => {
        const normalizedRole = toAppRole(x.role ?? x.profile ?? null);
        return {
          id: String(x.id),
          name: x.name ?? null,
          email: x.email ?? null,
          role: (normalizedRole ?? (x.role ?? x.profile ?? '')) as Role,
        status: (x.status ?? x.state ?? '')
          ? (String(x.status ?? x.state ?? '').toLowerCase() as Status)
          : ('' as Status),
        approved: Boolean(x.approved ?? x.is_approved ?? false),
        active: Boolean(x.active ?? x.is_active ?? x.enabled ?? false),
        created_at: x.created_at ?? x.createdAt ?? null,
        last_login_at: x.lastLoginAt ?? x.last_login_at ?? null,
        last_seen_at: x.lastSeenAt ?? x.last_seen_at ?? null,
        online: Boolean(x.online ?? false),
        };
      });
      setRows(mapped);
      setCount(j.count ?? mapped.length);
    } catch (e: any) {
      const fallback = getSampleUsers({
        page: paginationModel.page,
        pageSize: paginationModel.pageSize,
        search: quickFilter,
        role: undefined,
        status: undefined,
      });
      const mapped = fallback.rows.map((user) => ({
        id: String(user.id),
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status.toLowerCase() as Status,
        approved: user.approved,
        active: user.active,
        created_at: user.created_at,
        last_login_at: user.last_login_at,
        last_seen_at: user.last_seen_at,
        online: user.online,
      }));
      setRows(mapped);
      setCount(fallback.count);
      setSnack({ open:true, msg: e?.message || 'Falha ao carregar utilizadores — a mostrar dados de exemplo.', sev:'error' });
    } finally {
      setLoading(false);
    }
  }, [paginationModel.page, paginationModel.pageSize, quickFilter]);

  React.useEffect(() => { void fetchRows(); }, [fetchRows]);

  // --------- Helpers UI ----------
  const roleColor = (role?: Role) => {
    const appRole = toAppRole(role ?? null);
    switch (appRole) {
      case 'ADMIN': return 'error';
      case 'PT': return 'secondary';
      case 'CLIENT': return 'success';
      default: return 'default';
    }
  };

  const roleLabel = React.useCallback((role?: Role) => {
    const appRole = toAppRole(role ?? null);
    if (appRole === 'ADMIN') return 'Admin';
    if (appRole === 'PT') return 'Personal trainer';
    if (appRole === 'CLIENT') return 'Cliente';
    return role ? String(role) : '—';
  }, []);

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

  const formatDateTime = React.useCallback((value?: string | null) => {
    if (!value) return '—';
    try {
      return new Date(String(value)).toLocaleString('pt-PT');
    } catch {
      return String(value);
    }
  }, []);

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
  const columnVisibilityModel = React.useMemo(
    () => ({
      profile: !downSm,
      activity: !downMd,
      created_at: !downSm,
    }),
    [downMd, downSm],
  );

  const columns: GridColDef<Row>[] = [
    {
      field: 'user',
      headerName: 'Utilizador',
      flex: 1.4,
      minWidth: 190,
      sortable: false,
      filterable: false,
      valueGetter: (_value, row) => row.name ?? '',
      renderCell: (params) => {
        const hasName = Boolean(params.row.name);
        const linkProps: any = hasName
          ? { component: Link, href: `/dashboard/admin/users/${params.row.id}`, prefetch: false }
          : { component: 'span' };
        return (
          <Stack spacing={0.25} sx={{ minWidth: 0 }}>
            <Typography
              {...linkProps}
              fontWeight={700}
              sx={{
                wordBreak: 'break-word',
                color: hasName
                  ? (isLight ? theme.palette.primary.main : theme.palette.primary.light)
                  : theme.palette.text.secondary,
                textDecoration: 'none',
                cursor: hasName ? 'pointer' : 'default',
                '&:hover': {
                  textDecoration: hasName ? 'underline' : 'none',
                },
              }}
            >
              {params.row.name ?? '—'}
            </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ wordBreak: 'break-word' }}>
            {params.row.email ?? '—'}
          </Typography>
          {downSm && (
            <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap sx={{ mt: 0.5 }}>
              {params.row.role ? (
                <Chip
                  size="small"
                  label={roleLabel(params.row.role)}
                  color={roleColor(params.row.role as Role)}
                  variant="outlined"
                />
              ) : null}
              {params.row.status ? (
                <Chip
                  size="small"
                  label={String(params.row.status ?? '').toUpperCase()}
                  color={statusColor(params.row.status as Status)}
                  variant="outlined"
                />
              ) : null}
              <Chip
                size="small"
                label={params.row.online ? 'Online' : 'Offline'}
                color={params.row.online ? 'success' : 'default'}
                variant={params.row.online ? 'filled' : 'outlined'}
              />
            </Stack>
          )}
          </Stack>
        );
      },
    },
    {
      field: 'profile',
      headerName: 'Perfil',
      flex: 1,
      minWidth: 200,
      sortable: false,
      filterable: false,
      valueGetter: (_value, row) => `${roleLabel(row.role)} ${row.status ?? ''}`,
      renderCell: (params) => (
        <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap sx={{ alignItems: 'center', minWidth: 0 }}>
          {params.row.role ? (
            <Chip
              size="small"
              label={roleLabel(params.row.role)}
              color={roleColor(params.row.role as Role)}
              variant="outlined"
            />
          ) : null}
          {params.row.status ? (
            <Chip
              size="small"
              label={String(params.row.status ?? '').toUpperCase()}
              color={statusColor(params.row.status as Status)}
              variant="outlined"
            />
          ) : null}
          <Chip
            size="small"
            label={params.row.online ? 'Online' : 'Offline'}
            color={params.row.online ? 'success' : 'default'}
            variant={params.row.online ? 'filled' : 'outlined'}
          />
        </Stack>
      ),
    },
    {
      field: 'activity',
      headerName: 'Atividade',
      flex: 1.1,
      minWidth: 220,
      sortable: false,
      filterable: false,
      valueGetter: (_value, row) => row.last_seen_at ?? row.last_login_at ?? '',
      renderCell: (params) => (
        <Stack spacing={0.25} sx={{ minWidth: 0 }}>
          <Typography
            variant="body2"
            color={params.row.online ? 'success.main' : 'text.secondary'}
            fontWeight={params.row.online ? 600 : undefined}
          >
            {params.row.online ? 'Online agora' : `Último login: ${formatDateTime(params.row.last_login_at)}`}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Última atividade: {params.row.online ? 'Em curso' : formatDateTime(params.row.last_seen_at)}
          </Typography>
        </Stack>
      ),
    },
    {
      field: 'created_at',
      headerName: 'Criado',
      flex: 0.8,
      minWidth: 160,
      valueGetter: (_value, row) => row.created_at ?? '',
      renderCell: (params) => (
        <Typography variant="body2" color="text.secondary">
          {formatDateTime(params.row.created_at)}
        </Typography>
      ),
    },
    {
      field: 'actions',
      headerName: 'Ações',
      flex: 0.9,
      minWidth: 170,
      sortable: false,
      filterable: false,
      renderCell: (params) => {
        const statusValue = params.row.status
          ? String(params.row.status).toUpperCase()
          : params.row.active
            ? 'ACTIVE'
            : 'PENDING';
        const roleValue = String(params.row.role ?? 'CLIENT').toUpperCase();
        return (
          <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap sx={{ alignItems: 'center', maxWidth: '100%' }}>
            <AdminUserRowActions
              id={params.row.id}
              currRole={roleValue || 'CLIENT'}
              currStatus={statusValue}
              compact
              onActionComplete={fetchRows}
            />
            <Tooltip title="Duplicar (Criar a partir de…)">
              <span>
                <IconButton size="small" onClick={() => setOpenClone({ open:true, from:params.row })}>
                  <ContentCopyOutlined fontSize="small" />
                </IconButton>
              </span>
            </Tooltip>
            <Tooltip title="Editar">
              <span>
                <IconButton size="small" onClick={() => router.push(`/dashboard/admin/users/${params.row.id}`)}>
                  <EditOutlined fontSize="small" />
                </IconButton>
              </span>
            </Tooltip>
            <Tooltip title="Remover">
              <span>
                <IconButton
                  size="small"
                  color="error"
                  onClick={async () => {
                    if (!confirm('Remover utilizador?')) return;
                    try {
                      const res = await fetch(`/api/admin/users/${params.row.id}`, { method: 'DELETE' });
                      if (!res.ok) throw new Error(await res.text());
                      setSnack({ open:true, msg: 'Utilizador removido', sev:'success' });
                      await fetchRows();
                    } catch (e:any) {
                      setSnack({ open:true, msg: e?.message || 'Falha ao remover', sev:'error' });
                    }
                  }}
                >
                  <DeleteOutline fontSize="small" />
                </IconButton>
              </span>
            </Tooltip>
          </Stack>
        );
      },
    },
  ];

  // --------- Render ----------
  return (
    <Box
      sx={{
        display: 'grid',
        gap: 1.5,
      }}
    >
      <Paper
        variant="outlined"
        sx={{
          p: { xs: 1.25, sm: 1.5 },
          borderRadius: 3,
          backgroundColor: isLight ? alpha(theme.palette.background.paper, 0.92) : undefined,
          backgroundImage: isLight
            ? 'linear-gradient(135deg, rgba(59,130,246,0.08), rgba(59,130,246,0.02))'
            : undefined,
          backdropFilter: isLight ? 'blur(6px)' : undefined,
          boxShadow: isLight ? '0 18px 45px rgba(15, 23, 42, 0.08)' : undefined,
          borderColor: isLight ? alpha(theme.palette.primary.main, 0.12) : undefined,
        }}
      >
        <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={1}>
          <Typography variant="h6" fontWeight={800}>Utilizadores</Typography>
          <Stack direction="row" spacing={1}>
            <Tooltip title="Exportar CSV"><IconButton onClick={exportCSV}><FileDownloadOutlined /></IconButton></Tooltip>
            <Tooltip title="Imprimir"><IconButton onClick={printList}><PrintOutlined /></IconButton></Tooltip>
            <Button variant="contained" startIcon={<AddIcon />} onClick={() => setOpenCreate(true)}>Novo utilizador</Button>
          </Stack>
        </Stack>
      </Paper>

      <Divider sx={{ opacity: isLight ? 0.5 : 1 }} />

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
        getRowHeight={() => 'auto'}
        columnVisibilityModel={columnVisibilityModel}
        sx={{
          width: '100%',
          bgcolor: isLight ? alpha(theme.palette.background.paper, 0.95) : 'transparent',
          borderRadius: 3,
          border: '1px solid',
          borderColor: isLight ? alpha(theme.palette.primary.main, 0.12) : 'divider',
          boxShadow: isLight ? '0 16px 40px rgba(15, 23, 42, 0.06)' : undefined,
          '& .MuiDataGrid-cell': {
            py: 1.5,
            alignItems: 'flex-start',
            whiteSpace: 'normal',
            lineHeight: 1.4,
          },
          '& .MuiDataGrid-cellContent': {
            whiteSpace: 'normal',
            width: '100%',
          },
          '& .MuiDataGrid-columnHeaders': {
            lineHeight: 1.2,
            whiteSpace: 'normal',
            backgroundColor: isLight ? alpha(theme.palette.primary.light, 0.12) : undefined,
            borderBottom: isLight ? `1px solid ${alpha(theme.palette.primary.main, 0.15)}` : undefined,
          },
          '& .MuiDataGrid-row:hover': {
            backgroundColor: isLight
              ? alpha(theme.palette.primary.light, 0.12)
              : alpha(theme.palette.primary.main, 0.1),
          },
          '& .MuiDataGrid-footerContainer': {
            borderTop: isLight ? `1px solid ${alpha(theme.palette.primary.main, 0.12)}` : undefined,
            backgroundColor: isLight ? alpha(theme.palette.background.paper, 0.9) : undefined,
          },
        }}
        slots={{
          toolbar: () => (
            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              spacing={1}
              sx={{
                p: 1,
                '& .MuiInputBase-root': {
                  backgroundColor: isLight ? alpha(theme.palette.common.white, 0.8) : undefined,
                  borderRadius: 2,
                },
              }}
            >
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
