'use client';

import * as React from 'react';
import {
  Stack,
  TextField,
  MenuItem,
  Button,
  Paper,
  CircularProgress,
  Snackbar,
  Alert,
  Typography,
  Chip,
  Collapse,
  useTheme,
  Tooltip,
  IconButton,
} from '@mui/material';
import CheckCircleOutline from '@mui/icons-material/CheckCircleOutline';
import DeleteOutline from '@mui/icons-material/DeleteOutline';
import FileDownloadOutlined from '@mui/icons-material/FileDownloadOutlined';
import PrintOutlined from '@mui/icons-material/PrintOutlined';
import VisibilityOutlined from '@mui/icons-material/VisibilityOutlined';
import { DataGrid, GridColDef, GridToolbar } from '@mui/x-data-grid';
import OpenInNewToggle from '@/components/ui/OpenInNewToggle';
import { navigate } from '@/lib/nav';
import { alpha } from '@mui/material/styles';
import type { AlertColor } from '@mui/material/Alert';

type Row = {
  id: string;
  user_id: string;
  name?: string | null;
  email?: string | null;
  requested_at?: string | null;
  status?: 'pending' | 'approved' | 'rejected' | string | null;
};

export default function ApprovalsClient({ pageSize = 20 }: { pageSize?: number }) {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const panelBg = alpha(theme.palette.background.paper, isDark ? 0.82 : 0.98);
  const toolbarBg = alpha(theme.palette.primary.main, isDark ? 0.2 : 0.08);
  const borderGlow = alpha(theme.palette.primary.main, isDark ? 0.35 : 0.15);
  const rowStripe = alpha(theme.palette.primary.main, isDark ? 0.08 : 0.03);
  const rowHover = alpha(theme.palette.primary.main, isDark ? 0.18 : 0.1);
  const footerBg = alpha(theme.palette.background.paper, isDark ? 0.78 : 0.98);

  const [q, setQ] = React.useState('');
  const [status, setStatus] = React.useState('');
  const [rows, setRows] = React.useState<Row[]>([]);
  const [count, setCount] = React.useState(0);
  const [loading, setLoading] = React.useState(false);
  const [paginationModel, setPaginationModel] = React.useState({ page: 0, pageSize });

  const [openInNew, setOpenInNew] = React.useState(false);

  const [snack, setSnack] = React.useState<{open:boolean; msg:string; sev:'success'|'error'|'info'|'warning'}>({ open:false, msg:'', sev:'success' });
  const closeSnack = () => setSnack(s => ({ ...s, open:false }));
  const [undo, setUndo] = React.useState<{ open:boolean; row?: Row }>({ open:false });
  const closeUndo = () => setUndo({ open:false });
  const [banner, setBanner] = React.useState<{ message: string; severity: AlertColor } | null>(null);

  const activeBannerColor = banner
    ? banner.severity === 'error'
      ? theme.palette.error.main
      : banner.severity === 'warning'
        ? theme.palette.warning.main
        : banner.severity === 'info'
          ? theme.palette.info.main
          : banner.severity === 'success'
            ? theme.palette.success.main
            : theme.palette.primary.main
    : theme.palette.primary.main;

  type ApprovalsApiResponse = {
    rows?: Array<{
      id: string | number;
      user_id?: string | number | null;
      uid?: string | number | null;
      user?: string | number | null;
      name?: string | null;
      email?: string | null;
      requested_at?: string | null;
      created_at?: string | null;
      status?: string | null;
    }>;
    count?: number;
    _supabaseConfigured?: boolean;
    error?: string;
  };

  const fetchRows = React.useCallback(async () => {
    setLoading(true);
    setBanner(null);
    const u = new URL('/api/admin/approvals', window.location.origin);
    u.searchParams.set('page', String(paginationModel.page));
    u.searchParams.set('pageSize', String(paginationModel.pageSize));
    if (q) u.searchParams.set('q', q);
    if (status) u.searchParams.set('status', status);

    try {
      const r = await fetch(u.toString(), { cache: 'no-store', credentials: 'same-origin' });
      if (r.status === 401 || r.status === 403) {
        setRows([]);
        setCount(0);
        setBanner({
          severity: 'warning',
          message: 'Sessão expirada — autentica-te novamente para gerir os pedidos reais.',
        });
        return;
      }

      if (!r.ok) {
        throw new Error((await r.text()) || 'Falha ao carregar pedidos de aprovação.');
      }

      const j = (await r.json()) as ApprovalsApiResponse;
      if (j._supabaseConfigured === false) {
        setRows([]);
        setCount(0);
        setBanner({
          severity: 'info',
          message: 'Supabase não está configurado — assim que ligares a base de dados, os pedidos reais vão aparecer aqui.',
        });
        return;
      }

      setRows((j.rows ?? []).map((r) => ({
        id: String(r.id),
        user_id: String(r.user_id ?? r.uid ?? r.user ?? r.id ?? ''),
        name: r.name ?? null,
        email: r.email ?? null,
        requested_at: r.requested_at ?? r.created_at ?? null,
        status: r.status ?? 'pending',
      })));
      setCount(j.count ?? 0);
      if (j.error) {
        setBanner({ severity: 'warning', message: 'Alguns pedidos podem não estar disponíveis neste momento.' });
      }
    } catch (error: any) {
      console.error('approvals.fetch', error);
      setBanner({
        severity: 'error',
        message: error?.message || 'Falha ao carregar pedidos de aprovação. Tenta novamente em instantes.',
      });
    } finally {
      setLoading(false);
    }
  }, [paginationModel.page, paginationModel.pageSize, q, status]);

  React.useEffect(() => {
    void fetchRows();
  }, [fetchRows]);

  const columns = React.useMemo<GridColDef<Row>[]>(() => [
    {
      field: 'name',
      headerName: 'Nome',
      flex: 1,
      minWidth: 200,
      valueFormatter: (p:any) => String(p?.value ?? ''),
    },
    {
      field: 'email',
      headerName: 'Email',
      flex: 1.2,
      minWidth: 220,
      valueFormatter: (p:any) => String(p?.value ?? ''),
    },
    {
      field: 'status',
      headerName: 'Estado',
      width: 150,
      renderCell: (p) => {
        const value = String(p.value ?? '').toLowerCase();
        const config = value === 'approved'
          ? { label: 'Aprovado', color: 'success' as const }
          : value === 'pending'
            ? { label: 'Pendente', color: 'warning' as const }
            : value === 'rejected'
              ? { label: 'Rejeitado', color: 'error' as const }
              : { label: p.value ? String(p.value) : '—', color: 'default' as const };
        return <Chip label={config.label} size="small" color={config.color} variant={config.color === 'default' ? 'outlined' : 'filled'} sx={{ fontWeight: 600 }} />;
      },
      sortComparator: (v1, v2) => String(v1 ?? '').localeCompare(String(v2 ?? '')),
    },
    {
      field: 'requested_at',
      headerName: 'Pedido em',
      minWidth: 190,
      valueFormatter: (p:any) => (p?.value ? new Date(String(p.value)).toLocaleString() : ''),
    },
    {
      field: 'actions', headerName: 'Ações', width: 200, sortable:false, filterable:false,
      renderCell: (p) => (
        <Stack direction="row" spacing={0.5}>
          {/* Opcional: Ver utilizador */}
          <Tooltip title="Ver utilizador">
            <IconButton size="small" onClick={() => navigate(`/dashboard/admin/users/${p.row.user_id}`, openInNew)}>
              <VisibilityOutlined fontSize="small" />
            </IconButton>
          </Tooltip>

          <Tooltip title="Aprovar">
            <IconButton
              size="small"
              color="success"
              onClick={async () => {
                try {
                  const res = await fetch(`/api/admin/approvals/${p.row.id}`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ status: 'approved' }),
                  });
                  if (!res.ok) throw new Error(await res.text());
                  setSnack({ open:true, msg:'Aprovação concluída ✅', sev:'success' });
                  void fetchRows();
                } catch (e:any) {
                  setSnack({ open:true, msg: e?.message || 'Falha ao aprovar', sev:'error' });
                }
              }}
            >
              <CheckCircleOutline fontSize="small" />
            </IconButton>
          </Tooltip>

          <Tooltip title="Remover">
            <IconButton
              size="small"
              color="error"
              onClick={async () => {
                const removed = p.row as Row;
                if (!confirm(`Remover pedido de ${removed.email || removed.name || removed.id}?`)) return;

                setRows(prev => prev.filter(r => r.id !== removed.id));
                setUndo({ open:true, row: removed });

                try {
                  const res = await fetch(`/api/admin/approvals/${removed.id}`, { method: 'DELETE' });
                  if (!res.ok) throw new Error(await res.text());
                } catch (e:any) {
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
      )
    }
  ], [openInNew]);

  function exportCSV() {
    if (!rows.length) {
      setSnack({ open: true, msg: 'Não há pedidos para exportar neste momento.', sev: 'info' });
      return;
    }
    const header = ['id','user_id','name','email','status','requested_at'];
    const lines = [
      header.join(','),
      ...rows.map(r => [
        r.id, r.user_id, r.name ?? '', r.email ?? '', r.status ?? '', r.requested_at ?? '',
      ].map(v => `"${String(v).replace(/"/g, '""')}"`).join(',')),
    ].join('\n');

    const blob = new Blob([lines], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `approvals${status?`-${status}`:''}${q?`-q-${q}`:''}.csv`; a.click();
    URL.revokeObjectURL(url);
  }

  function printList() {
    if (!rows.length) {
      setSnack({ open: true, msg: 'Não há pedidos para imprimir.', sev: 'info' });
      return;
    }
    const w = window.open('', '_blank', 'noopener,noreferrer,width=1000,height=700'); if (!w) return;
    const rowsHtml = rows.map(r => {
      const cells = [
        r.name ?? '', r.email ?? '', r.status ?? '', r.requested_at ? new Date(String(r.requested_at)).toLocaleString() : ''
      ].map(c => `<td>${String(c)}</td>`).join('');
      return `<tr>${cells}</tr>`;
    }).join('');
    const html =
      '<html><head><meta charset="utf-8" /><title>Aprovações</title>' +
      '<style>body{font-family:system-ui,-apple-system,Segoe UI,Roboto; padding:16px;}h1{font-size:18px;margin:0 0 12px;}table{border-collapse:collapse;width:100%;}th,td{border:1px solid #e5e7eb;padding:6px 8px;text-align:left;font-size:12px;}th{background:#f8fafc;}</style>' +
      '</head><body><h1>Aprovações</h1><table><thead><tr><th>Nome</th><th>Email</th><th>Estado</th><th>Pedido em</th></tr></thead><tbody>' +
      rowsHtml +
      '</tbody></table><script>window.onload=function(){window.print();}</script></body></html>';
    w.document.open(); w.document.write(html); w.document.close();
  }

  async function undoDelete() {
    const r = undo.row; if (!r) { closeUndo(); return; }
    try {
      const res = await fetch('/api/admin/approvals', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: r.user_id, name: r.name, email: r.email, status: r.status ?? 'pending' }),
      });
      if (!res.ok) throw new Error(await res.text());
      setSnack({ open:true, msg:'Pedido restaurado', sev:'success' });
      void fetchRows();
    } catch (e:any) {
      setSnack({ open:true, msg: e?.message || 'Falha ao restaurar', sev:'error' });
    } finally { closeUndo(); }
  }

  return (
    <Stack spacing={2.5} sx={{ width: '100%' }}>
      <Collapse in={Boolean(banner)}>
        {banner ? (
          <Alert
            severity={banner.severity}
            variant="outlined"
            onClose={() => setBanner(null)}
            sx={{ borderRadius: 2, borderColor: alpha(activeBannerColor, isDark ? 0.4 : 0.3) }}
          >
            {banner.message}
          </Alert>
        ) : null}
      </Collapse>

      <Paper
        sx={{
          p: { xs: 2, md: 2.5 },
          borderRadius: 3,
          border: '1px solid',
          borderColor: borderGlow,
          backgroundImage: 'none',
          backgroundColor: panelBg,
          boxShadow: `0 24px 64px -40px ${alpha(theme.palette.common.black, isDark ? 0.8 : 0.25)}`,
          backdropFilter: 'blur(12px)',
        }}
      >
        <Stack spacing={2.5}>
          <Stack
            direction={{ xs: 'column', lg: 'row' }}
            spacing={{ xs: 1.5, lg: 2 }}
            alignItems={{ xs: 'flex-start', lg: 'center' }}
            justifyContent="space-between"
          >
            <Stack spacing={0.5}>
              <Typography variant="h5" fontWeight={700} color="text.primary">
                Pedidos de aprovação
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Filtra, aprova ou rejeita rapidamente os pedidos de acesso de treinadores e clientes.
              </Typography>
            </Stack>

            <Stack
              direction="row"
              spacing={1}
              alignItems="center"
              flexWrap="wrap"
              justifyContent={{ xs: 'flex-start', lg: 'flex-end' }}
              useFlexGap
            >
              <Chip
                label={`${count} ${count === 1 ? 'pedido' : 'pedidos'}`}
                color="primary"
                variant="outlined"
                sx={{ fontWeight: 600 }}
              />
              <OpenInNewToggle checked={openInNew} onChange={setOpenInNew} />
              <Button
                size="small"
                variant="outlined"
                color="primary"
                startIcon={<FileDownloadOutlined fontSize="small" />}
                onClick={exportCSV}
              >
                Exportar
              </Button>
              <Button
                size="small"
                variant="outlined"
                color="secondary"
                startIcon={<PrintOutlined fontSize="small" />}
                onClick={printList}
              >
                Imprimir
              </Button>
            </Stack>
          </Stack>

          <Stack
            direction={{ xs: 'column', md: 'row' }}
            spacing={1.5}
            alignItems="stretch"
            useFlexGap
          >
            <TextField
              label="Pesquisar"
              value={q}
              onChange={(e)=>setQ(e.target.value)}
              fullWidth
              size="small"
            />
            <TextField
              select
              label="Estado"
              value={status}
              onChange={(e)=>setStatus(e.target.value)}
              sx={{ minWidth: { xs: '100%', md: 200 } }}
              size="small"
            >
              <MenuItem value="">Todos</MenuItem>
              <MenuItem value="pending">Pendentes</MenuItem>
              <MenuItem value="approved">Aprovados</MenuItem>
              <MenuItem value="rejected">Rejeitados</MenuItem>
            </TextField>
          </Stack>
        </Stack>
      </Paper>

      <Paper
        sx={{
          borderRadius: 3,
          border: '1px solid',
          borderColor: alpha(theme.palette.divider, isDark ? 0.6 : 0.4),
          backgroundImage: 'none',
          backgroundColor: alpha(theme.palette.background.paper, isDark ? 0.86 : 1),
          boxShadow: theme.shadows[3],
          overflow: 'hidden',
        }}
      >
        <DataGrid
          rows={rows}
          columns={columns as unknown as GridColDef[]}
          loading={loading}
          rowCount={count}
          paginationMode="server"
          paginationModel={paginationModel}
          onPaginationModelChange={setPaginationModel}
          disableRowSelectionOnClick
          disableColumnMenu
          autoHeight
          density="comfortable"
          pageSizeOptions={[10,20,50,100]}
          slots={{
            toolbar: GridToolbar,
            loadingOverlay: () => <CircularProgress size={24} />,
            noRowsOverlay: () => (
              <Stack height="100%" alignItems="center" justifyContent="center" spacing={1} sx={{ py: 4 }}>
                <Typography variant="body2" color="text.secondary">
                  Nenhum pedido encontrado.
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Ajusta os filtros ou tenta novamente mais tarde.
                </Typography>
              </Stack>
            ),
          }}
          slotProps={{
            toolbar: {
              showQuickFilter: false,
              csvOptions: { disableToolbarButton: true },
              printOptions: { disableToolbarButton: true },
            },
          }}
          sx={{
            border: 'none',
            '--DataGrid-rowBorderColor': alpha(theme.palette.divider, isDark ? 0.4 : 0.2),
            '& .MuiDataGrid-columnHeaders': {
              backgroundColor: toolbarBg,
              backdropFilter: 'blur(10px)',
              borderBottomColor: alpha(theme.palette.divider, isDark ? 0.5 : 0.25),
            },
            '& .MuiDataGrid-virtualScroller': {
              backgroundColor: 'transparent',
            },
            '& .MuiDataGrid-row:nth-of-type(odd)': {
              backgroundColor: rowStripe,
            },
            '& .MuiDataGrid-row:hover': {
              backgroundColor: rowHover,
            },
            '& .MuiDataGrid-cell:focus, & .MuiDataGrid-cell:focus-within': {
              outline: 'none',
            },
            '& .MuiDataGrid-footerContainer': {
              backgroundColor: footerBg,
              backdropFilter: 'blur(10px)',
            },
          }}
        />
      </Paper>

      <Snackbar open={undo.open} autoHideDuration={4000} onClose={closeUndo} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert severity="info" variant="filled" onClose={closeUndo} action={<Button color="inherit" size="small" onClick={undoDelete}>Desfazer</Button>} sx={{ width:'100%' }}>
          Pedido removido
        </Alert>
      </Snackbar>

      <Snackbar open={snack.open} autoHideDuration={3000} onClose={closeSnack}>
        <Alert severity={snack.sev} variant="filled" onClose={closeSnack} sx={{ width: '100%' }}>
          {snack.msg}
        </Alert>
      </Snackbar>
    </Stack>
  );
}
