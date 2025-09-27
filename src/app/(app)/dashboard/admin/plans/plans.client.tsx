'use client';
import * as React from 'react';
import {
  DataGrid,
  GridToolbar,
  type GridColDef,
} from '@mui/x-data-grid';
import { Paper, Chip, Tooltip } from '@mui/material';

export type PlanRow = {
  id: string;
  title: string;
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED' | string;
  owner: string | null;
  trainer: string | null;
  updated_at: string | null;
  active: boolean;
};

const StatusChip: React.FC<{ value: PlanRow['status'] }> = ({ value }) => {
  const v = String(value || '').toUpperCase();
  const map: Record<string, { label: string; color: 'default' | 'success' | 'warning' | 'error' | 'info' }> = {
    DRAFT:     { label: 'Rascunho',  color: 'warning' },
    PUBLISHED: { label: 'Publicado', color: 'success' },
    ARCHIVED:  { label: 'Arquivado', color: 'default' },
  };
  const cfg = map[v] ?? { label: v, color: 'info' };
  return <Chip size="small" label={cfg.label} color={cfg.color} variant="outlined" />;
};

const columns: GridColDef<PlanRow>[] = [
  { field: 'title', headerName: 'Título', flex: 1, minWidth: 220 },
  { field: 'status', headerName: 'Estado', width: 140, renderCell: (p) => <StatusChip value={p.value as any} /> },
  {
    field: 'owner',
    headerName: 'Dono',
    width: 160,
    renderCell: (p) => (p.value ? <Tooltip title={String(p.value)}><span>{String(p.value).slice(0, 10)}…</span></Tooltip> : '—'),
  },
  {
    field: 'trainer',
    headerName: 'PT',
    width: 160,
    renderCell: (p) => (p.value ? <Tooltip title={String(p.value)}><span>{String(p.value).slice(0, 10)}…</span></Tooltip> : '—'),
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
  { field: 'updated_at', headerName: 'Atualizado', width: 160, renderCell: (p) => (p.value ? new Date(String(p.value)).toLocaleString() : '') },
];

export default function PlansGrid({ rows }: { rows: PlanRow[] }) {
  return (
    <Paper sx={{ p: 1, border: 1, borderColor: 'divider' }}>
      <DataGrid<PlanRow>
        autoHeight
        rows={rows}
        getRowId={(r) => r.id}
        columns={columns}
        slots={{ toolbar: GridToolbar }}
        slotProps={{
          toolbar: {
            showQuickFilter: true,
            quickFilterProps: { debounceMs: 250, placeholder: 'Pesquisar planos…' },
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
