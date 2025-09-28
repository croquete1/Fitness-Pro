'use client';

import * as React from 'react';
import { Paper } from '@mui/material';
import {
  DataGrid,
  GridToolbar,
  type GridColDef,
  type GridRowsProp,
} from '@mui/x-data-grid';

export type PlanRow = {
  id: string;
  title: string | null;
  updated_at: string | null;
};

type Props = { initial: PlanRow[] };

export default function PlansGrid({ initial }: Props) {
  const [rows, setRows] = React.useState<GridRowsProp<PlanRow>>(initial);

  const cols: GridColDef<PlanRow>[] = [
    {
      field: 'title',
      headerName: 'Título',
      flex: 1,
      minWidth: 220,
      editable: true,
      renderCell: (p) => p.row.title ?? '—', // ✅ evita “never”
    },
    {
      field: 'updated_at',
      headerName: 'Atualizado',
      width: 170,
      renderCell: (p) =>
        p.row.updated_at ? new Date(p.row.updated_at).toLocaleString() : '—',
      sortable: false,
      filterable: false,
    },
  ];

  async function processRowUpdate(newRow: PlanRow, oldRow: PlanRow) {
    const patch: Partial<PlanRow> = {};
    if (newRow.title !== oldRow.title) patch.title = newRow.title;

    if (Object.keys(patch).length) {
      const res = await fetch(`/api/admin/plans/${newRow.id}`, {
        method: 'PATCH',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(patch),
      });
      if (!res.ok) throw new Error(await res.text());
    }
    setRows((cur) => cur.map((r) => (r.id === newRow.id ? newRow : r)));
    return newRow;
  }

  return (
    <Paper sx={{ p: 1 }}>
      <DataGrid
        autoHeight
        density="compact"
        rows={rows}
        columns={cols}
        getRowId={(r) => r.id}
        processRowUpdate={processRowUpdate}
        onProcessRowUpdateError={(e) => console.error('plans.update', e)}
        slots={{ toolbar: GridToolbar }}
        slotProps={{ toolbar: { showQuickFilter: true, quickFilterProps: { debounceMs: 300 } } }}
        disableRowSelectionOnClick
      />
    </Paper>
  );
}
