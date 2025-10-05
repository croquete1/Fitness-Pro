'use client';

import React from 'react';
import {
  Box, Stack, TextField, IconButton, Tooltip,
  CircularProgress, Snackbar, Alert, InputAdornment, Dialog, DialogTitle, DialogContent, DialogActions, Button,
  Autocomplete, ButtonGroup, Menu, MenuItem, Divider, ListSubheader, Switch, ListItemIcon, ListItemText
} from '@mui/material';
import { DataGrid, GridColDef, GridRowSelectionModel } from '@mui/x-data-grid';
import SearchIcon from '@mui/icons-material/Search';
import VisibilityIcon from '@mui/icons-material/Visibility';
import EditIcon from '@mui/icons-material/Edit';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import UploadIcon from '@mui/icons-material/Upload';
import DownloadIcon from '@mui/icons-material/Download';
import AddIcon from '@mui/icons-material/Add';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { useRouter } from 'next/navigation';

export type Row = {
  id: string;
  name: string;
  muscle_group?: string | null;
  equipment?: string | null;
  difficulty?: string | null;     // "Fácil" | "Média" | "Difícil" | ...
  description?: string | null;
  video_url?: string | null;
  created_at?: string | null;
};

export default function ExercisesClient({ pageSize: pageSizeProp = 20 }: { pageSize?: number; }) {
  const router = useRouter();

  const [rows, setRows] = React.useState<Row[]>([]);
  const [count, setCount] = React.useState(0);
  const [loading, setLoading] = React.useState(true);

  const [page, setPage] = React.useState(0);
  const [pageSize, setPageSize] = React.useState(pageSizeProp);

  const [q, setQ] = React.useState('');
  const [mg, setMg] = React.useState('');      // filtro: muscle_group
  const [diff, setDiff] = React.useState('');  // filtro: difficulty
  const [eq, setEq] = React.useState('');      // filtro: equipment

  const [selection, setSelection] = React.useState<GridRowSelectionModel>([]);

  const [snack, setSnack] = React.useState<{open:boolean; msg:string; sev:'success'|'error'|'info'|'warning'; action?: React.ReactNode}>({
    open: false, msg: '', sev: 'success', action: undefined,
  });
  const closeSnack = () => setSnack((s) => ({ ...s, open: false, action: undefined }));
  const show = (msg: string, sev: 'success'|'error'|'info'|'warning' = 'success', action?: React.ReactNode) =>
    setSnack({ open: true, msg, sev, action });

  // Remoção individual
  const [delOpen, setDelOpen] = React.useState(false);
  const [delTarget, setDelTarget] = React.useState<Row | null>(null);
  const [lastDeleted, setLastDeleted] = React.useState<{row: Row; soft: boolean} | null>(null);

  // Remoção em massa
  const [bulkOpen, setBulkOpen] = React.useState(false);
  const [bulkBackup, setBulkBackup] = React.useState<Row[] | null>(null);

  // Opções de filtros (carregadas da BD)
  const [mgOpts, setMgOpts] = React.useState<string[]>([]);
  const [eqOpts, setEqOpts] = React.useState<string[]>([]);
  const [loadingOpts, setLoadingOpts] = React.useState(false);
  const diffOpts = React.useMemo(() => ['Fácil', 'Média', 'Difícil'], []);

  React.useEffect(() => {
    let alive = true;
    (async () => {
      setLoadingOpts(true);
      try {
        const res = await fetch('/api/admin/exercises/distinct?fields=muscle_group,equipment');
        const data = await res.json();
        if (alive && res.ok) {
          setMgOpts(Array.isArray(data?.muscle_group) ? data.muscle_group : []);
          setEqOpts(Array.isArray(data?.equipment) ? data.equipment : []);
        }
      } finally {
        if (alive) setLoadingOpts(false);
      }
    })();
    return () => { alive = false; };
  }, []);

  const fetchData = React.useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page + 1), pageSize: String(pageSize) });
      if (q) params.set('q', q);
      if (mg) params.set('muscle_group', mg);
      if (diff) params.set('difficulty', diff);
      if (eq) params.set('equipment', eq);

      const res = await fetch('/api/admin/exercises?' + params.toString());
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || 'Falha a carregar exercícios');
      setRows((data.rows ?? []).map((r: any) => ({ ...r, id: String(r.id) })));
      setCount(data.count ?? 0);
    } catch (e: any) {
      show(e.message || 'Erro a carregar exercícios', 'error');
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, q, mg, diff, eq]);

  React.useEffect(() => { fetchData(); }, [fetchData]);

  // ===== Preferência: Abrir em nova aba (toolbar + duplicar por linha) =====
  const [openInNewTab, setOpenInNewTab] = React.useState<boolean>(false);
  React.useEffect(() => {
    try { if (localStorage.getItem('exercises_new_openInNewTab') === '1') setOpenInNewTab(true); } catch {}
  }, []);
  React.useEffect(() => {
    try { localStorage.setItem('exercises_new_openInNewTab', openInNewTab ? '1' : '0'); } catch {}
  }, [openInNewTab]);

  function navigateToNew(pathWithQuery: string) {
    if (openInNewTab) window.open(pathWithQuery, '_blank', 'noopener');
    else router.push(pathWithQuery);
  }

  const columns: GridColDef[] = React.useMemo(() => [
    { field: 'name', headerName: 'Nome', flex: 1.4, minWidth: 200 },
    { field: 'muscle_group', headerName: 'Grupo muscular', flex: 0.9, minWidth: 150, valueFormatter: (p: any) => (p?.value ?? '') as string },
    { field: 'equipment', headerName: 'Equipamento', flex: 0.8, minWidth: 140, valueFormatter: (p: any) => (p?.value ?? '') as string },
    { field: 'difficulty', headerName: 'Dificuldade', width: 120, valueFormatter: (p: any) => (p?.value ?? '') as string },
    {
      field: 'actions', headerName: 'Ações', width: 210, sortable: false, filterable: false,
      renderCell: (p) => {
        const id = String((p as any).row?.id ?? '');
        const row = (p as any).row as Row;
        const q = new URLSearchParams();
        if (row.name) q.set('name', row.name);
        if (row.muscle_group) q.set('muscle_group', row.muscle_group);
        if (row.equipment) q.set('equipment', row.equipment);
        if (row.difficulty) q.set('difficulty', row.difficulty);
        return (
          <Stack direction="row" spacing={1}>
            {/* ✅ NOVO: Duplicar / Criar a partir deste (respeita o toggle “nova aba”) */}
            <Tooltip title="Duplicar (criar a partir deste)">
              <IconButton size="small" onClick={() => navigateToNew(`/dashboard/admin/exercises/new?${q.toString()}`)}>
                <ContentCopyIcon fontSize="small" />
              </IconButton>
            </Tooltip>

            <Tooltip title="Ver">
              <IconButton size="small" onClick={() => router.push(`/dashboard/admin/exercises/${id}`)}>
                <VisibilityIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Editar">
              <IconButton size="small" onClick={() => router.push(`/dashboard/admin/exercises/${id}?edit=1`)}>
                <EditIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Remover">
              <IconButton size="small" onClick={() => { setDelTarget(row); setDelOpen(true); }}>
                <DeleteOutlineIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Stack>
        );
      },
    },
  ], [router, openInNewTab]);

  // ===== Export/Import/Deletes etc. (inalterado) =====

  async function doDeleteSingle() {
    if (!delTarget) return;
    const target = delTarget;
    setDelOpen(false);
    try {
      const res = await fetch(`/api/admin/exercises/${target.id}`, { method: 'DELETE' });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || 'Falha ao remover exercício.');
      const soft = Boolean(data?.soft);
      setRows((prev) => prev.filter((r) => r.id !== target.id));
      setLastDeleted({ row: target, soft });

      const undo = async () => {
        try {
          if (soft) {
            await fetch(`/api/admin/exercises/${target.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ deleted_at: null }) });
          } else {
            const payload = {
              name: target.name,
              muscle_group: target.muscle_group ?? null,
              equipment: target.equipment ?? null,
              difficulty: target.difficulty ?? null,
              description: target.description ?? null,
              video_url: target.video_url ?? null,
            };
            await fetch('/api/admin/exercises', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
          }
          setRows((prev) => [target, ...prev]);
          show('Remoção anulada', 'success');
          setLastDeleted(null);
        } catch (e: any) {
          show(e.message || 'Falha ao anular remoção', 'error');
        }
      };

      show('Exercício removido', 'success', <Button color="inherit" size="small" onClick={undo}>Anular</Button>);
    } catch (e: any) {
      show(e.message || 'Falha ao remover exercício.', 'error');
    } finally {
      setDelTarget(null);
    }
  }

  async function doBulkDelete() {
    const ids = selection.map(String);
    if (!ids.length) { setBulkOpen(false); return; }
    setBulkBackup(rows.filter((r) => ids.includes(r.id)));
    setBulkOpen(false);
    try {
      for (const id of ids) {
        await fetch(`/api/admin/exercises/${id}`, { method: 'DELETE' });
      }
      setRows((prev) => prev.filter((r) => !ids.includes(r.id)));

      const undo = async () => {
        try {
          if (!bulkBackup?.length) return;
          for (const r of bulkBackup) {
            const res = await fetch(`/api/admin/exercises/${r.id}`, {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ deleted_at: null }),
            });
            if (!res.ok) {
              const payload = {
                name: r.name,
                muscle_group: r.muscle_group ?? null,
                equipment: r.equipment ?? null,
                difficulty: r.difficulty ?? null,
                description: r.description ?? null,
                video_url: r.video_url ?? null,
              };
              await fetch('/api/admin/exercises', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
            }
          }
          await fetchData();
          show('Remoção em massa anulada', 'success');
          setBulkBackup(null);
        } catch (e: any) {
          show(e.message || 'Falha ao anular remoção em massa', 'error');
        }
      };

      show(`${ids.length} exercício(s) removido(s)`, 'success', <Button color="inherit" size="small" onClick={undo}>Anular</Button>);
      setSelection([]);
    } catch (e: any) {
      show(e.message || 'Falha na remoção em massa', 'error');
    }
  }

  function exportCSV() {
    const header = ['id','name','muscle_group','equipment','difficulty','description','video_url'];
    const lines = [header.join(';')];
    for (const r of rows) {
      const vals = [
        r.id,
        r.name ?? '',
        r.muscle_group ?? '',
        r.equipment ?? '',
        r.difficulty ?? '',
        (r.description ?? '').replace(/[\r\n]+/g, ' ').trim(),
        r.video_url ?? '',
      ];
      lines.push(vals.map((v) => String(v).replace(/;/g, ',')).join(';'));
    }
    const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'exercicios.csv';
    document.body.appendChild(a); a.click(); a.remove();
    URL.revokeObjectURL(url);
    show('Exportação concluída', 'success');
  }

  // Import CSV
  const fileRef = React.useRef<HTMLInputElement | null>(null);
  async function onPickFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const text = await file.text();
      const res = await fetch('/api/admin/exercises/import', {
        method: 'POST',
        headers: { 'Content-Type': 'text/csv;charset=utf-8' },
        body: text,
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || 'Falha no import');
      show(`Importados ${data?.inserted ?? 0} exercícios`, 'success');
      await fetchData();
    } catch (err: any) {
      show(err.message || 'Falha ao importar CSV', 'error');
    } finally {
      if (fileRef.current) fileRef.current.value = '';
    }
  }

  // ===== Split Button “Novo exercício” — presets + toggle =====
  const DIFFS = ['Fácil', 'Média', 'Difícil'] as const;
  const MG_PRESETS = ['Peito', 'Costas', 'Pernas', 'Ombros', 'Braços', 'Core'] as const;
  const EQ_PRESETS = ['Barra', 'Máquina', 'Halteres', 'Cabo', 'Peso corporal', 'Kettlebell', 'Elástico'] as const;
  const NAME_PRESETS = ['Supino', 'Agachamento', 'Remada', 'Levantamento Terra', 'Prancha', 'Flexões'] as const;

  const [diffIdx, setDiffIdx] = React.useState(1); // default “Média”
  const [mgPreset, setMgPreset] = React.useState<string | undefined>(undefined);
  const [eqPreset, setEqPreset] = React.useState<string | undefined>(undefined);
  const [namePreset, setNamePreset] = React.useState<string | undefined>(undefined);
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const menuOpen = Boolean(anchorEl);

  function createWithSelection(d?: string, mgOverride?: string, eqOverride?: string, nameOverride?: string) {
    const q = new URLSearchParams();
    const chosenDiff = (d ?? DIFFS[diffIdx]) as string;
    q.set('difficulty', chosenDiff);
    const chosenMG = mgOverride ?? mgPreset ?? (mg || '');
    if (chosenMG) q.set('muscle_group', chosenMG);
    const chosenEQ = eqOverride ?? eqPreset ?? (eq || '');
    if (chosenEQ) q.set('equipment', chosenEQ);
    const chosenName = nameOverride ?? namePreset ?? '';
    if (chosenName) q.set('name', chosenName);
    navigateToNew(`/dashboard/admin/exercises/new?${q.toString()}`);
  }

  function CurrentCreateLabel() {
    const parts = [`${DIFFS[diffIdx]}`];
    if (mgPreset) parts.push(mgPreset);
    if (eqPreset) parts.push(eqPreset);
    if (namePreset) parts.push(`“${namePreset}”`);
    return `Novo exercício (${parts.join(' · ')})`;
  }

  return (
    <Stack spacing={2}>
      {/* Filtros */}
      <Stack direction="row" spacing={1} alignItems="center" justifyContent="space-between" sx={{ flexWrap: 'wrap' }}>
        <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap' }}>
          <TextField
            size="small" label="Pesquisar" placeholder="Nome…"
            value={q} onChange={(e) => { setQ(e.target.value); setPage(0); }}
            InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon fontSize="small" /></InputAdornment>,
                          endAdornment: loading ? <CircularProgress size={16} /> : undefined }}
          />

          <Autocomplete
            size="small"
            options={mgOpts}
            loading={loadingOpts}
            value={mg || ''}
            onChange={(_e, v) => { setMg((v as string) || ''); setPage(0); }}
            onInputChange={(_e, v) => { setMg(v || ''); }}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Grupo muscular"
                placeholder="ex.: Peito, Costas…"
                InputProps={{
                  ...params.InputProps,
                  endAdornment: (
                    <>
                      {loadingOpts ? <CircularProgress size={16} /> : null}
                      {params.InputProps.endAdornment}
                    </>
                  ),
                }}
                sx={{ minWidth: 200 }}
              />
            )}
            freeSolo
          />

          <Autocomplete
            size="small"
            options={diffOpts}
            value={diff || ''}
            onChange={(_e, v) => { setDiff((v as string) || ''); setPage(0); }}
            onInputChange={(_e, v) => { setDiff(v || ''); }}
            renderInput={(params) => (
              <TextField {...params} label="Dificuldade" placeholder="Fácil/Média/Difícil" sx={{ minWidth: 160 }} />
            )}
            freeSolo
          />

          <Autocomplete
            size="small"
            options={eqOpts}
            loading={loadingOpts}
            value={eq || ''}
            onChange={(_e, v) => { setEq((v as string) || ''); setPage(0); }}
            onInputChange={(_e, v) => { setEq(v || ''); }}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Equipamento"
                placeholder="Barra, Máquina…"
                InputProps={{
                  ...params.InputProps,
                  endAdornment: (
                    <>
                      {loadingOpts ? <CircularProgress size={16} /> : null}
                      {params.InputProps.endAdornment}
                    </>
                  ),
                }}
                sx={{ minWidth: 180 }}
              />
            )}
            freeSolo
          />
        </Stack>

        {/* Split Button + toggle */}
        <Stack direction="row" spacing={1}>
          <input ref={fileRef} type="file" accept=".csv,text/csv" hidden onChange={onPickFile} />
          <Button variant="outlined" startIcon={<UploadIcon />} onClick={() => fileRef.current?.click()}>
            Importar CSV
          </Button>
          <Button variant="outlined" startIcon={<DownloadIcon />} disabled={rows.length === 0} onClick={exportCSV}>
            Exportar CSV
          </Button>
          <Button
            variant="outlined"
            color="error"
            startIcon={<DeleteOutlineIcon />}
            disabled={selection.length === 0}
            onClick={() => setBulkOpen(true)}
          >
            Remover selecionados ({selection.length})
          </Button>

          <ButtonGroup variant="contained">
            <Button startIcon={<AddIcon />} onClick={() => createWithSelection()}>
              {CurrentCreateLabel()}
            </Button>
            <Button size="small" onClick={(e) => setAnchorEl(e.currentTarget)}>
              <KeyboardArrowDownIcon />
            </Button>
          </ButtonGroup>

          <Menu
            anchorEl={anchorEl}
            open={menuOpen}
            onClose={() => setAnchorEl(null)}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            transformOrigin={{ vertical: 'top', horizontal: 'right' }}
          >
            <ListSubheader disableSticky>Dificuldade</ListSubheader>
            {DIFFS.map((d, idx) => (
              <MenuItem key={`diff-${d}`} selected={idx === diffIdx} onClick={() => { setDiffIdx(idx); setAnchorEl(null); createWithSelection(d); }}>
                {d}
              </MenuItem>
            ))}

            <Divider sx={{ my: 0.5 }} />

            <ListSubheader disableSticky>Grupo muscular</ListSubheader>
            {MG_PRESETS.map((g) => (
              <MenuItem key={`mg-${g}`} selected={mgPreset === g} onClick={() => { setMgPreset(g); setAnchorEl(null); createWithSelection(undefined, g); }}>
                {g}
              </MenuItem>
            ))}
            <MenuItem key="mg-clear" disabled={!mgPreset} onClick={() => { setMgPreset(undefined); setAnchorEl(null); createWithSelection(); }}>
              Sem grupo muscular
            </MenuItem>

            <Divider sx={{ my: 0.5 }} />

            <ListSubheader disableSticky>Equipamento</ListSubheader>
            {EQ_PRESETS.map((eqq) => (
              <MenuItem key={`eq-${eqq}`} selected={eqPreset === eqq} onClick={() => { setEqPreset(eqq); setAnchorEl(null); createWithSelection(undefined, undefined, eqq); }}>
                {eqq}
              </MenuItem>
            ))}
            <MenuItem key="eq-clear" disabled={!eqPreset} onClick={() => { setEqPreset(undefined); setAnchorEl(null); createWithSelection(); }}>
              Sem equipamento
            </MenuItem>

            <Divider sx={{ my: 0.5 }} />

            <ListSubheader disableSticky>Nome base</ListSubheader>
            {NAME_PRESETS.map((n) => (
              <MenuItem key={`name-${n}`} selected={namePreset === n} onClick={() => { setNamePreset(n); setAnchorEl(null); createWithSelection(undefined, undefined, undefined, n); }}>
                {n}
              </MenuItem>
            ))}
            <MenuItem key="name-clear" disabled={!namePreset} onClick={() => { setNamePreset(undefined); setAnchorEl(null); createWithSelection(); }}>
              Sem nome base
            </MenuItem>

            <Divider sx={{ my: 0.5 }} />

            {/* Toggle Abrir em nova aba (persistente) */}
            <MenuItem onClick={(e) => { e.stopPropagation(); setOpenInNewTab((v) => !v); }} disableRipple>
              <ListItemIcon><OpenInNewIcon fontSize="small" /></ListItemIcon>
              <ListItemText primary="Abrir em nova aba" />
              <Switch
                edge="end"
                checked={openInNewTab}
                onClick={(e) => { e.stopPropagation(); setOpenInNewTab(!openInNewTab); }}
                onChange={() => {}}
              />
            </MenuItem>
          </Menu>
        </Stack>
      </Stack>

      <Box sx={{ height: 640, width: '100%', '& .MuiDataGrid-columnHeaders': { position: 'sticky', top: 0, zIndex: 1, bgcolor: 'background.paper' } }}>
        <DataGrid
          rows={rows}
          columns={columns}
          getRowId={(r) => r.id}
          loading={loading}
          rowCount={count}
          paginationMode="server"
          paginationModel={{ page, pageSize }}
          onPaginationModelChange={(m) => { setPage(m.page); setPageSize(m.pageSize); }}
          pageSizeOptions={[10, 20, 50, 100]}
          checkboxSelection
          rowSelectionModel={selection}
          onRowSelectionModelChange={(m) => setSelection(m)}
          disableRowSelectionOnClick
          density="compact"
        />
      </Box>

      {/* Diálogos e Snackbar (inalterados) */}
      <Dialog open={delOpen} onClose={() => setDelOpen(false)}>
        <DialogTitle>Remover exercício</DialogTitle>
        <DialogContent>Tem a certeza que pretende remover <b>{delTarget?.name}</b>?</DialogContent>
        <DialogActions>
          <Button onClick={() => setDelOpen(false)}>Cancelar</Button>
          <Button color="error" variant="contained" startIcon={<DeleteOutlineIcon />} onClick={doDeleteSingle}>Remover</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={bulkOpen} onClose={() => setBulkOpen(false)}>
        <DialogTitle>Remover selecionados</DialogTitle>
        <DialogContent>Tem a certeza que pretende remover <b>{selection.length}</b> exercício(s)?</DialogContent>
        <DialogActions>
          <Button onClick={() => setBulkOpen(false)}>Cancelar</Button>
          <Button color="error" variant="contained" startIcon={<DeleteOutlineIcon />} onClick={doBulkDelete}>Remover</Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={snack.open} autoHideDuration={3500} onClose={closeSnack} action={snack.action}>
        <Alert severity={snack.sev} variant="filled" onClose={closeSnack} sx={{ width: '100%' }}>{snack.msg}</Alert>
      </Snackbar>
    </Stack>
  );
}
