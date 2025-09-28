'use client';

import * as React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import Chip from '@mui/material/Chip';
import { useRouter } from 'next/navigation';

export default function Editor({ initial }: { initial: any }) {
  const router = useRouter();
  const [title, setTitle] = React.useState(initial.title ?? '');
  const [status, setStatus] = React.useState(initial.status ?? 'ATIVO');
  const [start, setStart] = React.useState(initial.start_date ? String(initial.start_date).substring(0,10) : '');
  const [end, setEnd] = React.useState(initial.end_date ? String(initial.end_date).substring(0,10) : '');
  const [busy, setBusy] = React.useState(false);

  async function save() {
    setBusy(true);
    try {
      await fetch(`/api/pt/plans/${initial.id}`, {
        method:'PATCH',
        headers:{ 'Content-Type':'application/json' },
        body: JSON.stringify({ title, status, start_date: start || null, end_date: end || null }),
      });
      router.refresh();
    } finally { setBusy(false); }
  }
  async function remove() {
    if (!confirm('Eliminar plano?')) return;
    setBusy(true);
    try {
      await fetch(`/api/pt/plans/${initial.id}`, { method:'DELETE' });
      router.push('/dashboard/pt/plans');
    } finally { setBusy(false); }
  }

  return (
    <Box sx={{ p: 2, display: 'grid', gap: 1.5, maxWidth: 640 }}>
      <Typography variant="h5" fontWeight={800}>Editar plano</Typography>
      <Paper variant="outlined" sx={{ p: 2, borderRadius: 3, display:'grid', gap: 1 }}>
        <TextField label="Título" value={title} onChange={(e)=>setTitle(e.target.value)} />
        <Box sx={{ display:'grid', gap: 1, gridTemplateColumns:'repeat(auto-fit,minmax(160px,1fr))' }}>
          <TextField label="Início" type="date" value={start} onChange={(e)=>setStart(e.target.value)} InputLabelProps={{ shrink: true }} />
          <TextField label="Fim" type="date" value={end} onChange={(e)=>setEnd(e.target.value)} InputLabelProps={{ shrink: true }} />
        </Box>
        <Box sx={{ display:'flex', gap:1, alignItems:'center' }}>
          <span>Estado:</span>
          <Chip label={status} color={status==='ATIVO'?'success':'default'} />
          <Button size="small" variant="outlined" onClick={()=>setStatus(status==='ATIVO'?'PAUSADO':'ATIVO')}>
            Alternar
          </Button>
        </Box>
        <Box sx={{ display:'flex', gap:1, justifyContent:'space-between' }}>
          <Button color="error" onClick={remove} disabled={busy} variant="outlined">Eliminar</Button>
          <Box sx={{ display:'flex', gap:1 }}>
            <Button onClick={()=>history.back()} variant="text">Cancelar</Button>
            <Button onClick={save} disabled={busy || !title} variant="contained">Guardar</Button>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
}
