'use client';

import * as React from 'react';
import { Box, Button, Container, Stack, TextField, Typography, Alert } from '@mui/material';

export default function RegisterPage() {
  const [loading, setLoading] = React.useState(false);
  const [ok, setOk] = React.useState<string | null>(null);
  const [err, setErr] = React.useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true); setOk(null); setErr(null);
    const form = new FormData(e.currentTarget);
    const payload = {
      name: String(form.get('name') || ''),
      email: String(form.get('email') || ''),
      password: String(form.get('password') || ''),
      role: 'CLIENT',
    };
    try {
      const res = await fetch('/api/register', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(payload) });
      if (!res.ok) throw new Error(await res.text());
      setOk('Pedido de registo submetido. Aguarda aprovação.');
      (e.currentTarget as HTMLFormElement).reset();
    } catch {
      setErr('Não foi possível registar. Tenta novamente.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Container maxWidth="xs" sx={{ minHeight: '100dvh', display: 'grid', placeItems: 'center' }}>
      <Box component="form" onSubmit={onSubmit} sx={{ width: '100%', p: 3, borderRadius: 3, bgcolor: 'background.paper', boxShadow: 3 }}>
        <Typography variant="h5" fontWeight={800} gutterBottom>Cria a tua conta</Typography>
        <Stack spacing={2}>
          {ok && <Alert severity="success">{ok}</Alert>}
          {err && <Alert severity="error">{err}</Alert>}
          <TextField name="name" label="Nome" fullWidth required />
          <TextField name="email" label="Email" type="email" fullWidth required />
          <TextField name="password" label="Palavra-passe" type="password" fullWidth required />
          <Button type="submit" variant="contained" disabled={loading}>{loading ? 'A enviar…' : 'Registar'}</Button>
        </Stack>
      </Box>
    </Container>
  );
}
