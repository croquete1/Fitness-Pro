'use client';

import * as React from 'react';
import {
  Box, Stack, Button, IconButton, Tooltip, Paper, Divider, TextField, MenuItem, Snackbar, Alert, CircularProgress,
} from '@mui/material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import DeleteOutline from '@mui/icons-material/DeleteOutline';
import AddIcon from '@mui/icons-material/Add';
import ArrowUpward from '@mui/icons-material/ArrowUpward';
import ArrowDownward from '@mui/icons-material/ArrowDownward';

type Row = {
  id: string;
  exercise_id: string;
  name: string;
  muscle_group?: string;
  difficulty?: string;
  sort: number | null;
};

export default function PlanExercisesEditor({ planId }: { planId: string }) {
  const [rows, setRows] = React.useState<Row[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [snack, setSnack] = React.useState<{open:boolean; msg:string; sev:'success'|'error'|'info'|'warning'}>({ open:false, msg:'', sev:'success' });
  const closeSnack = () => setSnack((s) => ({ ...s, open:false }));

  // filtros/adder
  const [q, setQ] = React.useState('');
  const [muscle, setMuscle] = React.useState('');
  const [exerciseOptions, setExerciseOptions] = React.useState<{ id: string; name: string }[]>([]);
  const [selectedExId, setSelectedExId] = React.useState('');

  async function loadList() {
    setLoading(true);
    try {
      const r = await fetch(`/api/admin/plans/${planId}/exercises`, { cache: 'no-store' });
      const j = await r.json();
      setRows((j.rows ?? []).map((r: any, i: number) => ({ ...r, sort: r.sort ?? i })));
    } catch {
      setRows([]);
      setSnack({ open:true, msg:'Falha ao carregar exercícios do plano', sev:'error' });
    } finally {
      setLoading(false);
    }
  }

  async function loadExerciseOptions() {
    try {
      const u = new URL('/api/admin/exercises', window.location.origin);
      u.searchParams.set('page', '0'); u.searchParams.set('pageSize', '50');
      if (q) u.searchParams.set('q', q);
      if (muscle) u.searchParams.set('muscle_group', muscle);
      const r = await fetch(u.toString(), { cache: 'no-store' });
      const j = await r.json();
      const opts = (j.rows ?? []).map((e: any) => ({ id: String(e.id), name: e.name || `Ex ${e.id}` }));
      setExerciseOptions(opts);
    } catch {
      setExerciseOptions([]);
    }
  }

  React.useEffect(() => { void loadList(); }, []); // init
  React.useEffect(() => { void loadExerciseOptions(); }, [q, muscle]);

  async function addExercise() {
    if (!selectedExId) return;
    try {
      const res = await fetch(`/api/admin/plans/${planId}/exercises`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: [{ exercise_id: selectedExId }] }),
      });
      if (!res.ok) throw new Error(await res.text());
      setSelectedExId('');
      setSnack({ open:true, msg:'Exercício adicionado', sev:'success' });
      void loadList();
    } catch (e:any) {
      setSnack({ open:true, msg: e?.message || 'Falha ao adicionar', sev:'error' });
    }
  }

  async function removeExercise(exercise_id: string) {
    try {
      const url = new URL(`/api/admin/plans/${planId}/exercises`, window.location.origin);
      url.searchParams.set('exercise_id', exercise_id);
      const res = await fetch(url.toString(), { method: 'DELETE' });
      if (!res.ok) throw new Error(await res.text());
      setSnack({ open:true, msg:'Exercício removido', sev:'success' });
      setRows(prev => prev.filter(r => r.exercise_id !== exercise_id));
    } catch (e:any) {
      setSnack({ open:true, msg: e?.message || 'Falha ao remover', sev:'error' });
    }
  }

  async function reorder(idx: number, dir: -1 | 1) {
    const newIdx = idx + dir;
    if (newIdx < 0 || newIdx >= rows.length) return;
    const swapped = [...rows];
    const [a, b] = [swapped[idx], swapped[newIdx]];
    [swapped[idx], swapped[newIdx]] = [b, a];
    // reatribuir sort 0..n
    const reSorted = swapped.map((r, i) => ({ ...r, sort: i }));
    setRows(reSorted);

    try {
      const payload = { items: reSorted.map(r => ({ id: r.id, sort: r.sort })) };
      const res = await fetch(`/api/admin/plans/${planId}/exercises`, {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error(await res.text());
    } catch {
      // se falhar, volta a carregar
      void loadList();
      setSnack({ open:true, msg:'Falha ao reordenar', sev:'error' });
    }
  }

  const columns = React.useMemo<GridColDef<Row>[]>(() => [
    { field: 'sort', headerName: 'Ordem', width: 90, valueFormatter: (p: any) => String((p?.value ?? 0) + 1) },
    { field: 'name', headerName: 'Nome', flex: 1.3, minWidth: 220 },
    { field: 'muscle_group', headerName: 'Músculo', width: 140, valueFormatter: (p: any) => String(p?.value ?? '') },
    { field: 'difficulty', headerName: 'Dificuldade', width: 120, valueFormatter: (p: any) => String(p?.value ?? '') },
    {
      field: 'actions', headerName: 'Ações', width: 160, sortable: false, filterable: false,
      renderCell: (p) => {
        const idx = rows.findIndex(r => r.id === p.row.id);
        return (
          <Stack direction="row" spacing={0.5}>
            <Tooltip title="Subir">
              <span>
                <IconButton size="small" disabled={idx <= 0} onClick={() => reorder(idx, -1)}><ArrowUpward fontSize="small" /></IconButton>
              </span>
            </Tooltip>
            <Tooltip title="Descer">
              <span>
                <IconButton size="small" disabled={idx < 0 || idx >= rows.length - 1} onClick={() => reorder(idx, +1)}><ArrowDownward fontSize="small" /></IconButton>
              </span>
            </Tooltip>
            <Tooltip title="Remover">
              <IconButton size="small" color="error" onClick={() => removeExercise(p.row.exercise_id)}><DeleteOutline fontSize="small" /></IconButton>
            </Tooltip>
          </Stack>
        );
      }
    },
  ], [rows]);

  return (
    <Box sx={{ display: 'grid', gap: 1.5 }}>
      <Paper variant="outlined" sx={{ p: 1.5, borderRadius: 2 }}>
        <Stack direction={{ xs:'column', sm:'row' }} spacing={1} alignItems="center" justifyContent="space-between">
          <Stack direction="row" spacing={1} sx={{ flexWrap:'wrap' }}>
            <TextField label="Pesquisar exercício" value={q} onChange={(e) => setQ(e.target.value)} sx={{ minWidth: 240 }} />
            <TextField select label="Músculo" value={muscle} onChange={(e) => setMuscle(e.target.value)} sx={{ minWidth: 180 }}>
              <MenuItem value="">Todos</MenuItem>
              <MenuItem value="Peito">Peito</MenuItem>
              <MenuItem value="Costas">Costas</MenuItem>
              <MenuItem value="Perna">Perna</MenuItem>
              <MenuItem value="Ombros">Ombros</MenuItem>
              <MenuItem value="Braços">Braços</MenuItem>
              <MenuItem value="Core">Core</MenuItem>
            </TextField>
            <TextField select label="Adicionar exercício" value={selectedExId} onChange={(e) => setSelectedExId(e.target.value)} sx={{ minWidth: 260 }}>
              <MenuItem value="">—</MenuItem>
              {exerciseOptions.map(o => <MenuItem key={o.id} value={o.id}>{o.name}</MenuItem>)}
            </TextField>
          </Stack>
          <Button variant="contained" startIcon={<AddIcon />} onClick={addExercise} disabled={!selectedExId}>Adicionar</Button>
        </Stack>
      </Paper>

      <Divider />

      <div style={{ width: '100%' }}>
        <DataGrid
          rows={rows}
          columns={columns as any}
          loading={loading}
          disableRowSelectionOnClick
          autoHeight
          density="compact"
          pageSizeOptions={[50]}
          initialState={{ pagination: { paginationModel: { pageSize: 50, page: 0 } } }}
          slots={{ loadingOverlay: () => <CircularProgress size={24} /> }}
        />
      </div>

      <Snackbar open={snack.open} autoHideDuration={3000} onClose={closeSnack}>
        <Alert severity={snack.sev} variant="filled" onClose={closeSnack} sx={{ width:'100%' }}>
          {snack.msg}
        </Alert>
      </Snackbar>
    </Box>
  );
}
