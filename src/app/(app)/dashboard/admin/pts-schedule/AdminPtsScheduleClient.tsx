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
import ContentCopyOutlined from '@mui/icons-material/ContentCopyOutlined';
import FileDownloadOutlined from '@mui/icons-material/FileDownloadOutlined';
import PrintOutlined from '@mui/icons-material/PrintOutlined';
import { useRouter } from 'next/navigation';
import SessionFormClient from './SessionFormClient';

type Row = {
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

export default function AdminPtsScheduleClient({ pageSize = 20 }: { pageSize?: number }) {
  const router = useRouter();
  const [status, setStatus] = React.useState('');
  const [rows, setRows] = React.useState<Row[]>([]);
  const [count, setCount] = React.useState(0);
  const [loading, setLoading] = React.useState(false);
  const [paginationModel, setPaginationModel] = React.useState({ page: 0, pageSize });

  // Dialog states
  const [openCreate, setOpenCreate] = React.useState(false);
  const [openClone, setOpenClone] = React.useState<{ open: boolean; initial?: Partial<Row> }>({ open: false });

  const closeCreate = (refresh?: boolean) => { setOpenCreate(false); if (refresh) void fetchRows(); };
  const closeClone = (refresh?: boolean) => { setOpenClone({ open: false, initial: undefined }); if (refresh) void fetchRows(); };

 function mapRowToSessionInitial(r: Partial<Row>) {
  return {
    trainer_id: r.trainer_id ?? '',
    client_id: r.client_id ?? '',
    start_time: r.start_time ?? '',
    end_time: r.end_time ?? '',
    status: (r.status as any) ?? 'scheduled',
    location: r.location ?? '',
    notes: r.notes ?? '',
  };
}

  async function fetchRows() {
    setLoading(true);
    try {
      const u = new URL('/api/admin/pts-schedule', window.location.origin);
      u.searchParams.set('page', String(paginationModel.page));
      u.searchParams.set('pageSize', String(paginationModel.pageSize));
      if (status) u.searchParams.set('status', status);
      const r = await fetch(u.toString(), { cache: 'no-store' });
      const j = await r.json();
      setRows((j.rows ?? []).map((r: any) => ({
        id: String(r.id),
        start_time: r.start_time ?? r.begin_at ?? null,
        end_time: r.end_time ?? r.finish_at ?? null,
        status: r.status ?? null,
        trainer_id: r.trainer_id ?? null,
        client_id: r.client_id ?? null,
        location: r.location ?? null,
        notes: r.notes ?? null,
      })));
      setCount(j.count ?? 0);
    } catch {
      setRows([]); setCount(0);
    } finally {
      setLoading(false);
    }
  }

  React.useEffect(() => { void fetchRows(); }, [status, paginationModel.page, paginationModel.pageSize]);

  const columns: GridColDef<Row>[] = [
    { field: 'start_time', headerName: 'Início', minWidth: 180, valueFormatter: (p:any) => (p?.value ? new Date(String(p.value)).toLocaleString() : '') },
    { field: 'end_time', headerName: 'Fim', minWidth: 180, valueFormatter: (p:any) => (p?.value ? new Date(String(p.value)).toLocaleString() : '') },
    { field: 'status', headerName: 'Estado', width: 130 },
    { field: 'trainer_id', headerName: 'PT', minWidth: 160 },
    { field: 'client_id', headerName: 'Cliente', minWidth: 160 },
    { field: 'location', headerName: 'Local', minWidth: 160 },
    {
      field: 'actions', headerName: 'Ações', width: 180, sortable:false, filterable:false,
      renderCell: (p) => (
        <Stack direction="row" spacing={0.5}>
          <Tooltip title="Duplicar (Criar a partir de…)">
            <IconButton size="small" onClick={() => setOpenClone({ open: true, initial: p.row })}>
              <ContentCopyOutlined fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Editar">
            <IconButton size="small" onClick={() => router.push(`/dashboard/admin/pts-schedule/${p.row.id}`)}>
              <EditOutlined fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Remover">
            <IconButton size="small" color="error" onClick={async () => {
              if (!confirm('Remover sessão?')) return;
              const res = await fetch(`/api/admin/pts-schedule/${p.row.id}`, { method: 'DELETE' });
              if (res.ok) void fetchRows();
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
          <Stack direction="row" spacing={1}>
            <TextField select label="Estado" value={status} onChange={(e)=>setStatus(e.target.value)} sx={{ minWidth: 180 }}>
              <MenuItem value="">Todos</MenuItem>
              <MenuItem value="scheduled">scheduled</MenuItem>
              <MenuItem value="done">done</MenuItem>
              <MenuItem value="cancelled">cancelled</MenuItem>
            </TextField>
            <Chip label={`Total: ${count}`} variant="outlined" />
          </Stack>
          <Stack direction="row" spacing={1}>
            <Tooltip title="Exportar CSV"><IconButton><FileDownloadOutlined /></IconButton></Tooltip>
            <Tooltip title="Imprimir"><IconButton><PrintOutlined /></IconButton></Tooltip>
            <Button variant="contained" startIcon={<AddIcon />} onClick={() => setOpenCreate(true)}>Nova sessão</Button>
          </Stack>
        </Stack>
      </Paper>

      <Divider />

      <div style={{ width:'100%' }}>
        <DataGrid
          rows={rows}
          columns={columns}
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

      {/* Dialog: Nova sessão */}
      <Dialog open={openCreate} onClose={() => closeCreate()} fullWidth maxWidth="sm">
        <DialogTitle>➕ Nova sessão</DialogTitle>
        <DialogContent dividers>
          <SessionFormClient mode="create" onSuccess={() => closeCreate(true)} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => closeCreate()}>Fechar</Button>
        </DialogActions>
      </Dialog>

      {/* Dialog: Criar a partir de… */}
      <Dialog open={openClone.open} onClose={() => closeClone()} fullWidth maxWidth="sm">
        <DialogTitle>📄 Criar sessão a partir de…</DialogTitle>
        <DialogContent dividers>
          <SessionFormClient
            mode="create"
            initial={openClone.initial ? mapRowToSessionInitial(openClone.initial) : undefined}
            onSuccess={() => closeClone(true)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => closeClone()}>Fechar</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
