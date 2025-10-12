'use client';

import * as React from 'react';
import {
  Box, Stack, TextField, MenuItem, Button, IconButton, Tooltip, Paper, Divider,
  CircularProgress, Snackbar, Alert, Dialog, DialogTitle, DialogContent, DialogActions, Chip,
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
import PublishToggle from '@/components/exercise/PublishToggle';
import { getExerciseMediaInfo } from '@/lib/exercises/media';
import { parseTagList } from '@/lib/exercises/tags';

type Difficulty = 'Fácil' | 'Média' | 'Difícil' | string;

export type Row = {
  id: string;
  name: string;
  muscle_group?: string | null;
  equipment?: string | null;
  muscle_tags?: string[];
  equipment_tags?: string[];
  difficulty?: Difficulty | null;
  description?: string | null;
  video_url?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
  is_global?: boolean | null;
  is_published?: boolean | null;
  owner_id?: string | null;
  owner_name?: string | null;
  published_at?: string | null;
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
  const [scope, setScope] = React.useState<'global' | 'personal' | 'all'>('all');
  const [publishedState, setPublishedState] = React.useState<'all' | 'published' | 'draft'>('all');

  const [rows, setRows] = React.useState<Row[]>([]);
  const [count, setCount] = React.useState(0);
  const [loading, setLoading] = React.useState(false);
  const [paginationModel, setPaginationModel] = React.useState({ page: 0, pageSize });
  const [facets, setFacets] = React.useState<{ muscles: string[]; equipments: string[]; difficulties: string[] }>({
    muscles: [],
    equipments: [],
    difficulties: [],
  });

  const [snack, setSnack] = React.useState<{ open:boolean; msg:string; sev:'success'|'error'|'info'|'warning' }>({ open:false, msg:'', sev:'success' });
  const closeSnack = () => setSnack(s => ({ ...s, open:false }));

  const [undo, setUndo] = React.useState<{ open:boolean; row?: Row }>({ open:false });
  const closeUndo = () => setUndo({ open:false });

  // Dialogs
  const [openCreate, setOpenCreate] = React.useState(false);
  const [openClone, setOpenClone] = React.useState<{ open: boolean; initial?: Partial<Row> }>({ open: false });
  const fetchFacets = React.useCallback(async () => {
    try {
      const res = await fetch('/api/admin/exercises?facets=1', { cache: 'no-store' });
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      setFacets({
        muscles: Array.isArray(data?.muscles) ? data.muscles : [],
        equipments: Array.isArray(data?.equipments) ? data.equipments : [],
        difficulties: Array.isArray(data?.difficulties) ? data.difficulties : [],
      });
    } catch (error) {
      console.warn('Failed to fetch exercise facets', error);
    }
  }, []);

  const closeCreate = (refresh?: boolean) => {
    setOpenCreate(false);
    if (refresh) {
      void fetchRows();
      void fetchFacets();
    }
  };
  const closeClone = (refresh?: boolean) => {
    setOpenClone({ open: false, initial: undefined });
    if (refresh) {
      void fetchRows();
      void fetchFacets();
    }
  };

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

  const updateScope = React.useCallback((next: 'global' | 'personal' | 'all') => {
    setScope(next);
    setPaginationModel((prev) => ({ ...prev, page: 0 }));
  }, []);

  const updatePublished = React.useCallback((next: 'all' | 'published' | 'draft') => {
    setPublishedState(next);
    setPaginationModel((prev) => ({ ...prev, page: 0 }));
  }, []);

  async function fetchRows() {
    setLoading(true);
    const u = new URL('/api/admin/exercises', window.location.origin);
    u.searchParams.set('page', String(paginationModel.page));
    u.searchParams.set('pageSize', String(paginationModel.pageSize));
    u.searchParams.set('scope', scope);
    u.searchParams.set('published', publishedState);
    if (q) u.searchParams.set('q', q);
    if (muscle) u.searchParams.set('muscle_group', muscle);
    if (difficulty) u.searchParams.set('difficulty', difficulty);
    if (equipment) u.searchParams.set('equipment', equipment);

    try {
      const r = await fetch(u.toString(), { cache: 'no-store' });
      const j = await r.json();
      const mapped = (j.rows ?? []).map((row: any) => {
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
          created_at: row.created_at ?? null,
          updated_at: row.updated_at ?? null,
          is_global: row.is_global ?? null,
          is_published: row.is_published ?? row.published ?? null,
          owner_id: row.owner_id ?? null,
          owner_name: row.owner?.name ?? row.owner?.email ?? row.owner_name ?? null,
          published_at: row.published_at ?? null,
        } as Row;
      });
      setRows(mapped);
      setCount(j.count ?? mapped.length ?? 0);
    } catch {
      setRows([]); setCount(0);
      setSnack({ open:true, msg:'Falha ao carregar exercícios', sev:'error' });
    } finally {
      setLoading(false);
    }
  }

  React.useEffect(() => {
    void fetchRows();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q, muscle, difficulty, equipment, scope, publishedState, paginationModel.page, paginationModel.pageSize]);

  React.useEffect(() => {
    void fetchFacets();
  }, [fetchFacets]);

  const handlePublishChange = React.useCallback((id: string, next: boolean) => {
    setRows((prev) =>
      prev.map((row) =>
        row.id === id
          ? {
              ...row,
              is_published: next,
              published_at: next ? new Date().toISOString() : null,
            }
          : row,
      ),
    );
  }, []);

  const columns: GridColDef<Row>[] = [
    {
      field: 'media',
      headerName: '',
      width: 96,
      sortable: false,
      filterable: false,
      renderCell: (params) => {
        const media = getExerciseMediaInfo(params.row.video_url);
        return (
          <div
            style={{
              width: 72,
              height: 72,
              borderRadius: 12,
              overflow: 'hidden',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'linear-gradient(135deg, rgba(59,130,246,.08), rgba(16,185,129,.12))',
            }}
          >
            {media.kind === 'image' && (
              <img src={media.src} alt="Pré-visualização" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            )}
            {media.kind === 'video' && (
              <video
                src={media.src}
                muted
                loop
                playsInline
                autoPlay
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            )}
            {media.kind === 'embed' && (
              <iframe
                src={media.src}
                title="Pré-visualização"
                allow="autoplay; clipboard-write; encrypted-media; picture-in-picture"
                style={{ width: '100%', height: '100%', border: 0 }}
              />
            )}
            {media.kind === 'none' && (
              <span role="img" aria-label="Exercício" style={{ fontSize: 28 }}>
                💪
              </span>
            )}
          </div>
        );
      },
    },
    {
      field: 'name',
      headerName: 'Nome',
      flex: 1.4,
      minWidth: 240,
      renderCell: (params) => (
        <div style={{ display: 'grid', gap: 4 }}>
          <div style={{ fontWeight: 600, lineHeight: 1.2 }}>{params.row.name}</div>
          <div style={{ fontSize: 11, opacity: 0.6 }}>{params.row.description ? params.row.description.slice(0, 80) : ''}</div>
          {params.row.owner_name && !params.row.is_global && (
            <div style={{ fontSize: 11, opacity: 0.7 }}>Autor: {params.row.owner_name}</div>
          )}
        </div>
      ),
    },
    {
      field: 'muscle_group',
      headerName: 'Grupo muscular',
      flex: 0.9,
      minWidth: 150,
      renderCell: (params) => (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
          {(params.row.muscle_tags ?? []).map((tag) => (
            <Chip key={`muscle-${params.row.id}-${tag}`} size="small" label={tag} variant="outlined" />
          ))}
        </div>
      ),
    },
    {
      field: 'equipment',
      headerName: 'Equipamento',
      flex: 0.9,
      minWidth: 150,
      renderCell: (params) => (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
          {(params.row.equipment_tags ?? []).map((tag) => (
            <Chip key={`equipment-${params.row.id}-${tag}`} size="small" label={tag} variant="outlined" />
          ))}
        </div>
      ),
    },
    {
      field: 'difficulty',
      headerName: 'Dificuldade',
      width: 130,
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
      field: 'is_global',
      headerName: 'Origem',
      width: 140,
      renderCell: (params) => (
        <Chip
          size="small"
          label={params.row.is_global ? 'Catálogo global' : 'Privado'}
          color={params.row.is_global ? 'default' : 'primary'}
          variant={params.row.is_global ? 'outlined' : 'filled'}
        />
      ),
    },
    {
      field: 'status',
      headerName: 'Estado',
      width: 180,
      sortable: false,
      filterable: false,
      renderCell: (params) => (
        params.row.is_global ? (
          <PublishToggle
            id={params.row.id}
            published={!!params.row.is_published}
            onChange={(next) => handlePublishChange(params.row.id, next)}
          />
        ) : (
          <Chip size="small" label="Rascunho privado" color="default" variant="outlined" />
        )
      ),
    },
    {
      field: 'created_at',
      headerName: 'Criado em',
      minWidth: 180,
      valueFormatter: (p: any) => (p?.value ? new Date(String(p.value)).toLocaleString() : ''),
    },
    {
      field: 'actions',
      headerName: 'Ações',
      width: 210,
      sortable: false,
      filterable: false,
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
                setRows((prev) => prev.filter((r) => r.id !== removed.id));
                setUndo({ open: true, row: removed });
                try {
                  const res = await fetch(`/api/admin/exercises/${removed.id}`, { method: 'DELETE' });
                  if (!res.ok) throw new Error(await res.text());
                  setCount((prev) => Math.max(prev - 1, 0));
                } catch (e: any) {
                  setRows((prev) => [removed, ...prev]);
                  setUndo({ open: false });
                  setSnack({ open: true, msg: e?.message || 'Falha ao remover', sev: 'error' });
                }
              }}
            >
              <DeleteOutline fontSize="small" />
            </IconButton>
          </Tooltip>
        </Stack>
      ),
    },
  ];

  function exportCSV() {
    const header = ['id','name','muscle_group','equipment','difficulty','is_global','is_published','owner','created_at','published_at','description','video_url'];
    const lines = [
      header.join(','),
      ...rows.map(r => [
        r.id,
        r.name,
        r.muscle_group ?? '',
        r.equipment ?? '',
        r.difficulty ?? '',
        r.is_global ? 'global' : 'privado',
        r.is_published ? 'publicado' : 'rascunho',
        r.owner_name ?? '',
        r.created_at ?? '',
        r.published_at ?? '',
        (r.description ?? '').replace(/\r?\n/g,' '),
        r.video_url ?? '',
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
        r.name,
        r.muscle_group ?? '',
        r.equipment ?? '',
        r.difficulty ?? '',
        r.is_global ? 'Catálogo global' : 'Privado',
        r.is_published ? 'Publicado' : 'Rascunho',
        r.created_at ? new Date(String(r.created_at)).toLocaleString() : '',
        r.published_at ? new Date(String(r.published_at)).toLocaleString() : '',
        (r.description ?? '').replace(/\r?\n/g, ' '),
      ].map(c => `<td>${String(c)}</td>`).join('');
      return `<tr>${cells}</tr>`;
    }).join('');

    w.document.open(); w.document.write(
      '<html><head><meta charset="utf-8" /><title>Exercícios</title>' +
      '<style>body{font-family:system-ui,-apple-system,Segoe UI,Roboto; padding:16px;}h1{font-size:18px;margin:0 0 12px;}table{border-collapse:collapse;width:100%;}th,td{border:1px solid #e5e7eb;padding:6px 8px;text-align:left;font-size:12px;}th{background:#f8fafc;}</style>' +
      `</head><body><h1>Exercícios</h1><table><thead><tr><th>Nome</th><th>Grupo</th><th>Equipamento</th><th>Dificuldade</th><th>Origem</th><th>Estado</th><th>Criado</th><th>Publicado</th><th>Descrição</th></tr></thead><tbody>${rowsHtml}</tbody></table><script>window.onload=function(){window.print();}</script></body></html>`
    ); w.document.close();
  }

  return (
    <Box sx={{ display: 'grid', gap: 1.5 }}>
      <Paper variant="outlined" sx={{ p: 1.5, borderRadius: 2 }}>
        <Stack direction={{ xs:'column', sm:'row' }} spacing={1} alignItems="center" justifyContent="space-between">
          <Stack direction="row" spacing={1} sx={{ flexWrap:'wrap' }}>
            <TextField label="Pesquisar" value={q} onChange={(e)=>setQ(e.target.value)} sx={{ minWidth: 220 }} />
            <TextField
              select
              label="Origem"
              value={scope}
              onChange={(e) => updateScope(e.target.value as 'global' | 'personal' | 'all')}
              sx={{ minWidth: 180 }}
            >
              <MenuItem value="all">Todos</MenuItem>
              <MenuItem value="global">Catálogo global</MenuItem>
              <MenuItem value="personal">Privados</MenuItem>
            </TextField>
            <TextField
              select
              label="Estado"
              value={publishedState}
              onChange={(e) => updatePublished(e.target.value as 'all' | 'published' | 'draft')}
              sx={{ minWidth: 160 }}
            >
              <MenuItem value="all">Todos</MenuItem>
              <MenuItem value="published">Publicado</MenuItem>
              <MenuItem value="draft">Rascunho</MenuItem>
            </TextField>
            <TextField select label="Grupo muscular" value={muscle} onChange={(e)=>setMuscle(e.target.value)} sx={{ minWidth: 180 }}>
              <MenuItem value="">Todos</MenuItem>
              {facets.muscles.map((option) => (
                <MenuItem key={`facet-muscle-${option}`} value={option}>
                  {option}
                </MenuItem>
              ))}
            </TextField>
            <TextField select label="Dificuldade" value={difficulty} onChange={(e)=>setDifficulty(e.target.value)} sx={{ minWidth: 160 }}>
              <MenuItem value="">Todas</MenuItem>
              {facets.difficulties.map((option) => (
                <MenuItem key={`facet-difficulty-${option}`} value={option}>
                  {option}
                </MenuItem>
              ))}
            </TextField>
            <TextField select label="Equipamento" value={equipment} onChange={(e)=>setEquipment(e.target.value)} sx={{ minWidth: 180 }}>
              <MenuItem value="">Todos</MenuItem>
              {facets.equipments.map((option) => (
                <MenuItem key={`facet-equipment-${option}`} value={option}>
                  {option}
                </MenuItem>
              ))}
            </TextField>
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
