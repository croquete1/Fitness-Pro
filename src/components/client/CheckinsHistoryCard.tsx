'use client';
import * as React from 'react';
import {
  Card, CardContent, CardActions, Button, Typography, Stack, Chip,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField, Slider
} from '@mui/material';
import { toast } from '@/components/ui/Toaster';

type Item = {
  date: string;
  answer?: 'ok'|'difficult'|null;
  energy?: number|null;
  sleep?: number|null;
  soreness?: number|null;
  note?: string|null;
};

function lastNDays(n = 14) {
  const out: string[] = [];
  const d = new Date();
  for (let i=n-1; i>=0; i--) {
    const x = new Date(d); x.setDate(x.getDate()-i);
    out.push(x.toISOString().slice(0,10));
  }
  return out;
}

export default function CheckinsHistoryCard() {
  const [items, setItems] = React.useState<Item[]>([]);
  const [loading, setLoading] = React.useState(true);

  // dialog notas (para o dia de hoje)
  const [open, setOpen] = React.useState(false);
  const [energy, setEnergy] = React.useState(3);
  const [sleep, setSleep] = React.useState(3);
  const [soreness, setSoreness] = React.useState(2);
  const [note, setNote] = React.useState('');

  async function load() {
    setLoading(true);
    try {
      const dates = lastNDays(14);
      const from = dates[0], to = dates[dates.length-1];
      const res = await fetch(`/api/clients/checkin?from=${from}&to=${to}`, { cache: 'no-store' });
      const j = res.ok ? await res.json() : { items: [] };
      const byDate = new Map<string, Item>();
      (j.items ?? []).forEach((it: any) => byDate.set(it.date, it));
      const merged = dates.map(d => byDate.get(d) ?? { date: d });
      setItems(merged);
    } catch { setItems([]); }
    setLoading(false);
  }

  React.useEffect(() => { load(); }, []);

  const ok = items.filter(i => i.answer === 'ok').length;
  const diff = items.filter(i => i.answer === 'difficult').length;

  // mini gráfico: barras de energia (1..5)
  const barW = 12, gap = 4;
  const maxH = 40;
  const bars = items.map(i => Math.max(0, Math.min(5, Number(i.energy ?? 0))));
  const svgW = items.length * (barW + gap) + gap;
  const svgH = maxH + 2;

  async function saveNotes() {
    try {
      const res = await fetch('/api/clients/checkin', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ energy, sleep, soreness, note })
      });
      if (!res.ok) throw new Error(await res.text());
      toast('Notas guardadas 💾', 1800, 'success');
      setOpen(false); setNote('');
      load();
    } catch {
      toast('Falhou guardar notas', 2200, 'error');
    }
  }

  const today = items[items.length - 1];

  return (
    <Card variant="outlined" sx={{ height: '100%' }}>
      <CardContent>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Typography variant="subtitle2" sx={{ opacity:.7 }}>Histórico (14 dias) 📈</Typography>
          <Stack direction="row" gap={1}>
            <Chip size="small" label={`✅ ${ok}`} color="success" />
            <Chip size="small" label={`⚠️ ${diff}`} color="warning" />
          </Stack>
        </Stack>

        {/* mini gráfico de energia */}
        <svg width={svgW} height={svgH} style={{ display:'block', marginTop: 8 }}>
          {bars.map((v, i) => {
            const h = (v/5) * maxH;
            const x = gap + i*(barW+gap);
            const y = svgH - h - 1;
            const fill = v >= 4 ? '#2e7d32' : v >= 3 ? '#1976d2' : v >= 2 ? '#ed6c02' : '#d32f2f';
            return <rect key={i} x={x} y={y} width={barW} height={h} rx={3} ry={3} fill={fill} />;
          })}
        </svg>

        <Typography variant="caption" sx={{ opacity:.7, display:'block', mt: .5 }}>
          🔋 energia diária (1–5). Também guardamos 💤 sono e 🤕 dor.
        </Typography>
      </CardContent>

      <CardActions sx={{ px:2, pb:2 }}>
        <Button onClick={()=>setOpen(true)}>➕ Notas de hoje</Button>
        {today?.note && <Typography variant="caption" sx={{ opacity:.8 }}>📝 {today.note}</Typography>}
      </CardActions>

      {/* Dialog de notas do dia */}
      <Dialog open={open} onClose={()=>setOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>➕ Notas de hoje</DialogTitle>
        <DialogContent dividers sx={{ display:'grid', gap:2 }}>
          <Typography variant="body2">🔋 Energia</Typography>
          <Slider min={1} max={5} step={1} value={energy} onChange={(_,v)=>setEnergy(v as number)} marks />
          <Typography variant="body2">💤 Sono</Typography>
          <Slider min={1} max={5} step={1} value={sleep} onChange={(_,v)=>setSleep(v as number)} marks />
          <Typography variant="body2">🤕 Dor</Typography>
          <Slider min={1} max={5} step={1} value={soreness} onChange={(_,v)=>setSoreness(v as number)} marks />
          <TextField label="📝 Observações" value={note} onChange={(e)=>setNote(e.target.value)} multiline minRows={2} />
        </DialogContent>
        <DialogActions>
          <Button onClick={()=>setOpen(false)}>❌ Cancelar</Button>
          <Button variant="contained" onClick={saveNotes}>💾 Guardar</Button>
        </DialogActions>
      </Dialog>
    </Card>
  );
}
