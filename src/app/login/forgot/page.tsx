'use client';

import * as React from 'react';
import { Box, Stack, TextField, Button, Alert, Typography, CircularProgress } from '@mui/material';

export default function ForgotPage() {
  const [email, setEmail] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [ok, setOk] = React.useState<string | null>(null);
  const [err, setErr] = React.useState<string | null>(null);

  const canSubmit = !loading && email.trim().length > 0;

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;
    setOk(null); setErr(null); setLoading(true);
    try {
      const res = await fetch('/api/auth/forgot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setErr(data?.message || 'Não foi possível processar o pedido.');
      } else {
        setOk('Se o email existir, enviámos um link de recuperação.');
        setEmail('');
      }
    } catch {
      setErr('Erro de rede. Tenta novamente.');
    } finally { setLoading(false); }
  }

  return (
    <Box sx={{ minHeight: '100dvh', display: 'grid', placeItems: 'center', p: 2 }}>
      <Box component="form" onSubmit={onSubmit}
        sx={{ width: '100%', maxWidth: 420, p: 3, borderRadius: 2, border: '1px solid', borderColor: 'divider', bgcolor: 'background.paper' }}>
        <Stack spacing={2}>
          <Typography variant="h5" fontWeight={600}>Recuperar acesso</Typography>
          <TextField label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required fullWidth />
          <Button type="submit" variant="contained" disabled={!canSubmit}>
            {loading ? <CircularProgress size={20} /> : 'Enviar link'}
          </Button>
          {ok && <Alert severity="success">{ok}</Alert>}
          {err && <Alert severity="error">{err}</Alert>}
        </Stack>
      </Box>
    </Box>
  );
}
