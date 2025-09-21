'use client';

import * as React from 'react';
import Link from 'next/link';
import {
  Box, Paper, Stack, TextField, Button, Alert, Typography, CircularProgress
} from '@mui/material';

export const dynamic = 'force-dynamic';

export default function ForgotPage() {
  const [email, setEmail] = React.useState('');
  const [busy, setBusy] = React.useState(false);
  const [ok, setOk] = React.useState<string | null>(null);
  const [err, setErr] = React.useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true); setOk(null); setErr(null);
    try {
      const res = await fetch('/api/auth/forgot', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      if (!res.ok) throw new Error('failed');
      setOk('Se o email existir, enviámos instruções para recuperar o acesso.');
    } catch {
      setErr('Não foi possível enviar o email. Tenta novamente.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <Box sx={{ minHeight: '100dvh', display: 'grid', placeItems: 'center', p: 2, bgcolor: 'background.default' }}>
      <Paper elevation={6} sx={{ width: '100%', maxWidth: 460, p: 3.5, borderRadius: 4 }}>
        <form onSubmit={onSubmit}>
          <Stack spacing={2.25}>
            <Typography variant="h5" fontWeight={800} textAlign="center">Recuperar acesso</Typography>
            <TextField label="Email *" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required fullWidth />
            <Button type="submit" variant="contained" disabled={!email || busy}>
              {busy ? <CircularProgress size={20} /> : 'Enviar'}
            </Button>
            {ok && <Alert severity="success">{ok}</Alert>}
            {err && <Alert severity="error">{err}</Alert>}
            <Button component={Link} href="/login" variant="text">Voltar ao login</Button>
          </Stack>
        </form>
      </Paper>
    </Box>
  );
}
