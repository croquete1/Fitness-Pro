'use client';

import * as React from 'react';
import Link from 'next/link';
import {
  Box, Paper, Stack, TextField, Button, Alert, Typography, CircularProgress, Divider
} from '@mui/material';
import ThemeToggle from '@/components/ThemeToggle';
import BrandLogo from '@/components/BrandLogo';
import { z } from 'zod';

export const dynamic = 'force-dynamic';

const schema = z.object({ email: z.string().email('Email inválido') });

export default function ForgotPage() {
  const [email, setEmail] = React.useState('');
  const [busy, setBusy] = React.useState(false);
  const [ok, setOk] = React.useState<string | null>(null);
  const [err, setErr] = React.useState<string | null>(null);
  const [fieldErr, setFieldErr] = React.useState<string | undefined>(undefined);

  const valid = schema.safeParse({ email }).success && !busy;

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setOk(null); setErr(null);
    const res = schema.safeParse({ email });
    if (!res.success) {
      setFieldErr(res.error.errors[0]?.message);
      return;
    }
    setBusy(true);
    try {
      const r = await fetch('/api/auth/forgot', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      if (!r.ok) throw new Error('failed');
      setOk('Se o email existir, enviámos instruções para recuperar o acesso.');
    } catch {
      setErr('Não foi possível enviar o email. Tenta novamente.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <Box sx={{
      minHeight: '100dvh', display: 'grid', placeItems: 'center', p: 2, bgcolor: 'background.default',
      backgroundImage: `
        radial-gradient(1000px 600px at 50% -10%, rgba(255,255,255,0.06), transparent),
        linear-gradient(180deg, rgba(255,255,255,0.02), transparent 120px)
      `,
    }}>
      <Paper elevation={10} sx={{
        width: '100%', maxWidth: 520, p: { xs: 3, sm: 4 }, borderRadius: 4,
        bgcolor: 'background.paper', position: 'relative', backdropFilter: 'saturate(120%) blur(2px)',
      }}>
        <Box sx={{ position: 'absolute', top: 8, right: 8 }}><ThemeToggle /></Box>

        <Stack alignItems="center" spacing={1.5} sx={{ mb: 1 }}>
          <BrandLogo size={56} />
          <Typography variant="h5" fontWeight={800} textAlign="center">Recuperar acesso</Typography>
          <Typography variant="body2" color="text.secondary" textAlign="center">
            Introduz o teu email para receberes o link de recuperação.
          </Typography>
        </Stack>

        <Divider sx={{ my: 2 }} />

        <form onSubmit={onSubmit} noValidate>
          <Stack spacing={2.25}>
            <TextField
              label="Email *"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onBlur={(e) => {
                const r = schema.safeParse({ email: e.target.value });
                setFieldErr(r.success ? undefined : r.error.errors[0]?.message);
              }}
              required
              fullWidth
              error={!!fieldErr}
              helperText={fieldErr}
            />
            <Button type="submit" variant="contained" disabled={!valid}>
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
