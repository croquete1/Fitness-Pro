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
import AdminExerciseFormClient from './AdminExerciseFormClient';

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

export default function ExercisesClient({ pageSize = 20, initialFilters }: {
  pageSize?: number;
  initialFilters?: { muscle_group?: string; difficulty?: string; equipment?: string; q?: string };
}) {
  const router = useRouter();

  const [q, setQ] = React.useState(initialFilters?.q ?? '');
  const [muscle, setMuscle] = React.useState(initialFilters?.muscle_group ?? '');
  const [difficulty, setDifficulty] = React.useState(initialFilters?.difficulty ?? '');
  const [equipment, setEquipment] = React.useState(initialFilters?.equipment ?? '');

  const [rows, setRows] = React.useState<Row[]>([]);
  const [count, setCount] = React.useState(0);
  const [loading, setLoading] = React.useState(false);
  const [paginationModel, setPaginationModel] = React.useState({ page: 0, pageSize });

  const [snack, setSnack] = React.useState<{ open:boolean; msg:string; sev:'success'|'error'|'info'|'warning' }>({ open:false, msg:'', sev:'success' });
  const closeSnack = () => setSnack(s => ({ ...s, open:false }));

  const [undo, setUndo] = React.useState<{ open:boolean; row?: Row }>({ open:false });
  const closeUndo = () => setUndo({ open:false });

  // Dialogs
  const [openCreate, setOpenCreate] = React.useState(false);
  const [openClone, setOpenClone] = React.useState<{ open: boolean; initial?: Partial<Row> }>({ open: false });
  const closeCreate = (refresh?: boolean) => { setOpenCreate(false); if (refresh) void fetchRows(); };
  const closeClone  = (refresh?: boolean) => { setOpenClone({ open:false, initial: undefined }); if (refresh) void fetchRows(); };

  function mapRowToExerciseInitial(r: Row) {
    return {
      name: r.name ?? '',
      muscle_group: r.muscle_group ?? '',
      equipment: r.equipment ?? '',
      difficulty: (r.difficulty as any) ?? undefined,
      description: r.description ?? '',
      video_url: r.video_url ?? '',
    };
  }

  async function fetchRows() {
    setLoading(true);
    const u = new URL('/api/admin/exercises', window.location.origin);
    u.searchParams.set('page', String(paginationModel.page));
    u.searchParams.set('pageSize', String(paginationModel.pageSize));
    if (q) u.searchParams.set('q', q);
    if (muscle) u.searchParams.set('muscle_group', muscle);
    if (difficulty) u.searchParams.set('difficulty', difficulty);
    if (equipment) u.searchParams.set('equipment', equipment);

    try {
      const r = await fetch(u.toString(), { cache: 'no-store' });
      const j = await r.json();
      setRows((j.rows ?? []).map((r: any) => ({
        id: String(r.id),
        name: r.name ?? '',
        muscle_group: r.muscle_group ?? r.muscle ?? null,
        equipment: r.equipment ?? null,
        difficulty: r.difficulty ?? r.level ?? null,
        description: r.description ?? r.instructions ?? null,
        video_url: r.video_url ?? r.video ?? null,
        created_at: r.created_at ?? null,
      })));
      setCount(j.count ?? 0);
    } catch {
      setRows([]); setCount(0);
      setSnack({ open:true, msg:'Falha ao carregar exercícios', sev:'error' });
    } finally {
      setLoading(false);
    }
  }

  React.useEffect(() => { void fetchRows(); /* eslint-disable-next-line */ }, [q, muscle, difficulty, equipment, paginationModel.page, paginationModel.pageSize]);

  const columns: GridColDef<Row>[] = [
    { field: 'name', headerName: 'Nome', flex: 1.4, minWidth: 220 },
    { field: 'muscle_group', headerName: 'Grupo muscular', flex: 0.9, minWidth: 150, valueFormatter: (p:any) => String(p?.value ?? '') },
    { field: 'equipment', headerName: 'Equipamento', flex: 0.9, minWidth: 150, valueFormatter: (p:any) => String(p?.value ?? '') },
    { field: 'difficulty', headerName: 'Dificuldade', width: 130, valueFormatter: (p:any) => String(p?.value ?? '') },
    { field: 'created_at', headerName: 'Criado em', minWidth: 180, valueFormatter: (p:any) => (p?.value ? new Date(String(p.value)).toLocaleString() : '') },
    {
      field: 'actions', headerName: 'Ações', width: 190, sortable:false, filterable:false,
      renderCell: (p) => (
        <Stack direction="row" spacing={0.5}>
          <Tooltip title="Duplicar (Criar a partir de…)">
            <IconButton size="small" onClick={() => setOpenClone({ open: true, initial: p.row })}>
              <ContentCopyOutlined fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Editar">
            <IconButton size="small" onClick={() => router.push(`/dashboard/admin/exercises/${p.row.id}`)}>
              <EditOutlined fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Remover">
            <IconButton
              size="small"
              color="error"
              onClick={async () => {
                const removed = p.row as Row;
                if (!confirm(`Remover "${removed.name}"?`)) return;
                setRows(prev => prev.filter(r => r.id !== removed.id));
                setUndo({ open: true, row: removed });
                try {
                  const res = await fetch(`/api/admin/exercises/${removed.id}`, { method: 'DELETE' });
                  if (!res.ok) throw new Error(await res.text());
                } catch (e:any) {
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
  ];

  function exportCSV() {
    const header = ['id','name','muscle_group','equipment','difficulty','created_at','description','video_url'];
    const lines = [
      header.join(','),
      ...rows.map(r => [
        r.id, r.name, r.muscle_group ?? '', r.equipment ?? '', r.difficulty ?? '',
        r.created_at ?? '', (r.description ?? '').replace(/\r?\n/g,' '), r.video_url ?? ''
      ].map(v => `"${String(v).replace(/"/g,'""')}"`).join(',')),
    ].join('\n');

    const url = URL.createObjectURL(new Blob([lines], { type:'text/csv;charset=utf-8;' }));
    const a = Object.assign(document.createElement('a'), { href:url, download:'exercises.csv' });
    a.click(); URL.revokeObjectURL(url);
  }

  function printList() {
    const w = window.open('', '_blank', 'noopener,noreferrer,width=900,height=700'); if (!w) return;
    const rowsHtml = rows.map(r => {
      const cells = [
        r.name, r.muscle_group ?? '', r.equipment ?? '', r.difficulty ?? '',
        r.created_at ? new Date(String(r.created_at)).toLocaleString() : '', (r.description ?? '').replace(/\r?\n/g, ' ')
      ].map(c => `<td>${String(c)}</td>`).join('');
      return `<tr>${cells}</tr>`;
    }).join('');

    w.document.open(); w.document.write(
      '<html><head><meta charset="utf-8" /><title>Exercícios</title>' +
      '<style>body{font-family:system-ui,-apple-system,Segoe UI,Roboto; padding:16px;}h1{font-size:18px;margin:0 0 12px;}table{border-collapse:collapse;width:100%;}th,td{border:1px solid #e5e7eb;padding:6px 8px;text-align:left;font-size:12px;}th{background:#f8fafc;}</style>' +
      `</head><body><h1>Exercícios</h1><table><thead><tr><th>Nome</th><th>Grupo</th><th>Equipamento</th><th>Dificuldade</th><th>Criado</th><th>Descrição</th></tr></thead><tbody>${rowsHtml}</tbody></table><script>window.onload=function(){window.print();}</script></body></html>`
    ); w.document.close();
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
            <Button variant="contained" startIcon={<AddIcon />} onClick={() => setOpenCreate(true)}>Novo exercício</Button>
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

      {/* Dialog: novo */}
      <Dialog open={openCreate} onClose={() => closeCreate()} fullWidth maxWidth="sm">
        <DialogTitle>➕ Novo exercício</DialogTitle>
        <DialogContent dividers>
          <AdminExerciseFormClient mode="create" onSuccess={() => closeCreate(true)} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => closeCreate()}>Fechar</Button>
        </DialogActions>
      </Dialog>

      {/* Dialog: duplicar */}
      <Dialog open={openClone.open} onClose={() => closeClone()} fullWidth maxWidth="sm">
        <DialogTitle>📄 Criar exercício a partir de…</DialogTitle>
        <DialogContent dividers>
          <AdminExerciseFormClient
            mode="create"
            initial={openClone.initial ? mapRowToExerciseInitial(openClone.initial as Row) : undefined}
            onSuccess={() => closeClone(true)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => closeClone()}>Fechar</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
