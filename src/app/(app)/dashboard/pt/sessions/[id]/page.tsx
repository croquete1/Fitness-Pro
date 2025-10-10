'use client';

import * as React from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  Box, Button, Card, CardContent, Container, IconButton, List, ListItem, ListItemIcon, ListItemText,
  MenuItem, Stack, TextField, Typography, Tooltip,
} from '@mui/material';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import DeleteIcon from '@mui/icons-material/Delete';
import { toast } from '@/components/ui/Toaster';

type Sess = {
  id: string;
  title: string | null;
  kind: string | null;
  start_at: string;
  end_at: string | null;
  exercises: string[] | null;
  client_id: string | null;
};

export default function EditSessionPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [item, setItem] = React.useState<Sess | null>(null);
  const [loading, setLoading] = React.useState(true);

  const [title, setTitle] = React.useState('');
  const [kind, setKind] = React.useState('presencial');
  const [startAt, setStartAt] = React.useState('');
  const [endAt, setEndAt] = React.useState('');
  const [exercises, setExercises] = React.useState<string[]>([]);
  const [newEx, setNewEx] = React.useState('');
  const [clients, setClients] = React.useState<{ id: string; full_name: string | null }[]>([]);
  const [clientId, setClientId] = React.useState('');

  React.useEffect(() => {
    (async () => {
      try {
        const r = await fetch(`/api/pt/sessions/${id}`, { cache: 'no-store' });
        const j = await r.json();
        const s: Sess = j.item;
        setItem(s);
        setTitle(s.title ?? '');
        setKind(s.kind ?? 'presencial');
        setStartAt(s.start_at?.slice(0,16) ?? '');
        setEndAt(s.end_at ? s.end_at.slice(0,16) : '');
        setExercises(Array.isArray(s.exercises) ? s.exercises : []);
        setClientId(s.client_id ?? '');
      } catch {}
      setLoading(false);
    })();
  }, [id]);

  React.useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/pt/clients', { cache: 'no-store' });
        const json = res.ok ? await res.json() : { items: [] };
        setClients(Array.isArray(json.items) ? json.items : []);
      } catch {
        setClients([]);
      }
    })();
  }, []);

  async function save() {
    try {
      const payload = {
        title, kind,
        start_at: startAt ? new Date(startAt).toISOString() : null,
        end_at: endAt ? new Date(endAt).toISOString() : null,
        exercises,
        client_id: clientId || null,
      };
      const r = await fetch(`/api/pt/sessions/${id}`, { method: 'PATCH', headers: { 'content-type':'application/json' }, body: JSON.stringify(payload) });
      if (!r.ok) throw new Error(await r.text());
      toast('Sessão guardada 💾', 1500, 'success');
      router.push('/dashboard/pt/sessions');
    } catch { toast('Falha ao guardar', 1800, 'error'); }
  }

  async function remove() {
    if (!confirm('Apagar sessão?')) return;
    try {
      const r = await fetch(`/api/pt/sessions/${id}`, { method: 'DELETE' });
      if (!r.ok) throw new Error(await r.text());
      toast('Sessão apagada 🗑️', 1500, 'success');
      router.push('/dashboard/pt/sessions');
    } catch { toast('Falha ao apagar', 1800, 'error'); }
  }

  // ------ Drag & Drop exercícios (HTML5) ------
  const dragIndex = React.useRef<number | null>(null);
  function onDragStart(i: number) { return () => { dragIndex.current = i; }; }
  function onDragOver(e: React.DragEvent) { e.preventDefault(); }
  function onDrop(i: number) {
    return (e: React.DragEvent) => {
      e.preventDefault();
      const from = dragIndex.current;
      if (from == null || from === i) return;
      setExercises(arr => {
        const next = arr.slice();
        const [m] = next.splice(from, 1);
        next.splice(i, 0, m);
        return next;
      });
      dragIndex.current = null;
    };
  }

  function addExercise() {
    const v = newEx.trim();
    if (!v) return;
    setExercises(e => [...e, v]);
    setNewEx('');
  }
  function delExercise(i: number) {
    setExercises(e => e.filter((_, idx) => idx !== i));
  }

  if (loading || !item) return <Container maxWidth="md"><Typography>Carregando…</Typography></Container>;

  return (
    <Container maxWidth="md" sx={{ display:'grid', gap:2 }}>
      <Stack direction="row" alignItems="center" justifyContent="space-between">
        <Typography variant="h5" fontWeight={800}>✏️ Editar sessão</Typography>
        <Stack direction="row" gap={1}>
          <Button onClick={() => router.back()}>❌ Cancelar</Button>
          <Button color="error" onClick={remove}>🗑️ Apagar</Button>
          <Button variant="contained" onClick={save}>💾 Guardar</Button>
        </Stack>
      </Stack>

      <Card variant="outlined">
        <CardContent>
          <Stack gap={2}>
            <TextField label="Título" value={title} onChange={(e)=>setTitle(e.target.value)} />
            <TextField select label="Tipo" value={kind} onChange={(e)=>setKind(e.target.value)}>
              <MenuItem value="presencial">Presencial</MenuItem>
              <MenuItem value="online">Online</MenuItem>
              <MenuItem value="outro">Outro</MenuItem>
            </TextField>
            <TextField
              select
              label="Cliente"
              value={clientId}
              onChange={(e) => setClientId(e.target.value)}
              helperText="Escolhe o cliente associado a esta sessão"
            >
              <MenuItem value="">Sem cliente</MenuItem>
              {clients.map((c) => (
                <MenuItem key={c.id} value={c.id}>{c.full_name ?? c.id}</MenuItem>
              ))}
            </TextField>
            <Stack direction="row" gap={2}>
              <TextField
                label="Início"
                type="datetime-local"
                value={startAt}
                onChange={(e)=>setStartAt(e.target.value)}
                InputLabelProps={{ shrink: true }}
              />
              <TextField
                label="Fim"
                type="datetime-local"
                value={endAt}
                onChange={(e)=>setEndAt(e.target.value)}
                InputLabelProps={{ shrink: true }}
              />
            </Stack>

            <Box>
              <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 1 }}>↕️ Exercícios (arrasta para ordenar)</Typography>
              <Stack direction="row" gap={1} sx={{ mb: 1 }}>
                <TextField
                  label="Adicionar exercício"
                  value={newEx}
                  onChange={(e)=>setNewEx(e.target.value)}
                  onKeyDown={(e)=>{ if (e.key==='Enter') { e.preventDefault(); addExercise(); } }}
                  sx={{ minWidth: 320 }}
                />
                <Button onClick={addExercise}>➕ Adicionar</Button>
              </Stack>

              <List dense sx={{ border: '1px dashed', borderColor: 'divider', borderRadius: 2 }}>
                {exercises.length === 0 ? (
                  <Typography variant="caption" sx={{ p: 2, display:'block', opacity:.7 }}>
                    Sem exercícios. Adiciona alguns para esta sessão.
                  </Typography>
                ) : exercises.map((name, i) => (
                  <ListItem
                    key={`${name}-${i}`}
                    draggable
                    onDragStart={onDragStart(i)}
                    onDragOver={onDragOver}
                    onDrop={onDrop(i)}
                    sx={{ cursor:'grab' }}
                    secondaryAction={
                      <Tooltip title="Remover">
                        <IconButton edge="end" onClick={() => delExercise(i)}>
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    }
                  >
                    <ListItemIcon sx={{ minWidth: 28 }}><DragIndicatorIcon fontSize="small" /></ListItemIcon>
                    <ListItemText primary={name} />
                  </ListItem>
                ))}
              </List>
            </Box>
          </Stack>
        </CardContent>
      </Card>
    </Container>
  );
}
