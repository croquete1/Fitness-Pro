'use client';

import * as React from 'react';
import {
  Box, Stack, TextField, MenuItem, Button, IconButton, Tooltip, Paper, Divider,
  CircularProgress, Snackbar, Alert,
} from '@mui/material';
import DeleteOutline from '@mui/icons-material/DeleteOutline';
import FileDownloadOutlined from '@mui/icons-material/FileDownloadOutlined';
import PrintOutlined from '@mui/icons-material/PrintOutlined';
import CheckIcon from '@mui/icons-material/Check';
import { DataGrid, GridColDef, GridToolbar } from '@mui/x-data-grid';
import OpenInNewToggle from '@/components/ui/OpenInNewToggle';
import { navigate } from '@/lib/nav';

type Row = {
  id: string;
  user_id?: string | null;
  title?: string | null;
  body?: string | null;
  type?: string | null;
  read?: boolean | null;
  created_at?: string | null;
};

export default function NotificationsClient({ pageSize = 20 }: { pageSize?: number }) {
  const [q, setQ] = React.useState('');
  const [type, setType] = React.useState('');
  const [onlyUnread, setOnlyUnread] = React.useState('');
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
    const u = new URL('/api/admin/notifications', window.location.origin);
    u.searchParams.set('page', String(paginationModel.page));
    u.searchParams.set('pageSize', String(paginationModel.pageSize));
    if (q) u.searchParams.set('q', q);
    if (type) u.searchParams.set('type', type);
    if (onlyUnread) u.searchParams.set('unread', 'true');

    try {
      const r = await fetch(u.toString(), { cache: 'no-store' });
      const j = await r.json();
      setRows((j.rows ?? []).map((n:any) => ({
        id: String(n.id),
        user_id: n.user_id ?? n.uid ?? null,
        title: n.title ?? n.subject ?? '',
        body: n.body ?? n.message ?? '',
        type: n.type ?? n.kind ?? '',
        read: Boolean(n.read ?? n.is_read ?? false),
        created_at: n.created_at ?? null,
      })));
      setCount(j.count ?? 0);
    } catch {
      setRows([]); setCount(0);
      setSnack({ open:true, msg:'Falha ao carregar notificações', sev:'error' });
    } finally { setLoading(false); }
  }

  React.useEffect(() => { void fetchRows(); // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q, type, onlyUnread, paginationModel.page, paginationModel.pageSize]);

  const columns = React.useMemo<GridColDef<Row>[]>(() => [
    { field: 'title', headerName: 'Título', flex: 1.2, minWidth: 220, valueFormatter: (p:any) => String(p?.value ?? '') },
    { field: 'type', headerName: 'Tipo', width: 130, valueFormatter: (p:any) => String(p?.value ?? '') },
    { field: 'read', headerName: 'Lida', width: 100, valueFormatter: (p:any) => (p?.value ? 'Sim' : 'Não') },
    { field: 'created_at', headerName: 'Criada em', minWidth: 180, valueFormatter: (p:any) => (p?.value ? new Date(String(p.value)).toLocaleString() : '') },
    {
      field: 'actions', headerName: 'Ações', width: 180, sortable:false, filterable:false,
      renderCell: (p) => (
        <Stack direction="row" spacing={0.5}>
          {/* Opcional: Ver utilizador associado */}
          {p.row.user_id && (
            <Tooltip title="Ver utilizador">
              <IconButton size="small" onClick={() => navigate(`/dashboard/admin/users/${p.row.user_id}`, openInNew)}>
                <CheckIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          )}

          <Tooltip title="Marcar como lida">
            <span>
              <IconButton
                size="small"
                disabled={Boolean(p.row.read)}
                onClick={async () => {
                  try {
                    const res = await fetch(`/api/admin/notifications/${p.row.id}`, {
                      method: 'PATCH',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ read: true }),
                    });
                    if (!res.ok) throw new Error(await res.text());
                    setSnack({ open:true, msg:'Notificação marcada como lida', sev:'success' });
                    void fetchRows();
                  } catch (e:any) {
                    setSnack({ open:true, msg: e?.message || 'Falha ao marcar', sev:'error' });
                  }
                }}
              >
                <CheckIcon fontSize="small" />
              </IconButton>
            </span>
          </Tooltip>

          <Tooltip title="Remover">
            <IconButton
              size="small"
              color="error"
              onClick={async () => {
                const removed = p.row as Row;
                if (!confirm(`Remover notificação "${removed.title || removed.id}"?`)) return;

                setRows(prev => prev.filter(r => r.id !== removed.id));
                setUndo({ open:true, row: removed });

                try {
                  const res = await fetch(`/api/admin/notifications/${removed.id}`, { method: 'DELETE' });
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
    const header = ['id','title','type','read','created_at','body'];
    const lines = [
      header.join(','),
      ...rows.map(r => [
        r.id, r.title ?? '', r.type ?? '', r.read ? 'true' : 'false', r.created_at ?? '', (r.body ?? '').replace(/\r?\n/g, ' ')
      ].map(v => `"${String(v).replace(/"/g, '""')}"`).join(',')),
    ].join('\n');

    const blob = new Blob([lines], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `notifications${type?`-${type}`:''}${onlyUnread?'-unread':''}${q?`-q-${q}`:''}.csv`; a.click();
    URL.revokeObjectURL(url);
  }

  function printList() {
    const w = window.open('', '_blank', 'noopener,noreferrer,width=1000,height=700'); if (!w) return;
    const rowsHtml = rows.map(r => {
      const cells = [
        r.title ?? '', r.type ?? '', r.read ? 'Sim' : 'Não', r.created_at ? new Date(String(r.created_at)).toLocaleString() : '', (r.body ?? '').replace(/\r?\n/g, ' ')
      ].map(c => `<td>${String(c)}</td>`).join('');
      return `<tr>${cells}</tr>`;
    }).join('');
    const html =
      '<html><head><meta charset="utf-8" /><title>Notificações</title>' +
      '<style>body{font-family:system-ui,-apple-system,Segoe UI,Roboto; padding:16px;}h1{font-size:18px;margin:0 0 12px;}table{border-collapse:collapse;width:100%;}th,td{border:1px solid #e5e7eb;padding:6px 8px;text-align:left;font-size:12px;}th{background:#f8fafc;}</style>' +
      '</head><body><h1>Notificações</h1><table><thead><tr><th>Título</th><th>Tipo</th><th>Lida</th><th>Criada</th><th>Mensagem</th></tr></thead><tbody>' +
      rowsHtml +
      '</tbody></table><script>window.onload=function(){window.print();}</script></body></html>';
    w.document.open(); w.document.write(html); w.document.close();
  }

  async function undoDelete() {
    const r = undo.row; if (!r) { closeUndo(); return; }
    try {
      const res = await fetch('/api/admin/notifications', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: r.user_id ?? null,
          title: r.title ?? '',
          body: r.body ?? '',
          type: r.type ?? 'info',
          read: Boolean(r.read),
        }),
      });
      if (!res.ok) throw new Error(await res.text());
      setSnack({ open:true, msg:'Notificação restaurada', sev:'success' });
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
            <TextField label="Pesquisar" value={q} onChange={(e)=>setQ(e.target.value)} sx={{ minWidth: 240 }} />
            <TextField select label="Tipo" value={type} onChange={(e)=>setType(e.target.value)} sx={{ minWidth: 160 }}>
              <MenuItem value="">Todos</MenuItem>
              <MenuItem value="info">info</MenuItem>
              <MenuItem value="warning">warning</MenuItem>
              <MenuItem value="success">success</MenuItem>
              <MenuItem value="error">error</MenuItem>
            </TextField>
            <TextField select label="Só por ler" value={onlyUnread} onChange={(e)=>setOnlyUnread(e.target.value)} sx={{ minWidth: 160 }}>
              <MenuItem value="">—</MenuItem>
              <MenuItem value="true">Sim</MenuItem>
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
          Notificação removida
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
