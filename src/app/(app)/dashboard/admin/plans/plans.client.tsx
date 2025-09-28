// src/app/(app)/dashboard/admin/plans/plans.client.tsx
'use client';

import * as React from 'react';
import Link from 'next/link';
import { Box, Paper, Button } from '@mui/material';
import {
  DataGrid, type GridColDef, type GridRowModel,
  GridToolbarContainer, GridToolbarColumnsButton, GridToolbarFilterButton,
  GridToolbarDensitySelector, GridToolbarExport, GridToolbarQuickFilter,
} from '@mui/x-data-grid';
import Add from '@mui/icons-material/Add';

export type PlanRow = {
  id: string;
  title: string | null;
  updated_at: string | null;
};

type Props = { initial: PlanRow[] };

function Toolbar({ onCreate }: { onCreate: () => void }) {
  return (
    <GridToolbarContainer>
      <Button startIcon={<Add />} onClick={onCreate}>Criar plano</Button>
      <GridToolbarColumnsButton />
      <GridToolbarFilterButton />
      <GridToolbarDensitySelector />
      <GridToolbarExport />
      <Box sx={{ flex: 1 }} />
      <GridToolbarQuickFilter placeholder="Pesquisar planos…" />
    </GridToolbarContainer>
  );
}

export default function PlansGrid({ initial }: Props) {
  const [rows, setRows] = React.useState<PlanRow[]>(initial);

  const onCreate = async () => {
    const res = await fetch('/api/admin/plans', { method: 'POST' });
    if (!res.ok) return;
    const row = (await res.json()) as PlanRow;
    setRows((cur) => [row, ...cur]);
  };

  const processRowUpdate = async (next: GridRowModel<PlanRow>) => {
    const payload = { title: next.title ?? null };
    const res = await fetch(`/api/admin/plans/${next.id}`, {
      method: 'PATCH',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error(await res.text());
    const saved = (await res.json()) as PlanRow;
    setRows((cur) => cur.map((r) => (r.id === saved.id ? saved : r)));
    return saved;
  };

  const cols: GridColDef<PlanRow>[] = [
    {
      field: 'title', headerName: 'Título', flex: 1, minWidth: 220, editable: true,
      renderCell: (p) => <Link href={`/dashboard/admin/plans/${p.row.id}`}>{p.row.title ?? '—'}</Link>,
    },
    {
      field: 'updated_at', headerName: 'Atualizado', width: 170,
      renderCell: (p) => <>{p.row.updated_at ? new Date(p.row.updated_at).toLocaleString() : '—'}</>,
    },
  ];

  return (
    <Paper sx={{ p: 1, border: 1, borderColor: 'divider', borderRadius: 3 }} elevation={0}>
      <Box sx={{ height: 640, width: '100%' }}>
        <DataGrid<PlanRow>
          rows={rows}
          columns={cols}
          getRowId={(r) => r.id}
          disableRowSelectionOnClick
          slots={{ toolbar: () => <Toolbar onCreate={onCreate} /> }}
          paginationModel={{ page: 0, pageSize: 25 }}
          pageSizeOptions={[10, 25, 50, 100]}
          processRowUpdate={processRowUpdate}
          onProcessRowUpdateError={(e) => console.error('plans.update', e)}
        />
      </Box>
    </Paper>
  );
}
