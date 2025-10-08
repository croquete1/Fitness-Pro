'use client';

import * as React from 'react';
import {
  Box, Paper, Stack, TextField, MenuItem, Button, IconButton, Tooltip,
  Divider, CircularProgress, Chip, Dialog, DialogTitle, DialogContent, DialogActions,
  Snackbar, Alert,
} from '@mui/material';
import { DataGrid, GridColDef, GridToolbar } from '@mui/x-data-grid';
import AddIcon from '@mui/icons-material/Add';
import EditOutlined from '@mui/icons-material/EditOutlined';
import DeleteOutline from '@mui/icons-material/DeleteOutline';
import ContentCopyOutlined from '@mui/icons-material/ContentCopyOutlined';
import FileDownloadOutlined from '@mui/icons-material/FileDownloadOutlined';
import PrintOutlined from '@mui/icons-material/PrintOutlined';
import { useRouter } from 'next/navigation';
import { usePtsCounts } from '@/lib/hooks/usePtsCounts';
import SessionFormClient from './SessionFormClient';

export type Row = {
  id: string;
  start_time?: string | null;
  end_time?: string | null;
  status?: string | null;
  trainer_id?: string | null;
  client_id?: string | null;
  location?: string | null;
  notes?: string | null;
  created_at?: string | null;
};

// shape mínimo esperado pelo SessionFormClient.initial
type SessionInitial = Partial<{
  id: string;
  trainer_id: string;
  client_id: string;
  start_time: string;
  end_time: string;
  status: 'scheduled' | 'done' | 'cancelled';
  location?: string;
  notes?: string;
}>;

export default function AdminPtsScheduleClient({ pageSize = 20 }: { pageSize?: number }) {
  const router = useRouter();

  const [status, setStatus] = React.useState('');
  const [rows, setRows] = React.useState<Row[]>([]);
  const [count, setCount] = React.useState(0);
  const [loading, setLoading] = React.useState(false);
  const [paginationModel, setPaginationModel] = React.useState({ page: 0, pageSize });

  // counts (badge no header) — mantém compat com o hook existente
const { today, next7, loading: loadingCounts } = usePtsCounts();
  const todayBadge = today;
  const next7Badge = next7;

  // feedback
  const [snack, setSnack] = React.useState<{ open: boolean; msg: string; sev: 'success'|'error'|'info'|'warning' }>
  ({ open: false, msg: '', sev: 'success' });
  const closeSnack = () => setSnack(s => ({ ...s, open: false }));

  // -----------------------
  // Fetch (seguro c/ AbortSignal)
  // -----------------------
  async function fetchRows(signal?: AbortSignal) {
    setLoading(true);
    try {
      const u = new URL('/api/admin/pts-schedule', window.location.origin);
      u.searchParams.set('page', String(paginationModel.page));
      u.searchParams.set('pageSize', String(paginationModel.pageSize));
      if (status) u.searchParams.set('status', status);

      const r = await fetch(u.toString(), { cache: 'no-store', signal });
      const j = await r.json();
      const mapped: Row[] = (j.rows ?? []).map((r: any) => ({
        id: String(r.id),
        start_time: r.start_time ?? r.start ?? r.starts_at ?? r.begin_at ?? null,
        end_time: r.end_time ?? r.end ?? r.ends_at ?? r.finish_at ?? null,
        status: r.status ?? r.state ?? null,
        trainer_id: r.trainer_id ?? r.pt_id ?? null,
        client_id: r.client_id ?? r.member_id ?? null,
        location: r.location ?? r.place ?? null,
        notes: r.notes ?? null,
        created_at: r.created_at ?? null,
      }));
      setRows(mapped);
      setCount(j.count ?? mapped.length);
    } catch {
      // se abort ou falha, limpamos de forma segura
      if (!signal || !('aborted' in signal) || !signal.aborted) {
        setRows([]); setCount(0);
      }
    } finally {
      setLoading(false);
    }
  }

  React.useEffect(() => {
    const ctrl = new AbortController();
    void fetchRows(ctrl.signal);
    return () => ctrl.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, paginationModel.page, paginationModel.pageSize]);

  // -----------------------
  // Export / Print
  // -----------------------
  function exportCSV() {
    const header = ['id','trainer_id','client_id','start_time','end_time','status','location','notes','created_at'];
    const lines = [
      header.join(','),
      ...rows.map(r => [
        r.id,
        r.trainer_id ?? '',
        r.client_id ?? '',
        r.start_time ?? '',
        r.end_time ?? '',
        r.status ?? '',
        r.location ?? '',
        (r.notes ?? '').replace(/\r?\n/g, ' '),
        r.created_at ?? '',
      ].map(v => `"${String(v).replace(/"/g, '""')}"`).join(',')),
    ].join('\n');

    const blob = new Blob([lines], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const name = `pts-schedule${status?`-status-${status}`:''}.csv`;
    a.href = url; a.download = name; a.click();
    URL.revokeObjectURL(url);
  }

  function printList() {
    const w = window.open('', '_blank', 'noopener,noreferrer,width=1000,height=700'); if (!w) return;

    const rowsHtml = rows.map(r => {
      const cells = [
        r.start_time ? new Date(String(r.start_time)).toLocaleString() : '',
        r.end_time ? new Date(String(r.end_time)).toLocaleString() : '',
        r.status ?? '',
        r.trainer_id ?? '',
        r.client_id ?? '',
        r.location ?? '',
        (r.notes ?? '').replace(/\r?\n/g, ' '),
      ].map(c => `<td>${String(c)}</td>`).join('');
      return `<tr>${cells}</tr>`;
    }).join('');

    const title = 'Agenda PTs';
    const html =
      '<html><head><meta charset="utf-8" />' +
      `<title>${title}</title>` +
      '<style>body{font-family:system-ui,-apple-system,Segoe UI,Roboto,Ubuntu,Cantarell,Helvetica Neue,Arial,Noto Sans; padding:16px;}h1{font-size:18px;margin:0 0 12px;}table{border-collapse:collapse;width:100%;}th,td{border:1px solid #e5e7eb;padding:6px 8px;text-align:left;font-size:12px;}th{background:#f8fafc;}@media print{@page{margin:12mm;}}</style></head>' +
      `<body><h1>${title}</h1><table><thead><tr><th>Início</th><th>Fim</th><th>Estado</th><th>PT</th><th>Cliente</th><th>Local</th><th>Notas</th></tr></thead><tbody>${rowsHtml}</tbody></table><script>window.onload=function(){window.print();}</script></body></html>`;
    w.document.open(); w.document.write(html); w.document.close();
  }

  // -----------------------
  // Dialog "Criar a partir de"
  // -----------------------
  const [createOpen, setCreateOpen] = React.useState(false);
  const [createInitial, setCreateInitial] = React.useState<SessionInitial | null>(null);

  function openCreateFrom(row?: Row) {
    if (row) {
      setCreateInitial({
        // sem id: será sempre create
        trainer_id: row.trainer_id ?? '',
        client_id: row.client_id ?? '',
        start_time: row.start_time ?? '',
        end_time: row.end_time ?? '',
        status: (row.status as any) ?? 'scheduled',
        location: row.location ?? '',
        notes: row.notes ?? '',
      });
    } else {
      setCreateInitial(null);
    }
    setCreateOpen(true);
  }

  function closeCreate() {
    setCreateOpen(false);
  }

  // -----------------------
  // Columns
  // -----------------------
  const columns: GridColDef<Row>[] = [
    { field: 'start_time', headerName: 'Início', minWidth: 180, valueFormatter: (p: any) => (p?.value ? new Date(String(p.value)).toLocaleString() : '') },
    { field: 'end_time', headerName: 'Fim', minWidth: 180, valueFormatter: (p: any) => (p?.value ? new Date(String(p.value)).toLocaleString() : '') },
    { field: 'status', headerName: 'Estado', width: 130, valueFormatter: (p: any) => String(p?.value ?? '') },
    { field: 'trainer_id', headerName: 'PT', minWidth: 160, valueFormatter: (p: any) => String(p?.value ?? '') },
    { field: 'client_id', headerName: 'Cliente', minWidth: 160, valueFormatter: (p: any) => String(p?.value ?? '') },
    { field: 'location', headerName: 'Local', minWidth: 160, valueFormatter: (p: any) => String(p?.value ?? '') },
    {
      field: 'actions',
      headerName: 'Ações',
      width: 190,
      sortable: false,
      filterable: false,
      renderCell: (p) => (
        <Stack direction="row" spacing={0.5}>
          <Tooltip title="Editar">
            <IconButton size="small" onClick={() => router.push(`/dashboard/admin/pts-schedule/${p.row.id}`)}>
              <EditOutlined fontSize="small" />
            </IconButton>
          </Tooltip>

          <Tooltip title="Criar a partir desta">
            <IconButton size="small" onClick={() => openCreateFrom(p.row)}>
              <ContentCopyOutlined fontSize="small" />
            </IconButton>
          </Tooltip>

          <Tooltip title="Remover">
            <IconButton
              size="small"
              color="error"
              onClick={async () => {
                if (!confirm('Remover sessão?')) return;
                const res = await fetch(`/api/admin/pts-schedule/${p.row.id}`, { method: 'DELETE' });
                if (res.ok) {
                  setSnack({ open: true, msg: 'Sessão removida', sev: 'success' });
                  void fetchRows();
                } else {
                  setSnack({ open: true, msg: 'Falha ao remover', sev: 'error' });
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

  // -----------------------
  // Render
  // -----------------------
  return (
    <Box sx={{ display: 'grid', gap: 1.5 }}>
      <Paper variant="outlined" sx={{ p: 1.5, borderRadius: 2 }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} alignItems="center" justifyContent="space-between">
          <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap' }}>
            <TextField select label="Estado" value={status} onChange={(e) => setStatus(e.target.value)} sx={{ minWidth: 180 }}>
              <MenuItem value="">Todos</MenuItem>
              <MenuItem value="scheduled">scheduled</MenuItem>
              <MenuItem value="done">done</MenuItem>
              <MenuItem value="cancelled">cancelled</MenuItem>
            </TextField>
<Chip label={`Hoje: ${today}`}   variant="outlined" color="primary" />
<Chip label={`Próx. 7: ${next7}`} variant="outlined" />
          </Stack>

          <Stack direction="row" spacing={1}>
            <Tooltip title="Exportar CSV"><IconButton onClick={exportCSV}><FileDownloadOutlined /></IconButton></Tooltip>
            <Tooltip title="Imprimir"><IconButton onClick={printList}><PrintOutlined /></IconButton></Tooltip>
            <Button variant="contained" startIcon={<AddIcon />} onClick={() => openCreateFrom()}>
              Nova sessão
            </Button>
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

      {/* Dialog: Criar a partir de / Nova sessão */}
      <Dialog
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        fullWidth
        maxWidth="sm"
        PaperProps={{ elevation: 8, sx: { borderRadius: 2 } }}
      >
        <DialogTitle>{createInitial ? 'Criar sessão a partir desta' : 'Nova sessão'}</DialogTitle>
        <DialogContent dividers>
          {/* Reutilizamos o mesmo form, scope admin (endpoints /api/admin/...) */}
          <SessionFormClient mode="create" initial={createInitial ?? undefined} />
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setCreateOpen(false);
              void fetchRows();
            }}
          >
            Fechar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snack de feedback simples para ações fora do form */}
      <Snackbar open={snack.open} autoHideDuration={3000} onClose={closeSnack}>
        <Alert severity={snack.sev} variant="filled" onClose={closeSnack} sx={{ width: '100%' }}>
          {snack.msg}
        </Alert>
      </Snackbar>
    </Box>
  );
}
