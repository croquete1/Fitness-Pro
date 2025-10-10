'use client';

import * as React from 'react';
import { formatISO, startOfWeek, endOfWeek } from 'date-fns';
import {
  Box, Button, Card, CardContent, Container, MenuItem, Stack, Table, TableBody, TableCell,
  TableHead, TableRow, TextField, Typography, IconButton, Tooltip,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import { toast } from '@/components/ui/Toaster';

type Sess = {
  id: string;
  client_id: string | null;
  title: string | null;
  kind: string | null;
  start_at: string;
  end_at: string | null;
  order_index: number;
};

function weekRange(from?: string) {
  const base = from ? new Date(from) : new Date();
  const s = startOfWeek(base, { weekStartsOn: 1 });
  const e = endOfWeek(base, { weekStartsOn: 1 });
  return { start: s, end: e };
}
function moveWeek(dir: -1|1, from?: string) {
  const d = from ? new Date(from) : new Date();
  d.setDate(d.getDate() + (7 * dir));
  return d.toISOString();
}

export default function TrainerSessionsPage() {
  const [cursor, setCursor] = React.useState<string>(new Date().toISOString());
  const [rows, setRows] = React.useState<Sess[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [sortMode, setSortMode] = React.useState(false); // ativa arrastar-e-soltar
  const [clients, setClients] = React.useState<{ id: string; full_name: string | null }[]>([]);
  const [clientsLoaded, setClientsLoaded] = React.useState(false);
  const clientNameById = React.useMemo(() => {
    const map = new Map<string, string>();
    clients.forEach((c) => {
      if (c.id) map.set(c.id, c.full_name ?? c.id);
    });
    return map;
  }, [clients]);

  const wr = weekRange(cursor);
  const fromISO = formatISO(wr.start);
  const toISO = formatISO(wr.end);

  async function load() {
    setLoading(true);
    try {
      const q = new URLSearchParams({ from: fromISO, to: toISO });
      const r = await fetch(`/api/pt/sessions?${q}`, { cache: 'no-store' });
      const j = await r.json();
      setRows(Array.isArray(j.items) ? j.items : []);
    } catch { setRows([]); }
    setLoading(false);
  }
  React.useEffect(() => { load(); }, [cursor]); // eslint-disable-line

  React.useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/pt/clients', { cache: 'no-store' });
        const json = res.ok ? await res.json() : { items: [] };
        setClients(Array.isArray(json.items) ? json.items : []);
      } catch {
        setClients([]);
      } finally {
        setClientsLoaded(true);
      }
    })();
  }, []);

  async function remove(id: string) {
    if (!confirm('Apagar sessão?')) return;
    const prev = rows;
    setRows((r) => r.filter(x => x.id !== id));
    const res = await fetch(`/api/pt/sessions/${id}`, { method: 'DELETE' });
    if (!res.ok) { setRows(prev); toast('Falha ao apagar', 2000, 'error'); }
    else toast('Sessão apagada 🗑️', 1500, 'success');
  }

  // ------- Drag & Drop (HTML5) -------
  const dragIndex = React.useRef<number | null>(null);

  function onDragStart(i: number) { return () => { dragIndex.current = i; }; }
  function onDragOver(e: React.DragEvent) { e.preventDefault(); }
  function onDrop(i: number) {
    return async (e: React.DragEvent) => {
      e.preventDefault();
      const from = dragIndex.current;
      if (from == null || from === i) return;
      setRows((arr) => {
        const next = arr.slice();
        const [moved] = next.splice(from, 1);
        next.splice(i, 0, moved);
        // envia ordem nova ao server
        const ids = next.map(x => x.id);
        fetch('/api/pt/sessions', { method: 'PATCH', headers: { 'content-type':'application/json' }, body: JSON.stringify({ ids }) })
          .then(r => r.ok ? toast('Ordem atualizada ↕️', 1200, 'success') : toast('Falha a ordenar', 1600, 'error'));
        return next;
      });
      dragIndex.current = null;
    };
  }

  // criação rápida
  async function createQuick(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const start = String(f.get('start') || '');
    const title = String(f.get('title') || '');
    const kind = String(f.get('kind') || 'presencial');
    const clientId = String(f.get('client_id') || '');
    const durationMin = Number(f.get('durationMin') || 60);
    if (!start) return toast('Indica data/hora', 2000, 'warning');

    try {
      const res = await fetch('/api/pt/sessions', {
        method: 'POST', headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          start,
          durationMin,
          title,
          kind,
          client_id: clientId || undefined,
        }),
      });
      if (!res.ok) throw new Error(await res.text());
      toast('Sessão criada 🗓️', 1800, 'success');
      (e.target as HTMLFormElement).reset();
      load();
    } catch { toast('Falha ao criar sessão', 2000, 'error'); }
  }

  return (
    <Container maxWidth="lg" sx={{ display: 'grid', gap: 2 }}>
      <Stack direction="row" alignItems="center" justifyContent="space-between">
        <Typography variant="h5" fontWeight={800}>🗓️ Agenda do PT (semana)</Typography>
        <Stack direction="row" gap={1}>
          <Button onClick={() => setCursor(moveWeek(-1, cursor))}>◀ Semana anterior</Button>
          <Button onClick={() => setCursor(new Date().toISOString())}>Hoje</Button>
          <Button onClick={() => setCursor(moveWeek(1, cursor))}>Semana seguinte ▶</Button>
        </Stack>
      </Stack>

      <Card variant="outlined">
        <CardContent>
          <Stack direction="row" gap={1} component="form" onSubmit={createQuick}>
            <TextField name="start" type="datetime-local" label="Início" InputLabelProps={{ shrink: true }} required />
            <TextField name="title" label="Título (opcional)" placeholder="Sessão com cliente" sx={{ minWidth: 260 }} />
            <TextField name="kind" label="Tipo" defaultValue="presencial" />
            <TextField select name="client_id" label="Cliente" sx={{ minWidth: 220 }} disabled={!clientsLoaded}>
              <MenuItem value="">Sem cliente</MenuItem>
              {clients.map((c) => (
                <MenuItem key={c.id} value={c.id}>{c.full_name ?? c.id}</MenuItem>
              ))}
            </TextField>
            <TextField
              name="durationMin"
              label="Duração (min)"
              type="number"
              inputProps={{ min: 15, step: 15 }}
              defaultValue={60}
              sx={{ maxWidth: 140 }}
            />
            <Button type="submit" variant="contained">➕ Criar</Button>
            <Button onClick={() => setSortMode(v => !v)}>{sortMode ? '✅ Terminar ordenação' : '↕️ Ordenar sessões'}</Button>
          </Stack>
        </CardContent>
      </Card>

      <Box sx={{ borderRadius: 3, bgcolor: 'background.paper', border: '1px solid', borderColor: 'divider', overflow: 'hidden' }}>
        <Table size="small">
          <TableHead sx={{ bgcolor: 'action.hover' }}>
            <TableRow>
              <TableCell />
              <TableCell>Data</TableCell>
              <TableCell>Hora</TableCell>
              <TableCell>Título</TableCell>
              <TableCell>Tipo</TableCell>
              <TableCell>Cliente</TableCell>
              <TableCell align="right">Ações</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={7} align="center" sx={{ py: 4 }}>A carregar…</TableCell></TableRow>
            ) : rows.length === 0 ? (
              <TableRow><TableCell colSpan={7} align="center" sx={{ py: 4, opacity: .7 }}>Sem sessões nesta semana.</TableCell></TableRow>
            ) : rows.map((s, i) => {
              const d = new Date(s.start_at);
              const date = d.toLocaleDateString();
              const time = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
              const cliente = s.client_id ? clientNameById.get(s.client_id) ?? s.client_id : null;
              return (
                <TableRow
                  key={s.id}
                  draggable={sortMode}
                  onDragStart={onDragStart(i)}
                  onDragOver={onDragOver}
                  onDrop={onDrop(i)}
                  sx={{ cursor: sortMode ? 'grab' : 'default' }}
                >
                  <TableCell width={36} sx={{ opacity: sortMode ? 1 : .3 }}>
                    <DragIndicatorIcon fontSize="small" />
                  </TableCell>
                  <TableCell>{date}</TableCell>
                  <TableCell>{time}</TableCell>
                  <TableCell>{s.title ?? 'Sessão'}</TableCell>
                  <TableCell>{s.kind ?? '—'}</TableCell>
                  <TableCell>{cliente ?? '—'}</TableCell>
                  <TableCell align="right">
                    <Tooltip title="Editar">
                      <IconButton size="small" href={`/dashboard/pt/sessions/${s.id}`}><EditIcon fontSize="small" /></IconButton>
                    </Tooltip>
                    <Tooltip title="Apagar">
                      <IconButton size="small" color="error" onClick={() => remove(s.id)}><DeleteIcon fontSize="small" /></IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </Box>
    </Container>
  );
}
