'use client';

import * as React from 'react';
import {
  Box, Paper, Stack, TextField, MenuItem, Button, IconButton, Tooltip,
  Divider, CircularProgress, Chip, Dialog, DialogTitle, DialogContent, DialogActions,
} from '@mui/material';
import { DataGrid, GridColDef, GridToolbar } from '@mui/x-data-grid';
import AddIcon from '@mui/icons-material/Add';
import EditOutlined from '@mui/icons-material/EditOutlined';
import DeleteOutline from '@mui/icons-material/DeleteOutline';
import { usePtsCounts } from '@/lib/hooks/usePtsCounts';
import SessionFormClient from '@/app/(app)/dashboard/admin/pts-schedule/SessionFormClient';
import { useTrainerPtsCounts } from '@/lib/hooks/usePtsCounts';

type Row = {
  id: string;
  start_time?: string | null;
  end_time?: string | null;
  status?: string | null;
  client_id?: string | null;
  location?: string | null;
  notes?: string | null;
};

export default function TrainerScheduleClient({ pageSize = 20 }: { pageSize?: number }) {
  const [status, setStatus] = React.useState('');
  const [rows, setRows] = React.useState<Row[]>([]);
  const [count, setCount] = React.useState(0);
  const [loading, setLoading] = React.useState(false);
  const [paginationModel, setPaginationModel] = React.useState({ page: 0, pageSize });

  // contadores no escopo PT
const { today, next7, loading: loadingCounts } = useTrainerPtsCounts();

  const [createOpen, setCreateOpen] = React.useState(false);
  const openCreate = () => setCreateOpen(true);
  const closeCreate = () => setCreateOpen(false);

  const mapRows = React.useCallback((arr: any[]): Row[] => (arr ?? []).map((r: any) => ({
    id: String(r.id),
    start_time: r.start_time ?? null,
    end_time: r.end_time ?? null,
    status: r.status ?? null,
    client_id: r.client_id ?? null,
    location: r.location ?? null,
    notes: r.notes ?? null,
  })), []);

  const fetchRows = React.useCallback(() => {
    const ctrl = new AbortController();
    (async () => {
      setLoading(true);
      try {
        const u = new URL('/api/trainer/pts-schedule', window.location.origin);
        u.searchParams.set('page', String(paginationModel.page));
        u.searchParams.set('pageSize', String(paginationModel.pageSize));
        if (status) u.searchParams.set('status', status);

        const r = await fetch(u.toString(), { cache: 'no-store', signal: ctrl.signal });
        const j = await r.json();
        setRows(mapRows(j.rows ?? []));
        setCount(j.count ?? 0);
      } catch {
        setRows([]); setCount(0);
      } finally {
        setLoading(false);
      }
    })();
    return () => ctrl.abort();
  }, [mapRows, paginationModel.page, paginationModel.pageSize, status]);

  React.useEffect(() => {
    const cleanup = fetchRows();
    return cleanup;
  }, [fetchRows]);

  const columns: GridColDef<Row>[] = [
    { field: 'start_time', headerName: 'Início', minWidth: 180, valueFormatter: (p: any) => (p?.value ? new Date(String(p.value)).toLocaleString() : '') },
    { field: 'end_time', headerName: 'Fim', minWidth: 180, valueFormatter: (p: any) => (p?.value ? new Date(String(p.value)).toLocaleString() : '') },
    { field: 'status', headerName: 'Estado', width: 130, valueFormatter: (p: any) => String(p?.value ?? '') },
    { field: 'client_id', headerName: 'Cliente', minWidth: 160, valueFormatter: (p: any) => String(p?.value ?? '') },
    { field: 'location', headerName: 'Local', minWidth: 160, valueFormatter: (p: any) => String(p?.value ?? '') },
    {
      field: 'actions', headerName: 'Ações', width: 140, sortable:false, filterable:false,
      renderCell: (p) => (
        <Stack direction="row" spacing={0.5}>
          <Tooltip title="Editar">
            <IconButton size="small" onClick={() => alert('Implementa a página de edição do PT conforme necessário 😉')}>
              <EditOutlined fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Remover">
            <IconButton size="small" color="error" onClick={async () => {
              if (!confirm('Remover sessão?')) return;
              const res = await fetch(`/api/trainer/pts-schedule/${p.row.id}`, { method: 'DELETE' });
              if (res.ok) fetchRows();
            }}>
              <DeleteOutline fontSize="small" />
            </IconButton>
          </Tooltip>
        </Stack>
      ),
    },
  ];

  return (
    <Box sx={{ display:'grid', gap:1.5 }}>
      <Paper variant="outlined" sx={{ p:1.5, borderRadius:2 }}>
        <Stack direction={{ xs:'column', sm:'row' }} spacing={1} alignItems="center" justifyContent="space-between">
          <Stack direction="row" spacing={1} sx={{ flexWrap:'wrap' }}>
            <TextField select label="Estado" value={status} onChange={(e)=>setStatus(e.target.value)} sx={{ minWidth: 180 }}>
              <MenuItem value="">Todos</MenuItem>
              <MenuItem value="scheduled">scheduled</MenuItem>
              <MenuItem value="done">done</MenuItem>
              <MenuItem value="cancelled">cancelled</MenuItem>
            </TextField>
            <Chip label={`Hoje: ${today}`} variant="outlined" color="primary" icon={loadingCounts ? <CircularProgress size={14} /> : undefined} />
            <Chip label={`Próx. 7: ${next7}`} variant="outlined" />
          </Stack>
          <Button variant="contained" startIcon={<AddIcon />} onClick={openCreate}>
            Nova sessão
          </Button>
        </Stack>
      </Paper>

      <Divider />

      <div style={{ width:'100%' }}>
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

      <Dialog open={createOpen} onClose={closeCreate} fullWidth maxWidth="sm" keepMounted>
        <DialogTitle>➕ Nova sessão (PT)</DialogTitle>
        <DialogContent dividers>
          {/* Reutilizamos o mesmo form, só que em “scope trainer” */}
          <SessionFormClient mode="create" scope="trainer" />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => { closeCreate(); void fetchRows(); }}>Fechar</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
