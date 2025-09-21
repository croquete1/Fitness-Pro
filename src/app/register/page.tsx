'use client';

import * as React from 'react';
import { Box, Stack, TextField, Button, Alert, Typography, CircularProgress } from '@mui/material';
import Link from 'next/link';

export default function RegisterPage() {
  const [name, setName] = React.useState('');
  const [username, setUsername] = React.useState('');
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
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim() || null,
          username: username.trim() || null,
          email: email.trim().toLowerCase(),
          role: 'CLIENT',
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) setErr(data?.message || 'Ocorreu um erro ao registar.');
      else {
        setOk('Pedido submetido. Receberás um email após aprovação para definires a palavra-passe.');
        setName(''); setUsername(''); setEmail('');
      }
    } catch {
      setErr('Erro de rede. Tenta novamente.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Box sx={{ minHeight: '100dvh', display: 'grid', placeItems: 'center', p: 2 }}>
      <Box component="form" onSubmit={onSubmit}
        sx={{ width: '100%', maxWidth: 440, p: 3, borderRadius: 2, border: '1px solid', borderColor: 'divider', bgcolor: 'background.paper' }}>
        <Stack spacing={2}>
          <Typography variant="h5" fontWeight={600}>Criar conta</Typography>

          <TextField label="Nome (opcional)" value={name} onChange={(e) => setName(e.target.value)} fullWidth />
          <TextField label="Nome de utilizador (opcional)" value={username} onChange={(e) => setUsername(e.target.value)} helperText="3-30 chars: letras, números, . e _" fullWidth />
          <TextField label="Email" type="email" value={email} required onChange={(e) => setEmail(e.target.value)} fullWidth />

          <Button type="submit" variant="contained" disabled={!canSubmit}>
            {loading ? <CircularProgress size={20} /> : 'Submeter pedido'}
          </Button>

          {ok && <Alert severity="success">{ok}</Alert>}
          {err && <Alert severity="error">{err}</Alert>}

          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography variant="body2" color="text.secondary">Já tens conta?</Typography>
            <Button component={Link} href="/login" variant="text">Entrar</Button>
          </Stack>

          <Typography variant="caption" color="text.secondary">
            A tua conta fica pendente até aprovação. Depois receberás um link para definir a palavra-passe.
          </Typography>
        </Stack>
      </Box>
    </Box>
  );
}
