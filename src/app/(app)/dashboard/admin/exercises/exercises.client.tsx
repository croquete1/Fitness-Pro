'use client';

import * as React from 'react';
import {
  Box, Stack, TextField, MenuItem, Button, IconButton, Tooltip, Paper, Divider,
  CircularProgress, Snackbar, Alert, Dialog, DialogTitle, DialogContent, DialogActions,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteOutline from '@mui/icons-material/DeleteOutline';
import EditOutlined from '@mui/icons-material/EditOutlined';
import FileDownloadOutlined from '@mui/icons-material/FileDownloadOutlined';
import PrintOutlined from '@mui/icons-material/PrintOutlined';
import ContentCopyOutlined from '@mui/icons-material/ContentCopyOutlined';
import { DataGrid, GridColDef, GridToolbar } from '@mui/x-data-grid';
import { useRouter } from 'next/navigation';

// ✅ importa o teu form real para criar/editar (reutilizado no Dialog “Criar a partir desta”)
import AdminExerciseFormClient from '@/app/(app)/dashboard/admin/exercises/AdminExerciseFormClient';

type Difficulty = 'Fácil' | 'Média' | 'Difícil' | string;

export type Row = {
  id: string;
  name: string;
  muscle_group?: string | null;
  equipment?: string | null;
  difficulty?: Difficulty | null;
  description?: string | null;
  video_url?: string | null;
  created_at?: string | null;
};

export default function ExercisesClient({
  pageSize = 20,
  initialFilters,
}: {
  pageSize?: number;
  initialFilters?: { muscle_group?: string; difficulty?: string; equipment?: string; q?: string };
}) {
  const router = useRouter();

  // filtros
  const [q, setQ] = React.useState(initialFilters?.q ?? '');
  const [muscle, setMuscle] = React.useState(initialFilters?.muscle_group ?? '');
  const [difficulty, setDifficulty] = React.useState(initialFilters?.difficulty ?? '');
  const [equipment, setEquipment] = React.useState(initialFilters?.equipment ?? '');

  // grelha
  const [rows, setRows] = React.useState<Row[]>([]);
  const [count, setCount] = React.useState(0);
  const [loading, setLoading] = React.useState(false);
  const [paginationModel, setPaginationModel] = React.useState({ page: 0, pageSize });

  // feedback
  const [snack, setSnack] = React.useState<{ open:boolean; msg:string; sev:'success'|'error'|'info'|'warning' }>({ open:false, msg:'', sev:'success' });
  const closeSnack = () => setSnack(s => ({ ...s, open:false }));

  // UNDO
  const [undo, setUndo] = React.useState<{ open:boolean; row?: Row }>({ open:false });
  const closeUndo = () => setUndo({ open:false });

  // Dialog “Criar a partir desta”
  const [openClone, setOpenClone] = React.useState(false);
  const [cloneInitial, setCloneInitial] = React.useState<Partial<Row> | null>(null);
  const closeClone = (refresh?: boolean) => {
    setOpenClone(false);
    setCloneInitial(null);
    if (refresh) void fetchRows();
  };

  async function fetchRows(signal?: AbortSignal) {
    setLoading(true);
    try {
      const u = new URL('/api/admin/exercises', window.location.origin);
      u.searchParams.set('page', String(paginationModel.page));
      u.searchParams.set('pageSize', String(paginationModel.pageSize));
      if (q) u.searchParams.set('q', q);
      if (muscle) u.searchParams.set('muscle_group', muscle);
      if (difficulty) u.searchParams.set('difficulty', difficulty);
      if (equipment) u.searchParams.set('equipment', equipment);

      const r = await fetch(u.toString(), { cache: 'no-store', signal });
      const j = await r.json();
      const mapped: Row[] = (j.rows ?? []).map((r: any) => ({
        id: String(r.id),
        name: r.name ?? '',
        muscle_group: r.muscle_group ?? r.muscle ?? null,
        equipment: r.equipment ?? null,
        difficulty: r.difficulty ?? r.level ?? null,
        description: r.description ?? r.instructions ?? null,
        video_url: r.video_url ?? r.video ?? null,
        created_at: r.created_at ?? null,
      }));
      setRows(mapped);
      setCount(j.count ?? mapped.length);
    } catch {
      setRows([]); setCount(0);
      setSnack({ open:true, msg:'Falha ao carregar exercícios', sev:'error' });
    } finally {
      setLoading(false);
    }
  }

  React.useEffect(() => {
    const ctrl = new AbortController();
    void fetchRows(ctrl.signal);
    return () => ctrl.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q, muscle, difficulty, equipment, paginationModel.page, paginationModel.pageSize]);

  const columns = React.useMemo<GridColDef<Row>[]>(() => [
    { field: 'name', headerName: 'Nome', flex: 1.4, minWidth: 220 },
    { field: 'muscle_group', headerName: 'Grupo muscular', flex: 0.9, minWidth: 150, valueFormatter: (p:any) => String(p?.value ?? '') },
    { field: 'equipment', headerName: 'Equipamento', flex: 0.9, minWidth: 150, valueFormatter: (p:any) => String(p?.value ?? '') },
    { field: 'difficulty', headerName: 'Dificuldade', width: 130, valueFormatter: (p:any) => String(p?.value ?? '') },
    { field: 'created_at', headerName: 'Criado em', minWidth: 180, valueFormatter: (p:any) => (p?.value ? new Date(String(p.value)).toLocaleString() : '') },
    {
      field: 'actions', headerName: 'Ações', width: 210, sortable:false, filterable:false,
      renderCell: (p) => (
        <Stack direction="row" spacing={0.5}>
          <Tooltip title="Editar">
            <IconButton size="small" onClick={() => router.push(`/dashboard/admin/exercises/${p.row.id}`)}>
              <EditOutlined fontSize="small" />
            </IconButton>
          </Tooltip>

          {/* ➕ Criar a partir desta (Dialog com sombra) */}
          <Tooltip title="Criar a partir desta">
            <IconButton
              size="small"
              onClick={() => {
                setCloneInitial({
                  // sem id => modo create
                  name: p.row.name ?? '',
                  muscle_group: p.row.muscle_group ?? '',
                  equipment: p.row.equipment ?? '',
                  difficulty: (p.row.difficulty ?? '') as any,
                  description: p.row.description ?? '',
                  video_url: p.row.video_url ?? '',
                });
                setOpenClone(true);
              }}
            >
              <ContentCopyOutlined fontSize="small" />
            </IconButton>
          </Tooltip>

          <Tooltip title="Remover">
            <IconButton
              size="small"
              color="error"
              onClick={async () => {
                const removed = p.row as Row;
                if (!confirm(`Remover "${removed.name}"?`)) return;

                // remoção otimista + UNDO
                setRows(prev => prev.filter(r => r.id !== removed.id));
                setUndo({ open: true, row: removed });

                try {
                  const res = await fetch(`/api/admin/exercises/${removed.id}`, { method: 'DELETE' });
                  if (!res.ok) throw new Error(await res.text());
                } catch (e:any) {
                  // rollback
                  setRows(prev => [removed, ...prev]);
                  setUndo({ open:false });
                  setSnack({ open:true, msg: e?.message || 'Falha ao remover', sev:'error' });
                }
              }}
            >
              <DeleteOutline fontSize="small" />
            </IconButton>
          </Tooltip>
        </Stack>
      )
    }
  ], [router]);

  function exportCSV() {
    const header = ['id','name','muscle_group','equipment','difficulty','created_at','description','video_url'];
    const lines = [
      header.join(','),
      ...rows.map(r => [
        r.id,
        r.name,
        r.muscle_group ?? '',
        r.equipment ?? '',
        r.difficulty ?? '',
        r.created_at ?? '',
        (r.description ?? '').replace(/\r?\n/g, ' '),
        r.video_url ?? '',
      ].map(v => `"${String(v).replace(/"/g, '""')}"`).join(',')),
    ].join('\n');

    const blob = new Blob([lines], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const name = `exercises${q?`-q-${q}`:''}${muscle?`-muscle-${muscle}`:''}${difficulty?`-diff-${difficulty}`:''}${equipment?`-equip-${equipment}`:''}.csv`;
    a.href = url; a.download = name; a.click();
    URL.revokeObjectURL(url);
  }

  function printList() {
    const w = window.open('', '_blank', 'noopener,noreferrer,width=900,height=700');
    if (!w) return;

    const rowsHtml = rows.map(r => {
      const cells = [
        r.name,
        r.muscle_group ?? '',
        r.equipment ?? '',
        r.difficulty ?? '',
        r.created_at ? new Date(String(r.created_at)).toLocaleString() : '',
        (r.description ?? '').replace(/\r?\n/g, ' '),
      ].map(c => `<td>${String(c)}</td>`).join('');
      return `<tr>${cells}</tr>`;
    }).join('');

    const title = 'Lista de Exercícios';
    const html =
      '<html><head><meta charset="utf-8" />' +
      `<title>${title}</title>` +
      '<style>body{font-family:system-ui,-apple-system,Segoe UI,Roboto,Ubuntu,Cantarell,Helvetica Neue,Arial,Noto Sans; padding:16px;}h1{font-size:18px;margin:0 0 12px;}table{border-collapse:collapse;width:100%;}th,td{border:1px solid #e5e7eb;padding:6px 8px;text-align:left;font-size:12px;}th{background:#f8fafc;}@media print{@page{margin:12mm;}}</style></head>' +
      `<body><h1>${title}</h1><table><thead><tr><th>Nome</th><th>Grupo</th><th>Equipamento</th><th>Dificuldade</th><th>Criado</th><th>Descrição</th></tr></thead><tbody>${rowsHtml}</tbody></table><script>window.onload=function(){window.print();}</script></body></html>`;
    w.document.open(); w.document.write(html); w.document.close();
  }

  // UNDO handler
  async function undoDelete() {
    const r = undo.row;
    if (!r) { closeUndo(); return; }
    try {
      const res = await fetch('/api/admin/exercises', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: r.name,
          muscle_group: r.muscle_group ?? null,
          equipment: r.equipment ?? null,
          difficulty: r.difficulty ?? null,
          description: r.description ?? null,
          video_url: r.video_url ?? null,
        }),
      });
      if (!res.ok) throw new Error(await res.text());
      setSnack({ open:true, msg:'Exercício restaurado', sev:'success' });
      void fetchRows();
    } catch (e:any) {
      setSnack({ open:true, msg: e?.message || 'Falha ao restaurar', sev:'error' });
    } finally {
      closeUndo();
    }
  }

  return (
    <Box sx={{ display: 'grid', gap: 1.5 }}>
      <Paper variant="outlined" sx={{ p: 1.5, borderRadius: 2 }}>
        <Stack direction={{ xs:'column', sm:'row' }} spacing={1} alignItems="center" justifyContent="space-between">
          <Stack direction="row" spacing={1} sx={{ flexWrap:'wrap' }}>
            <TextField label="Pesquisar" value={q} onChange={(e)=>setQ(e.target.value)} sx={{ minWidth: 220 }} />
            <TextField select label="Grupo muscular" value={muscle} onChange={(e)=>setMuscle(e.target.value)} sx={{ minWidth: 180 }}>
              <MenuItem value="">Todos</MenuItem>
              <MenuItem value="Peito">Peito</MenuItem>
              <MenuItem value="Costas">Costas</MenuItem>
              <MenuItem value="Perna">Perna</MenuItem>
              <MenuItem value="Ombros">Ombros</MenuItem>
              <MenuItem value="Braços">Braços</MenuItem>
              <MenuItem value="Core">Core</MenuItem>
            </TextField>
            <TextField select label="Dificuldade" value={difficulty} onChange={(e)=>setDifficulty(e.target.value)} sx={{ minWidth: 160 }}>
              <MenuItem value="">Todas</MenuItem>
              <MenuItem value="Fácil">Fácil</MenuItem>
              <MenuItem value="Média">Média</MenuItem>
              <MenuItem value="Difícil">Difícil</MenuItem>
            </TextField>
            <TextField label="Equipamento" value={equipment} onChange={(e)=>setEquipment(e.target.value)} sx={{ minWidth: 180 }} placeholder="Barra, Máquina, ..." />
          </Stack>
          <Stack direction="row" spacing={1}>
            <Tooltip title="Exportar CSV"><IconButton onClick={exportCSV}><FileDownloadOutlined /></IconButton></Tooltip>
            <Tooltip title="Imprimir"><IconButton onClick={printList}><PrintOutlined /></IconButton></Tooltip>
            <Button variant="contained" startIcon={<AddIcon />} onClick={() => router.push('/dashboard/admin/exercises/new')}>Novo exercício</Button>
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
        <Alert severity="info" variant="filled" onClose={closeUndo} action={<Button color="inherit" size="small" onClick={undoDelete}>Desfazer</Button>} sx={{ width:'100%' }}>
          Exercício removido
        </Alert>
      </Snackbar>

      {/* Feedback */}
      <Snackbar open={snack.open} autoHideDuration={3000} onClose={closeSnack}>
        <Alert severity={snack.sev} variant="filled" onClose={closeSnack} sx={{ width: '100%' }}>
          {snack.msg}
        </Alert>
      </Snackbar>

      {/* Dialog: Criar a partir desta */}
      <Dialog
        open={openClone}
        onClose={() => closeClone()}
        fullWidth
        maxWidth="sm"
        PaperProps={{ elevation: 8, sx: { borderRadius: 2 } }}
      >
        <DialogTitle>Criar exercício a partir deste</DialogTitle>
        <DialogContent dividers>
          <AdminExerciseFormClient
            mode="create"
            initial={{
              name: cloneInitial?.name ?? '',
              muscle_group: cloneInitial?.muscle_group ?? '',
              equipment: cloneInitial?.equipment ?? '',
              difficulty: (cloneInitial?.difficulty as any) ?? undefined,
              description: cloneInitial?.description ?? '',
              video_url: cloneInitial?.video_url ?? '',
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => closeClone(true)}>Fechar</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
