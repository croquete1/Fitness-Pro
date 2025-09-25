'use client';

import * as React from 'react';
import { addDays, startOfWeek, endOfWeek, formatISO } from 'date-fns';
import { Box, Button, Card, CardContent, Container, Stack, Table, TableBody, TableCell, TableHead, TableRow, TextField, Typography } from '@mui/material';
import { toast } from '@/components/ui/Toaster';

type Sess = {
  id: string;
  client_id: string | null;
  title: string | null;
  kind: string | null;           // ex.: 'presencial' | 'online'
  start_at: string;              // ISO
  end_at: string | null;         // ISO
};

function weekRange(from?: string) {
  const base = from ? new Date(from) : new Date();
  const s = startOfWeek(base, { weekStartsOn: 1 }); // segunda
  const e = endOfWeek(base, { weekStartsOn: 1 });
  return { start: s, end: e };
}

// ✅ parâmetro opcional no fim
function move(range: 'week' | 'month', dir: -1 | 1, from?: string) {
  const base = from ? new Date(from) : new Date();
  if (range === 'month') {
    const d = new Date(base); d.setMonth(d.getMonth() + dir); d.setDate(1);
    return d.toISOString();
  }
  const d = new Date(base); d.setDate(d.getDate() + (7 * dir));
  return d.toISOString();
}

export default function TrainerSessionsPage() {
  const [cursor, setCursor] = React.useState<string>(new Date().toISOString());
  const [rows, setRows] = React.useState<Sess[]>([]);
  const [loading, setLoading] = React.useState(true);

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
    } catch {
      setRows([]);
    }
    setLoading(false);
  }

  React.useEffect(() => { load(); }, [cursor]); // eslint-disable-line

  // criação rápida (PT marca sessão)
  async function createQuick(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const start = String(f.get('start') || '');
    const title = String(f.get('title') || '');
    const kind = String(f.get('kind') || 'presencial');
    if (!start) return toast('Indica data/hora', 2000, 'warning');

    try {
      const res = await fetch('/api/pt/sessions', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ start, durationMin: 60, title, kind }),
      });
      if (!res.ok) throw new Error(await res.text());
      toast('Sessão criada 🗓️', 1800, 'success');
      (e.target as HTMLFormElement).reset();
      load();
    } catch {
      toast('Falha ao criar sessão', 2000, 'error');
    }
  }

  return (
    <Container maxWidth="lg" sx={{ display: 'grid', gap: 2 }}>
      <Stack direction="row" alignItems="center" justifyContent="space-between">
        <Typography variant="h5" fontWeight={800}>🗓️ Agenda do PT (semana)</Typography>
        <Stack direction="row" gap={1}>
          <Button onClick={() => setCursor(move('week', -1, cursor))}>◀ Semana anterior</Button>
          <Button onClick={() => setCursor(new Date().toISOString())}>Hoje</Button>
          <Button onClick={() => setCursor(move('week', 1, cursor))}>Semana seguinte ▶</Button>
        </Stack>
      </Stack>

      <Card variant="outlined">
        <CardContent>
          <Stack direction="row" gap={1} component="form" onSubmit={createQuick}>
            <TextField
              name="start"
              type="datetime-local"
              label="Início"
              InputLabelProps={{ shrink: true }}
              required
            />
            <TextField name="title" label="Título (opcional)" placeholder="Sessão com cliente" sx={{ minWidth: 260 }} />
            <TextField name="kind" label="Tipo" defaultValue="presencial" />
            <Button type="submit" variant="contained">➕ Criar</Button>
          </Stack>
        </CardContent>
      </Card>

      <Box sx={{ borderRadius: 3, bgcolor: 'background.paper', border: '1px solid', borderColor: 'divider', overflow: 'hidden' }}>
        <Table size="small">
          <TableHead sx={{ bgcolor: 'action.hover' }}>
            <TableRow>
              <TableCell>Data</TableCell>
              <TableCell>Hora</TableCell>
              <TableCell>Título</TableCell>
              <TableCell>Tipo</TableCell>
              <TableCell>Cliente</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={5} align="center" sx={{ py: 4 }}>A carregar…</TableCell></TableRow>
            ) : rows.length === 0 ? (
              <TableRow><TableCell colSpan={5} align="center" sx={{ py: 4, opacity: .7 }}>Sem sessões nesta semana.</TableCell></TableRow>
            ) : rows.map(s => {
              const d = new Date(s.start_at);
              const date = d.toLocaleDateString();
              const time = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
              const cliente = s.client_id ? s.client_id.slice(0, 6) + '…' : '—';
              return (
                <TableRow key={s.id} hover>
                  <TableCell>{date}</TableCell>
                  <TableCell>{time}</TableCell>
                  <TableCell>{s.title ?? 'Sessão'}</TableCell>
                  <TableCell>{s.kind ?? '—'}</TableCell>
                  <TableCell>{cliente}</TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </Box>
    </Container>
  );
}
