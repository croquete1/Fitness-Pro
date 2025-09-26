'use client';

import * as React from 'react';
import { Paper, Stack, Typography, Divider, Chip } from '@mui/material';

type Item = { date: string; energy: number; soreness: number; note?: string | null };

function toXY(values: number[], width = 220, height = 52, pad = 6) {
  if (values.length === 0) return '';
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = Math.max(1, max - min);
  const stepX = (width - pad * 2) / Math.max(1, values.length - 1);
  const scaleY = (height - pad * 2) / span;

  return values
    .map((v, i) => {
      const x = pad + i * stepX;
      const y = height - pad - (v - min) * scaleY;
      return `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(' ');
}

export default function ClientCheckinHistoryCard() {
  const [items, setItems] = React.useState<Item[] | null>(null);

  React.useEffect(() => {
    let cancel = false;
    (async () => {
      try {
        const r = await fetch('/api/client/checkins', { credentials: 'include' });
        if (!r.ok) throw new Error('HTTP ' + r.status);
        const j = await r.json();
        if (!cancel) setItems(Array.isArray(j.items) ? j.items : []);
      } catch {
        if (!cancel) setItems([]);
      }
    })();
    return () => { cancel = true; };
  }, []);

  const energy = (items ?? []).map(x => Number(x.energy || 0)).reverse();   // antigo → recente (para desenho)
  const sore   = (items ?? []).map(x => Number(x.soreness || 0)).reverse();

  return (
    <Paper elevation={0} sx={{ p: 2, border: 1, borderColor: 'divider', borderRadius: 2, bgcolor: 'background.paper' }}>
      <Stack spacing={1}>
        <Typography variant="subtitle1" fontWeight={800}>Histórico de check-ins</Typography>
        <Typography variant="caption" color="text.secondary">
          Últimos registos de energia e dor/rigidez. (máx 30)
        </Typography>
        <Divider />
        {items === null && <Typography variant="body2" color="text.secondary">A carregar…</Typography>}
        {items && items.length === 0 && <Typography variant="body2" color="text.secondary">Sem registos ainda. ✍️</Typography>}

        {items && items.length > 0 && (
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <SparkBlock label="⚡ Energia" data={energy} />
            <SparkBlock label="🧱 Dor" data={sore} />
          </Stack>
        )}
      </Stack>
    </Paper>
  );
}

function SparkBlock({ label, data }: { label: string; data: number[] }) {
  const path = toXY(data);
  const min = Math.min(...data), max = Math.max(...data);
  const last = data[data.length - 1];

  return (
    <Stack spacing={1} sx={{ minWidth: 240 }}>
      <Stack direction="row" alignItems="center" spacing={1}>
        <Typography variant="body2" fontWeight={700}>{label}</Typography>
        <Chip size="small" label={`último: ${last}`} />
        <Chip size="small" label={`min: ${min}`} />
        <Chip size="small" label={`max: ${max}`} />
      </Stack>
      <svg width="100%" height="56" viewBox="0 0 232 56" role="img" aria-label={`${label} sparkline`}>
        <path d={path} fill="none" stroke="currentColor" strokeOpacity={0.14} strokeWidth="8" />
        <path d={path} fill="none" stroke="currentColor" strokeWidth="2" />
      </svg>
    </Stack>
  );
}
