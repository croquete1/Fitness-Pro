'use client';

import * as React from 'react';
import {
  Box,
  Stack,
  TextField,
  MenuItem,
  Button,
  IconButton,
  Tooltip,
  Paper,
  Divider,
  Snackbar,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Chip,
} from '@mui/material';
import { DataGrid, GridColDef, GridToolbar } from '@mui/x-data-grid';
import AddIcon from '@mui/icons-material/Add';
import EditOutlined from '@mui/icons-material/EditOutlined';
import DeleteOutline from '@mui/icons-material/DeleteOutline';
import FileCopyOutlined from '@mui/icons-material/FileCopyOutlined';
import VisibilityOutlined from '@mui/icons-material/VisibilityOutlined';
import Close from '@mui/icons-material/Close';
import TrainerExerciseFormClient from './TrainerExerciseFormClient';
import { normalizeDifficulty } from '@/lib/exercises/schema';

export type LibraryRow = {
  id: string;
  name: string;
  muscle_group?: string | null;
  equipment?: string | null;
  difficulty?: string | null;
  description?: string | null;
  video_url?: string | null;
  is_global?: boolean | null;
  is_published?: boolean | null;
  owner_id?: string | null;
  created_at?: string | null;
};

type Scope = 'personal' | 'global';

type Snack = { open: boolean; msg: string; sev: 'success' | 'error' | 'info' | 'warning' };

const DEFAULT_PAGE_SIZE = 20;

export default function PTLibraryClient({ initialScope = 'personal' }: { initialScope?: Scope }) {
  const [scope, setScope] = React.useState<Scope>(initialScope);
  const [q, setQ] = React.useState('');
  const [muscle, setMuscle] = React.useState('');
  const [difficulty, setDifficulty] = React.useState('');
  const [equipment, setEquipment] = React.useState('');

  const [rows, setRows] = React.useState<LibraryRow[]>([]);
  const [count, setCount] = React.useState(0);
  const [loading, setLoading] = React.useState(false);
  const [paginationModel, setPaginationModel] = React.useState({ page: 0, pageSize: DEFAULT_PAGE_SIZE });
  const [snack, setSnack] = React.useState<Snack>({ open: false, msg: '', sev: 'success' });
  const [needsPersonalRefresh, setNeedsPersonalRefresh] = React.useState(false);

  const closeSnack = () => setSnack((s) => ({ ...s, open: false }));

  const [openCreate, setOpenCreate] = React.useState(false);
  const [editing, setEditing] = React.useState<LibraryRow | null>(null);
  const [preview, setPreview] = React.useState<LibraryRow | null>(null);

  const closeCreate = (refresh?: boolean) => {
    setOpenCreate(false);
    if (refresh) void fetchRows();
  };
  const closeEdit = (refresh?: boolean) => {
    setEditing(null);
    if (refresh) void fetchRows();
  };

  function setScopeAndReset(next: Scope) {
    setScope(next);
    setPaginationModel((prev) => ({ ...prev, page: 0 }));
  }

  React.useEffect(() => {
    if (scope === 'personal' && needsPersonalRefresh) {
      setNeedsPersonalRefresh(false);
      void fetchRows();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scope]);

  async function fetchRows() {
    setLoading(true);
    const u = new URL('/api/pt/library/exercises', window.location.origin);
    u.searchParams.set('scope', scope);
    u.searchParams.set('page', String(paginationModel.page));
    u.searchParams.set('pageSize', String(paginationModel.pageSize));
    if (q) u.searchParams.set('q', q);
    if (muscle) u.searchParams.set('muscle_group', muscle);
    if (difficulty) u.searchParams.set('difficulty', difficulty);
    if (equipment) u.searchParams.set('equipment', equipment);

    try {
      const r = await fetch(u.toString(), { cache: 'no-store' });
      if (!r.ok) throw new Error(await r.text());
      const data = await r.json();
      const mapped = (data.rows ?? []).map((row: any) => ({
        id: String(row.id),
        name: row.name ?? '',
        muscle_group: row.muscle_group ?? row.muscle ?? null,
        equipment: row.equipment ?? null,
        difficulty: row.difficulty ?? row.level ?? null,
        description: row.description ?? row.instructions ?? null,
        video_url: row.video_url ?? row.video ?? null,
        is_global: row.is_global ?? false,
        is_published: row.is_published ?? row.published ?? false,
        owner_id: row.owner_id ?? null,
        created_at: row.created_at ?? null,
      })) as LibraryRow[];
      setRows(mapped);
      setCount(Number(data.count ?? mapped.length));
    } catch (error: any) {
      console.error('load exercises', error);
      setRows([]);
      setCount(0);
      setSnack({ open: true, msg: 'Falha ao carregar exercícios.', sev: 'error' });
    } finally {
      setLoading(false);
    }
  }

  React.useEffect(() => {
    void fetchRows();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scope, q, muscle, difficulty, equipment, paginationModel.page, paginationModel.pageSize]);

  const cloneExercise = React.useCallback(async (row: LibraryRow) => {
    try {
      const res = await fetch('/api/pt/library/exercises', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sourceId: row.id }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || `HTTP ${res.status}`);
      setSnack({ open: true, msg: 'Exercício copiado para a tua biblioteca.', sev: 'success' });
      if (scope === 'personal') {
        void fetchRows();
      } else {
        setNeedsPersonalRefresh(true);
      }
    } catch (error: any) {
      setSnack({ open: true, msg: error?.message || 'Falha ao copiar exercício.', sev: 'error' });
    }
  }, [scope]);

  const deleteExercise = React.useCallback(async (row: LibraryRow) => {
    if (!confirm(`Remover "${row.name}" da tua biblioteca?`)) return;
    try {
      const res = await fetch(`/api/pt/library/exercises/${row.id}`, { method: 'DELETE' });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || `HTTP ${res.status}`);
      setSnack({ open: true, msg: 'Exercício removido.', sev: 'success' });
      setRows((prev) => prev.filter((r) => r.id !== row.id));
      setCount((prev) => Math.max(prev - 1, 0));
    } catch (error: any) {
      setSnack({ open: true, msg: error?.message || 'Falha ao remover exercício.', sev: 'error' });
    }
  }, []);

  const columns = React.useMemo<GridColDef<LibraryRow>[]>(() => [
    { field: 'name', headerName: 'Nome', flex: 1.4, minWidth: 220 },
    {
      field: 'muscle_group',
      headerName: 'Grupo muscular',
      flex: 0.9,
      minWidth: 140,
      valueFormatter: (params: any) => String(params?.value ?? ''),
    },
    {
      field: 'equipment',
      headerName: 'Equipamento',
      flex: 0.9,
      minWidth: 140,
      valueFormatter: (params: any) => String(params?.value ?? ''),
    },
    {
      field: 'difficulty',
      headerName: 'Dificuldade',
      width: 120,
      valueFormatter: (params: any) => String(params?.value ?? ''),
    },
    {
      field: 'origin',
      headerName: 'Origem',
      width: 150,
      valueGetter: (params: any) => (params.row.is_global ? 'Catálogo global' : 'Minha biblioteca'),
      renderCell: (params) => (
        <Chip
          size="small"
          label={params.row.is_global ? 'Catálogo global' : 'Minha biblioteca'}
          color={params.row.is_global ? 'default' : 'primary'}
          variant={params.row.is_global ? 'outlined' : 'filled'}
        />
      ),
    },
    {
      field: 'actions',
      headerName: 'Ações',
      width: 210,
      sortable: false,
      filterable: false,
      renderCell: (params) => (
        <Stack direction="row" spacing={0.5} alignItems="center">
          <Tooltip title="Pré-visualizar detalhes">
            <span>
              <IconButton size="small" onClick={() => setPreview(params.row)}>
                <VisibilityOutlined fontSize="small" />
              </IconButton>
            </span>
          </Tooltip>
          {params.row.is_global ? (
            <Tooltip title="Copiar para a minha biblioteca">
              <span>
                <IconButton size="small" onClick={() => cloneExercise(params.row)}>
                  <FileCopyOutlined fontSize="small" />
                </IconButton>
              </span>
            </Tooltip>
          ) : (
            <>
              <Tooltip title="Editar exercício">
                <span>
                  <IconButton size="small" onClick={() => setEditing(params.row)}>
                    <EditOutlined fontSize="small" />
                  </IconButton>
                </span>
              </Tooltip>
              <Tooltip title="Remover exercício">
                <span>
                  <IconButton size="small" color="error" onClick={() => deleteExercise(params.row)}>
                    <DeleteOutline fontSize="small" />
                  </IconButton>
                </span>
              </Tooltip>
            </>
          )}
        </Stack>
      ),
    },
  ], [cloneExercise, deleteExercise]);

  return (
    <Box sx={{ display: 'grid', gap: 1.5 }}>
      <Paper variant="outlined" sx={{ p: 1.5, borderRadius: 2 }}>
        <Stack direction={{ xs: 'column', lg: 'row' }} spacing={1.5} justifyContent="space-between" alignItems="center">
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} sx={{ flexWrap: 'wrap' }}>
            <TextField
              select
              label="Coleção"
              value={scope}
              onChange={(e) => setScopeAndReset(e.target.value as Scope)}
              sx={{ minWidth: 200 }}
              helperText={scope === 'global' ? 'Explora o catálogo oficial e duplica exercícios.' : 'Gere a tua biblioteca privada.'}
            >
              <MenuItem value="personal">Minha biblioteca</MenuItem>
              <MenuItem value="global">Catálogo global</MenuItem>
            </TextField>
            <TextField label="Pesquisar" value={q} onChange={(e) => setQ(e.target.value)} sx={{ minWidth: 220 }} />
            <TextField select label="Grupo muscular" value={muscle} onChange={(e) => setMuscle(e.target.value)} sx={{ minWidth: 180 }}>
              <MenuItem value="">Todos</MenuItem>
              <MenuItem value="Peito">Peito</MenuItem>
              <MenuItem value="Costas">Costas</MenuItem>
              <MenuItem value="Perna">Perna</MenuItem>
              <MenuItem value="Ombros">Ombros</MenuItem>
              <MenuItem value="Braços">Braços</MenuItem>
              <MenuItem value="Core">Core</MenuItem>
            </TextField>
            <TextField select label="Dificuldade" value={difficulty} onChange={(e) => setDifficulty(e.target.value)} sx={{ minWidth: 160 }}>
              <MenuItem value="">Todas</MenuItem>
              <MenuItem value="Fácil">Fácil</MenuItem>
              <MenuItem value="Média">Média</MenuItem>
              <MenuItem value="Difícil">Difícil</MenuItem>
            </TextField>
            <TextField
              label="Equipamento"
              value={equipment}
              onChange={(e) => setEquipment(e.target.value)}
              sx={{ minWidth: 200 }}
              placeholder="Barra, Máquina, Halteres…"
            />
          </Stack>
          <Stack direction="row" spacing={1} alignItems="center">
            {scope === 'global' ? (
              <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 260 }}>
                Dica: duplica exercícios globais para personalizá-los antes de adicionar a um plano.
              </Typography>
            ) : (
              <Button variant="contained" startIcon={<AddIcon />} onClick={() => setOpenCreate(true)}>
                Novo exercício
              </Button>
            )}
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
          autoHeight
          density="compact"
          pageSizeOptions={[10, 20, 50]}
          slots={{ toolbar: GridToolbar }}
        />
      </div>

      <Snackbar open={snack.open} autoHideDuration={3000} onClose={closeSnack}>
        <Alert severity={snack.sev} variant="filled" onClose={closeSnack} sx={{ width: '100%' }}>
          {snack.msg}
        </Alert>
      </Snackbar>

      <Dialog open={openCreate} onClose={() => closeCreate()} fullWidth maxWidth="sm">
        <DialogTitle>➕ Novo exercício</DialogTitle>
        <DialogContent dividers>
          <TrainerExerciseFormClient mode="create" onSuccess={() => closeCreate(true)} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => closeCreate()}>Fechar</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={Boolean(editing)} onClose={() => closeEdit()} fullWidth maxWidth="sm">
        <DialogTitle>✏️ Editar exercício</DialogTitle>
        <DialogContent dividers>
          {editing && (
            <TrainerExerciseFormClient
              mode="edit"
              initial={{
                ...editing,
                difficulty: normalizeDifficulty(editing.difficulty as any),
              }}
              onSuccess={() => closeEdit(true)}
            />
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => closeEdit()}>Fechar</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={Boolean(preview)} onClose={() => setPreview(null)} fullWidth maxWidth="sm">
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>{preview?.name}</span>
          <IconButton size="small" onClick={() => setPreview(null)}>
            <Close fontSize="small" />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers sx={{ display: 'grid', gap: 1.5 }}>
          {preview?.muscle_group && (
            <Typography variant="body2"><strong>Grupo muscular:</strong> {preview.muscle_group}</Typography>
          )}
          {preview?.equipment && (
            <Typography variant="body2"><strong>Equipamento:</strong> {preview.equipment}</Typography>
          )}
          {preview?.difficulty && (
            <Typography variant="body2"><strong>Dificuldade:</strong> {preview.difficulty}</Typography>
          )}
          {preview?.description && (
            <Typography variant="body2" component="div">
              <strong>Instruções:</strong>
              <br />
              <span style={{ whiteSpace: 'pre-wrap' }}>{preview.description}</span>
            </Typography>
          )}
          {preview?.video_url && (
            <Button variant="outlined" href={preview.video_url} target="_blank" rel="noreferrer">
              Ver vídeo de demonstração
            </Button>
          )}
          {preview?.is_global ? (
            <Chip label="Catálogo global" color="default" variant="outlined" />
          ) : (
            <Chip label="Exercício privado" color="primary" variant="outlined" />
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPreview(null)}>Fechar</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
