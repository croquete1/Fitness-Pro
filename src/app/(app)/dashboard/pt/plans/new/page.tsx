'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import Autocomplete from '@mui/material/Autocomplete';
import { toast } from 'sonner';

type Opt = { id: string; label: string; email: string };

export default function NewPlanPage() {
  const router = useRouter();
  const [client, setClient] = React.useState<Opt | null>(null);
  const [query, setQuery] = React.useState('');
  const [opts, setOpts] = React.useState<Opt[]>([]);
  const [title, setTitle] = React.useState('');
  const [start, setStart] = React.useState('');
  const [end, setEnd] = React.useState('');
  const [busy, setBusy] = React.useState(false);

  React.useEffect(() => {
    let alive = true;
    (async () => {
      const res = await fetch('/api/pt/clients?q=' + encodeURIComponent(query));
      const json = await res.json();
      if (!alive) return;
      if (res.ok) setOpts(json.items ?? []);
    })();
    return () => { alive = false; };
  }, [query]);

  async function createPlan() {
    if (!client) return;
    setBusy(true);
    try {
      const res = await fetch('/api/pt/plans', {
        method:'POST',
        headers:{ 'Content-Type':'application/json' },
        body: JSON.stringify({ client_id: client.id, title, start_date: start || null, end_date: end || null }),
      });
      const json = await res.json();
      if (res.ok && json?.id) {
        toast.success('Plano criado');
        router.push(`/dashboard/pt/plans/${json.id}`);
      } else {
        toast.error(json?.error || 'Erro a criar plano');
      }
    } finally { setBusy(false); }
  }

  return (
    <Box sx={{ p: 2, display: 'grid', gap: 1.5, maxWidth: 560 }}>
      <Typography variant="h5" fontWeight={800}>Criar plano</Typography>
      <Paper variant="outlined" sx={{ p: 2, borderRadius: 3, display:'grid', gap: 1 }}>
        <Autocomplete
          options={opts}
          value={client}
          onChange={(_,v)=>setClient(v)}
          onInputChange={(_,v)=>setQuery(v)}
          getOptionLabel={(o)=>o?.label ?? ''}
          renderInput={(params)=><TextField {...params} label="Cliente" placeholder="Pesquisar por nome/email" />}
        />
        <TextField label="Título" value={title} onChange={(e)=>setTitle(e.target.value)} />
        <Box sx={{ display:'grid', gap: 1, gridTemplateColumns:'repeat(auto-fit,minmax(160px,1fr))' }}>
          <TextField label="Início" type="date" value={start} onChange={(e)=>setStart(e.target.value)} InputLabelProps={{ shrink: true }} />
          <TextField label="Fim" type="date" value={end} onChange={(e)=>setEnd(e.target.value)} InputLabelProps={{ shrink: true }} />
        </Box>
        <Box sx={{ display:'flex', gap:1, justifyContent:'flex-end' }}>
          <Button onClick={()=>router.back()} variant="text">Cancelar</Button>
          <Button onClick={createPlan} disabled={busy || !client || !title} variant="contained">Criar</Button>
        </Box>
      </Paper>
    </Box>
  );
}
