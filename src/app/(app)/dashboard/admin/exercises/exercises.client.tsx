'use client';
import * as React from 'react';
import {
  DataGrid,
  GridToolbar,
  type GridColDef,
} from '@mui/x-data-grid';
import { Paper, Chip } from '@mui/material';

export type ExerciseRow = {
  id: string;
  name: string;
  muscle: string | null;
  equipment: string | null;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD' | string;
  active: boolean;
  updated_at: string | null;
};

const DiffChip: React.FC<{ value: ExerciseRow['difficulty'] }> = ({ value }) => {
  const v = String(value || '').toUpperCase();
  const map: Record<string, { label: string; color: 'success' | 'warning' | 'error' | 'default' }> = {
    EASY:   { label: 'Fácil',    color: 'success' },
    MEDIUM: { label: 'Médio',    color: 'warning' },
    HARD:   { label: 'Difícil',  color: 'error' },
  };
  const cfg = map[v] ?? { label: v, color: 'default' };
  return <Chip size="small" label={cfg.label} color={cfg.color} variant="outlined" />;
};

const columns: GridColDef<ExerciseRow>[] = [
  { field: 'name', headerName: 'Nome', flex: 1, minWidth: 220 },
  { field: 'muscle', headerName: 'Grupo muscular', width: 180 },
  { field: 'equipment', headerName: 'Equipamento', width: 160 },
  {
    field: 'difficulty',
    headerName: 'Dificuldade',
    width: 140,
    renderCell: (p) => <DiffChip value={p.value as any} />,
    sortComparator: (a, b) => String(a).localeCompare(String(b)),
  },
  {
    field: 'active',
    headerName: 'Ativo',
    width: 100,
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
    field: 'updated_at',
    headerName: 'Atualizado',
    width: 160,
    renderCell: (p) => (p.value ? new Date(String(p.value)).toLocaleString() : ''),
  },
];

export default function ExercisesGrid({ rows }: { rows: ExerciseRow[] }) {
  return (
    <Paper sx={{ p: 1, border: 1, borderColor: 'divider' }}>
      <DataGrid<ExerciseRow>
        autoHeight
        rows={rows}
        getRowId={(r) => r.id}
        columns={columns}
        slots={{ toolbar: GridToolbar }}
        slotProps={{
          toolbar: {
            showQuickFilter: true,
            quickFilterProps: { debounceMs: 250, placeholder: 'Pesquisar exercícios…' },
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
