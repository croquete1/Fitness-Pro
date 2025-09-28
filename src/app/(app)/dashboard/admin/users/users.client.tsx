'use client';

import * as React from 'react';
import { Paper } from '@mui/material';
import {
  DataGrid,
  GridToolbar,
  type GridColDef,
  type GridRowsProp,
} from '@mui/x-data-grid';

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
  const [rows, setRows] = React.useState<GridRowsProp<Row>>(initial);

  const cols: GridColDef<Row>[] = [
    {
      field: 'name',
      headerName: 'Nome',
      flex: 1,
      minWidth: 160,
      editable: true,
      // ✅ evita “never”: usa renderCell tipado
      renderCell: (params) => params.row.name ?? '—',
    },
    { field: 'email', headerName: 'Email', flex: 1, minWidth: 220 },
    {
      field: 'role',
      headerName: 'Role',
      width: 130,
      type: 'singleSelect',
      editable: true,
      valueOptions: [
        { value: 'ADMIN', label: 'ADMIN' },
        { value: 'TRAINER', label: 'TRAINER' },
        { value: 'CLIENT', label: 'CLIENT' },
      ],
    },
    {
      field: 'approved',
      headerName: 'Aprovado',
      type: 'boolean',
      width: 120,
      editable: true,
    },
    {
      field: 'active',
      headerName: 'Ativo',
      type: 'boolean',
      width: 100,
      editable: true,
    },
    {
      field: 'created_at',
      headerName: 'Registo',
      width: 170,
      renderCell: (p) =>
        p.row.created_at ? new Date(p.row.created_at).toLocaleString() : '—',
      sortable: false,
      filterable: false,
      editable: false,
    },
  ];

  async function processRowUpdate(newRow: Row, oldRow: Row) {
    // calcula patch só com campos alterados
    const patch: Partial<Row> = {};
    if (newRow.name !== oldRow.name) patch.name = newRow.name;
    if (newRow.role !== oldRow.role) patch.role = newRow.role;
    if (newRow.approved !== oldRow.approved) patch.approved = newRow.approved;
    if (newRow.active !== oldRow.active) patch.active = newRow.active;

    if (Object.keys(patch).length) {
      const res = await fetch(`/api/admin/users/${newRow.id}`, {
        method: 'PATCH',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(patch),
      });
      if (!res.ok) throw new Error(await res.text());
    }

    // mantém client state
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
        onProcessRowUpdateError={(e) => console.error('users.update', e)}
        slots={{ toolbar: GridToolbar }}
        slotProps={{ toolbar: { showQuickFilter: true, quickFilterProps: { debounceMs: 300 } } }}
        disableRowSelectionOnClick
      />
    </Paper>
  );
}
