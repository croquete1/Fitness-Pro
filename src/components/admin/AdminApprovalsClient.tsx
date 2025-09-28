'use client';

import * as React from 'react';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import { DataGrid,
  type GridColDef,
  type GridRenderCellParams,
  type GridRowSelectionModel,
  GridToolbar
} from '@mui/x-data-grid';

type Row = {
  id: string;
  name?: string | null;
  email?: string | null;
  role?: string | null;
  created_at?: string | null;
  // adiciona outros campos que já venhas a usar (status, etc.)
};

export default function AdminApprovalsClient({ initial }: { initial: Row[] }) {
  const [rows, setRows] = React.useState<Row[]>(initial);
  const [selection, setSelection] = React.useState<GridRowSelectionModel>([]);

  const columns: GridColDef<Row>[] = [
    { field: 'name', headerName: 'Nome', flex: 1, minWidth: 160 },
    { field: 'email', headerName: 'Email', flex: 1, minWidth: 220 },
    { field: 'role', headerName: 'Role', width: 120 },
    {
      field: 'created_at',
      headerName: 'Registo',
      width: 180,
      // usar renderCell em vez de valueGetter evita o 'never' e dá-te a Row tipada
      renderCell: (p: GridRenderCellParams<Row, string | null>) =>
        p.row?.created_at ? new Date(p.row.created_at).toLocaleString('pt-PT') : '',
      sortComparator: (a, b) => {
        const da = a ? Date.parse(a) : 0;
        const db = b ? Date.parse(b) : 0;
        return da - db;
      },
    },
    {
      field: 'actions',
      headerName: 'Ações',
      width: 180,
      sortable: false,
      filterable: false,
      renderCell: (p: GridRenderCellParams<Row>) => (
        <Stack direction="row" spacing={1}>
          <Button size="small" variant="contained" onClick={() => approve(p.row.id)}>Aprovar</Button>
          <Button size="small" variant="outlined" color="inherit" onClick={() => reject(p.row.id)}>Recusar</Button>
        </Stack>
      ),
    },
  ];

  async function approve(id: string) {
    try {
      await fetch(`/api/admin/approvals/${id}/approve`, { method: 'POST' });
      setRows((rs) => rs.filter((r) => r.id !== id));
    } catch { /* noop */ }
  }

  async function reject(id: string) {
    try {
      await fetch(`/api/admin/approvals/${id}/reject`, { method: 'POST' });
      setRows((rs) => rs.filter((r) => r.id !== id));
    } catch { /* noop */ }
  }

  return (
    <Paper variant="outlined" sx={{ p: 2, borderRadius: 3 }}>
      <div style={{ width: '100%' }}>
        <DataGrid<Row>
          rows={rows}
          columns={columns}
          getRowId={(r) => r.id}
          autoHeight
          checkboxSelection
          disableRowSelectionOnClick
          rowSelectionModel={selection}
          onRowSelectionModelChange={(m) => setSelection(m)}
          initialState={{ pagination: { paginationModel: { pageSize: 10, page: 0 } } }}
          pageSizeOptions={[10, 25, 50]}
          slots={{ toolbar: GridToolbar }}
          slotProps={{ toolbar: { showQuickFilter: true, quickFilterProps: { debounceMs: 300 } } }}
          sx={{
            '& .MuiDataGrid-cell:focus': { outline: 'none' },
            '& .MuiDataGrid-columnHeader:focus': { outline: 'none' },
          }}
        />
      </div>
    </Paper>
  );
}