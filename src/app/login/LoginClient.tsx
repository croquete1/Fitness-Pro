'use client';

import * as React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { signIn } from 'next-auth/react';
import Link from 'next/link';
import {
  Box, Paper, Stack, TextField, Button, Alert, Typography,
  CircularProgress, IconButton, InputAdornment, Divider
} from '@mui/material';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import LoginIcon from '@mui/icons-material/Login';
import ThemeToggle from '@/components/ThemeToggle';
import BrandLogo from '@/components/BrandLogo';
import { z } from 'zod';

const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Mínimo 6 caracteres'),
});

function fallbackTarget(nextUrl?: string | null) {
  return nextUrl && nextUrl.trim().length > 0 ? decodeURIComponent(nextUrl) : '/dashboard';
}

export default function LoginClient() {
  const router = useRouter();
  const sp = useSearchParams();
  const nextUrl = sp.get('next');

  const [email, setEmail] = React.useState('');
  const [pw, setPw] = React.useState('');
  const [show, setShow] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [err, setErr] = React.useState<string | null>(null);
  const [fieldErr, setFieldErr] = React.useState<{ email?: string; password?: string }>({});

  // Prefill email
  React.useEffect(() => {
    try { const last = localStorage.getItem('fp:lastEmail'); if (last) setEmail(last); } catch {}
  }, []);
  React.useEffect(() => {
    try { if (email) localStorage.setItem('fp:lastEmail', email.trim()); } catch {}
  }, [email]);

  const validateField = (key: 'email' | 'password', value: string) => {
    const partial =
      key === 'email'
        ? loginSchema.pick({ email: true })
        : loginSchema.pick({ password: true });
    const res = partial.safeParse({ [key]: value } as any);
    setFieldErr((prev) => ({ ...prev, [key]: res.success ? undefined : res.error.errors[0]?.message }));
    return res.success;
  };

  const isFormValid =
    loginSchema.safeParse({ email, password: pw }).success && !loading;

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);

    const valid = loginSchema.safeParse({ email, password: pw });
    if (!valid.success) {
      const next: any = {};
      for (const issue of valid.error.issues) next[issue.path[0] as string] = issue.message;
      setFieldErr(next);
      return;
    }

    setLoading(true);
    const target = fallbackTarget(nextUrl);
    const res = await signIn('credentials', {
      email,
      password: pw,
      redirect: false,
      callbackUrl: target,
    });
    setLoading(false);

    if (!res || !res.ok) {
      setErr('Credenciais inválidas.');
      return;
    }
    router.replace(res.url || target);
  }

  return (
    <Box
      sx={{
        minHeight: '100dvh',
        display: 'grid',
        placeItems: 'center',
        p: 2,
        bgcolor: 'background.default',
        backgroundImage: `
          radial-gradient(1000px 600px at 50% -10%, rgba(255,255,255,0.06), transparent),
          linear-gradient(180deg, rgba(255,255,255,0.02), transparent 120px)
        `,
      }}
    >
      <Paper
        elevation={10}
        sx={{
          width: '100%',
          maxWidth: 520,
          p: { xs: 3, sm: 4 },
          borderRadius: 4,
          bgcolor: 'background.paper',
          position: 'relative',
          backdropFilter: 'saturate(120%) blur(2px)',
        }}
      >
        <Box sx={{ position: 'absolute', top: 8, right: 8 }}>
          <ThemeToggle />
        </Box>

        <Stack alignItems="center" spacing={1.5} sx={{ mb: 1 }}>
          <BrandLogo size={56} />
          <Typography variant="h5" fontWeight={800} textAlign="center">
            Bem-vindo ao Fitness Pro
          </Typography>
          <Typography variant="body2" color="text.secondary" textAlign="center">
            Inicia sessão para acederes ao teu painel (Admin, PT ou Cliente).
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
              onBlur={(e) => validateField('email', e.target.value)}
              required
              fullWidth
              autoFocus
              autoComplete="username"
              error={!!fieldErr.email}
              helperText={fieldErr.email}
            />

            <TextField
              label="Palavra-passe *"
              type={show ? 'text' : 'password'}
              value={pw}
              onChange={(e) => setPw(e.target.value)}
              onBlur={(e) => validateField('password', e.target.value)}
              required
              fullWidth
              inputProps={{ minLength: 6 }}
              autoComplete="current-password"
              error={!!fieldErr.password}
              helperText={fieldErr.password}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShow((v) => !v)} edge="end" aria-label="mostrar/ocultar palavra-passe">
                      {show ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            <Button
              type="submit"
              variant="contained"
              size="large"
              startIcon={loading ? undefined : <LoginIcon />}
              disabled={!isFormValid}
            >
              {loading ? <CircularProgress size={20} /> : 'Entrar'}
            </Button>

            {err && <Alert severity="error">{err}</Alert>}

            <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" spacing={1}>
              <Button component={Link} href="/login/forgot" variant="text">Esqueceste-te da palavra-passe?</Button>
              <Button component={Link} href="/register" variant="text">Criar conta</Button>
            </Stack>
          </Stack>
        </form>
      </Paper>
    </Box>
  );
}
