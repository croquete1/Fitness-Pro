// src/app/(app)/dashboard/admin/users/users.client.tsx
'use client';

import * as React from 'react';
import Link from 'next/link';
import { Box, Paper, Chip, Tooltip } from '@mui/material';
import {
  DataGrid,
  type GridColDef,
  type GridRowModel,
  GridToolbarContainer,
  GridToolbarColumnsButton,
  GridToolbarFilterButton,
  GridToolbarDensitySelector,
  GridToolbarExport,
  GridToolbarQuickFilter,
  GridActionsCellItem,
  useGridApiRef,
} from '@mui/x-data-grid';
import MailOutline from '@mui/icons-material/MailOutline';
import ManageAccounts from '@mui/icons-material/ManageAccounts';

export type Role = 'ADMIN' | 'TRAINER' | 'CLIENT';

export type Row = {
  id: string;
  name: string | null;
  email: string;
  role: Role;
  approved: boolean;
  active: boolean;
  created_at: string | null;
};

type Props = { initial: Row[] };

function Toolbar() {
  return (
    <GridToolbarContainer>
      <GridToolbarColumnsButton />
      <GridToolbarFilterButton />
      <GridToolbarDensitySelector />
      <GridToolbarExport />
      <Box sx={{ flex: 1 }} />
      <GridToolbarQuickFilter placeholder="Pesquisar utilizadores…" />
    </GridToolbarContainer>
  );
}

export default function UsersGrid({ initial }: Props) {
  const apiRef = useGridApiRef();
  const [rows, setRows] = React.useState<Row[]>(initial);

  const processRowUpdate = async (next: GridRowModel<Row>, prev: GridRowModel<Row>) => {
    const payload: Partial<Row> = {
      name: (next.name ?? null) as Row['name'],
      role: (next.role as Role) || (prev.role as Role),
      approved: Boolean(next.approved),
      active: Boolean(next.active),
    };

    const res = await fetch(`/api/admin/users/${next.id}`, {
      method: 'PATCH',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error(await res.text());

    const saved = (await res.json()) as Row;

    // manter estado controlado
    setRows((cur) => cur.map((r) => (r.id === saved.id ? saved : r)));
    return saved;
  };

  const handleSendReset = async (email: string) => {
    try {
      const res = await fetch('/api/admin/users/send-recovery', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      if (!res.ok) throw new Error(await res.text());
      console.info('📧 Reset enviado (ou link gerado) para:', email);
    } catch (e) {
      console.error('send-recovery', e);
    }
  };

  const cols: GridColDef<Row>[] = [
    {
      field: 'name',
      headerName: 'Nome',
      flex: 1,
      minWidth: 160,
      editable: true,
      renderCell: (p) => (
        <Link href={`/dashboard/admin/users/${p.row.id}`} style={{ textDecoration: 'none' }}>
          {p.value ?? '—'}
        </Link>
      ),
    },
    { field: 'email', headerName: 'Email', flex: 1.2, minWidth: 220 },
    {
      field: 'role',
      headerName: 'Role',
      width: 130,
      editable: true,
      type: 'singleSelect',
      valueOptions: [
        { value: 'ADMIN', label: 'ADMIN' },
        { value: 'TRAINER', label: 'TRAINER' },
        { value: 'CLIENT', label: 'CLIENT' },
      ],
      renderCell: (p) => (
        <Chip
          size="small"
          label={
            p.value === 'ADMIN' ? '🛠️ ADMIN' :
            p.value === 'TRAINER' ? '🧑‍🏫 TRAINER' : '💪 CLIENT'
          }
          color={p.value === 'ADMIN' ? 'warning' : p.value === 'TRAINER' ? 'info' : 'default'}
          variant="outlined"
        />
      ),
    },
    {
      field: 'approved',
      headerName: 'Aprovado',
      width: 120,
      editable: true,
      type: 'boolean',
    },
    {
      field: 'active',
      headerName: 'Ativo',
      width: 110,
      editable: true,
      type: 'boolean',
    },
    {
      field: 'created_at',
      headerName: 'Registo',
      width: 170,
      sortable: false,
      filterable: false,
      renderCell: (p) => <>{p.value ? new Date(p.value as string).toLocaleString() : '—'}</>,
    },
    {
      field: 'actions',
      type: 'actions',
      headerName: 'Ações',
      width: 120,
      getActions: (p) => [
        <GridActionsCellItem
          key="editRole"
          icon={<Tooltip title="Editar role"><ManageAccounts fontSize="small" /></Tooltip>}
          label="Editar role"
          onClick={() => {
            // ✅ v6: usa apiRef (não existe p.api)
            apiRef.current.startCellEditMode({ id: p.id, field: 'role' });
          }}
          showInMenu
        />,
        <GridActionsCellItem
          key="reset"
          icon={<Tooltip title="Enviar reset palavra-passe"><MailOutline fontSize="small" /></Tooltip>}
          label="Enviar reset"
          onClick={() => handleSendReset(p.row.email)}
          showInMenu
        />,
      ],
    },
  ];

  return (
    <Paper sx={{ p: 1, border: 1, borderColor: 'divider', borderRadius: 3 }} elevation={0}>
      <Box sx={{ height: 640, width: '100%' }}>
        <DataGrid<Row>
          apiRef={apiRef}
          rows={rows}
          columns={cols}
          getRowId={(r) => r.id}
          disableRowSelectionOnClick
          paginationModel={{ page: 0, pageSize: 25 }}
          pageSizeOptions={[10, 25, 50, 100]}
          processRowUpdate={processRowUpdate}
          onProcessRowUpdateError={(e) => console.error('users.update', e)}
          slots={{ toolbar: Toolbar }}
        />
      </Box>
    </Paper>
  );
}
