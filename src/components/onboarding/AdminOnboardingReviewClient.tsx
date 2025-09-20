'use client';

import * as React from 'react';
import { Paper, Stack, Typography, TextField, MenuItem, Button, Divider, Chip } from '@mui/material';

type Form = any;
type Note = { id: string; visibility: 'private' | 'shared'; content: string; created_at: string; profiles?: { name?: string | null } | null };

export default function AdminOnboardingReviewClient({ form, notes }: { form: Form | null; notes: Note[] }) {
  const [visibility, setVisibility] = React.useState<'private' | 'shared'>('private');
  const [content, setContent] = React.useState('');

  async function addNote() {
    if (!form?.id || !content.trim()) return;
    await fetch('/api/onboarding/admin/notes', {
      method: 'POST',
      body: JSON.stringify({ onboarding_id: form.id, visibility, content }),
    });
    setContent('');
    location.reload();
  }

  return (
    <Stack spacing={2}>
      <Paper variant="outlined" sx={{ p: 2, borderRadius: 3 }}>
        <Typography variant="h6" fontWeight={900} sx={{ mb: 1 }}>Ficha do cliente</Typography>
        <Stack spacing={1}>
          <Typography variant="body2"><b>Objetivos:</b> {form?.goals || '—'}</Typography>
          <Typography variant="body2"><b>Lesões:</b> {form?.injuries || '—'}</Typography>
          <Typography variant="body2"><b>Condições médicas:</b> {form?.medical || '—'}</Typography>
          <Typography variant="body2"><b>Nível de atividade:</b> {form?.activity_level || '—'}</Typography>
          <Typography variant="body2"><b>Experiência:</b> {form?.experience || '—'}</Typography>
          <Typography variant="body2"><b>Disponibilidade:</b> {form?.availability || '—'}</Typography>
        </Stack>
      </Paper>

      <Paper variant="outlined" sx={{ p: 2, borderRadius: 3 }}>
        <Typography variant="h6" fontWeight={900} sx={{ mb: 1 }}>Notas</Typography>
        <Stack spacing={1} sx={{ mb: 2 }}>
          {notes.map((n) => (
            <Paper key={n.id} variant="outlined" sx={{ p: 1.5 }}>
              <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 0.5 }}>
                <Chip size="small" label={n.visibility === 'private' ? 'Privada (Admin/PT)' : 'Partilhada (visível ao cliente)'} />
                <Typography variant="caption" sx={{ opacity: 0.7 }}>
                  {new Date(n.created_at).toLocaleString('pt-PT')} • {n.profiles?.name ?? '—'}
                </Typography>
              </Stack>
              <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>{n.content}</Typography>
            </Paper>
          ))}
          {notes.length === 0 && <Typography variant="body2">Sem notas.</Typography>}
        </Stack>

        <Divider sx={{ my: 1 }} />
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
          <TextField
            select
            label="Visibilidade"
            value={visibility}
            onChange={(e) => setVisibility(e.target.value as any)}
            sx={{ minWidth: 220 }}
          >
            <MenuItem value="private">Privada (Admin/PT)</MenuItem>
            <MenuItem value="shared">Partilhada (também visível ao cliente)</MenuItem>
          </TextField>
          <TextField
            label="Adicionar nota"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            fullWidth
            multiline
            minRows={2}
          />
          <Button variant="contained" onClick={addNote}>Guardar nota</Button>
        </Stack>
      </Paper>
    </Stack>
  );
}
