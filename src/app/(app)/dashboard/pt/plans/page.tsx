'use client';

import * as React from 'react';
import {
  Box, Button, Card, CardContent, Chip, Container, Grid, Stack, Typography, Paper
} from '@mui/material';
import { toast } from '@/components/ui/Toaster';
import { addDays, startOfWeek } from 'date-fns';

type Sess = {
  id: string;
  title: string | null;
  kind: string | null;          // 'presencial' | 'online' | etc.
  start_at: string;             // ISO
  order_index: number;          // ordenação estável no dia
  client_id: string | null;
};

const API = '/api/pt/plans'; // ✅ plural

function ymd(d: Date) { return d.toISOString().slice(0,10); }
function dayKeyFromISO(iso: string) { return iso.slice(0,10); }

export default function PlansBoardPage() {
  const [start, setStart] = React.useState<Date>(startOfWeek(new Date(), { weekStartsOn: 1 }));
  const [weeks, setWeeks] = React.useState(2);
  const [map, setMap] = React.useState<Record<string, Sess[]>>({});
  const [loading, setLoading] = React.useState(true);

  const days: Date[] = [];
  for (let w = 0; w < weeks; w++) for (let d = 0; d < 7; d++) days.push(addDays(start, w*7 + d));

  async function load() {
    setLoading(true);
    try {
      const from = ymd(days[0]) + 'T00:00:00.000Z';
      const to   = ymd(days[days.length-1]) + 'T23:59:59.999Z';
      const r = await fetch(`${API}?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`, { cache: 'no-store' });
      const j = r.ok ? await r.json() : { items: [] };
      const items: Sess[] =
        Array.isArray(j.items) ? j.items :
        Array.isArray(j.data) ? j.data :
        Array.isArray(j.sessions) ? j.sessions : [];

      const by: Record<string, Sess[]> = {};
      for (const d of days) by[ymd(d)] = [];
      items.forEach((s) => { (by[dayKeyFromISO(s.start_at)] ||= []).push(s); });

      Object.keys(by).forEach(k =>
        by[k].sort((a,b) => (a.order_index - b.order_index) || a.start_at.localeCompare(b.start_at))
      );

      setMap(by);
    } catch {
      setMap({});
    }
    setLoading(false);
  }
  React.useEffect(() => { load(); /* eslint-disable-next-line */ }, [start, weeks]);

  // ------- Drag & Drop -------
  const drag = React.useRef<{ day: string; index: number } | null>(null);
  function onDragStart(day: string, index: number) { return () => { drag.current = { day, index }; }; }
  function onDragOver(e: React.DragEvent) { e.preventDefault(); }

  async function reorderSameDay(list: Sess[]) {
    const ids = list.map(s => s.id);
    const r = await fetch(API, { method:'PATCH', headers:{'content-type':'application/json'}, body: JSON.stringify({ ids }) });
    if (r.ok) toast('Ordem atualizada ↕️', 1200, 'success'); else toast('Falha a ordenar', 1600, 'error');
  }

  async function moveToDay(targetDay: string, list: Sess[]) {
    const moves = list.map((s, i) => ({ id: s.id, date: targetDay, order_index: i }));
    const r = await fetch(API, { method:'PATCH', headers:{'content-type':'application/json'}, body: JSON.stringify({ moves }) });
    if (r.ok) toast('Movido ⇄', 1200, 'success'); else toast('Falha ao mover', 1600, 'error');
  }

  function onDrop(targetDay: string, targetIndex: number) {
    return async (e: React.DragEvent) => {
      e.preventDefault();
      const src = drag.current; drag.current = null;
      if (!src) return;

      setMap(prev => {
        const clone: Record<string, Sess[]> = Object.fromEntries(Object.entries(prev).map(([k,v]) => [k, v.slice()]));
        const item = clone[src.day].splice(src.index, 1)[0];
        if (!item) return prev;

        (clone[targetDay] ||= []).splice(targetIndex, 0, item);

        if (src.day === targetDay) {
          clone[targetDay] = clone[targetDay].map((s, i) => ({ ...s, order_index: i }));
          reorderSameDay(clone[targetDay]);
          return clone;
        }

        moveToDay(targetDay, clone[targetDay]);
        return clone;
      });
    };
  }

  return (
    <Container maxWidth={false} sx={{ display:'grid', gap:2, px: { xs: 2, md: 3 }, width: '100%' }}>
      <Stack direction="row" alignItems="center" justifyContent="space-between">
        <Typography variant="h5" fontWeight={800}>📅 Planeador (semanas ➜ dias)</Typography>
        <Stack direction="row" gap={1}>
          <Button onClick={() => setStart(addDays(start, -7))}>◀ Semana anterior</Button>
          <Button onClick={() => setStart(startOfWeek(new Date(), { weekStartsOn:1 }))}>Hoje</Button>
          <Button onClick={() => setStart(addDays(start, 7))}>Semana seguinte ▶</Button>
          <Button onClick={() => setWeeks(w => (w === 2 ? 3 : 2))}>{weeks === 2 ? 'Mostrar 3 semanas' : 'Mostrar 2 semanas'}</Button>
        </Stack>
      </Stack>

      <Grid container spacing={2}>
        {days.map((d) => {
          const key = ymd(d);
          const list = map[key] || [];
          const dow = d.toLocaleDateString(undefined, { weekday: 'short' });
          const label = `${dow} ${d.getDate().toString().padStart(2,'0')}/${(d.getMonth()+1).toString().padStart(2,'0')}`;

          return (
            <Grid item xs={12} sm={6} md={3} lg={3} key={key}>
              <Paper variant="outlined" sx={{ p:1.25, borderRadius:3, minHeight: 280, display:'grid', gap:1 }}>
                <Stack direction="row" alignItems="center" justifyContent="space-between">
                  <Typography fontWeight={700}>{label}</Typography>
                  <Chip size="small" label={list.length} />
                </Stack>

                <Box
                  onDragOver={onDragOver}
                  onDrop={onDrop(key, list.length)}
                  sx={{ display:'grid', gap:1, minHeight: 220 }}
                >
                  {list.map((s, i) => {
                    const t = new Date(s.start_at).toLocaleTimeString([], { hour:'2-digit', minute:'2-digit' });
                    return (
                      <Card
                        key={s.id}
                        variant="outlined"
                        draggable
                        onDragStart={onDragStart(key, i)}
                        onDragOver={onDragOver}
                        onDrop={onDrop(key, i)}
                        sx={{ cursor:'grab' }}
                      >
                        <CardContent sx={{ py: 1.25 }}>
                          <Typography fontWeight={700} sx={{ display:'flex', alignItems:'center', gap:1 }}>
                            ↕️ {s.title ?? 'Sessão'} <Chip size="small" label={s.kind ?? '—'} />
                          </Typography>
                          <Typography variant="body2" sx={{ opacity:.8 }}>{t}</Typography>
                          {s.client_id && <Typography variant="caption" sx={{ opacity:.6 }}>Cliente: {s.client_id.slice(0,6)}…</Typography>}
                        </CardContent>
                      </Card>
                    );
                  })}
                  {!loading && list.length === 0 && (
                    <Box sx={{ opacity:.6, fontSize: 12, textAlign:'center', py: 2 }}>Solta aqui para mover ⇄</Box>
                  )}
                </Box>
              </Paper>
            </Grid>
          );
        })}
      </Grid>
    </Container>
  );
}
