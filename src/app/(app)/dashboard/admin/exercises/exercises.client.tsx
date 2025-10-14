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
  CircularProgress,
  Snackbar,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  Typography,
  useMediaQuery,
  useTheme,
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
import { supabaseBrowser } from '@/lib/supabaseBrowser';

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
  creator_id?: string | null;
  creator_name?: string | null;
  creator_email?: string | null;
  owner_email?: string | null;
  published_at?: string | null;
  audience?: string | null;
  creator_label?: string | null;
  created_label?: string | null;
};

function unwrapRecord<T>(value: T | T[] | null | undefined): T | null {
  if (Array.isArray(value)) return value[0] ?? null;
  return value ?? null;
}

function pickFirstRecord<T>(...candidates: Array<T | T[] | null | undefined>): T | null {
  for (const candidate of candidates) {
    const record = unwrapRecord(candidate);
    if (record) return record;
  }
  return null;
}

export default function ExercisesClient({ pageSize = 20, initialFilters }: {
  pageSize?: number;
  initialFilters?: { muscle_group?: string; difficulty?: string; equipment?: string; q?: string };
}) {
  const router = useRouter();
  const theme = useTheme();
  const isMdDown = useMediaQuery(theme.breakpoints.down('md'));

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

  const [snack, setSnack] = React.useState<{ open: boolean; msg: string; sev: 'success' | 'error' | 'info' | 'warning' }>({
    open: false,
    msg: '',
    sev: 'success',
  });
  const closeSnack = () => setSnack((s) => ({ ...s, open: false }));

  const [undo, setUndo] = React.useState<{ open: boolean; row?: Row }>({ open: false });
  const closeUndo = () => setUndo({ open: false });

  const supabaseRef = React.useRef<ReturnType<typeof supabaseBrowser> | null>(null);
  if (!supabaseRef.current) {
    supabaseRef.current = supabaseBrowser();
  }

  const realtimeRefreshTimer = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  // Dialogs
  const [openCreate, setOpenCreate] = React.useState(false);
  const [openClone, setOpenClone] = React.useState<{ open: boolean; initial?: Partial<Row> }>({ open: false });

  const dateFormatter = React.useMemo(
    () => new Intl.DateTimeFormat('pt-PT', { dateStyle: 'short', timeStyle: 'short' }),
    [],
  );

  const formatDate = React.useCallback(
    (value?: string | null) => {
      if (!value) return '';
      const date = new Date(value);
      if (Number.isNaN(date.getTime())) return '';
      return dateFormatter.format(date);
    },
    [dateFormatter],
  );

  const renderMediaThumb = React.useCallback(
    (row: Pick<Row, 'video_url' | 'name'>) => {
      const media = getExerciseMediaInfo(row.video_url);
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
            background: 'linear-gradient(135deg, rgba(59,130,246,.08), rgba(16,185,129,.12))',
          }}
        >
          {media.kind === 'image' && (
            <Box
              component="img"
              src={media.src}
              alt={`Pré-visualização do exercício ${row.name ?? ''}`.trim() || 'Pré-visualização do exercício'}
              sx={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          )}
          {media.kind === 'video' && (
            <Box
              component="video"
              src={media.src}
              muted
              loop
              playsInline
              autoPlay
              sx={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          )}
          {media.kind === 'embed' && (
            <Box
              component="iframe"
              src={media.src}
              title={row.name ?? 'Pré-visualização do exercício'}
              allow="autoplay; clipboard-write; encrypted-media; picture-in-picture"
              sx={{ width: '100%', height: '100%', border: 0 }}
            />
          )}
          {media.kind === 'none' && (
            <Typography component="span" role="img" aria-label="Exercício" sx={{ fontSize: 28 }}>
              💪
            </Typography>
          )}
        </Box>
      );
    },
    [],
  );

  const fetchFacets = React.useCallback(async () => {
    try {
      const params = new URLSearchParams({ facets: '1', scope, published: publishedState });
      const res = await fetch(`/api/admin/exercises?${params.toString()}`, { cache: 'no-store' });
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
  }, [publishedState, scope]);

  const fetchRows = React.useCallback(async () => {
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
      if (!r.ok) throw new Error(await r.text());
      const j = await r.json();
      const mapped = (j.rows ?? []).map((row: any) => {
        const muscleTags = parseTagList(row.muscle_group ?? row.muscle ?? null);
        const equipmentTags = parseTagList(row.equipment ?? null);
        const ownerRecord = pickFirstRecord(
          row.owner_profile,
          row.owner_profiles,
          row.owner_user,
          row.owner,
          row.ownerinfo,
        );
        const creatorRecord = pickFirstRecord(
          row.creator_profile,
          row.creator_profiles,
          row.creator_user,
          row.creator,
        );
        const ownerName =
          row.owner_name ??
          ownerRecord?.full_name ??
          ownerRecord?.name ??
          ownerRecord?.display_name ??
          null;
        const ownerEmail = row.owner_email ?? ownerRecord?.email ?? ownerRecord?.username ?? null;
        const creatorName =
          row.creator_name ??
          creatorRecord?.full_name ??
          creatorRecord?.name ??
          creatorRecord?.display_name ??
          ownerName ??
          null;
        const creatorEmail =
          row.creator_email ?? creatorRecord?.email ?? ownerEmail ?? null;
        const createdAt = row.created_at ?? row.createdAt ?? row.inserted_at ?? null;
        const updatedAt = row.updated_at ?? row.updatedAt ?? null;
        const audienceLabel = row.is_global ? 'Catálogo global' : ownerName ?? ownerEmail ?? '—';
        const creatorLabel = creatorName ?? creatorEmail ?? audienceLabel;
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
          created_at: createdAt,
          updated_at: updatedAt,
          is_global: row.is_global ?? null,
          is_published: row.is_published ?? row.published ?? null,
          owner_id: row.owner_id ?? ownerRecord?.id ?? null,
          owner_name: ownerName ?? ownerEmail ?? null,
          owner_email: ownerEmail ?? null,
          creator_id: row.created_by ?? creatorRecord?.id ?? ownerRecord?.id ?? null,
          creator_name: creatorName ?? creatorEmail ?? null,
          creator_email: creatorEmail ?? null,
          published_at: row.published_at ?? null,
          audience: audienceLabel,
          creator_label: creatorLabel,
          created_label: formatDate(createdAt),
        } as Row;
      });
      setRows(mapped);
      setCount(j.count ?? mapped.length ?? 0);
    } catch (error) {
      console.error('[admin/exercises] falha ao carregar', error);
      setRows([]);
      setCount(0);
      setSnack({ open: true, msg: 'Falha ao carregar exercícios', sev: 'error' });
    } finally {
      setLoading(false);
    }
  }, [difficulty, equipment, formatDate, muscle, paginationModel.page, paginationModel.pageSize, publishedState, q, scope]);

  const scheduleRealtimeRefresh = React.useCallback(() => {
    if (realtimeRefreshTimer.current) {
      clearTimeout(realtimeRefreshTimer.current);
    }
    realtimeRefreshTimer.current = setTimeout(() => {
      realtimeRefreshTimer.current = null;
      void fetchRows();
      void fetchFacets();
    }, 200);
  }, [fetchFacets, fetchRows]);

  const closeCreate = React.useCallback(
    (refresh?: boolean) => {
      setOpenCreate(false);
      if (refresh) {
        void fetchRows();
        void fetchFacets();
      }
    },
    [fetchFacets, fetchRows],
  );

  const closeClone = React.useCallback(
    (refresh?: boolean) => {
      setOpenClone({ open: false, initial: undefined });
      if (refresh) {
        void fetchRows();
        void fetchFacets();
      }
    },
    [fetchFacets, fetchRows],
  );

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

  React.useEffect(() => {
    void fetchRows();
  }, [fetchRows]);

  React.useEffect(() => {
    void fetchFacets();
  }, [fetchFacets]);

  React.useEffect(() => {
    const sb = supabaseRef.current;
    if (!sb) return () => {};

    const channel = sb
      .channel('admin-exercises-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'exercises' },
        () => {
          scheduleRealtimeRefresh();
        },
      )
      .subscribe();

    return () => {
      if (realtimeRefreshTimer.current) {
        clearTimeout(realtimeRefreshTimer.current);
        realtimeRefreshTimer.current = null;
      }
      void channel.unsubscribe();
    };
  }, [scheduleRealtimeRefresh]);

  React.useEffect(() => {
    setPaginationModel((prev) => {
      const total = Math.max(Math.ceil((count || 0) / prev.pageSize), 1);
      if (prev.page >= total) {
        const nextPage = Math.max(total - 1, 0);
        if (nextPage === prev.page) return prev;
        return { ...prev, page: nextPage };
      }
      return prev;
    });
  }, [count]);

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

  const handleDuplicate = React.useCallback((row: Row) => {
    setOpenClone({ open: true, initial: row });
  }, []);

  const handleEdit = React.useCallback(
    (row: Row) => {
      router.push(`/dashboard/admin/exercises/${row.id}`);
    },
    [router],
  );

  const handleDelete = React.useCallback(
    async (row: Row) => {
      if (!confirm(`Remover "${row.name}"?`)) return;
      setRows((prev) => prev.filter((r) => r.id !== row.id));
      setUndo({ open: true, row });
      try {
        const res = await fetch(`/api/admin/exercises/${row.id}`, { method: 'DELETE' });
        if (!res.ok) throw new Error(await res.text());
        setCount((prev) => Math.max(prev - 1, 0));
      } catch (error: any) {
        console.error('[admin/exercises] delete failed', error);
        setRows((prev) => [row, ...prev]);
        setUndo({ open: false });
        setSnack({ open: true, msg: error?.message ?? 'Falha ao remover', sev: 'error' });
      }
    },
    [],
  );

  const goToPrevPage = React.useCallback(() => {
    setPaginationModel((prev) => {
      if (prev.page <= 0) return prev;
      return { ...prev, page: prev.page - 1 };
    });
  }, []);

  const goToNextPage = React.useCallback(() => {
    setPaginationModel((prev) => {
      const total = Math.max(Math.ceil((count || 0) / prev.pageSize), 1);
      if (prev.page >= total - 1) return prev;
      return { ...prev, page: prev.page + 1 };
    });
  }, [count]);

  const totalPages = Math.max(Math.ceil((count || 0) / paginationModel.pageSize), 1);
  const showingStart = count === 0 ? 0 : paginationModel.page * paginationModel.pageSize + 1;
  const showingEnd = count === 0 ? 0 : Math.min(showingStart + rows.length - 1, count);
  const isFirstPage = paginationModel.page <= 0;
  const isLastPage = paginationModel.page >= totalPages - 1;

  const columns: GridColDef<Row>[] = [
    {
      field: 'media',
      headerName: '',
      width: 100,
      sortable: false,
      filterable: false,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
          {renderMediaThumb(params.row)}
        </Box>
      ),
    },
    {
      field: 'name',
      headerName: 'Nome',
      flex: 1.4,
      minWidth: 260,
      renderCell: (params) => {
        const description = params.row.description ? params.row.description.slice(0, 120) : '';
        const creator = params.row.creator_label ?? params.row.creator_name ?? params.row.creator_email ?? '—';
        const created = params.row.created_label ?? formatDate(params.row.created_at);
        return (
          <Stack spacing={0.5} sx={{ py: 1 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, lineHeight: 1.2 }}>
              {params.row.name}
            </Typography>
            {description && (
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{
                  display: '-webkit-box',
                  WebkitBoxOrient: 'vertical',
                  WebkitLineClamp: 2,
                  overflow: 'hidden',
                }}
              >
                {description}
              </Typography>
            )}
            <Typography variant="caption" color="text.secondary">
              {`Criado por ${creator}${created ? ` • ${created}` : ''}`}
            </Typography>
          </Stack>
        );
      },
    },
    {
      field: 'muscle_group',
      headerName: 'Grupo muscular',
      flex: 1,
      minWidth: 170,
      renderCell: (params) => (
        <Stack direction="row" spacing={0.5} flexWrap="wrap">
          {(params.row.muscle_tags ?? []).map((tag) => (
            <Chip key={`muscle-${params.row.id}-${tag}`} size="small" label={tag} variant="outlined" />
          ))}
        </Stack>
      ),
    },
    {
      field: 'equipment',
      headerName: 'Equipamento',
      flex: 1,
      minWidth: 170,
      renderCell: (params) => (
        <Stack direction="row" spacing={0.5} flexWrap="wrap">
          {(params.row.equipment_tags ?? []).map((tag) => (
            <Chip key={`equipment-${params.row.id}-${tag}`} size="small" label={tag} variant="outlined" />
          ))}
        </Stack>
      ),
    },
    {
      field: 'difficulty',
      headerName: 'Dificuldade',
      width: 140,
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
      field: 'audience',
      headerName: 'Disponível para',
      flex: 0.9,
      minWidth: 200,
      renderCell: (params) => (
        <Typography variant="body2" noWrap>
          {params.row.audience ?? '—'}
        </Typography>
      ),
    },
    {
      field: 'status',
      headerName: 'Estado',
      width: 200,
      sortable: false,
      filterable: false,
      renderCell: (params) =>
        params.row.is_global ? (
          <PublishToggle
            id={params.row.id}
            published={!!params.row.is_published}
            onChange={(next) => handlePublishChange(params.row.id, next)}
          />
        ) : (
          <Chip size="small" label="Rascunho privado" color="default" variant="outlined" />
        ),
    },
    {
      field: 'created_at',
      headerName: 'Criado em',
      minWidth: 190,
      valueFormatter: (p: any) => formatDate(p?.value as string | null),
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
            <IconButton size="small" onClick={() => handleDuplicate(p.row)}>
              <ContentCopyOutlined fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Editar">
            <IconButton size="small" onClick={() => handleEdit(p.row)}>
              <EditOutlined fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Remover">
            <IconButton size="small" color="error" onClick={() => handleDelete(p.row)}>
              <DeleteOutline fontSize="small" />
            </IconButton>
          </Tooltip>
        </Stack>
      ),
    },
  ];

  function exportCSV() {
    const header = [
      'id',
      'name',
      'muscle_group',
      'equipment',
      'difficulty',
      'audience',
      'is_global',
      'is_published',
      'creator',
      'creator_email',
      'created_at',
      'published_at',
      'description',
      'video_url',
    ];
    const lines = [
      header.join(','),
      ...rows.map(r => [
        r.id,
        r.name,
        r.muscle_group ?? '',
        r.equipment ?? '',
        r.difficulty ?? '',
        r.audience ?? '',
        r.is_global ? 'global' : 'privado',
        r.is_published ? 'publicado' : 'rascunho',
        r.creator_name ?? r.creator_email ?? '',
        r.creator_email ?? '',
        r.created_at ? formatDate(r.created_at) : '',
        r.published_at ? formatDate(r.published_at) : '',
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
        r.audience ?? '',
        r.is_global ? 'Catálogo global' : 'Privado',
        r.is_published ? 'Publicado' : 'Rascunho',
        r.creator_label ?? r.creator_name ?? r.creator_email ?? '',
        r.created_at ? formatDate(r.created_at) : '',
        r.published_at ? formatDate(r.published_at) : '',
        (r.description ?? '').replace(/\r?\n/g, ' '),
      ].map(c => `<td>${String(c)}</td>`).join('');
      return `<tr>${cells}</tr>`;
    }).join('');

    w.document.open(); w.document.write(
      '<html><head><meta charset="utf-8" /><title>Exercícios</title>' +
      '<style>body{font-family:system-ui,-apple-system,Segoe UI,Roboto; padding:16px;}h1{font-size:18px;margin:0 0 12px;}table{border-collapse:collapse;width:100%;}th,td{border:1px solid #e5e7eb;padding:6px 8px;text-align:left;font-size:12px;}th{background:#f8fafc;}</style>' +
      `</head><body><h1>Exercícios</h1><table><thead><tr><th>Nome</th><th>Grupo</th><th>Equipamento</th><th>Dificuldade</th><th>Disponível para</th><th>Origem</th><th>Estado</th><th>Criado por</th><th>Criado em</th><th>Publicado</th><th>Descrição</th></tr></thead><tbody>${rowsHtml}</tbody></table><script>window.onload=function(){window.print();}</script></body></html>`
    ); w.document.close();
  }

  return (
    <Box sx={{ display: 'grid', gap: 1.5 }}>
      <Paper variant="outlined" sx={{ p: { xs: 1.5, sm: 2 }, borderRadius: 2 }}>
        <Stack
          direction={{ xs: 'column', lg: 'row' }}
          spacing={{ xs: 1.5, lg: 1 }}
          alignItems={{ xs: 'stretch', lg: 'center' }}
          justifyContent="space-between"
        >
          <Stack
            direction={{ xs: 'column', md: 'row' }}
            spacing={1}
            sx={{ flexWrap: 'wrap', width: '100%', rowGap: 1 }}
          >
            <TextField
              label="Pesquisar"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              sx={{ minWidth: { xs: '100%', sm: 220 }, flex: { xs: '1 1 100%', md: '0 0 auto' } }}
            />
            <TextField
              select
              label="Origem"
              value={scope}
              onChange={(e) => updateScope(e.target.value as 'global' | 'personal' | 'all')}
              sx={{ minWidth: { xs: '100%', sm: 180 }, flex: { xs: '1 1 100%', md: '0 0 auto' } }}
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
              sx={{ minWidth: { xs: '100%', sm: 160 }, flex: { xs: '1 1 100%', md: '0 0 auto' } }}
            >
              <MenuItem value="all">Todos</MenuItem>
              <MenuItem value="published">Publicado</MenuItem>
              <MenuItem value="draft">Rascunho</MenuItem>
            </TextField>
            <TextField
              select
              label="Grupo muscular"
              value={muscle}
              onChange={(e) => setMuscle(e.target.value)}
              sx={{ minWidth: { xs: '100%', sm: 180 }, flex: { xs: '1 1 100%', md: '0 0 auto' } }}
            >
              <MenuItem value="">Todos</MenuItem>
              {facets.muscles.map((option) => (
                <MenuItem key={`facet-muscle-${option}`} value={option}>
                  {option}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              select
              label="Dificuldade"
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value)}
              sx={{ minWidth: { xs: '100%', sm: 160 }, flex: { xs: '1 1 100%', md: '0 0 auto' } }}
            >
              <MenuItem value="">Todas</MenuItem>
              {facets.difficulties.map((option) => (
                <MenuItem key={`facet-difficulty-${option}`} value={option}>
                  {option}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              select
              label="Equipamento"
              value={equipment}
              onChange={(e) => setEquipment(e.target.value)}
              sx={{ minWidth: { xs: '100%', sm: 180 }, flex: { xs: '1 1 100%', md: '0 0 auto' } }}
            >
              <MenuItem value="">Todos</MenuItem>
              {facets.equipments.map((option) => (
                <MenuItem key={`facet-equipment-${option}`} value={option}>
                  {option}
                </MenuItem>
              ))}
            </TextField>
          </Stack>
          <Stack
            direction="row"
            spacing={1}
            sx={{
              flexWrap: 'wrap',
              justifyContent: { xs: 'flex-start', lg: 'flex-end' },
              width: { xs: '100%', lg: 'auto' },
            }}
          >
            <Tooltip title="Exportar CSV">
              <IconButton onClick={exportCSV} aria-label="Exportar lista para CSV">
                <FileDownloadOutlined />
              </IconButton>
            </Tooltip>
            <Tooltip title="Imprimir">
              <IconButton onClick={printList} aria-label="Imprimir lista de exercícios">
                <PrintOutlined />
              </IconButton>
            </Tooltip>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setOpenCreate(true)}
              sx={{ flexShrink: 0 }}
            >
              Novo exercício
            </Button>
          </Stack>
        </Stack>
      </Paper>

      <Divider />

      {isMdDown ? (
        <Stack spacing={1.5}>
          {loading ? (
            <Paper variant="outlined" sx={{ p: 2, borderRadius: 2, textAlign: 'center' }}>
              <CircularProgress size={24} />
            </Paper>
          ) : rows.length === 0 ? (
            <Paper variant="outlined" sx={{ p: 2, borderRadius: 2, textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary">
                Nenhum exercício encontrado para os filtros selecionados.
              </Typography>
            </Paper>
          ) : (
            rows.map((row) => (
              <Paper
                key={row.id}
                variant="outlined"
                sx={{
                  p: 1.5,
                  borderRadius: 2,
                  display: 'flex',
                  flexDirection: { xs: 'column', sm: 'row' },
                  gap: 1.5,
                }}
              >
                <Box sx={{ width: { xs: '100%', sm: 108 }, display: 'flex', justifyContent: 'center' }}>
                  {renderMediaThumb(row)}
                </Box>
                <Stack spacing={1} sx={{ flexGrow: 1 }}>
                  <Stack spacing={0.5}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                      {row.name}
                    </Typography>
                    {row.description && (
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{
                          display: '-webkit-box',
                          WebkitBoxOrient: 'vertical',
                          WebkitLineClamp: 3,
                          overflow: 'hidden',
                        }}
                      >
                        {row.description}
                      </Typography>
                    )}
                    <Typography variant="caption" color="text.secondary">
                      {`Criado por ${row.creator_label ?? row.creator_name ?? row.creator_email ?? '—'}${row.created_label ? ` • ${row.created_label}` : ''}`}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {`Disponível para: ${row.audience ?? '—'}`}
                    </Typography>
                  </Stack>
                  <Stack direction="row" spacing={0.5} flexWrap="wrap">
                    {(row.muscle_tags ?? []).map((tag) => (
                      <Chip key={`mobile-muscle-${row.id}-${tag}`} size="small" label={tag} variant="outlined" />
                    ))}
                    {(row.equipment_tags ?? []).map((tag) => (
                      <Chip key={`mobile-equipment-${row.id}-${tag}`} size="small" label={tag} variant="outlined" />
                    ))}
                    {row.difficulty && (
                      <Chip
                        size="small"
                        label={row.difficulty}
                        color={
                          row.difficulty === 'Difícil'
                            ? 'error'
                            : row.difficulty === 'Média'
                            ? 'warning'
                            : 'success'
                        }
                        variant="outlined"
                      />
                    )}
                  </Stack>
                  <Stack
                    direction="row"
                    spacing={1}
                    alignItems="center"
                    justifyContent="space-between"
                    flexWrap="wrap"
                    rowGap={1}
                  >
                    <Chip
                      size="small"
                      label={row.is_global ? 'Catálogo global' : 'Privado'}
                      color={row.is_global ? 'default' : 'primary'}
                      variant={row.is_global ? 'outlined' : 'filled'}
                    />
                    <Stack direction="row" spacing={0.5} alignItems="center">
                      {row.is_global ? (
                        <PublishToggle
                          id={row.id}
                          published={!!row.is_published}
                          onChange={(next) => handlePublishChange(row.id, next)}
                        />
                      ) : (
                        <Chip size="small" label="Rascunho privado" variant="outlined" />
                      )}
                      <Tooltip title="Duplicar (Criar a partir de…)">
                        <IconButton size="small" onClick={() => handleDuplicate(row)} aria-label="Duplicar exercício">
                          <ContentCopyOutlined fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Editar">
                        <IconButton size="small" onClick={() => handleEdit(row)} aria-label="Editar exercício">
                          <EditOutlined fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Remover">
                        <IconButton size="small" color="error" onClick={() => handleDelete(row)} aria-label="Remover exercício">
                          <DeleteOutline fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Stack>
                  </Stack>
                </Stack>
              </Paper>
            ))
          )}
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={1}
            alignItems={{ xs: 'flex-start', sm: 'center' }}
            justifyContent="space-between"
            sx={{ px: 0.5 }}
          >
            <Typography variant="body2" color="text.secondary">
              {count === 0 ? 'Sem registos' : `Mostrando ${showingStart}-${showingEnd} de ${count}`}
            </Typography>
            <Stack direction="row" spacing={1}>
              <Button variant="outlined" size="small" onClick={goToPrevPage} disabled={isFirstPage || loading}>
                Anterior
              </Button>
              <Button variant="outlined" size="small" onClick={goToNextPage} disabled={isLastPage || loading}>
                Seguinte
              </Button>
            </Stack>
          </Stack>
        </Stack>
      ) : (
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
      )}

      {/* Dialog: novo */}
      <Dialog open={openCreate} onClose={() => closeCreate()} fullWidth maxWidth="sm">
        <DialogTitle>➕ Novo exercício</DialogTitle>
        <DialogContent dividers>
          <AdminExerciseFormClient
            mode="create"
            onSuccess={() => closeCreate(true)}
            onCancel={() => closeCreate()}
          />
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
            onCancel={() => closeClone()}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => closeClone()}>Fechar</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
