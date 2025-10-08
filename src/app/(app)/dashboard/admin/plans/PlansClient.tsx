'use client';

import * as React from 'react';
import {
  Box, Stack, TextField, MenuItem, Button, IconButton, Tooltip, Paper, Divider, Snackbar, Alert, CircularProgress,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteOutline from '@mui/icons-material/DeleteOutline';
import EditOutlined from '@mui/icons-material/EditOutlined';
import FileDownloadOutlined from '@mui/icons-material/FileDownloadOutlined';
import PrintOutlined from '@mui/icons-material/PrintOutlined';
import ContentCopyOutlined from '@mui/icons-material/ContentCopyOutlined';
import { DataGrid, GridColDef, GridToolbar } from '@mui/x-data-grid';
import { useRouter } from 'next/navigation';

type Row = {
  id: string;
  name: string;
  description?: string | null;
  difficulty?: 'Fácil' | 'Média' | 'Difícil' | string | null;
  duration_weeks?: number | null;
  is_public?: boolean | null;
  created_at?: string | null;
};

export default function PlansClient() {
  const router = useRouter();

  const [q, setQ] = React.useState('');
  const [difficulty, setDifficulty] = React.useState('');
  const [rows, setRows] = React.useState<Row[]>([]);
  const [count, setCount] = React.useState(0);
  const [loading, setLoading] = React.useState(false);
  const [paginationModel, setPaginationModel] = React.useState({ page: 0, pageSize: 20 });

  const [snack, setSnack] = React.useState<{open:boolean; msg:string; sev:'success'|'error'|'info'|'warning'}>({ open:false, msg:'', sev:'success' });
  const closeSnack = () => setSnack((s) => ({ ...s, open:false }));

  // UNDO delete
  const [undo, setUndo] = React.useState<{ open: boolean; row?: Row }>({ open: false });
  const closeUndo = () => setUndo({ open: false });

  async function fetchRows() {
    setLoading(true);
    const u = new URL('/api/admin/plans', window.location.origin);
    u.searchParams.set('page', String(paginationModel.page));
    u.searchParams.set('pageSize', String(paginationModel.pageSize));
    if (q) u.searchParams.set('q', q);
    if (difficulty) u.searchParams.set('difficulty', difficulty);

    try {
      const r = await fetch(u.toString(), { cache: 'no-store' });
      const j = await r.json();
      setRows((j.rows ?? []).map((r: any) => ({ ...r, id: String(r.id) })));
      setCount(j.count ?? 0);
    } catch {
      setRows([]); setCount(0);
      setSnack({ open:true, msg:'Falha ao carregar planos', sev:'error' });
    } finally {
      setLoading(false);
    }
  }

  React.useEffect(() => {
    void fetchRows();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q, difficulty, paginationModel.page, paginationModel.pageSize]);

  function exportCSV() {
    const header = ['id','name','difficulty','duration_weeks','is_public','created_at','description'];
    const lines = [
      header.join(','),
      ...rows.map(r => [
        r.id,
        r.name,
        r.difficulty ?? '',
        r.duration_weeks ?? '',
        r.is_public ? 'true' : 'false',
        r.created_at ?? '',
        (r.description ?? '').replace(/\r?\n/g, ' ')
      ].map(v => `"${String(v).replace(/"/g, '""')}"`).join(',')),
    ].join('\n');

    const blob = new Blob([lines], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const name = `plans${difficulty ? `-diff-${difficulty}` : ''}${q ? `-q-${q}` : ''}.csv`;
    a.href = url; a.download = name; a.click();
    URL.revokeObjectURL(url);
  }

  function printList() {
    const w = window.open('', '_blank', 'noopener,noreferrer,width=900,height=700');
    if (!w) return;

    const rowsHtml = rows.map(r => {
      const cells = [
        r.name,
        r.difficulty ?? '',
        r.duration_weeks ?? '',
        r.is_public ? 'Sim' : 'Não',
        r.created_at ? new Date(String(r.created_at)).toLocaleString() : '',
        (r.description ?? '').replace(/\r?\n/g, ' '),
      ].map(c => `<td>${String(c)}</td>`).join('');
      return `<tr>${cells}</tr>`;
    }).join('');

    const title = 'Lista de Planos';
    const html =
      '<html><head><meta charset="utf-8" />' +
      `<title>${title}</title>` +
      '<style>body{font-family:system-ui,-apple-system,Segoe UI,Roboto,Ubuntu,Cantarell,Helvetica Neue,Arial,Noto Sans; padding:16px;}h1{font-size:18px;margin:0 0 12px;}table{border-collapse:collapse;width:100%;}th,td{border:1px solid #e5e7eb;padding:6px 8px;text-align:left;font-size:12px;}th{background:#f8fafc;}@media print{@page{margin:12mm;}}</style></head>' +
      `<body><h1>${title}</h1><table><thead><tr><th>Nome</th><th>Dificuldade</th><th>Semanas</th><th>Público</th><th>Criado</th><th>Descrição</th></tr></thead><tbody>${rowsHtml}</tbody></table><script>window.onload=function(){window.print();}</script></body></html>`;
    w.document.open(); w.document.write(html); w.document.close();
  }

  async function clonePlan(id: string) {
    try {
      const res = await fetch(`/api/admin/plans/${id}/clone`, { method: 'POST' });
      if (!res.ok) throw new Error(await res.text());
      setSnack({ open: true, msg: 'Plano clonado ✅', sev: 'success' });
      void fetchRows();
    } catch (e: any) {
      setSnack({ open: true, msg: e?.message || 'Falha ao clonar', sev: 'error' });
    }
  }

  const columns = React.useMemo<GridColDef<Row>[]>(() => [
    { field: 'name', headerName: 'Nome', flex: 1.3, minWidth: 220 },
    { field: 'difficulty', headerName: 'Dificuldade', width: 140, valueFormatter: (p: any) => String(p?.value ?? '') },
    { field: 'duration_weeks', headerName: 'Semanas', width: 110, valueFormatter: (p: any) => String(p?.value ?? '') },
    { field: 'is_public', headerName: 'Público', width: 100, valueFormatter: (p: any) => (p?.value ? 'Sim' : 'Não') },
    { field: 'created_at', headerName: 'Criado em', minWidth: 180, valueFormatter: (p: any) => (p?.value ? new Date(String(p.value)).toLocaleString() : '') },
    {
      field: 'actions',
      headerName: 'Ações',
      width: 170,
      sortable: false,
      filterable: false,
      renderCell: (p) => (
        <Stack direction="row" spacing={0.5}>
          <Tooltip title="Editar">
            <IconButton size="small" onClick={() => router.push(`/dashboard/admin/plans/${p.row.id}`)}>
              <EditOutlined fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Clonar">
            <IconButton size="small" onClick={() => clonePlan(p.row.id)}>
              <ContentCopyOutlined fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Remover">
            <IconButton
              size="small"
              color="error"
              onClick={async () => {
                const removed = p.row as Row;
                if (!confirm(`Remover plano "${removed.name}"?`)) return;

                // optimista + UNDO
                setRows(prev => prev.filter(r => r.id !== removed.id));
                setUndo({ open: true, row: removed });

                try {
                  const res = await fetch(`/api/admin/plans/${removed.id}`, { method: 'DELETE' });
                  if (!res.ok) throw new Error(await res.text());
                } catch (e: any) {
                  // rollback
                  setRows(prev => [removed, ...prev]);
                  setUndo({ open: false });
                  setSnack({ open:true, msg: e?.message || 'Falha ao remover', sev:'error' });
                }
              }}
            >
              <DeleteOutline fontSize="small" />
            </IconButton>
          </Tooltip>
        </Stack>
      ),
    },
  ], [router]);

  async function undoDelete() {
    const r = undo.row;
    if (!r) { closeUndo(); return; }
    try {
      const res = await fetch('/api/admin/plans', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: r.name,
          description: r.description ?? null,
          difficulty: r.difficulty ?? null,
          duration_weeks: r.duration_weeks ?? null,
          is_public: r.is_public ?? false,
        }),
      });
      if (!res.ok) throw new Error(await res.text());
      setSnack({ open:true, msg:'Plano restaurado', sev:'success' });
      void fetchRows();
    } catch (e: any) {
      setSnack({ open:true, msg: e?.message || 'Falha ao restaurar', sev:'error' });
    } finally {
      closeUndo();
    }
  }

  return (
    <Box sx={{ display: 'grid', gap: 1.5 }}>
      <Paper variant="outlined" sx={{ p: 1.5, borderRadius: 2 }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} alignItems="center" justifyContent="space-between">
          <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap' }}>
            <TextField label="Pesquisar" value={q} onChange={(e) => setQ(e.target.value)} sx={{ minWidth: 220 }} />
            <TextField select label="Dificuldade" value={difficulty} onChange={(e) => setDifficulty(e.target.value)} sx={{ minWidth: 160 }}>
              <MenuItem value="">Todas</MenuItem>
              <MenuItem value="Fácil">Fácil</MenuItem>
              <MenuItem value="Média">Média</MenuItem>
              <MenuItem value="Difícil">Difícil</MenuItem>
            </TextField>
          </Stack>
          <Stack direction="row" spacing={1}>
            <Tooltip title="Exportar CSV">
              <IconButton onClick={exportCSV}><FileDownloadOutlined /></IconButton>
            </Tooltip>
            <Tooltip title="Imprimir">
              <IconButton onClick={printList}><PrintOutlined /></IconButton>
            </Tooltip>
            <Button variant="contained" startIcon={<AddIcon />} onClick={() => router.push('/dashboard/admin/plans/new')}>
              Novo plano
            </Button>
          </Stack>
        </Stack>
      </Paper>

      <Divider />

      <div style={{ width: '100%' }}>
        <DataGrid
          rows={rows}
          columns={columns as unknown as GridColDef[]}
          loading={loading}
          rowCount={count}
          paginationMode="server"
          paginationModel={paginationModel}
          onPaginationModelChange={setPaginationModel}
          disableRowSelectionOnClick
          slots={{ toolbar: GridToolbar, loadingOverlay: () => <CircularProgress size={24} /> }}
          autoHeight
          density="compact"
          pageSizeOptions={[10, 20, 50, 100]}
        />
      </div>

      {/* UNDO */}
      <Snackbar open={undo.open} autoHideDuration={4000} onClose={closeUndo} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert
          severity="info"
          variant="filled"
          onClose={closeUndo}
          action={<Button color="inherit" size="small" onClick={undoDelete}>Desfazer</Button>}
          sx={{ width: '100%' }}
        >
          Plano removido
        </Alert>
      </Snackbar>

      {/* Feedback geral */}
      <Snackbar open={snack.open} autoHideDuration={3000} onClose={closeSnack}>
        <Alert severity={snack.sev} variant="filled" onClose={closeSnack} sx={{ width: '100%' }}>
          {snack.msg}
        </Alert>
      </Snackbar>
    </Box>
  );
}
