'use client';

import * as React from 'react';
import Link from 'next/link';
import {
  DataGrid, GridToolbar, useGridApiRef,
  type GridColDef,
} from '@mui/x-data-grid';
import { Paper, Stack, Typography, Button } from '@mui/material';
import Add from '@mui/icons-material/Add';

export type PlanRow = {
  id: string;
  title: string | null;
  updated_at: string | null;
};

export default function PlansGrid({ initial }: { initial: PlanRow[] }) {
  const apiRef = useGridApiRef();
  const [rows, setRows] = React.useState<PlanRow[]>(initial);

  const cols: GridColDef<PlanRow>[] = [
    {
      field: 'title', headerName: '📒 Título', flex: 1, minWidth: 220, editable: true,
      renderCell: (p) => <Link href={`/dashboard/admin/plans/${p.row.id}`}>{p.value ?? '—'}</Link>,
      valueGetter: (_v, row) => row.title ?? '—',
    },
    {
      field: 'updated_at', headerName: '🕓 Atualizado', width: 170,
      valueGetter: (_v, row) => row.updated_at ? new Date(row.updated_at).toLocaleString() : '—',
    },
  ];

  async function processRowUpdate(newRow: PlanRow, oldRow: PlanRow) {
    if (JSON.stringify(newRow) === JSON.stringify(oldRow)) return oldRow;
    const res = await fetch(`/api/admin/plans/${newRow.id}`, {
      method: 'PATCH', headers: { 'content-type': 'application/json' }, body: JSON.stringify(newRow),
    });
    if (!res.ok) throw new Error(await res.text());
    const saved = await res.json(); // devolve updated_at
    return { ...newRow, updated_at: saved.updated_at ?? newRow.updated_at };
  }

  async function handleCreate() {
    const res = await fetch('/api/admin/plans', { method: 'POST' });
    if (!res.ok) return;
    const row: PlanRow = await res.json();
    setRows((cur) => [row, ...cur]);
    apiRef.current?.startRowEditMode({ id: row.id });
  }

  return (
    <Paper sx={{ p: 1.5, borderRadius: 3 }}>
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1 }}>
        <Typography variant="h6" fontWeight={800}>🗂️ Planos</Typography>
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
