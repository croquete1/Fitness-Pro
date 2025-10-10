'use client';

import * as React from 'react';
import {
  Box, Paper, Stack, TextField, MenuItem, Button, IconButton, Tooltip,
  Divider, CircularProgress, Chip, Dialog, DialogTitle, DialogContent, DialogActions,
} from '@mui/material';
import { DataGrid, type GridColDef, GridToolbar } from '@mui/x-data-grid';
import AddIcon from '@mui/icons-material/Add';
import EditOutlined from '@mui/icons-material/EditOutlined';
import DeleteOutline from '@mui/icons-material/DeleteOutline';
import FileDownloadOutlined from '@mui/icons-material/FileDownloadOutlined';
import PrintOutlined from '@mui/icons-material/PrintOutlined';
import { useRouter } from 'next/navigation';
import SessionFormClient from '@/app/(app)/dashboard/admin/pts-schedule/SessionFormClient';
import { useTrainerPtsCounts } from '@/lib/hooks/usePtsCounts'; // ✅ nome correto do hook

export type Row = {
  id: string;
  start_time?: string | null;
  end_time?: string | null;
  status?: 'scheduled' | 'done' | 'cancelled' | string | null;
  trainer_id?: string | null;
  client_id?: string | null;
  location?: string | null;
  notes?: string | null;
  created_at?: string | null;
};

export default function TrainerScheduleClient({ pageSize = 20 }: { pageSize?: number }) {
  const router = useRouter();

  // filtros/paginação
  const [status, setStatus] = React.useState('');
  const [rows, setRows] = React.useState<Row[]>([]);
  const [count, setCount] = React.useState(0);
  const [loading, setLoading] = React.useState(false);
  const [paginationModel, setPaginationModel] = React.useState({ page: 0, pageSize });

  // contadores no escopo PT
  const { today, next7, loading: loadingCounts } = useTrainerPtsCounts();

  // diálogo "Nova sessão"
  const [createOpen, setCreateOpen] = React.useState(false);
  const openCreate = () => setCreateOpen(true);
  const closeCreate = (refresh?: boolean) => {
    setCreateOpen(false);
    if (refresh) void fetchRows();
  };

  async function fetchRows() {
    setLoading(true);
    try {
      const u = new URL('/api/trainer/pts-schedule', window.location.origin);
      u.searchParams.set('page', String(paginationModel.page));
      u.searchParams.set('pageSize', String(paginationModel.pageSize));
      if (status) u.searchParams.set('status', status);

      const r = await fetch(u.toString(), { cache: 'no-store' });
      const j = await r.json();

      setRows(
        (j.rows ?? []).map((row: any): Row => ({
          id: String(row.id),
          start_time: row.start_time ?? row.start ?? row.starts_at ?? null,
          end_time: row.end_time ?? row.end ?? row.ends_at ?? null,
          status: row.status ?? row.state ?? null,
          trainer_id: row.trainer_id ?? row.pt_id ?? null,
          client_id: row.client_id ?? row.member_id ?? null,
          location: row.location ?? row.place ?? null,
          notes: row.notes ?? null,
          created_at: row.created_at ?? null,
        })),
      );
      setCount(j.count ?? 0);
    } catch {
      setRows([]);
      setCount(0);
    } finally {
      setLoading(false);
    }
  }

  React.useEffect(() => {
    void fetchRows();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, paginationModel.page, paginationModel.pageSize]);

  const columns: GridColDef<Row>[] = [
    {
      field: 'start_time',
      headerName: 'Início',
      minWidth: 180,
      valueFormatter: (p: any) => (p?.value ? new Date(String(p.value)).toLocaleString() : ''),
    },
    {
      field: 'end_time',
      headerName: 'Fim',
      minWidth: 180,
      valueFormatter: (p: any) => (p?.value ? new Date(String(p.value)).toLocaleString() : ''),
    },
    { field: 'status', headerName: 'Estado', width: 130, valueFormatter: (p: any) => String(p?.value ?? '') },
    { field: 'client_id', headerName: 'Cliente', minWidth: 160, valueFormatter: (p: any) => String(p?.value ?? '') },
    { field: 'location', headerName: 'Local', minWidth: 160, valueFormatter: (p: any) => String(p?.value ?? '') },
    {
      field: 'actions',
      headerName: 'Ações',
      width: 150,
      sortable: false,
      filterable: false,
      renderCell: (p) => (
        <Stack direction="row" spacing={0.5}>
          <Tooltip title="Editar">
            <IconButton size="small" onClick={() => router.push(`/dashboard/pt/schedule/${p.row.id}`)}>
              <EditOutlined fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Remover">
            <IconButton
              size="small"
              color="error"
              onClick={async () => {
                if (!confirm('Remover sessão?')) return;
                const res = await fetch(`/api/trainer/pts-schedule/${p.row.id}`, { method: 'DELETE' });
                if (res.ok) void fetchRows();
              }}
            >
              <DeleteOutline fontSize="small" />
            </IconButton>
          </Tooltip>
        </Stack>
      ),
    },
  ];

  function exportCSV() {
    const header = ['id', 'start_time', 'end_time', 'status', 'client_id', 'location', 'notes', 'created_at'];
    const lines = [
      header.join(','),
      ...rows.map((r) =>
        [
          r.id,
          r.start_time ?? '',
          r.end_time ?? '',
          r.status ?? '',
          r.client_id ?? '',
          r.location ?? '',
          (r.notes ?? '').replace(/\r?\n/g, ' '),
          r.created_at ?? '',
        ]
          .map((v) => `"${String(v).replace(/"/g, '""')}"`)
          .join(','),
      ),
    ].join('\n');

    const blob = new Blob([lines], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const name = `trainer-sessions${status ? `-status-${status}` : ''}.csv`;
    a.href = url;
    a.download = name;
    a.click();
    URL.revokeObjectURL(url);
  }

  function printList() {
    const w = window.open('', '_blank', 'noopener,noreferrer,width=1000,height=700');
    if (!w) return;

    const rowsHtml = rows
      .map((r) => {
        const cells = [
          r.start_time ? new Date(String(r.start_time)).toLocaleString() : '',
          r.end_time ? new Date(String(r.end_time)).toLocaleString() : '',
          r.status ?? '',
          r.client_id ?? '',
          r.location ?? '',
          (r.notes ?? '').replace(/\r?\n/g, ' '),
        ]
          .map((c) => `<td>${String(c)}</td>`)
          .join('');
        return `<tr>${cells}</tr>`;
      })
      .join('');

    const title = 'Agenda do PT';
    const html =
      '<html><head><meta charset="utf-8" />' +
      `<title>${title}</title>` +
      '<style>body{font-family:system-ui,-apple-system,Segoe UI,Roboto,Ubuntu,Cantarell,Helvetica Neue,Arial,Noto Sans; padding:16px;}h1{font-size:18px;margin:0 0 12px;}table{border-collapse:collapse;width:100%;}th,td{border:1px solid #e5e7eb;padding:6px 8px;text-align:left;font-size:12px;}th{background:#f8fafc;}@media print{@page{margin:12mm;}}</style></head>' +
      `<body><h1>${title}</h1><table><thead><tr><th>Início</th><th>Fim</th><th>Estado</th><th>Cliente</th><th>Local</th><th>Notas</th></tr></thead><tbody>${rowsHtml}</tbody></table><script>window.onload=function(){window.print();}</script></body></html>`;
    w.document.open();
    w.document.write(html);
    w.document.close();
  }

  return (
    <Box sx={{ display: 'grid', gap: 1.5 }}>
      <Paper variant="outlined" sx={{ p: 1.5, borderRadius: 2 }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} alignItems="center" justifyContent="space-between">
          <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap' }}>
            <TextField
              select
              label="Estado"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              sx={{ minWidth: 180 }}
            >
              <MenuItem value="">Todos</MenuItem>
              <MenuItem value="scheduled">scheduled</MenuItem>
              <MenuItem value="done">done</MenuItem>
              <MenuItem value="cancelled">cancelled</MenuItem>
            </TextField>
            <Chip
              label={`Hoje: ${today ?? 0}`}
              variant="outlined"
              color="primary"
              icon={loadingCounts ? <CircularProgress size={14} /> : undefined}
            />
            <Chip label={`Próx. 7: ${next7 ?? 0}`} variant="outlined" />
          </Stack>

          <Stack direction="row" spacing={1}>
            <Tooltip title="Exportar CSV">
              <IconButton onClick={exportCSV}>
                <FileDownloadOutlined />
              </IconButton>
            </Tooltip>
            <Tooltip title="Imprimir">
              <IconButton onClick={printList}>
                <PrintOutlined />
              </IconButton>
            </Tooltip>
            <Button variant="contained" startIcon={<AddIcon />} onClick={openCreate}>
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

      {/* Dialog: Nova sessão (PT) */}
      <Dialog open={createOpen} onClose={() => closeCreate()} fullWidth maxWidth="sm">
        <DialogTitle>➕ Nova sessão</DialogTitle>
        <DialogContent dividers>
          {/* Reutilizamos o mesmo form; no backend /api/trainer/pts-schedule valida o scope */}
          <SessionFormClient
            mode="create"
            onSuccess={() => closeCreate(true)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => closeCreate()}>Fechar</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
