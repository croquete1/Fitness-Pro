'use client';

import * as React from 'react';
import Link from 'next/link';
import { Paper, Stack, Typography, Button } from '@mui/material';
import {
  DataGrid,
  GridToolbar,
  useGridApiRef,
  type GridColDef,
} from '@mui/x-data-grid';

export type Role = 'ADMIN' | 'TRAINER' | 'CLIENT';

export type UserRow = {
  id: string;
  name: string | null;
  email: string | null;
  role: Role;
  approved: boolean;
  active: boolean;
  created_at: string | null;
};

type Props = {
  /** Linhas iniciais vindas do servidor */
  initial: UserRow[];
  /** (Opcional) callback depois de um update com sucesso */
  onUpdated?: (row: UserRow) => void;
};

export default function UsersClient({ initial, onUpdated }: Props) {
  const apiRef = useGridApiRef();
  const [rows, setRows] = React.useState<UserRow[]>(initial);

  const cols = React.useMemo<GridColDef<UserRow>[]>(() => [
    {
      field: 'name',
      headerName: 'Nome',
      flex: 1,
      minWidth: 200,
      editable: true,
      renderCell: (p) => (
        <Link href={`/dashboard/admin/users/${p.row.id}`}>
          {p.value ?? '—'}
        </Link>
      ),
      valueGetter: (_v, row) => row.name ?? '—',
    },
    { field: 'email', headerName: 'Email', flex: 1, minWidth: 220 },
    {
      field: 'role',
      headerName: 'Cargo',
      width: 130,
      editable: true,
      type: 'singleSelect',
      valueOptions: ['ADMIN', 'TRAINER', 'CLIENT'],
    },
    { field: 'approved', headerName: 'Aprovado', width: 120, type: 'boolean' },
    { field: 'active', headerName: 'Ativo', width: 100, type: 'boolean' },
    {
      field: 'created_at',
      headerName: 'Registo',
      width: 170,
      valueGetter: (_v, row) =>
        row.created_at ? new Date(row.created_at).toLocaleString() : '—',
    },
  ], []);

  async function patchUser(row: UserRow) {
    const res = await fetch(`/api/admin/users/${row.id}`, {
      method: 'PATCH',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        name: row.name,
        role: row.role,
        approved: row.approved,
        active: row.active,
      }),
    });
    if (!res.ok) throw new Error(await res.text());
    return (await res.json()) as { ok: true; user?: Partial<UserRow> };
  }

  async function processRowUpdate(newRow: UserRow, oldRow: UserRow) {
    if (JSON.stringify(newRow) === JSON.stringify(oldRow)) return oldRow;
    await patchUser(newRow);
    onUpdated?.(newRow);
    return newRow;
  }

  return (
    <Paper sx={{ p: 1.5, borderRadius: 3, border: 1, borderColor: 'divider' }}>
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1 }}>
        <Typography variant="h6" fontWeight={800}>🧑‍🤝‍🧑 Utilizadores</Typography>
        <Button
          size="small"
          variant="outlined"
          onClick={() => {
            const root = apiRef.current.rootElementRef?.current as HTMLElement | undefined;
            const input = root?.querySelector<HTMLInputElement>('input[placeholder*="Quick filter"]');
            input?.focus();
          }}
        >
          🔎 Procurar
        </Button>
      </Stack>

      <DataGrid<UserRow>
        apiRef={apiRef}
        rows={rows}
        columns={cols}
        autoHeight
        density="comfortable"
        disableRowSelectionOnClick
        slots={{ toolbar: GridToolbar }}
        slotProps={{
          toolbar: {
            showQuickFilter: true,
            quickFilterProps: { debounceMs: 300, placeholder: 'Quick filter…' },
            printOptions: { disableToolbarButton: false },
            csvOptions: { fileName: 'utilizadores' },
          },
        }}
        processRowUpdate={async (n, o) => {
          const saved = await processRowUpdate(n, o);
          setRows((cur) => cur.map((r) => (r.id === saved.id ? saved : r)));
          return saved;
        }}
        onProcessRowUpdateError={(e) => console.error('users.update', e)}
      />
    </Paper>
  );
}
