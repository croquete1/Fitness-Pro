'use client';

import * as React from 'react';
import {
  Alert,
  Box,
  Button,
  Container,
  Link as MuiLink,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { signIn } from 'next-auth/react';
import { z } from 'zod';
import { toast } from '@/components/ui/Toaster';

export default function LoginPage() {
  const [loading, setLoading] = React.useState(false);
  const [err, setErr] = React.useState<string | null>(null);
  const [fieldErr, setFieldErr] = React.useState<{ email?: string; password?: string }>({});

  const Schema = React.useMemo(
    () =>
      z.object({
        email: z.string().min(1, 'Email é obrigatório.').email('Email inválido.'),
        password: z
          .string()
          .min(1, 'Palavra-passe obrigatória.')
          .min(6, 'Mínimo 6 caracteres.'),
      }),
    []
  );

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErr(null);
    setLoading(true);
    setFieldErr({});
    const f = new FormData(e.currentTarget);
    const email = String(f.get('email') || '').trim();
    const password = String(f.get('password') || '');
    try {
      const parsed = Schema.safeParse({ email, password });
      if (!parsed.success) {
        const nextErrors: { email?: string; password?: string } = {};
        for (const issue of parsed.error.issues) {
          const key = issue.path[0] as 'email' | 'password' | undefined;
          if (key) nextErrors[key] = issue.message;
        }
        setFieldErr(nextErrors);
        toast('Verifica os campos destacados.', 2600, 'warning');
        setLoading(false);
        return;
      }
      const res = await signIn('credentials', { email, password, redirect: false });
      if (!res) throw new Error('Resposta inesperada.');
      if (res.error) {
        const clean = res.error.toLowerCase().includes('credential')
          ? 'Credenciais inválidas.'
          : res.error;
        throw new Error(clean);
      }
      toast('Sessão iniciada ✅', 2000, 'success');
      // vamos sempre para /dashboard; o index lá redireciona por role
      window.location.href = '/dashboard';
    } catch (e: any) {
      setErr(e?.message || 'Falha no login');
      toast('Falha no login', 2500, 'error');
    } finally { setLoading(false); }
  }

  return (
    <Box
      sx={{
        minHeight: '100dvh',
        display: 'grid',
        placeItems: 'center',
        position: 'relative',
        overflow: 'hidden',
        backgroundColor: 'background.default',
        '&::before': {
          content: "''",
          position: 'absolute',
          inset: '-40%',
          background:
            'radial-gradient(35% 40% at 20% 20%, rgba(51,153,255,.35), transparent 70%), ' +
            'radial-gradient(25% 30% at 85% 15%, rgba(136,84,255,.28), transparent 60%), ' +
            'radial-gradient(45% 45% at 70% 75%, rgba(255,94,133,.18), transparent 70%)',
          filter: 'blur(12px)',
          transform: 'translate3d(0,0,0)',
        },
      }}
    >
      <Container maxWidth="xs" sx={{ position: 'relative', zIndex: 1 }}>
        <Paper
          elevation={0}
          sx={{
            p: { xs: 3, sm: 4 },
            borderRadius: 4,
            backgroundColor: (theme) =>
              theme.palette.mode === 'dark'
                ? 'rgba(12,15,25,0.85)'
                : 'rgba(255,255,255,0.9)',
            border: '1px solid',
            borderColor: 'divider',
            backdropFilter: 'blur(14px)',
            boxShadow: (theme) =>
              theme.palette.mode === 'dark'
                ? '0 25px 80px -40px rgba(15,23,42,0.85)'
                : '0 35px 90px -45px rgba(15,23,42,0.25)',
          }}
        >
          <Stack alignItems="center" gap={1.5} sx={{ mb: 1.5 }}>
            <Box
              component="img"
              src="/branding/hms-personal-trainer.svg"
              alt="HMS Personal Trainer"
              sx={{ width: 104, height: 104, objectFit: 'contain' }}
            />
            <Typography variant="h5" component="h1" fontWeight={800} textAlign="center">
              Entrar na conta
            </Typography>
            <Typography variant="body2" sx={{ opacity: .75, textAlign: 'center' }}>
              Introduz as tuas credenciais para acederes ao painel HMS.
            </Typography>
          </Stack>

          {err && <Alert severity="error" sx={{ mb: 2 }}>{err}</Alert>}

          <Box component="form" onSubmit={onSubmit} sx={{ display: 'grid', gap: 1.5 }}>
            <TextField
              name="email"
              label="Email"
              type="email"
              required
              autoComplete="username"
              error={Boolean(fieldErr.email)}
              helperText={fieldErr.email || ' '}
              InputProps={{ inputProps: { inputMode: 'email' } }}
              onChange={() => {
                setFieldErr((prev) => ({ ...prev, email: undefined }));
              }}
            />
            <TextField
              name="password"
              label="Palavra-passe"
              type="password"
              required
              autoComplete="current-password"
              error={Boolean(fieldErr.password)}
              helperText={fieldErr.password || ' '}
              onChange={() => {
                setFieldErr((prev) => ({ ...prev, password: undefined }));
              }}
            />
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <MuiLink href="/login/forgot" underline="hover" sx={{ fontSize: 14 }}>Esqueceste-te?</MuiLink>
              <Button type="submit" variant="contained" disabled={loading}>
                {loading ? 'A entrar…' : '👉 Entrar'}
              </Button>
            </Stack>
            <MuiLink href="/register" underline="hover" sx={{ mt: .5, textAlign: 'center', fontSize: 14 }}>
              ➕ Criar conta
            </MuiLink>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
}
