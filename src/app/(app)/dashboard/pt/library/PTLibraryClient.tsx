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
  useMediaQuery,
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
import { useTheme } from '@mui/material/styles';
import { getExerciseMediaInfo } from '@/lib/exercises/media';
import { parseTagList } from '@/lib/exercises/tags';

export type LibraryRow = {
  id: string;
  name: string;
  muscle_group?: string | null;
  equipment?: string | null;
  muscle_tags?: string[];
  equipment_tags?: string[];
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
  const theme = useTheme();
  const isSmallDialog = useMediaQuery(theme.breakpoints.down('sm'));

  const [scope, setScope] = React.useState<Scope>(initialScope);
  const [q, setQ] = React.useState('');
  const [muscle, setMuscle] = React.useState('');
  const [difficulty, setDifficulty] = React.useState('');
  const [equipment, setEquipment] = React.useState('');

  const [rows, setRows] = React.useState<LibraryRow[]>([]);
  const [count, setCount] = React.useState(0);
  const [loading, setLoading] = React.useState(false);
  const [paginationModel, setPaginationModel] = React.useState({ page: 0, pageSize: DEFAULT_PAGE_SIZE });
  const [facets, setFacets] = React.useState<{ muscles: string[]; equipments: string[]; difficulties: string[] }>({
    muscles: [],
    equipments: [],
    difficulties: [],
  });
  const [snack, setSnack] = React.useState<Snack>({ open: false, msg: '', sev: 'success' });
  const [needsPersonalRefresh, setNeedsPersonalRefresh] = React.useState(false);

  const closeSnack = () => setSnack((s) => ({ ...s, open: false }));

  const [openCreate, setOpenCreate] = React.useState(false);
  const [editing, setEditing] = React.useState<LibraryRow | null>(null);
  const [preview, setPreview] = React.useState<LibraryRow | null>(null);
  const previewMedia = React.useMemo(() => getExerciseMediaInfo(preview?.video_url), [preview?.video_url]);

  const fetchFacets = React.useCallback(async (scopeFilter: Scope) => {
    try {
      const res = await fetch(`/api/pt/library/exercises?facets=1&scope=${scopeFilter}`, { cache: 'no-store' });
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      setFacets({
        muscles: Array.isArray(data?.muscles) ? data.muscles : [],
        equipments: Array.isArray(data?.equipments) ? data.equipments : [],
        difficulties: Array.isArray(data?.difficulties) ? data.difficulties : [],
      });
    } catch (error) {
      console.warn('failed to load exercise facets', error);
      setFacets({ muscles: [], equipments: [], difficulties: [] });
    }
  }, []);

  const closeCreate = (refresh?: boolean) => {
    setOpenCreate(false);
    if (refresh) {
      void fetchRows();
      void fetchFacets(scope);
    }
  };
  const closeEdit = (refresh?: boolean) => {
    setEditing(null);
    if (refresh) {
      void fetchRows();
      void fetchFacets(scope);
    }
  };

  function setScopeAndReset(next: Scope) {
    setScope(next);
    setPaginationModel((prev) => ({ ...prev, page: 0 }));
  }

  React.useEffect(() => {
    if (scope === 'personal' && needsPersonalRefresh) {
      setNeedsPersonalRefresh(false);
      void fetchRows();
      void fetchFacets('personal');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scope, needsPersonalRefresh, fetchFacets]);

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
      const mapped = (data.rows ?? []).map((row: any) => {
        const muscleTags = parseTagList(row.muscle_group ?? row.muscle ?? null);
        const equipmentTags = parseTagList(row.equipment ?? null);
        return {
          id: String(row.id),
          name: row.name ?? '',
          muscle_group: row.muscle_group ?? row.muscle ?? null,
          equipment: row.equipment ?? null,
          muscle_tags: muscleTags,
          equipment_tags: equipmentTags,
          difficulty: row.difficulty ?? row.level ?? null,
          description: row.description ?? row.instructions ?? null,
          video_url: row.video_url ?? row.video ?? null,
          is_global: row.is_global ?? false,
          is_published: row.is_published ?? row.published ?? false,
          owner_id: row.owner_id ?? null,
          created_at: row.created_at ?? null,
        } as LibraryRow;
      });
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

  React.useEffect(() => {
    void fetchFacets(scope);
  }, [fetchFacets, scope]);

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

  const columns = React.useMemo<GridColDef<LibraryRow>[]>(
    () => [
      {
        field: 'media',
        headerName: '',
        width: 96,
        sortable: false,
        filterable: false,
        renderCell: (params) => {
          const media = getExerciseMediaInfo(params.row.video_url);
          return (
            <Box
              sx={{
                width: 90,
                height: 90,
                borderRadius: 2,
                overflow: 'hidden',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                bgcolor: 'action.hover',
              }}
            >
              {media.kind === 'image' && (
                <Box component="img" src={media.src} alt="Pré-visualização" sx={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              )}
              {media.kind === 'video' && (
                <Box
                  component="video"
                  src={media.src}
                  muted
                  loop
                  autoPlay
                  playsInline
                  sx={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              )}
              {media.kind === 'embed' && (
                <Box component="iframe" src={media.src} title="Pré-visualização" sx={{ width: '100%', height: '100%', border: 0 }} allow="autoplay; clipboard-write; encrypted-media; picture-in-picture" />
              )}
              {media.kind === 'none' && (
                <Typography component="span" variant="h5" role="img" aria-label="Exercício">
                  💪
                </Typography>
              )}
            </Box>
          );
        },
      },
      {
        field: 'name',
        headerName: 'Nome',
        flex: 1.4,
        minWidth: 220,
        renderCell: (params) => (
          <Stack spacing={0.5} sx={{ py: 0.5 }}>
            <Typography variant="body2" fontWeight={600} noWrap>
              {params.row.name}
            </Typography>
            {params.row.description && (
              <Typography variant="caption" color="text.secondary" noWrap>
                {params.row.description}
              </Typography>
            )}
          </Stack>
        ),
      },
    {
      field: 'muscle_group',
      headerName: 'Grupo muscular',
      flex: 0.9,
      minWidth: 140,
      renderCell: (params) => (
        <Stack direction="row" spacing={0.5} flexWrap="wrap">
          {(params.row.muscle_tags ?? []).map((tag) => (
            <Chip key={`pt-muscle-${params.row.id}-${tag}`} label={tag} size="small" variant="outlined" />
          ))}
        </Stack>
      ),
    },
    {
      field: 'equipment',
      headerName: 'Equipamento',
      flex: 0.9,
      minWidth: 140,
      renderCell: (params) => (
        <Stack direction="row" spacing={0.5} flexWrap="wrap">
          {(params.row.equipment_tags ?? []).map((tag) => (
            <Chip key={`pt-equipment-${params.row.id}-${tag}`} label={tag} size="small" variant="outlined" />
          ))}
        </Stack>
      ),
    },
    {
      field: 'difficulty',
      headerName: 'Dificuldade',
      width: 120,
      renderCell: (params) =>
        params.row.difficulty ? (
          <Chip
            size="small"
            label={params.row.difficulty}
            color={
              params.row.difficulty === 'Difícil'
                ? 'error'
                : params.row.difficulty === 'Média'
                ? 'warning'
                : 'success'
            }
            variant="outlined"
          />
        ) : null,
    },
    {
      field: 'origin',
      headerName: 'Origem',
      width: 150,
      valueGetter: (params: any) => {
        const row = (params?.row ?? {}) as LibraryRow;
        return row.is_global ? 'Catálogo global' : 'Minha biblioteca';
      },
      renderCell: (params) => {
        const row = (params?.row ?? {}) as LibraryRow;
        const isGlobal = Boolean(row.is_global);
        return (
          <Chip
            size="small"
            label={isGlobal ? 'Catálogo global' : 'Minha biblioteca'}
            color={isGlobal ? 'default' : 'primary'}
            variant={isGlobal ? 'outlined' : 'filled'}
          />
        );
      },
    },
    {
      field: 'actions',
      headerName: 'Ações',
      width: 210,
      sortable: false,
      filterable: false,
      renderCell: (params) => {
        const row = (params?.row ?? null) as LibraryRow | null;
        if (!row) return null;
        return (
          <Stack direction="row" spacing={0.5} alignItems="center">
            <Tooltip title="Pré-visualizar detalhes">
              <span>
                <IconButton size="small" onClick={() => setPreview(row)}>
                  <VisibilityOutlined fontSize="small" />
                </IconButton>
              </span>
            </Tooltip>
            {row.is_global ? (
              <Tooltip title="Copiar para a minha biblioteca">
                <span>
                  <IconButton size="small" onClick={() => cloneExercise(row)}>
                    <FileCopyOutlined fontSize="small" />
                  </IconButton>
                </span>
              </Tooltip>
            ) : (
              <>
                <Tooltip title="Editar exercício">
                  <span>
                    <IconButton size="small" onClick={() => setEditing(row)}>
                      <EditOutlined fontSize="small" />
                    </IconButton>
                  </span>
                </Tooltip>
                <Tooltip title="Remover exercício">
                  <span>
                    <IconButton size="small" color="error" onClick={() => deleteExercise(row)}>
                      <DeleteOutline fontSize="small" />
                    </IconButton>
                  </span>
                </Tooltip>
              </>
            )}
          </Stack>
        );
      },
    },
    ],
    [cloneExercise, deleteExercise],
  );

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
              {facets.muscles.map((option) => (
                <MenuItem key={`pt-facet-muscle-${option}`} value={option}>
                  {option}
                </MenuItem>
              ))}
            </TextField>
            <TextField select label="Dificuldade" value={difficulty} onChange={(e) => setDifficulty(e.target.value)} sx={{ minWidth: 160 }}>
              <MenuItem value="">Todas</MenuItem>
              {facets.difficulties.map((option) => (
                <MenuItem key={`pt-facet-difficulty-${option}`} value={option}>
                  {option}
                </MenuItem>
              ))}
            </TextField>
            <TextField select label="Equipamento" value={equipment} onChange={(e) => setEquipment(e.target.value)} sx={{ minWidth: 200 }}>
              <MenuItem value="">Todos</MenuItem>
              {facets.equipments.map((option) => (
                <MenuItem key={`pt-facet-equipment-${option}`} value={option}>
                  {option}
                </MenuItem>
              ))}
            </TextField>
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

      <Dialog open={openCreate} onClose={() => closeCreate()} fullWidth maxWidth="md" fullScreen={isSmallDialog}>
        <DialogTitle>➕ Novo exercício</DialogTitle>
        <DialogContent dividers>
          <TrainerExerciseFormClient mode="create" onSuccess={() => closeCreate(true)} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => closeCreate()}>Fechar</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={Boolean(editing)} onClose={() => closeEdit()} fullWidth maxWidth="md" fullScreen={isSmallDialog}>
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

      <Dialog open={Boolean(preview)} onClose={() => setPreview(null)} fullWidth maxWidth="sm" fullScreen={isSmallDialog}>
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>{preview?.name}</span>
          <IconButton size="small" onClick={() => setPreview(null)}>
            <Close fontSize="small" />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers sx={{ display: 'grid', gap: 1.5 }}>
          {(preview?.muscle_tags ?? parseTagList(preview?.muscle_group)).length > 0 && (
            <Stack direction="row" spacing={0.5} flexWrap="wrap" alignItems="center">
              <Typography variant="body2" fontWeight={600} component="span">
                Grupo muscular:
              </Typography>
              {(preview?.muscle_tags ?? parseTagList(preview?.muscle_group)).map((tag) => (
                <Chip key={`preview-muscle-${tag}`} label={tag} size="small" variant="outlined" />
              ))}
            </Stack>
          )}
          {(preview?.equipment_tags ?? parseTagList(preview?.equipment)).length > 0 && (
            <Stack direction="row" spacing={0.5} flexWrap="wrap" alignItems="center">
              <Typography variant="body2" fontWeight={600} component="span">
                Equipamento:
              </Typography>
              {(preview?.equipment_tags ?? parseTagList(preview?.equipment)).map((tag) => (
                <Chip key={`preview-equipment-${tag}`} label={tag} size="small" variant="outlined" />
              ))}
            </Stack>
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
          {previewMedia.kind !== 'none' ? (
            <Box
              sx={{
                position: 'relative',
                borderRadius: 2,
                overflow: 'hidden',
                border: '1px solid',
                borderColor: 'divider',
                backgroundColor: 'background.default',
                '&::after': { content: '""', display: 'block', paddingTop: '56.25%' },
              }}
            >
              {previewMedia.kind === 'image' && (
                <Box
                  component="img"
                  src={previewMedia.src}
                  alt={preview?.name ? `Pré-visualização de ${preview.name}` : 'Pré-visualização do exercício'}
                  sx={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
                />
              )}
              {previewMedia.kind === 'video' && (
                <Box
                  component="video"
                  src={previewMedia.src}
                  autoPlay
                  loop
                  muted
                  playsInline
                  controls
                  sx={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
                />
              )}
              {previewMedia.kind === 'embed' && (
                <Box
                  component="iframe"
                  src={previewMedia.src}
                  title={preview?.name || 'Vídeo do exercício'}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  sx={{ position: 'absolute', inset: 0, width: '100%', height: '100%', border: 0 }}
                />
              )}
            </Box>
          ) : (
            <Typography variant="caption" color="text.secondary">
              Este exercício ainda não tem vídeo associado.
            </Typography>
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
