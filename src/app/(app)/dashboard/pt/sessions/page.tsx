'use client';

import * as React from 'react';
import { formatISO, startOfWeek, endOfWeek } from 'date-fns';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import EventRepeatOutlinedIcon from '@mui/icons-material/EventRepeatOutlined';
import CalendarMonthOutlinedIcon from '@mui/icons-material/CalendarMonthOutlined';
import { toast } from '@/components/ui/Toaster';
import { withDashboardContentSx } from '@/styles/dashboardContentSx';

type Sess = {
  id: string;
  client_id: string | null;
  title: string | null;
  kind: string | null;
  start_at: string;
  end_at: string | null;
  order_index: number;
  duration_min: number | null;
  location: string | null;
  client_attendance_status: 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'no_show' | null;
  client_attendance_at: string | null;
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

function inferDuration(session: Sess) {
  if (typeof session.duration_min === 'number' && session.duration_min > 0) {
    return session.duration_min;
  }
  if (session.start_at && session.end_at) {
    return Math.max(30, Math.round((new Date(session.end_at).getTime() - new Date(session.start_at).getTime()) / 60000));
  }
  return 60;
}

function toInputValue(iso: string) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';
  const tzOffset = date.getTimezoneOffset() * 60000;
  const local = new Date(date.getTime() - tzOffset);
  return local.toISOString().slice(0, 16);
}

function attendanceChip(status: Sess['client_attendance_status']) {
  switch (status) {
    case 'confirmed':
      return { label: 'Confirmada', color: 'success' as const };
    case 'completed':
      return { label: 'Concluída', color: 'primary' as const };
    case 'cancelled':
      return { label: 'Cancelada', color: 'default' as const };
    case 'no_show':
      return { label: 'Faltou', color: 'warning' as const };
    default:
      return { label: 'Por confirmar', color: 'default' as const };
  }
}

export default function TrainerSessionsPage() {
  const [cursor, setCursor] = React.useState<string>(new Date().toISOString());
  const [rows, setRows] = React.useState<Sess[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [sortMode, setSortMode] = React.useState(false); // ativa arrastar-e-soltar
  const [reschedule, setReschedule] = React.useState<{ session: Sess; start: string; duration: number } | null>(null);
  const [rescheduleBusy, setRescheduleBusy] = React.useState(false);
  const [rescheduleError, setRescheduleError] = React.useState<string | null>(null);

  const wr = weekRange(cursor);
  const fromISO = formatISO(wr.start);
  const toISO = formatISO(wr.end);

  async function load() {
    setLoading(true);
    try {
      const q = new URLSearchParams({ from: fromISO, to: toISO });
      const r = await fetch(`/api/pt/sessions?${q}`, { cache: 'no-store' });
      const j = await r.json();
      if (Array.isArray(j.items)) {
        setRows(j.items.map((item: any) => ({
          ...item,
          duration_min: typeof item.duration_min === 'number' ? item.duration_min : (item.start_at && item.end_at ? Math.round((new Date(item.end_at).getTime() - new Date(item.start_at).getTime()) / 60000) : null),
          location: item.location ?? null,
          client_attendance_status: item.client_attendance_status ?? 'pending',
          client_attendance_at: item.client_attendance_at ?? null,
        })));
      } else {
        setRows([]);
      }
    } catch { setRows([]); }
    setLoading(false);
  }
  React.useEffect(() => { load(); }, [cursor]); // eslint-disable-line

  async function remove(id: string) {
    if (!confirm('Apagar sessão?')) return;
    const prev = rows;
    setRows((r) => r.filter(x => x.id !== id));
    const res = await fetch(`/api/pt/sessions/${id}`, { method: 'DELETE' });
    if (!res.ok) { setRows(prev); toast('Falha ao apagar', 2000, 'error'); }
    else toast('Sessão apagada 🗑️', 1500, 'success');
  }

  function openRescheduleDialog(session: Sess) {
    const base = session.start_at ? toInputValue(session.start_at) : '';
    setReschedule({ session, start: base, duration: inferDuration(session) });
    setRescheduleError(null);
  }

  async function saveReschedule() {
    if (!reschedule) return;
    if (!reschedule.start) {
      setRescheduleError('Escolhe data e hora válidas');
      return;
    }
    const startDate = new Date(reschedule.start);
    if (Number.isNaN(startDate.getTime())) {
      setRescheduleError('Data/hora inválida');
      return;
    }
    const duration = Number(reschedule.duration);
    if (!duration || duration <= 0) {
      setRescheduleError('Duração inválida');
      return;
    }
    setRescheduleBusy(true);
    setRescheduleError(null);
    try {
      const res = await fetch(`/api/pt/sessions/${reschedule.session.id}`, {
        method: 'PATCH',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ start_at: startDate.toISOString(), duration_min: duration }),
      });
      if (!res.ok) {
        const msg = await res.text();
        setRescheduleError(msg || 'Falha ao reagendar');
        return;
      }
      toast('Sessão reagendada 🔁', 1600, 'success');
      setReschedule(null);
      await load();
    } catch {
      setRescheduleError('Falha ao reagendar');
    } finally {
      setRescheduleBusy(false);
    }
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
    if (!start) return toast('Indica data/hora', 2000, 'warning');

    try {
      const res = await fetch('/api/pt/sessions', {
        method: 'POST', headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ start, durationMin: 60, title, kind }),
      });
      if (!res.ok) throw new Error(await res.text());
      toast('Sessão criada 🗓️', 1800, 'success');
      (e.target as HTMLFormElement).reset();
      load();
    } catch { toast('Falha ao criar sessão', 2000, 'error'); }
  }

  return (
    <Container sx={withDashboardContentSx({ display: 'grid', gap: 2 })}>
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
              <TableCell>Local</TableCell>
              <TableCell>Título</TableCell>
              <TableCell>Tipo</TableCell>
              <TableCell>Cliente</TableCell>
              <TableCell>Confirmação</TableCell>
              <TableCell align="right">Ações</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={9} align="center" sx={{ py: 4 }}>A carregar…</TableCell></TableRow>
            ) : rows.length === 0 ? (
              <TableRow><TableCell colSpan={9} align="center" sx={{ py: 4, opacity: .7 }}>Sem sessões nesta semana.</TableCell></TableRow>
            ) : rows.map((s, i) => {
              const d = new Date(s.start_at);
              const date = d.toLocaleDateString();
              const time = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
              const cliente = s.client_id ? s.client_id.slice(0, 6) + '…' : '—';
              const attendance = attendanceChip(s.client_attendance_status);
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
                  <TableCell>{s.location ?? '—'}</TableCell>
                  <TableCell>{s.title ?? 'Sessão'}</TableCell>
                  <TableCell>{s.kind ?? '—'}</TableCell>
                  <TableCell>{cliente}</TableCell>
                  <TableCell>
                    <Stack spacing={0.5}>
                      <Chip
                        size="small"
                        label={attendance.label}
                        color={attendance.color}
                        variant={attendance.color === 'default' ? 'outlined' : 'filled'}
                      />
                      {s.client_attendance_at && (
                        <Typography variant="caption" sx={{ opacity: 0.7 }}>
                          {new Date(s.client_attendance_at).toLocaleString('pt-PT', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}
                        </Typography>
                      )}
                    </Stack>
                  </TableCell>
                  <TableCell align="right">
                    <Tooltip title="Download ICS">
                      <IconButton
                        size="small"
                        component="a"
                        href={`/api/sessions/${s.id}/ics`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <CalendarMonthOutlinedIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Reagendar">
                      <IconButton size="small" onClick={() => openRescheduleDialog(s)}>
                        <EventRepeatOutlinedIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
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
      <Dialog open={Boolean(reschedule)} onClose={() => (!rescheduleBusy ? setReschedule(null) : undefined)} fullWidth maxWidth="xs">
        <DialogTitle>Reagendar sessão</DialogTitle>
        <DialogContent sx={{ display: 'grid', gap: 2, pt: 1 }}>
          {reschedule?.session && (
            <>
              <TextField
                label="Novo início"
                type="datetime-local"
                value={reschedule.start}
                onChange={(e) => setReschedule((prev) => (prev ? { ...prev, start: e.target.value } : prev))}
                InputLabelProps={{ shrink: true }}
                disabled={rescheduleBusy}
              />
              <TextField
                label="Duração (min)"
                type="number"
                value={reschedule?.duration ?? ''}
                onChange={(e) => setReschedule((prev) => (prev ? { ...prev, duration: Number(e.target.value) } : prev))}
                disabled={rescheduleBusy}
                inputProps={{ min: 15, step: 15 }}
              />
              <Divider />
              <Stack spacing={0.5}>
                <Typography variant="body2" fontWeight={600}>Sessão atual</Typography>
                <Typography variant="body2" color="text.secondary">
                  {new Date(reschedule.session.start_at).toLocaleString('pt-PT', { day: '2-digit', month: 'long', hour: '2-digit', minute: '2-digit' })}
                </Typography>
                {reschedule.session.location && (
                  <Typography variant="caption" color="text.secondary">Local: {reschedule.session.location}</Typography>
                )}
              </Stack>
            </>
          )}
          {rescheduleError && <Alert severity="error">{rescheduleError}</Alert>}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setReschedule(null)} disabled={rescheduleBusy}>Cancelar</Button>
          <Button variant="contained" onClick={saveReschedule} disabled={rescheduleBusy}>
            {rescheduleBusy ? 'A reagendar…' : 'Guardar'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
