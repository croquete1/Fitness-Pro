// src/app/(app)/dashboard/admin/exercises/exercises.client.tsx
'use client';

import * as React from 'react';
import Link from 'next/link';
import { Box, Paper, Button, Stack } from '@mui/material';
import {
  DataGrid, type GridColDef, type GridRowModel,
  GridToolbarContainer, GridToolbarColumnsButton, GridToolbarFilterButton,
  GridToolbarDensitySelector, GridToolbarExport, GridToolbarQuickFilter,
} from '@mui/x-data-grid';
import Add from '@mui/icons-material/Add';

export type ExerciseRow = {
  id: string;
  name: string | null;
  muscle: string | null;
  equipment: string | null;
  created_at: string | null;
  updated_at: string | null;
};

type Props = { initial: ExerciseRow[] };

function Toolbar({ onCreate }: { onCreate: () => void }) {
  return (
    <GridToolbarContainer>
      <Button startIcon={<Add />} onClick={onCreate}>Criar exercício</Button>
      <GridToolbarColumnsButton />
      <GridToolbarFilterButton />
      <GridToolbarDensitySelector />
      <GridToolbarExport />
      <Box sx={{ flex: 1 }} />
      <GridToolbarQuickFilter placeholder="Pesquisar exercícios…" />
    </GridToolbarContainer>
  );
}

export default function ExercisesGrid({ initial }: Props) {
  const [rows, setRows] = React.useState<ExerciseRow[]>(initial);

  const onCreate = async () => {
    const res = await fetch('/api/admin/exercises', { method: 'POST' });
    if (!res.ok) return;
    const row = (await res.json()) as ExerciseRow;
    setRows((cur) => [row, ...cur]);
  };

  const processRowUpdate = async (next: GridRowModel<ExerciseRow>) => {
    const payload = {
      name: next.name ?? null,
      muscle: next.muscle ?? null,
      equipment: next.equipment ?? null,
    };
    const res = await fetch(`/api/admin/exercises/${next.id}`, {
      method: 'PATCH',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error(await res.text());
    const saved = (await res.json()) as ExerciseRow;
    setRows((cur) => cur.map((r) => (r.id === saved.id ? saved : r)));
    return saved;
  };

  const cols: GridColDef<ExerciseRow>[] = [
    {
      field: 'name', headerName: 'Nome', flex: 1, minWidth: 180, editable: true,
      renderCell: (p) => <Link href={`/dashboard/admin/exercises/${p.row.id}`}>{p.row.name ?? '—'}</Link>,
    },
    { field: 'muscle', headerName: 'Músculo', width: 160, editable: true },
    { field: 'equipment', headerName: 'Equipamento', width: 180, editable: true },
    {
      field: 'updated_at', headerName: 'Atualizado', width: 170,
      renderCell: (p) => <>{p.row.updated_at ? new Date(p.row.updated_at).toLocaleString() : '—'}</>,
    },
  ];

  return (
    <Paper sx={{ p: 1, border: 1, borderColor: 'divider', borderRadius: 3 }} elevation={0}>
      <Box sx={{ height: 640, width: '100%' }}>
        <DataGrid<ExerciseRow>
          rows={rows}
          columns={cols}
          getRowId={(r) => r.id}
          disableRowSelectionOnClick
          slots={{ toolbar: () => <Toolbar onCreate={onCreate} /> }}
          paginationModel={{ page: 0, pageSize: 25 }}
          pageSizeOptions={[10, 25, 50, 100]}
          processRowUpdate={processRowUpdate}
          onProcessRowUpdateError={(e) => console.error('exercises.update', e)}
        />
      </Box>
    </Paper>
  );
}
