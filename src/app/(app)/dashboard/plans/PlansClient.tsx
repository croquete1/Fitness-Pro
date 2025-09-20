'use client';

import * as React from 'react';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import { DataGrid, type GridColDef, GridToolbar } from '@mui/x-data-grid';
import Link from 'next/link';

type Row = {
  id: string | number;
  title?: string | null;
  status?: string | null;
  updated_at?: string | null;
  trainer_id?: string | null;
};

export default function PlansClient({ rows: initial }: { rows: Row[] }) {
  const [rows] = React.useState<Row[]>(initial);

  const columns: GridColDef<Row>[] = [
    { field: 'title', headerName: 'Título', flex: 1, minWidth: 220 },
    {
      field: 'status',
      headerName: 'Estado',
      width: 140,
      valueGetter: (p: { row: Row }) => (p.row.status ? String(p.row.status) : ''),
    },
    {
      field: 'updated_at',
      headerName: 'Atualizado',
      width: 180,
      valueGetter: (p: { row: Row }) =>
        p.row.updated_at ? new Date(p.row.updated_at).toLocaleString('pt-PT') : '',
    },
    {
      field: 'actions',
      headerName: 'Ações',
      width: 140,
      sortable: false,
      filterable: false,
      renderCell: (p) => (
        <Button component={Link} href={`/dashboard/plans/${p.row.id}`} size="small">
          Abrir
        </Button>
      ),
    },
  ];

  return (
    <Box sx={{ display: 'grid', gap: 1 }}>
      <DataGrid<Row>
        rows={rows}
        columns={columns}
        getRowId={(r) => r.id}
        density="compact"
        pagination
        pageSizeOptions={[10, 25, 50]}
        initialState={{
          pagination: { paginationModel: { pageSize: 10, page: 0 } },
          sorting: { sortModel: [{ field: 'updated_at', sort: 'desc' }] },
        }}
        slots={{ toolbar: GridToolbar }}
      />
    </Box>
  );
}
