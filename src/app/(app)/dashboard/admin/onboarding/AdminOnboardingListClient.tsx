// src/app/(app)/dashboard/admin/onboarding/AdminOnboardingListClient.tsx
'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Paper, Stack, TextField, MenuItem, Typography } from '@mui/material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';

type Row = {
  id: string;
  user: string;
  status: string;
  created_at: string;
  updated_at: string | null;
};

export default function AdminOnboardingListClient({ initialRows }: { initialRows: Row[] }) {
  const router = useRouter();
  const [q, setQ] = React.useState('');
  const [status, setStatus] = React.useState<'all' | 'draft' | 'submitted'>('all');
  const [rows] = React.useState<Row[]>(initialRows);

  const cols: GridColDef<Row>[] = [
    { field: 'user', headerName: 'Cliente', flex: 1, minWidth: 220 },
    { field: 'status', headerName: 'Estado', width: 140 },
    {
      field: 'created_at',
      headerName: 'Criado',
      minWidth: 180,
      // ✅ usar renderCell para evitar tipos inconsistentes do valueGetter em v6
      renderCell: (p: any) =>
        p.value ? new Date(p.value as string).toLocaleString('pt-PT') : '',
    },
    {
      field: 'updated_at',
      headerName: 'Atualizado',
      minWidth: 180,
      renderCell: (p: any) =>
        p.value ? new Date(p.value as string).toLocaleString('pt-PT') : '',
    },
  ];

  const filtered = React.useMemo(
    () =>
      rows.filter((r) => {
        if (status !== 'all' && r.status !== status) return false;
        if (!q) return true;
        return r.user.toLowerCase().includes(q.toLowerCase());
      }),
    [rows, q, status]
  );

  return (
    <Paper variant="outlined" sx={{ p: 2, borderRadius: 3 }}>
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={1}
        sx={{ mb: 1 }}
        alignItems="center"
      >
        <Typography variant="h6" fontWeight={900} sx={{ flex: 1 }}>
          Avaliações físicas (onboarding)
        </Typography>
        <TextField
          select
          size="small"
          label="Estado"
          value={status}
          onChange={(e) => setStatus(e.target.value as any)}
          sx={{ minWidth: 160 }}
        >
          <MenuItem value="all">Todos</MenuItem>
          <MenuItem value="submitted">Submetidos</MenuItem>
          <MenuItem value="draft">Rascunho</MenuItem>
        </TextField>
        <TextField
          size="small"
          placeholder="Pesquisar cliente…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
      </Stack>

      <div style={{ height: 560 }}>
        <DataGrid
          rows={filtered}
          columns={cols}
          pageSizeOptions={[10, 25, 50]}
          initialState={{
            pagination: { paginationModel: { page: 0, pageSize: 10 } },
          }}
          disableRowSelectionOnClick
          onRowDoubleClick={(p) =>
            router.push(`/dashboard/admin/onboarding/${p.id}`)
          }
        />
      </div>
    </Paper>
  );
}
