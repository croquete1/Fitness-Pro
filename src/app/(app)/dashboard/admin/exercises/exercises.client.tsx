'use client';

import * as React from 'react';
import { Paper, Chip, Stack } from '@mui/material';
import {
  DataGrid,
  GridToolbar,
  type GridColDef,
  type GridRowsProp,
} from '@mui/x-data-grid';

export type ExerciseRow = {
  id: string;
  name: string;
  muscle: string | null;
  equipment: string | null;
  created_at: string | null;
  updated_at: string | null;
};

type Props = { initial: ExerciseRow[] };

export default function ExercisesGrid({ initial }: Props) {
  const [rows, setRows] = React.useState<GridRowsProp<ExerciseRow>>(initial);

  const cols: GridColDef<ExerciseRow>[] = [
    {
      field: 'name',
      headerName: 'Nome',
      flex: 1,
      minWidth: 220,
      editable: true,
      renderCell: (p) => p.row.name || '—',
    },
    {
      field: 'muscle',
      headerName: 'Músculo',
      width: 160,
      editable: true,
      renderCell: (p) =>
        p.row.muscle ? <Chip size="small" label={p.row.muscle} /> : '—',
    },
    {
      field: 'equipment',
      headerName: 'Equipamento',
      width: 170,
      editable: true,
      renderCell: (p) =>
        p.row.equipment ? (
          <Stack direction="row" spacing={0.5}>
            <Chip size="small" label={p.row.equipment} />
          </Stack>
        ) : (
          '—'
        ),
    },
    {
      field: 'updated_at',
      headerName: 'Atualizado',
      width: 170,
      renderCell: (p) =>
        p.row.updated_at ? new Date(p.row.updated_at).toLocaleString() : '—',
    },
  ];

  async function processRowUpdate(newRow: ExerciseRow, oldRow: ExerciseRow) {
    const patch: Partial<ExerciseRow> = {};
    if (newRow.name !== oldRow.name) patch.name = newRow.name;
    if (newRow.muscle !== oldRow.muscle) patch.muscle = newRow.muscle;
    if (newRow.equipment !== oldRow.equipment) patch.equipment = newRow.equipment;

    if (Object.keys(patch).length) {
      const res = await fetch(`/api/admin/exercises/${newRow.id}`, {
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
        onProcessRowUpdateError={(e) => console.error('exercises.update', e)}
        slots={{ toolbar: GridToolbar }}
        slotProps={{ toolbar: { showQuickFilter: true, quickFilterProps: { debounceMs: 300 } } }}
        disableRowSelectionOnClick
      />
    </Paper>
  );
}
