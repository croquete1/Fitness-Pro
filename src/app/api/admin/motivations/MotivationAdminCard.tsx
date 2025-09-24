'use client';

import * as React from 'react';
import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import CardContent from '@mui/material/CardContent';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Switch from '@mui/material/Switch';
import IconButton from '@mui/material/IconButton';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import Table from '@mui/material/Table';
import TableHead from '@mui/material/TableHead';
import TableBody from '@mui/material/TableBody';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import Stack from '@mui/material/Stack';
import { toast } from 'sonner';

type Row = { id: string; text: string; author: string | null; active: boolean; created_at?: string };

export default function MotivationAdminCard() {
  const [rows, setRows] = React.useState<Row[]>([]);
  const [text, setText] = React.useState('');
  const [author, setAuthor] = React.useState('');
  const [busy, setBusy] = React.useState(false);

  async function load() {
    const res = await fetch('/api/admin/motivations', { cache: 'no-store' });
    const json = await res.json();
    if (res.ok) setRows(json.items ?? []);
  }
  React.useEffect(() => { load(); }, []);

  async function add() {
    if (!text.trim()) return;
    setBusy(true);
    try {
      const res = await fetch('/api/admin/motivations', {
        method:'POST',
        headers:{ 'Content-Type':'application/json' },
        body: JSON.stringify({ text: text.trim(), author: author.trim() || null, active: true }),
      });
      if (res.ok) { setText(''); setAuthor(''); await load(); toast.success('Frase adicionada'); }
      else toast.error('Erro ao adicionar');
    } finally { setBusy(false); }
  }

  async function toggleActive(row: Row) {
    const res = await fetch('/api/admin/motivations/' + row.id, {
      method:'PATCH',
      headers:{ 'Content-Type':'application/json' },
      body: JSON.stringify({ active: !row.active }),
    });
    if (res.ok) { setRows(rs => rs.map(r => r.id===row.id ? { ...r, active: !r.active } : r)); }
  }

  async function remove(row: Row) {
    if (!confirm('Eliminar esta frase?')) return;
    const res = await fetch('/api/admin/motivations/' + row.id, { method:'DELETE' });
    if (res.ok) setRows(rs => rs.filter(r => r.id !== row.id));
  }

  return (
    <Card variant="outlined" sx={{ borderRadius: 3 }}>
      <CardHeader title="Frases motivadoras" subheader="Só o ADMIN pode gerir" />
      <CardContent sx={{ display:'grid', gap: 2 }}>
        <Stack direction="row" spacing={1} sx={{ alignItems:'center', flexWrap:'wrap' }}>
          <TextField label="Frase" value={text} onChange={e=>setText(e.target.value)} sx={{ minWidth: 320, flex: 1 }} />
          <TextField label="Autor (opcional)" value={author} onChange={e=>setAuthor(e.target.value)} sx={{ minWidth: 200 }} />
          <Button onClick={add} disabled={busy || !text.trim()} variant="contained">Adicionar</Button>
        </Stack>

        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Ativa</TableCell>
              <TableCell>Frase</TableCell>
              <TableCell>Autor</TableCell>
              <TableCell align="right">Ações</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map(r=>(
              <TableRow key={r.id}>
                <TableCell><Switch checked={!!r.active} onChange={()=>toggleActive(r)} /></TableCell>
                <TableCell>{r.text}</TableCell>
                <TableCell>{r.author ?? '—'}</TableCell>
                <TableCell align="right">
                  <IconButton onClick={()=>remove(r)} aria-label="Eliminar"><DeleteOutlineIcon /></IconButton>
                </TableCell>
              </TableRow>
            ))}
            {rows.length===0 && <TableRow><TableCell colSpan={4} align="center">Sem frases.</TableCell></TableRow>}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
