'use client';

import * as React from 'react';
import Link from 'next/link';
import {
  Box, Paper, Stack, TextField, Button, Alert, Typography,
  CircularProgress, Divider
} from '@mui/material';
import ThemeToggle from '@/components/ThemeToggle';
import BrandLogo from '@/components/BrandLogo';
import { z } from 'zod';

export const dynamic = 'force-dynamic';

const schema = z.object({
  name: z.string().trim().min(2, 'Nome demasiado curto'),
  email: z.string().email('Email inválido'),
});

export default function RegisterPage() {
  const [name, setName] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [busy, setBusy] = React.useState(false);
  const [ok, setOk] = React.useState<string | null>(null);
  const [err, setErr] = React.useState<string | null>(null);
  const [fieldErr, setFieldErr] = React.useState<{ name?: string; email?: string }>({});

  const validateField = (key: 'name' | 'email', value: string) => {
    const partial = schema.pick({ [key]: true } as any);
    const res = partial.safeParse({ [key]: value } as any);
    setFieldErr((prev) => ({ ...prev, [key]: res.success ? undefined : res.error.errors[0]?.message }));
    return res.success;
  };

  const isValid = schema.safeParse({ name, email }).success && !busy;

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setOk(null); setErr(null);

    const parsed = schema.safeParse({ name, email });
    if (!parsed.success) {
      const next: any = {};
      for (const i of parsed.error.issues) next[i.path[0] as string] = i.message;
      setFieldErr(next);
      return;
    }

    setBusy(true);
    try {
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ name, email }),
      });
      if (!res.ok) throw new Error(await res.text());
      setOk('Registo submetido. A tua conta ficará pendente até aprovação.');
      setName(''); setEmail('');
    } catch {
      setErr('Não foi possível concluir o registo. Tenta novamente.');
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
          <Typography variant="h5" fontWeight={800} textAlign="center">Criar conta</Typography>
          <Typography variant="body2" color="text.secondary" textAlign="center">
            Pede acesso e aguarda aprovação do administrador.
          </Typography>
        </Stack>

        <Divider sx={{ my: 2 }} />

        <form onSubmit={onSubmit} noValidate>
          <Stack spacing={2.25}>
            <TextField
              label="Nome *"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onBlur={(e) => validateField('name', e.target.value)}
              required
              fullWidth
              error={!!fieldErr.name}
              helperText={fieldErr.name}
            />
            <TextField
              label="Email *"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onBlur={(e) => validateField('email', e.target.value)}
              required
              fullWidth
              error={!!fieldErr.email}
              helperText={fieldErr.email}
            />
            <Button type="submit" variant="contained" disabled={!isValid}>
              {busy ? <CircularProgress size={20} /> : 'Enviar pedido'}
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
