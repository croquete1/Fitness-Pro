'use client';
import * as React from 'react';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Switch from '@mui/material/Switch';
import IconButton from '@mui/material/IconButton';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';

type Quote = { id: string; text: string; author?: string | null; active?: boolean };

export default function MotivationAdminCard() {
  const [items, setItems] = React.useState<Quote[]>([]);
  const [text, setText] = React.useState('');
  const [author, setAuthor] = React.useState('');
  const [busy, setBusy] = React.useState(false);

  async function load() {
    const r = await fetch('/api/motivation');
    const j = await r.json().catch(() => ({}));
    setItems(j.items || []);
  }
  React.useEffect(() => { load(); }, []);

  async function add() {
    if (!text.trim()) return;
    setBusy(true);
    try {
      await fetch('/api/motivation', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ text, author }) });
      setText(''); setAuthor(''); load();
    } finally { setBusy(false); }
  }

  async function toggleActive(q: Quote) {
    await fetch(`/api/motivation/${q.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ active: !q.active }) });
    load();
  }
  async function remove(id: string) {
    await fetch(`/api/motivation/${id}`, { method: 'DELETE' });
    load();
  }

  return (
    <Paper variant="outlined" sx={{ p: 2, borderRadius: 3 }}>
      <Typography variant="subtitle2" fontWeight={800} sx={{ mb: 1 }}>Frases motivadoras</Typography>

      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} sx={{ mb: 1 }}>
        <TextField size="small" label="Frase" value={text} onChange={(e) => setText(e.target.value)} fullWidth />
        <TextField size="small" label="Autor" value={author} onChange={(e) => setAuthor(e.target.value)} sx={{ minWidth: 160 }} />
        <Button variant="contained" onClick={add} disabled={busy}>Adicionar</Button>
      </Stack>

      <Stack spacing={1}>
        {items.map((q) => (
          <Paper key={q.id} variant="outlined" sx={{ p: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
            <Switch checked={!!q.active} onChange={() => toggleActive(q)} />
            <Typography sx={{ flex: 1 }}>{q.text} {q.author ? <em style={{ opacity: .7 }}>— {q.author}</em> : null}</Typography>
            <IconButton aria-label="remover" onClick={() => remove(q.id)}><DeleteOutlineIcon /></IconButton>
          </Paper>
        ))}
        {items.length === 0 && (
          <Typography variant="body2" color="text.secondary">Sem frases registadas.</Typography>
        )}
      </Stack>
    </Paper>
  );
}
