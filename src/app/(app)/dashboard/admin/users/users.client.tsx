'use client';
import * as React from 'react';
import {
  DataGrid,
  GridToolbar,
  type GridColDef,
} from '@mui/x-data-grid';
import { Paper, Chip } from '@mui/material';

export type Row = {
  id: string;
  email: string;
  name: string;
  role: 'ADMIN' | 'TRAINER' | 'CLIENT' | string;
  approved: boolean | null;
  active: boolean;
  created_at: string | null;
};

const RoleChip: React.FC<{ value: Row['role'] }> = ({ value }) => {
  const v = String(value || '').toUpperCase();
  const map: Record<string, { label: string; color: 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'error' }> = {
    ADMIN:   { label: '🛠️ Admin',   color: 'secondary' },
    TRAINER: { label: '🧑‍🏫 PT',      color: 'primary' },
    CLIENT:  { label: '💪 Cliente',  color: 'default' },
  };
  const cfg = map[v] ?? { label: v, color: 'default' };
  return <Chip size="small" label={cfg.label} color={cfg.color} variant="outlined" />;
};

const columns: GridColDef<Row>[] = [
  { field: 'name', headerName: 'Nome', flex: 1, minWidth: 160 },
  { field: 'email', headerName: 'Email', flex: 1, minWidth: 220 },
  {
    field: 'role',
    headerName: 'Role',
    width: 140,
    renderCell: (p) => <RoleChip value={p.value as any} />,
    sortComparator: (a, b) => String(a).localeCompare(String(b)),
  },
  {
    field: 'approved',
    headerName: 'Aprovado',
    width: 120,
    type: 'boolean',
    renderCell: (p) => (
      <Chip
        size="small"
        label={p.value ? 'Sim' : 'Não'}
        color={p.value ? 'success' : 'default'}
        variant={p.value ? 'filled' : 'outlined'}
      />
    ),
  },
  {
    field: 'active',
    headerName: 'Ativo',
    width: 110,
    type: 'boolean',
    renderCell: (p) => (
      <Chip
        size="small"
        label={p.value ? 'Sim' : 'Não'}
        color={p.value ? 'success' : 'default'}
        variant={p.value ? 'filled' : 'outlined'}
      />
    ),
  },
  {
    field: 'created_at',
    headerName: 'Registo',
    width: 160,
    renderCell: (p) => (p.value ? new Date(String(p.value)).toLocaleDateString() : ''),
  },
];

export default function UsersGrid({ rows, initialQuickFilter = '' }: { rows: Row[]; initialQuickFilter?: string }) {
  return (
    <Paper sx={{ p: 1, border: 1, borderColor: 'divider' }}>
      <DataGrid<Row>
        autoHeight
        rows={rows}
        getRowId={(r) => r.id}
        columns={columns}
        slots={{ toolbar: GridToolbar }}
        slotProps={{
          toolbar: {
            showQuickFilter: true,
            quickFilterProps: { debounceMs: 250, placeholder: 'Pesquisar utilizadores…' },
            // Nota: o QuickFilter não lê URL por si — passamos via prop e aplicamos por API se quiseres.
          },
        }}
        pageSizeOptions={[10, 25, 50]}
        initialState={{
          pagination: { paginationModel: { page: 0, pageSize: 10 } },
        }}
        disableRowSelectionOnClick
      />
    </Paper>
  );
}
