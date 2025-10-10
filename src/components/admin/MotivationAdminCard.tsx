'use client';
import * as React from 'react';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Switch from '@mui/material/Switch';
import IconButton from '@mui/material/IconButton';
import Chip from '@mui/material/Chip';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';

type Quote = { id: string; text: string; author?: string | null; active?: boolean };

const LOCAL_KEY = 'hms.admin.motivations';

function createId() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `quote-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function loadLocalQuotes(): Quote[] {
  if (typeof window === 'undefined') return [];
  try {
    const stored = window.localStorage.getItem(LOCAL_KEY);
    if (!stored) return [];
    const parsed = JSON.parse(stored);
    if (!Array.isArray(parsed)) return [];
    return parsed as Quote[];
  } catch {
    return [];
  }
}

function persistLocalQuotes(quotes: Quote[]) {
  try {
    window.localStorage.setItem(LOCAL_KEY, JSON.stringify(quotes));
  } catch {
    // ignore
  }
}

export default function MotivationAdminCard() {
  const [items, setItems] = React.useState<Quote[]>([]);
  const [text, setText] = React.useState('');
  const [author, setAuthor] = React.useState('');
  const [busy, setBusy] = React.useState(false);
  const [usingLocal, setUsingLocal] = React.useState(false);

  async function load() {
    try {
      const r = await fetch('/api/admin/motivations', { cache: 'no-store', credentials: 'same-origin' });
      if (r.status === 503) throw new Error('SUPABASE_UNCONFIGURED');
      const j = await r.json().catch(() => ({}));
      if (j?._supabaseConfigured === false || j?.error === 'SUPABASE_UNCONFIGURED') {
        setUsingLocal(true);
        setItems(loadLocalQuotes());
        return;
      }
      setUsingLocal(false);
      setItems(j.items || []);
    } catch (err: any) {
      if (err?.message === 'SUPABASE_UNCONFIGURED') {
        setUsingLocal(true);
        setItems(loadLocalQuotes());
      }
    }
  }
  React.useEffect(() => { load(); }, []);

  async function add() {
    if (!text.trim()) return;
    setBusy(true);
    try {
      if (usingLocal) {
        const next = [
          ...items,
          { id: createId(), text, author, active: true },
        ];
        setItems(next);
        persistLocalQuotes(next);
        setText('');
        setAuthor('');
        return;
      }
      await fetch('/api/admin/motivations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, author }),
        credentials: 'same-origin',
      });
      setText(''); setAuthor(''); load();
    } finally { setBusy(false); }
  }

  async function toggleActive(q: Quote) {
    if (usingLocal) {
      const next = items.map((item) => (item.id === q.id ? { ...item, active: !q.active } : item));
      setItems(next);
      persistLocalQuotes(next);
      return;
    }
    await fetch(`/api/admin/motivations/${q.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ active: !q.active }),
      credentials: 'same-origin',
    });
    load();
  }
  async function remove(id: string) {
    if (usingLocal) {
      const next = items.filter((item) => item.id !== id);
      setItems(next);
      persistLocalQuotes(next);
      return;
    }
    await fetch(`/api/admin/motivations/${id}`, { method: 'DELETE', credentials: 'same-origin' });
    load();
  }

  return (
    <Paper variant="outlined" sx={{ p: 2, borderRadius: 3 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
        <Typography variant="subtitle2" fontWeight={800}>Frases motivadoras</Typography>
        {usingLocal && <Chip label="Modo offline" color="warning" size="small" />}
      </Stack>

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
