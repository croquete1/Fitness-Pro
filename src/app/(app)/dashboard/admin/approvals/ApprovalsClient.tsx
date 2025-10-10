'use client';

import * as React from 'react';
import {
  Box, Stack, TextField, MenuItem, Button, IconButton, Tooltip, Paper, Divider,
  CircularProgress, Snackbar, Alert,
} from '@mui/material';
import CheckCircleOutline from '@mui/icons-material/CheckCircleOutline';
import DeleteOutline from '@mui/icons-material/DeleteOutline';
import FileDownloadOutlined from '@mui/icons-material/FileDownloadOutlined';
import PrintOutlined from '@mui/icons-material/PrintOutlined';
import { DataGrid, GridColDef, GridToolbar } from '@mui/x-data-grid';
import OpenInNewToggle from '@/components/ui/OpenInNewToggle';
import { navigate } from '@/lib/nav';

type Row = {
  id: string;
  user_id: string;
  name?: string | null;
  email?: string | null;
  requested_at?: string | null;
  status?: 'pending' | 'approved' | 'rejected' | string | null;
};

export default function ApprovalsClient({ pageSize = 20 }: { pageSize?: number }) {
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

  async function fetchRows() {
    setLoading(true);
    const u = new URL('/api/admin/approvals', window.location.origin);
    u.searchParams.set('page', String(paginationModel.page));
    u.searchParams.set('pageSize', String(paginationModel.pageSize));
    if (q) u.searchParams.set('q', q);
    if (status) u.searchParams.set('status', status);

    try {
      const r = await fetch(u.toString(), { cache: 'no-store', credentials: 'same-origin' });
      const j = await r.json();
      setRows((j.rows ?? []).map((r:any) => ({
        id: String(r.id),
        user_id: String(r.user_id ?? r.uid ?? r.user ?? ''),
        name: r.name ?? null,
        email: r.email ?? null,
        requested_at: r.requested_at ?? r.created_at ?? null,
        status: r.status ?? 'pending',
      })));
      setCount(j.count ?? 0);
    } catch {
      setRows([]); setCount(0);
      setSnack({ open:true, msg:'Falha ao carregar aprovações', sev:'error' });
    } finally {
      setLoading(false);
    }
  }

  React.useEffect(() => { void fetchRows(); // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q, status, paginationModel.page, paginationModel.pageSize]);

  const columns = React.useMemo<GridColDef<Row>[]>(() => [
    { field: 'name', headerName: 'Nome', flex: 1, minWidth: 180, valueFormatter: (p:any) => String(p?.value ?? '') },
    { field: 'email', headerName: 'Email', flex: 1.2, minWidth: 220, valueFormatter: (p:any) => String(p?.value ?? '') },
    { field: 'status', headerName: 'Estado', width: 130, valueFormatter: (p:any) => String(p?.value ?? '') },
    { field: 'requested_at', headerName: 'Pedido em', minWidth: 180, valueFormatter: (p:any) => (p?.value ? new Date(String(p.value)).toLocaleString() : '') },
    {
      field: 'actions', headerName: 'Ações', width: 200, sortable:false, filterable:false,
      renderCell: (p) => (
        <Stack direction="row" spacing={0.5}>
          {/* Opcional: Ver utilizador */}
          <Tooltip title="Ver utilizador">
            <IconButton size="small" onClick={() => navigate(`/dashboard/admin/users/${p.row.user_id}`, openInNew)}>
              {/* reutiliza CheckCircleOutline se não tiveres um ícone 'ver', ou troca por VisibilityOutlined */}
              <CheckCircleOutline fontSize="small" />
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
    <Box sx={{ display: 'grid', gap: 1.5 }}>
      <Paper variant="outlined" sx={{ p: 1.5, borderRadius: 2 }}>
        <Stack direction={{ xs:'column', sm:'row' }} spacing={1} alignItems="center" justifyContent="space-between">
          <Stack direction="row" spacing={1} sx={{ flexWrap:'wrap' }}>
            <TextField label="Pesquisar" value={q} onChange={(e)=>setQ(e.target.value)} sx={{ minWidth: 220 }} />
            <TextField select label="Estado" value={status} onChange={(e)=>setStatus(e.target.value)} sx={{ minWidth: 160 }}>
              <MenuItem value="">Todos</MenuItem>
              <MenuItem value="pending">pending</MenuItem>
              <MenuItem value="approved">approved</MenuItem>
              <MenuItem value="rejected">rejected</MenuItem>
            </TextField>
          </Stack>
          <Stack direction="row" spacing={1} alignItems="center">
            <OpenInNewToggle checked={openInNew} onChange={setOpenInNew} />
            <Tooltip title="Exportar CSV"><IconButton onClick={exportCSV}><FileDownloadOutlined /></IconButton></Tooltip>
            <Tooltip title="Imprimir"><IconButton onClick={printList}><PrintOutlined /></IconButton></Tooltip>
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
          pageSizeOptions={[10,20,50,100]}
        />
      </div>

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
    </Box>
  );
}
