'use client';

import * as React from 'react';
import { Box, Button, Chip, Container, Stack, Table, TableBody, TableCell, TableHead, TableRow, TextField, Typography, Alert } from '@mui/material';
import { toast } from '@/components/ui/Toaster';

type Noti = { id: string; title: string; body?: string|null; user_id?: string|null; active: boolean; created_at: string };

export default function AdminNotificationsPage() {
  const [items, setItems] = React.useState<Noti[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [err, setErr] = React.useState<string | null>(null);

  // form
  const [title, setTitle] = React.useState('');
  const [body, setBody] = React.useState('');

  async function load() {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/notifications', { cache: 'no-store' });
      const j = res.ok ? await res.json() : { items: [] };
      setItems(Array.isArray(j.items) ? j.items : []);
    } catch { setItems([]); }
    setLoading(false);
  }

  React.useEffect(() => { load(); }, []);

  async function create() {
    setErr(null);
    try {
      const res = await fetch('/api/admin/notifications', { method:'POST', headers:{'content-type':'application/json'}, body: JSON.stringify({ title, body }) });
      if (!res.ok) throw new Error(await res.text());
      setTitle(''); setBody(''); toast('Notificação criada ✅', 2000, 'success'); load();
    } catch (e:any) {
      toast('Falha ao criar', 2500, 'error'); setErr(e.message || 'Falha ao criar');
    }
  }

  async function toggle(id: string, active: boolean) {
    try {
      const res = await fetch(`/api/admin/notifications/${id}`, { method:'PATCH', headers:{'content-type':'application/json'}, body: JSON.stringify({ active: !active }) });
      if (!res.ok) throw new Error(await res.text());
      toast('Atualizado 💾', 1500, 'success'); load();
    } catch { toast('Falha ao atualizar', 2000, 'error'); }
  }

  async function del(id: string) {
    if (!confirm('Apagar notificação?')) return;
    try {
      const res = await fetch(`/api/admin/notifications/${id}`, { method:'DELETE' });
      if (!res.ok) throw new Error(await res.text());
      toast('Notificação apagada 🗑️', 2000, 'success'); load();
    } catch { toast('Falha ao apagar', 2000, 'error'); }
  }

  return (
    <Container maxWidth="md" sx={{ display:'grid', gap:2 }}>
      <Typography variant="h5" fontWeight={800}>🔔 Notificações</Typography>

      <Box sx={{ p:2, borderRadius:3, bgcolor:'background.paper', border:'1px solid', borderColor:'divider', display:'grid', gap:1 }}>
        {err && <Alert severity="error">{err}</Alert>}
        <TextField label="Título" value={title} onChange={(e)=>setTitle(e.target.value)} required />
        <TextField label="Corpo (opcional)" value={body} onChange={(e)=>setBody(e.target.value)} multiline minRows={2} />
        <Stack direction="row" gap={1} justifyContent="flex-end">
          <Button onClick={()=>{ setTitle(''); setBody(''); }}>❌ Limpar</Button>
          <Button variant="contained" onClick={create} disabled={!title.trim()}>➕ Criar</Button>
        </Stack>
      </Box>

      <Box sx={{ borderRadius:3, bgcolor:'background.paper', border:'1px solid', borderColor:'divider', overflow:'hidden' }}>
        <Table size="small">
          <TableHead sx={{ bgcolor:'action.hover' }}>
            <TableRow>
              <TableCell>Título</TableCell>
              <TableCell>Estado</TableCell>
              <TableCell>Criado</TableCell>
              <TableCell align="right">Ações</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={4} align="center" sx={{ py:4 }}>A carregar…</TableCell></TableRow>
            ) : items.length === 0 ? (
              <TableRow><TableCell colSpan={4} align="center" sx={{ py:4, opacity:.7 }}>Sem notificações.</TableCell></TableRow>
            ) : items.map(n => (
              <TableRow key={n.id} hover>
                <TableCell>
                  <strong>{n.title}</strong>
                  {n.body ? <div style={{opacity:.75, fontSize:12}}>{n.body}</div> : null}
                </TableCell>
                <TableCell>
                  <Chip size="small" label={n.active ? 'Ativa' : 'Inativa'} color={n.active ? 'success' : 'default'} />
                </TableCell>
                <TableCell>{new Date(n.created_at).toLocaleString()}</TableCell>
                <TableCell align="right">
                  <Stack direction="row" gap={1} justifyContent="flex-end">
                    <Button size="small" onClick={()=>toggle(n.id, n.active)}>{n.active ? '⏸️ Desativar' : '▶️ Ativar'}</Button>
                    <Button size="small" color="error" onClick={()=>del(n.id)}>🗑️ Apagar</Button>
                  </Stack>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Box>
    </Container>
  );
}
