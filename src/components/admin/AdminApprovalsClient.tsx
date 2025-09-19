// src/components/admin/AdminApprovalsClient.tsx
'use client';

import * as React from 'react';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import Divider from '@mui/material/Divider';
import Drawer from '@mui/material/Drawer';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import {
  DataGrid,
  GridColDef,
  GridRenderCellParams,
  GridToolbar,
} from '@mui/x-data-grid';

type Row = {
  id: string;
  name?: string | null;
  email?: string | null;
  role?: string | null;
  created_at?: string | null;
};
type LogRow = { id: string; actor_id: string; target_id: string; action: string; meta?: any; created_at?: string };

// GridRowId[] compat
type RowSelection = Array<string | number>;

export default function AdminApprovalsClient({ initial }: { initial: Row[] }) {
  const [rows, setRows] = React.useState<Row[]>(initial);
  const [selection, setSelection] = React.useState<RowSelection>([]);
  const [roleChoice, setRoleChoice] = React.useState('CLIENT');
  const [reason, setReason] = React.useState('');
  const [drawer, setDrawer] = React.useState<{ open: boolean; userId?: string; name?: string }>({ open: false });
  const [logs, setLogs] = React.useState<LogRow[]>([]);
  const [logsCount, setLogsCount] = React.useState(0);
  const [toast, setToast] = React.useState<{ open: boolean; msg: string; sev: 'success' | 'error' }>({
    open: false,
    msg: '',
    sev: 'success',
  });

  async function approveOne(id: string, role?: string) {
    const r = await fetch(`/api/admin/approvals/${id}/approve`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role: role || roleChoice, reason: reason || undefined }),
    });
    if (!r.ok) {
      setToast({ open: true, msg: 'Falha ao aprovar.', sev: 'error' });
      return;
    }
    setRows((list) => list.filter((x) => x.id !== id));
    setSelection((sel) => sel.filter((x) => String(x) !== id));
    setToast({ open: true, msg: 'Utilizador aprovado.', sev: 'success' });
  }

  async function rejectOne(id: string) {
    const r = await fetch(`/api/admin/approvals/${id}/reject`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reason: reason || undefined }),
    });
    if (!r.ok) {
      setToast({ open: true, msg: 'Falha ao recusar.', sev: 'error' });
      return;
    }
    setRows((list) => list.filter((x) => x.id !== id));
    setSelection((sel) => sel.filter((x) => String(x) !== id));
    setToast({ open: true, msg: 'Utilizador recusado.', sev: 'success' });
  }

  async function approveSelected() {
    const ids = [...selection].map((id) => String(id));
    for (const id of ids) await approveOne(id, roleChoice);
  }

  async function rejectSelected() {
    const ids = [...selection].map((id) => String(id));
    for (const id of ids) await rejectOne(id);
  }

  async function openAudit(user: Row) {
    setDrawer({ open: true, userId: user.id, name: user.name ?? user.email ?? user.id });
    const r = await fetch(
      `/api/admin/audit-log?target=${encodeURIComponent(user.id)}&page=1&pageSize=30`,
      { cache: 'no-store' },
    );
    const j = await r.json();
    setLogs(j?.items ?? []);
    setLogsCount(j?.count ?? 0);
  }

  const cols: GridColDef[] = [
    { field: 'name', headerName: 'Nome', flex: 1, minWidth: 140 },
    { field: 'email', headerName: 'Email', flex: 1, minWidth: 180 },
    { field: 'role', headerName: 'Role', width: 120 },
    {
      field: 'created_at',
      headerName: 'Registo',
      width: 200,
      valueFormatter: ({ value }) => (value ? new Date(value as string).toLocaleString('pt-PT') : ''),
    },
    {
      field: 'actions',
      headerName: 'Ações',
      sortable: false,
      width: 260,
      renderCell: (p: GridRenderCellParams<Row>) => (
        <Stack direction="row" spacing={1}>
          <Button size="small" variant="outlined" onClick={() => approveOne(p.row.id)}>
            Aprovar
          </Button>
          <Button size="small" color="error" onClick={() => rejectOne(p.row.id)}>
            Recusar
          </Button>
          <Button size="small" onClick={() => openAudit(p.row)}>Histórico</Button>
        </Stack>
      ),
    },
  ];

  return (
    <Paper variant="outlined" sx={{ p: 2, borderRadius: 3 }}>
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={1}
        alignItems={{ xs: 'stretch', sm: 'center' }}
        justifyContent="space-between"
        sx={{ mb: 1 }}
      >
        <Typography variant="h6" fontWeight={800}>Aprovações pendentes</Typography>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} useFlexGap flexWrap="wrap">
          <TextField
            select
            size="small"
            label="Aprovar como"
            value={roleChoice}
            onChange={(e) => setRoleChoice(e.target.value)}
            sx={{ minWidth: 160 }}
          >
            {['CLIENT', 'PT', 'TRAINER', 'ADMIN'].map((r) => (
              <MenuItem key={r} value={r}>{r}</MenuItem>
            ))}
          </TextField>
          <TextField
            size="small"
            label="Motivo / observações (opcional)"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            sx={{ minWidth: 220 }}
          />
          <Button size="small" variant="contained" onClick={approveSelected} disabled={!selection.length}>
            Aprovar selecionados
          </Button>
          <Button size="small" color="error" onClick={rejectSelected} disabled={!selection.length}>
            Recusar selecionados
          </Button>
        </Stack>
      </Stack>

      <div style={{ width: '100%' }}>
        <DataGrid
          autoHeight
          rows={rows}
          columns={cols}
          checkboxSelection
          disableRowSelectionOnClick
          density="compact"
          pageSizeOptions={[10, 25, 50]}
          initialState={{ pagination: { paginationModel: { pageSize: 10, page: 0 } } }}
          onRowSelectionModelChange={(m) => setSelection(m as unknown as RowSelection)}
          slots={{ toolbar: GridToolbar }}
          slotProps={{ toolbar: { showQuickFilter: true, quickFilterProps: { debounceMs: 200 } } }}
          sx={{
            '& .MuiDataGrid-toolbarContainer': { px: 0, mb: 1 },
            '& .MuiDataGrid-cell:focus, & .MuiDataGrid-columnHeader:focus': { outline: 'none' },
          }}
        />
      </div>

      <Drawer
        open={drawer.open}
        anchor="right"
        onClose={() => setDrawer({ open: false })}
        PaperProps={{ sx: { width: { xs: '100%', sm: 420 } } }}
      >
        <Stack sx={{ p: 2 }}>
          <Typography variant="h6" fontWeight={800}>Histórico: {drawer.name}</Typography>
          <Typography variant="caption" sx={{ opacity: 0.7 }}>{logsCount} registos</Typography>
        </Stack>
        <Divider />
        <Stack sx={{ p: 2 }} spacing={1}>
          {logs.map((l) => (
            <Paper key={l.id} variant="outlined" sx={{ p: 1.2, borderRadius: 2 }}>
              <Typography variant="subtitle2" fontWeight={700}>{l.action}</Typography>
              {l.meta && <Typography variant="body2" sx={{ opacity: 0.85, mt: 0.5 }}>{JSON.stringify(l.meta)}</Typography>}
              <Typography variant="caption" sx={{ opacity: 0.6 }}>
                {l.created_at ? new Date(l.created_at).toLocaleString('pt-PT') : ''}
              </Typography>
            </Paper>
          ))}
          {!logs.length && <Typography variant="body2" sx={{ opacity: 0.7 }}>Sem histórico.</Typography>}
        </Stack>
      </Drawer>

      <Snackbar open={toast.open} autoHideDuration={2200} onClose={() => setToast({ ...toast, open: false })}>
        <Alert elevation={6} variant="filled" severity={toast.sev} onClose={() => setToast({ ...toast, open: false })}>
          {toast.msg}
        </Alert>
      </Snackbar>
    </Paper>
  );
}
