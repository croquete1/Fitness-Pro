'use client';

import * as React from 'react';
import Link from 'next/link';
import {
  Box, Paper, Stack, TextField, Button, Alert, Typography, CircularProgress
} from '@mui/material';

export const dynamic = 'force-dynamic';

export default function RegisterPage() {
  const [name, setName] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [busy, setBusy] = React.useState(false);
  const [ok, setOk] = React.useState<string | null>(null);
  const [err, setErr] = React.useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true); setOk(null); setErr(null);
    try {
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ name, email }),
      });
      if (!res.ok) {
        const msg = await res.text();
        throw new Error(msg || 'failed');
      }
      setOk('Registo submetido. A tua conta ficará pendente até aprovação.');
      setName(''); setEmail('');
    } catch {
      setErr('Não foi possível concluir o registo. Tenta novamente.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <Box sx={{ minHeight: '100dvh', display: 'grid', placeItems: 'center', p: 2, bgcolor: 'background.default' }}>
      <Paper elevation={6} sx={{ width: '100%', maxWidth: 460, p: 3.5, borderRadius: 4 }}>
        <form onSubmit={onSubmit}>
          <Stack spacing={2.25}>
            <Typography variant="h5" fontWeight={800} textAlign="center">Criar conta</Typography>
            <TextField label="Nome *" value={name} onChange={(e) => setName(e.target.value)} required fullWidth />
            <TextField label="Email *" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required fullWidth />
            <Button type="submit" variant="contained" disabled={!name || !email || busy}>
              {busy ? <CircularProgress size={20} /> : 'Registar'}
            </Button>
            {ok && <Alert severity="success">{ok}</Alert>}
            {err && <Alert severity="error">{err}</Alert>}
            <Button component={Link} href="/login" variant="text">Já tenho conta</Button>
          </Stack>
        </form>
      </Paper>
    </Box>
  );
}
