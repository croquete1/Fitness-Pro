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
        // fundo com gradiente suave (legível em claro e escuro)
        background:
          'radial-gradient(1200px 600px at 15% -10%, rgba(25,118,210,.25), transparent), ' +
          'radial-gradient(900px 500px at 100% 0%, rgba(156,39,176,.20), transparent)',
      }}
    >
      <Container maxWidth="xs">
        <Paper elevation={6} sx={{ p: 3, borderRadius: 4 }}>
          <Stack alignItems="center" gap={1} sx={{ mb: 1 }}>
            <Box
              component="img"
              src="/branding/hms-personal-trainer.svg"
              alt="HMS Personal Trainer"
              sx={{ width: 88, height: 88, objectFit: 'contain' }}
            />
            <Typography variant="h5" component="h1" fontWeight={800} textAlign="center">
              Bem-vindo de volta 👋
            </Typography>
            <Typography variant="body2" sx={{ opacity: .75, textAlign: 'center' }}>
              Inicia sessão para acederes ao teu painel.
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
