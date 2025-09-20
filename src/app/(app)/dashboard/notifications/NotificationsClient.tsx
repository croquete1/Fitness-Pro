'use client';

import * as React from 'react';
import Link from 'next/link';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import Drawer from '@mui/material/Drawer';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import CircularProgress from '@mui/material/CircularProgress';
import { DataGrid, type GridColDef, GridToolbar, type GridRowSelectionModel, type GridPaginationModel } from '@mui/x-data-grid';

export type Row = {
  id: string;
  title: string | null;
  body?: string | null;
  href?: string | null;
  read: boolean;
  created_at: string | null; // ISO
};

type Props = { rows: Row[] };

export default function NotificationsClient({ rows }: Props) {
  // estado base
  const [data, setData] = React.useState<Row[]>(rows);
  const [rowCount, setRowCount] = React.useState<number>(rows.length);
  const [loading, setLoading] = React.useState(false);

  // seleção e filtros
  const [selection, setSelection] = React.useState<GridRowSelectionModel>([]);
  const [status, setStatus] = React.useState<'all' | 'unread' | 'read'>('all');

  // paginação server-side
  const [paginationModel, setPaginationModel] = React.useState<GridPaginationModel>({
    pageSize: 10,
    page: 0,
  });

  // Drawer de detalhe
  const [open, setOpen] = React.useState(false);
  const [current, setCurrent] = React.useState<Row | null>(null);

  // fetch server-side sempre que status/paginação muda
  React.useEffect(() => {
    let active = true;
    (async () => {
      setLoading(true);
      try {
        const url = new URL('/api/notifications/list', window.location.origin);
        url.searchParams.set('status', status);
        url.searchParams.set('page', String(paginationModel.page));
        url.searchParams.set('pageSize', String(paginationModel.pageSize));
        const r = await fetch(url.toString(), { cache: 'no-store' });
        const json = await r.json();
        if (!active) return;
        setData(json.items ?? []);
        setRowCount(json.total ?? 0);
        setSelection([]);
      } catch {
        if (!active) return;
        setData([]);
        setRowCount(0);
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [status, paginationModel.page, paginationModel.pageSize]);

  // helpers
  async function mark(endpoint: 'mark-read' | 'mark-unread' | 'mark-all-read', ids?: string[]) {
    try {
      await fetch(`/api/notifications/${endpoint}`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ ids }),
      });
      // otimista
      setData((prev) =>
        endpoint === 'mark-all-read'
          ? prev.map((r) => ({ ...r, read: true }))
          : prev.map((r) => (ids?.includes(r.id) ? { ...r, read: endpoint === 'mark-read' } : r))
      );
      setSelection([]);
    } catch {
      /* noop */
    }
  }

  const columns: GridColDef<Row>[] = [
    {
      field: 'title',
      headerName: 'Título',
      flex: 1,
      minWidth: 260,
      renderCell: (params) => (
        <Link
          href={params.row.href || '/dashboard/notifications'}
          className="no-underline"
          style={{ color: 'inherit' }}
        >
          {params.row.title || '(sem título)'}
        </Link>
      ),
    },
    {
      field: 'created_at',
      headerName: 'Data',
      width: 180,
      valueGetter: (_value, row) =>
        row?.created_at ? new Date(row.created_at).toLocaleString('pt-PT') : '',
    },
    {
      field: 'read',
      headerName: 'Estado',
      width: 120,
      valueGetter: (value) => (value ? 'Lida' : 'Por ler'),
      renderCell: (params) => (
        <Chip
          size="small"
          label={params.row.read ? 'Lida' : 'Por ler'}
          color={params.row.read ? 'default' : 'warning'}
          variant={params.row.read ? 'outlined' : 'filled'}
        />
      ),
    },
  ];

  const selectedIds = selection.map(String);

  return (
    <Stack spacing={1} sx={{ height: '100%', minHeight: 460 }}>
      {/* Filtros + ações */}
      <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', flexWrap: 'wrap' }}>
        <ToggleButtonGroup
          size="small"
          color="primary"
          value={status}
          exclusive
          onChange={(_, v) => v && setStatus(v)}
        >
          <ToggleButton value="all">Todos</ToggleButton>
          <ToggleButton value="unread">Por ler</ToggleButton>
          <ToggleButton value="read">Lidas</ToggleButton>
        </ToggleButtonGroup>

        <Box sx={{ flex: 1 }} />

        <Button
          size="small"
          variant="outlined"
          disabled={!selectedIds.length}
          onClick={() => mark('mark-read', selectedIds)}
        >
          Marcar selecionadas como lidas
        </Button>
        <Button
          size="small"
          variant="outlined"
          disabled={!selectedIds.length}
          onClick={() => mark('mark-unread', selectedIds)}
        >
          Marcar selecionadas como por ler
        </Button>
        <Button size="small" variant="contained" onClick={() => mark('mark-all-read')}>
          Marcar todas como lidas
        </Button>
      </Box>

      {/* Tabela */}
      <Box sx={{ flex: 1 }}>
        <DataGrid
          rows={data}
          columns={columns}
          getRowId={(r) => r.id}
          loading={loading}
          checkboxSelection
          disableRowSelectionOnClick
          paginationMode="server"
          rowCount={rowCount}
          paginationModel={paginationModel}
          onPaginationModelChange={setPaginationModel}
          pageSizeOptions={[10, 25, 50]}
          onRowSelectionModelChange={(m) => setSelection(m)}
          slots={{ toolbar: GridToolbar, loadingOverlay: () => (
            <Box sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
              <CircularProgress size={16} /> A carregar…
            </Box>
          ) }}
          slotProps={{ toolbar: { showQuickFilter: true, quickFilterProps: { debounceMs: 200 } } }}
          onRowClick={(p) => { setCurrent(p.row); setOpen(true); }}
        />
      </Box>

      {/* Drawer de detalhe */}
      <Drawer anchor="right" open={open} onClose={() => setOpen(false)}>
        <Box sx={{ width: { xs: 320, sm: 420 }, p: 2 }}>
          <Typography variant="h6" fontWeight={800}>
            {current?.title || 'Notificação'}
          </Typography>
          <Typography variant="body2" sx={{ opacity: 0.7, mb: 1 }}>
            {current?.created_at ? new Date(current.created_at).toLocaleString('pt-PT') : ''}
          </Typography>
          <Divider sx={{ my: 1 }} />
          <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
            {current?.body || '—'}
          </Typography>
          {current?.href && (
            <Box sx={{ mt: 2 }}>
              <Button component={Link} href={current.href} variant="text">
                Abrir destino
              </Button>
            </Box>
          )}
          <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
            {!current?.read ? (
              <Button
                size="small"
                variant="contained"
                onClick={async () => {
                  if (!current) return;
                  await mark('mark-read', [current.id]);
                  setCurrent((c) => (c ? { ...c, read: true } : c));
                }}
              >
                Marcar como lida
              </Button>
            ) : (
              <Button
                size="small"
                variant="outlined"
                onClick={async () => {
                  if (!current) return;
                  await mark('mark-unread', [current.id]);
                  setCurrent((c) => (c ? { ...c, read: false } : c));
                }}
              >
                Marcar por ler
              </Button>
            )}
          </Box>
        </Box>
      </Drawer>
    </Stack>
  );
}
