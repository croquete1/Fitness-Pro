// src/app/login/LoginClient.tsx
'use client';

import * as React from 'react';
import { signIn } from 'next-auth/react';
import Link from 'next/link';
import {
  Box, Paper, Stack, TextField, Button, Alert, Typography,
  CircularProgress, IconButton, InputAdornment, Divider, Fade
} from '@mui/material';
import MailOutline from '@mui/icons-material/MailOutline';
import LockOutlined from '@mui/icons-material/LockOutlined';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import LoginIcon from '@mui/icons-material/Login';
import ThemeToggle from '@/components/ThemeToggle';
import BrandLogo from '@/components/BrandLogo';
import { useSearchParams } from 'next/navigation';
import { z } from 'zod';

const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Mínimo 6 caracteres'),
});

function sanitizeNext(next?: string | null) {
  const fallback = '/dashboard';
  if (!next) return fallback;
  try {
    const base = typeof window !== 'undefined' ? window.location.origin : 'http://localhost';
    const u = new URL(next, base);
    const path = u.pathname + (u.search || '') + (u.hash || '');
    if (u.origin !== base) return fallback;
    if (path.startsWith('/login')) return fallback;
    if (path.startsWith('/') && !path.startsWith('//')) return path || fallback;
  } catch {
    if (next.startsWith('/login')) return fallback;
    if (next.startsWith('/') && !next.startsWith('//')) return next;
  }
  return fallback;
}

function mapAuthError(code?: string | null) {
  if (!code) return null;
  const c = code.toLowerCase();
  if (c.includes('credential') || c.includes('signin')) return 'Credenciais inválidas.';
  if (c.includes('configuration')) return 'Erro de configuração do login.';
  if (c.includes('accessdenied')) return 'Acesso negado.';
  return 'Não foi possível iniciar sessão.';
}

export default function LoginClient() {
  const sp = useSearchParams();
  const nextParam = sp.get('next');
  const errParam = sp.get('error');

  const [email, setEmail] = React.useState('');
  const [pw, setPw] = React.useState('');
  const [show, setShow] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [err, setErr] = React.useState<string | null>(null);
  const [fieldErr, setFieldErr] = React.useState<{ email?: string; password?: string }>({});

  React.useEffect(() => { setErr(mapAuthError(errParam)); }, [errParam]);
  React.useEffect(() => { try { const last = localStorage.getItem('fp:lastEmail'); if (last) setEmail(last); } catch {} }, []);
  React.useEffect(() => { try { if (email) localStorage.setItem('fp:lastEmail', email.trim()); } catch {} }, [email]);

  const validateField = (key: 'email' | 'password', value: string) => {
    const partial = key === 'email' ? loginSchema.pick({ email: true }) : loginSchema.pick({ password: true });
    const res = partial.safeParse({ [key]: value } as any);
    setFieldErr((prev) => ({ ...prev, [key]: res.success ? undefined : res.error.issues[0]?.message }));
    return res.success;
  };

  const isFormValid = loginSchema.safeParse({ email, password: pw }).success && !loading;

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (loading) return;

    setErr(null);
    const parsed = loginSchema.safeParse({ email, password: pw });
    if (!parsed.success) {
      const nextErrors: any = {};
      for (const i of parsed.error.issues) nextErrors[i.path[0] as string] = i.message;
      setFieldErr(nextErrors);
      return;
    }

    setLoading(true);
    try {
      const callbackUrl = sanitizeNext(nextParam);
      await signIn('credentials', {
        email: email.trim(),
        password: pw,
        redirect: true,
        callbackUrl,
      });
      // redireciona via 302; não precisamos de mexer aqui
    } catch {
      setErr('Não foi possível iniciar sessão. Tenta novamente.');
      setLoading(false);
    }
  }

  return (
    <Box
      sx={{
        minHeight: '100dvh',
        display: 'grid',
        placeItems: 'center',
        p: 3,
        bgcolor: 'background.default',
        // fundo com gradiente suave + textura radial
        backgroundImage: `
          radial-gradient(1200px 700px at 50% -10%, rgba(255,255,255,0.06), transparent),
          radial-gradient(900px 500px at 120% 10%, rgba(99,102,241,0.12), transparent),
          linear-gradient(180deg, rgba(255,255,255,0.02), transparent 160px)
        `,
      }}
    >
      <Fade in timeout={400}>
        <Paper
          elevation={24}
          sx={{
            width: '100%',
            maxWidth: 520,
            p: { xs: 3, sm: 4 },
            borderRadius: 5,
            bgcolor: 'rgba(18,18,18,0.65)',
            color: 'text.primary',
            backdropFilter: 'saturate(140%) blur(8px)',
            border: (t) => `1px solid ${t.palette.divider}`,
            boxShadow: '0 10px 40px rgba(0,0,0,0.35)',
            position: 'relative',
          }}
        >
          <Box sx={{ position: 'absolute', top: 10, right: 10 }}>
            <ThemeToggle />
          </Box>

          <Stack alignItems="center" spacing={1.2} sx={{ mb: 1 }}>
            <BrandLogo size={64} />
            <Typography variant="h4" fontWeight={800} textAlign="center" sx={{ letterSpacing: 0.2 }}>
              Bem-vindo ao Fitness Pro
            </Typography>
            <Typography variant="body2" color="text.secondary" textAlign="center">
              Entra para aceder ao teu painel <b>Admin</b>, <b>PT</b> ou <b>Cliente</b>.
            </Typography>
          </Stack>

          <Divider sx={{ my: 2.2, opacity: 0.6 }} />

          <form onSubmit={onSubmit} noValidate>
            <Stack spacing={2.2}>
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
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <MailOutline fontSize="small" />
                    </InputAdornment>
                  ),
                }}
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
                  startAdornment: (
                    <InputAdornment position="start">
                      <LockOutlined fontSize="small" />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={() => setShow((v) => !v)} edge="end" aria-label="Mostrar/ocultar palavra-passe">
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
                sx={{
                  py: 1.2,
                  fontWeight: 700,
                  textTransform: 'none',
                  borderRadius: 2.5,
                }}
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
      </Fade>
    </Box>
  );
}
