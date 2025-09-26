'use client';

import * as React from 'react';
import { Paper, Stack, Typography, TextField, Slider, Button, Divider } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import { useToast } from '@/components/ui/ToastProvider';

function marks() { return [{ value: 0, label: '0' }, { value: 5, label: '5' }, { value: 10, label: '10' }]; }

export default function ClientCheckinCard() {
  const toast = useToast();
  const [energy, setEnergy] = React.useState(6);
  const [soreness, setSoreness] = React.useState(3);
  const [note, setNote] = React.useState('');
  const [busy, setBusy] = React.useState(false);

  async function submit() {
    if (busy) return;
    setBusy(true);
    try {
      const res = await fetch('/api/client/checkins', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ energy, soreness, note: note?.trim() || null }),
      });
      if (!res.ok) throw new Error('HTTP ' + res.status);
      toast.success('Check-in guardado. Obrigado! ✅');
      setNote('');
    } catch {
      toast.error('Não foi possível guardar. Tenta novamente. 🥲');
    } finally {
      setBusy(false);
    }
  }

  return (
    <Paper elevation={0} sx={{ p: 2, border: 1, borderColor: 'divider', borderRadius: 2, bgcolor: 'background.paper' }}>
      <Stack spacing={1.25}>
        <Typography variant="subtitle1" fontWeight={800}>Pergunta do dia</Typography>
        <Typography variant="body2" color="text.secondary">
          Como te sentiste no treino de ontem (ou hoje, se já treinaste)?
        </Typography>
        <Divider />
        <Stack spacing={1}>
          <Typography variant="caption" color="text.secondary">⚡ Energia (0—10)</Typography>
          <Slider value={energy} onChange={(_, v) => setEnergy(v as number)} step={1} min={0} max={10} marks={marks()} />
        </Stack>
        <Stack spacing={1}>
          <Typography variant="caption" color="text.secondary">🧱 Dor/rigidez (0—10)</Typography>
          <Slider value={soreness} onChange={(_, v) => setSoreness(v as number)} step={1} min={0} max={10} marks={marks()} />
        </Stack>
        <TextField
          label="Notas (opcional)"
          placeholder="Ex.: Ombro direito tenso nas elevações laterais."
          value={note}
          onChange={(e) => setNote(e.target.value)}
          multiline minRows={2}
        />
        <Button onClick={submit} variant="contained" endIcon={<SendIcon />} disabled={busy}>
          {busy ? 'A enviar…' : 'Guardar check-in'}
        </Button>
      </Stack>
    </Paper>
  );
}
