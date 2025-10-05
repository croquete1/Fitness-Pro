'use client';

import * as React from 'react';
import {
  Box, Stack, TextField, MenuItem, Button, IconButton, Tooltip, Paper, Divider,
  CircularProgress, Snackbar, Alert,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import DeleteOutline from '@mui/icons-material/DeleteOutline';
import EditOutlined from '@mui/icons-material/EditOutlined';
import PrintOutlined from '@mui/icons-material/PrintOutlined';
import FileDownloadOutlined from '@mui/icons-material/FileDownloadOutlined';
import { DataGrid, GridColDef, GridToolbar } from '@mui/x-data-grid';
import { useRouter } from 'next/navigation';

type Row = {
  id: string;
  trainer_id: string;
  client_id: string;
  start_time: string;
  end_time: string;
  status: 'scheduled' | 'completed' | 'cancelled';
  location?: string;
  notes?: string;
};

export default function AdminPtsScheduleClient({
  trainers,
}: {
  trainers: { id: string; name: string | null; email: string | null }[];
}) {
  const router = useRouter();

  // filtros
  const [trainer, setTrainer] = React.useState('');
  const [status, setStatus] = React.useState('');
  const [from, setFrom] = React.useState('');
  const [to, setTo] = React.useState('');

  // paginação/estado
  const [rows, setRows] = React.useState<Row[]>([]);
  const [count, setCount] = React.useState(0);
  const [loading, setLoading] = React.useState(false);
  const [paginationModel, setPaginationModel] = React.useState({ page: 0, pageSize: 20 });

  // UI extra
  const [openNewTab, setOpenNewTab] = React.useState(false);
  const [undo, setUndo] = React.useState<{ open: boolean; row?: Row }>({ open: false });
  const closeUndo = () => setUndo({ open: false });
  const [snack, setSnack] = React.useState<{ open: boolean; msg: string; sev: 'success' | 'error' | 'info' | 'warning' }>({
    open: false, msg: '', sev: 'success',
  });
  const closeSnack = () => setSnack((s) => ({ ...s, open: false }));

  const fmtDT = (iso?: string) => {
    if (!iso) return '';
    const d = new Date(String(iso));
    return Number.isNaN(d.getTime()) ? '' : d.toLocaleString();
  };

  async function fetchRows() {
    setLoading(true);
    const u = new URL('/api/admin/pts-schedule', window.location.origin);
    u.searchParams.set('page', String(paginationModel.page));
    u.searchParams.set('pageSize', String(paginationModel.pageSize));
    if (trainer) u.searchParams.set('trainer', trainer);
    if (status) u.searchParams.set('status', status);
    if (from) u.searchParams.set('from', new Date(from).toISOString());
    if (to) u.searchParams.set('to', new Date(to).toISOString());

    try {
      const r = await fetch(u.toString(), { cache: 'no-store' });
      const j = await r.json();
      setRows((j.rows ?? []).map((r: any) => ({ ...r, id: String(r.id) })));
      setCount(j.count ?? 0);
    } catch {
      setRows([]); setCount(0);
      setSnack({ open: true, msg: 'Falha ao carregar sessões', sev: 'error' });
    } finally {
      setLoading(false);
    }
  }

  React.useEffect(() => {
    void fetchRows();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trainer, status, from, to, paginationModel.page, paginationModel.pageSize]);

  // ✅ evita o erro de "never" nos formatters
  const columns = React.useMemo<GridColDef<Row>[]>(() => [
    { field: 'start_time', headerName: 'Início', minWidth: 180, valueFormatter: (p: any) => fmtDT(p?.value) },
    { field: 'end_time', headerName: 'Fim', minWidth: 180, valueFormatter: (p: any) => fmtDT(p?.value) },
    { field: 'status', headerName: 'Estado', width: 130 },
    { field: 'trainer_id', headerName: 'PT', minWidth: 160 },
    { field: 'client_id', headerName: 'Cliente', minWidth: 160 },
    { field: 'location', headerName: 'Local', minWidth: 140, valueFormatter: (p: any) => String(p?.value ?? '') },
    {
      field: 'actions',
      headerName: 'Ações',
      width: 140,
      sortable: false,
      filterable: false,
      renderCell: (p) => (
        <Stack direction="row" spacing={0.5}>
          <Tooltip title="Editar">
            <IconButton size="small" onClick={() => router.push(`/dashboard/admin/pts-schedule/${p.row.id}`)}>
              <EditOutlined fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Remover">
            <IconButton
              size="small"
              color="error"
              onClick={async () => {
                const removed = p.row as Row;
                // optimistic
                setRows((prev) => prev.filter((r) => r.id !== removed.id));
                setUndo({ open: true, row: removed });

                try {
                  const res = await fetch(`/api/admin/pts-schedule/${removed.id}`, { method: 'DELETE' });
                  if (!res.ok) throw new Error(await res.text());
                  setSnack({ open: true, msg: 'Sessão removida', sev: 'success' });
                } catch (e: any) {
                  // rollback
                  setRows((prev) => [removed, ...prev]);
                  setUndo({ open: false });
                  setSnack({ open: true, msg: e?.message || 'Falha ao remover', sev: 'error' });
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

  // CSV
  function exportCSV() {
    const header = ['id', 'trainer_id', 'client_id', 'start_time', 'end_time', 'status', 'location', 'notes'];
    const lines = [
      header.join(','),
      ...rows.map(r => [
        r.id,
        r.trainer_id,
        r.client_id,
        new Date(r.start_time).toISOString(),
        new Date(r.end_time).toISOString(),
        r.status,
        r.location ?? '',
        (r.notes ?? '').replace(/\r?\n/g, ' '),
      ].map(v => `"${String(v).replace(/"/g, '""')}"`).join(',')),
    ].join('\n');

    const blob = new Blob([lines], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const name = `pts-schedule${trainer ? `-trainer-${trainer}` : ''}${status ? `-status-${status}` : ''}.csv`;
    a.href = url; a.download = name; a.click();
    URL.revokeObjectURL(url);
  }

  // Print por PT — versão sem template-string aninhada (evita erros de parsing)
  function printPerTrainer() {
    const w = window.open('', '_blank', 'noopener,noreferrer,width=900,height=700');
    if (!w) return;

    const t = trainers.find((tt) => tt.id === trainer);
    const title = 'Agenda PT' + (t ? ' — ' + (t.name || t.email || t.id) : '');

    const rowsHtml = rows.map((r) => {
      const cells = [
        fmtDT(r.start_time),
        fmtDT(r.end_time),
        r.status,
        r.trainer_id,
        r.client_id,
        r.location ?? '',
        (r.notes ?? '').replace(/\r?\n/g, ' '),
      ].map((c) => `<td>${String(c)}</td>`).join('');
      return `<tr>${cells}</tr>`;
    }).join('');

    const html =
      '<html>' +
      '<head>' +
      '<meta charset="utf-8" />' +
      `<title>${title}</title>` +
      '<style>' +
      "body{font-family:system-ui,-apple-system,'Segoe UI',Roboto,Ubuntu,Cantarell,'Helvetica Neue',Arial,'Noto Sans','Apple Color Emoji','Segoe UI Emoji';padding:16px;}" +
      'h1{font-size:18px;margin:0 0 12px;}' +
      'table{border-collapse:collapse;width:100%;}' +
      'th,td{border:1px solid #e5e7eb;padding:6px 8px;text-align:left;font-size:12px;}' +
      'th{background:#f8fafc;}' +
      '@media print{@page{margin:12mm;}}' +
      '</style>' +
      '</head>' +
      '<body>' +
      `<h1>${title}</h1>` +
      '<table>' +
      '<thead><tr>' +
      '<th>Início</th><th>Fim</th><th>Estado</th><th>PT</th><th>Cliente</th><th>Local</th><th>Notas</th>' +
      '</tr></thead>' +
      `<tbody>${rowsHtml}</tbody>` +
      '</table>' +
      '<script>window.onload=function(){window.print();}</script>' +
      '</body>' +
      '</html>';

    w.document.open();
    w.document.write(html);
    w.document.close();
  }

  // Desfazer remoção
  async function undoDelete() {
    const r = undo.row;
    if (!r) { closeUndo(); return; }

    try {
      const res = await fetch('/api/admin/pts-schedule', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          trainer_id: r.trainer_id,
          client_id: r.client_id,
          start_time: r.start_time,
          end_time: r.end_time,
          status: r.status,
          location: r.location ?? null,
          notes: r.notes ?? null,
        }),
      });
      if (!res.ok) throw new Error(await res.text());
      setSnack({ open: true, msg: 'Sessão restaurada', sev: 'success' });
      void fetchRows();
    } catch (e: any) {
      setSnack({ open: true, msg: e?.message || 'Falha ao restaurar', sev: 'error' });
    } finally {
      closeUndo();
    }
  }

  // -------------------- RENDER --------------------
  return (
    <Box sx={{ display: 'grid', gap: 1.5 }}>
      <Paper variant="outlined" sx={{ p: 1.5, borderRadius: 2 }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} alignItems="center" justifyContent="space-between">
          <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap' }}>
            <TextField
              select
              label="PT"
              value={trainer}
              onChange={(e) => setTrainer(e.target.value)}
              sx={{ minWidth: 200 }}
            >
              <MenuItem value="">Todos</MenuItem>
              {trainers.map((t) => (
                <MenuItem key={t.id} value={t.id}>{t.name || t.email || t.id}</MenuItem>
              ))}
            </TextField>

            <TextField
              select
              label="Estado"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              sx={{ minWidth: 160 }}
            >
              <MenuItem value="">Todos</MenuItem>
              <MenuItem value="scheduled">scheduled</MenuItem>
              <MenuItem value="completed">completed</MenuItem>
              <MenuItem value="cancelled">cancelled</MenuItem>
            </TextField>

            <TextField
              type="datetime-local"
              label="De"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              InputLabelProps={{ shrink: true }}
              sx={{ minWidth: 220 }}
            />
            <TextField
              type="datetime-local"
              label="Até"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              InputLabelProps={{ shrink: true }}
              sx={{ minWidth: 220 }}
            />
          </Stack>

          <Stack direction="row" spacing={1}>
            <Tooltip title={openNewTab ? 'Abrir em nova aba: ON' : 'Abrir em nova aba: OFF'}>
              <IconButton onClick={() => setOpenNewTab((v) => !v)}>
                <OpenInNewIcon />
              </IconButton>
            </Tooltip>

            <Tooltip title="Exportar CSV">
              <IconButton onClick={exportCSV}>
                <FileDownloadOutlined />
              </IconButton>
            </Tooltip>

            <Tooltip title="Imprimir por PT">
              <IconButton onClick={printPerTrainer} disabled={!trainer}>
                <PrintOutlined />
              </IconButton>
            </Tooltip>

            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => {
                const base = '/dashboard/admin/pts-schedule/new';
                const sp = new URLSearchParams();
                if (trainer) sp.set('trainer', trainer);
                if (from) sp.set('from', new Date(from).toISOString());
                if (to) sp.set('to', new Date(to).toISOString());
                const href = sp.toString() ? `${base}?${sp.toString()}` : base;

                if (openNewTab) window.open(href, '_blank');
                else router.push(href);
              }}
            >
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

      {/* Snackbar UNDO */}
      <Snackbar
        open={undo.open}
        autoHideDuration={4000}
        onClose={closeUndo}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          severity="info"
          variant="filled"
          action={
            <Button color="inherit" size="small" onClick={undoDelete}>
              Desfazer
            </Button>
          }
          onClose={closeUndo}
          sx={{ width: '100%' }}
        >
          Sessão removida
        </Alert>
      </Snackbar>

      {/* Snackbar geral */}
      <Snackbar open={snack.open} autoHideDuration={3000} onClose={closeSnack}>
        <Alert severity={snack.sev} variant="filled" onClose={closeSnack} sx={{ width: '100%' }}>
          {snack.msg}
        </Alert>
      </Snackbar>
    </Box>
  );
}
