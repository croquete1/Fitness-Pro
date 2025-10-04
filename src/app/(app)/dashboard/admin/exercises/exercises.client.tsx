'use client';

import * as React from 'react';
import Link from 'next/link';
import {
  DataGrid, GridToolbar, useGridApiRef,
  type GridColDef,
} from '@mui/x-data-grid';
import { Paper, Stack, Typography, Button } from '@mui/material';
import Add from '@mui/icons-material/Add';

export type ExerciseRow = {
  id: string;
  name: string | null;
  muscle: string | null;
  equipment: string | null;
  created_at: string | null;
  updated_at: string | null;
};

export default function ExercisesGrid({ initial }: { initial: ExerciseRow[] }) {
  const apiRef = useGridApiRef();
  const [rows, setRows] = React.useState<ExerciseRow[]>(initial);

  const cols: GridColDef<ExerciseRow>[] = [
    {
      field: 'name', headerName: '🏋️ Nome', flex: 1, minWidth: 180, editable: true,
      renderCell: (p) => <Link href={`/dashboard/admin/exercises/${p.row.id}`}>{p.value ?? '—'}</Link>,
      valueGetter: (_v, row) => row.name ?? '—',
    },
    { field: 'muscle', headerName: '💪 Músculo', width: 160, editable: true, valueGetter: (_v, row) => row.muscle ?? '—' },
    { field: 'equipment', headerName: '🧰 Equipamento', width: 180, editable: true, valueGetter: (_v, row) => row.equipment ?? '—' },
    {
      field: 'updated_at', headerName: '🕓 Atualizado', width: 170,
      valueGetter: (_v, row) => row.updated_at ? new Date(row.updated_at).toLocaleString() : '—',
    },
  ];

  async function processRowUpdate(newRow: ExerciseRow, oldRow: ExerciseRow) {
    if (JSON.stringify(newRow) === JSON.stringify(oldRow)) return oldRow;
    const res = await fetch(`/api/admin/exercises/${newRow.id}`, {
      method: 'PATCH', headers: { 'content-type': 'application/json' }, body: JSON.stringify(newRow),
    });
    if (!res.ok) throw new Error(await res.text());
    const saved = await res.json(); // devolve updated_at
    return { ...newRow, updated_at: saved.updated_at ?? newRow.updated_at };
  }

  async function handleCreate() {
    const res = await fetch('/api/admin/exercises', { method: 'POST' });
    if (!res.ok) return;
    const row: ExerciseRow = await res.json();
    setRows((cur) => [row, ...cur]);
    apiRef.current?.startRowEditMode({ id: row.id });
  }

  return (
    <Paper sx={{ p: 1.5, borderRadius: 3 }}>
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1 }}>
        <Typography variant="h6" fontWeight={800}>🧱 Exercícios</Typography>
        <Button onClick={handleCreate} startIcon={<Add />} variant="contained">Criar</Button>
      </Stack>
      <DataGrid
        apiRef={apiRef}
        rows={rows}
        columns={cols}
        processRowUpdate={async (n, o) => {
          const saved = await processRowUpdate(n, o);
          setRows((cur) => cur.map((r) => (r.id === saved.id ? saved : r)));
          return saved;
        }}
        onProcessRowUpdateError={(e) => console.error(e)}
        slots={{ toolbar: GridToolbar }}
        slotProps={{ toolbar: { showQuickFilter: true } }}
        disableRowSelectionOnClick
        autoHeight
      />
    </Paper>
  );
}
