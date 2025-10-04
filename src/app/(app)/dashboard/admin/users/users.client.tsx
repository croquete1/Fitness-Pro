'use client';

import * as React from 'react';
import Link from 'next/link';
import {
  DataGrid, GridToolbar, useGridApiRef,
  type GridColDef,
} from '@mui/x-data-grid';
import { Paper, Stack, Typography, Button } from '@mui/material';
import Add from '@mui/icons-material/Add';

export type Role = 'ADMIN' | 'TRAINER' | 'CLIENT';

export type Row = {
  id: string;
  name: string | null;
  email: string | null;
  role: Role;
  approved: boolean;
  active: boolean;
  created_at: string | null;
};

type Props = { initial: Row[] };

export default function UsersGrid({ initial }: Props) {
  const apiRef = useGridApiRef();
  const [rows, setRows] = React.useState<Row[]>(initial);

  const cols: GridColDef<Row>[] = [
    {
      field: 'name', headerName: '👤 Nome', flex: 1, minWidth: 200, editable: true,
      renderCell: (p) => <Link href={`/dashboard/admin/users/${p.row.id}`}>{p.value ?? '—'}</Link>,
      valueGetter: (_v, row) => row.name ?? '—',
    },
    { field: 'email', headerName: '📧 Email', flex: 1, minWidth: 220 },
    { field: 'role', headerName: '🛡️ Role', width: 130, editable: true },
    { field: 'approved', headerName: '✅ Aprovado', width: 120, type: 'boolean' },
    { field: 'active', headerName: '🟢 Ativo', width: 100, type: 'boolean' },
    {
      field: 'created_at', headerName: '🗓️ Registo', width: 170,
      valueGetter: (_v, row) => row.created_at ? new Date(row.created_at).toLocaleString() : '—',
    },
  ];

  async function processRowUpdate(newRow: Row, oldRow: Row) {
    if (JSON.stringify(newRow) === JSON.stringify(oldRow)) return oldRow;
    const res = await fetch(`/api/admin/users/${newRow.id}`, {
      method: 'PATCH',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(newRow),
    });
    if (!res.ok) throw new Error(await res.text());
    return newRow;
  }

  async function handleCreate() {
    const res = await fetch('/api/admin/users', { method: 'POST' });
    if (!res.ok) return;
    const row: Row = await res.json();
    setRows((cur) => [row, ...cur]);
    // foca o nome
    apiRef.current?.startRowEditMode({ id: row.id });
  }

  return (
    <Paper sx={{ p: 1.5, borderRadius: 3 }}>
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1 }}>
        <Typography variant="h6" fontWeight={800}>🧑‍🤝‍🧑 Utilizadores</Typography>
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
