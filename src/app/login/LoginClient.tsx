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
import CheckCircleOutline from '@mui/icons-material/CheckCircleOutline';
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
    } catch {
      setErr('Não foi possível iniciar sessão. Tenta novamente.');
      setLoading(false);
    }
  }

  return (
    <Box
      sx={(theme) => ({
        minHeight: '100dvh',
        display: 'grid',
        placeItems: 'center',
        p: { xs: 2.5, md: 4 },
        position: 'relative',
        overflow: 'hidden',
        background:
          theme.palette.mode === 'dark'
            ? 'linear-gradient(120deg, #020617 0%, #07112c 40%, #020617 100%)'
            : 'linear-gradient(120deg, #e9f1ff 0%, #f0f4ff 45%, #e6efff 100%)',
        '&::before': {
          content: "''",
          position: 'absolute',
          inset: '-30% -15%',
          background:
            'radial-gradient(30% 40% at 10% 20%, rgba(59,130,246,0.28), transparent 70%),' +
            'radial-gradient(24% 34% at 85% 18%, rgba(14,165,233,0.28), transparent 74%),' +
            'radial-gradient(36% 50% at 50% 120%, rgba(236,72,153,0.2), transparent 75%)',
          filter: 'blur(60px)',
          opacity: theme.palette.mode === 'dark' ? 0.55 : 0.4,
          pointerEvents: 'none',
        },
        '&::after': {
          content: "''",
          position: 'absolute',
          inset: '0',
          background:
            theme.palette.mode === 'dark'
              ? 'radial-gradient(65% 65% at 50% 0%, rgba(148,163,255,0.12), transparent 70%)'
              : 'radial-gradient(65% 65% at 50% 0%, rgba(79,70,229,0.12), transparent 70%)',
          mixBlendMode: 'screen',
          pointerEvents: 'none',
        },
      })}
    >
      <Fade in timeout={400}>
        <Paper
          elevation={24}
          sx={{
            width: '100%',
            maxWidth: 520,
            p: { xs: 3, sm: 4 },
            borderRadius: 4,
            position: 'relative',
            bgcolor: (theme) =>
              theme.palette.mode === 'dark'
                ? 'rgba(8, 13, 26, 0.82)'
                : 'rgba(255, 255, 255, 0.85)',
            border: (theme) =>
              theme.palette.mode === 'dark'
                ? '1px solid rgba(96,165,250,0.22)'
                : '1px solid rgba(99,102,241,0.18)',
            boxShadow: (theme) =>
              theme.palette.mode === 'dark'
                ? '0 40px 120px -60px rgba(15,23,42,0.95)'
                : '0 40px 120px -70px rgba(15,23,42,0.25)',
            backdropFilter: 'blur(18px)',
          }}
        >
          <Box sx={{ position: 'absolute', top: 12, right: 12 }}>
            <ThemeToggle />
          </Box>

          <Stack direction={{ xs: 'column', md: 'row' }} spacing={{ xs: 3, md: 4 }}>
            <Box
              sx={(theme) => ({
                flex: 1,
                borderRadius: 3,
                p: { xs: 2.75, md: 3.5 },
                background:
                  theme.palette.mode === 'dark'
                    ? 'linear-gradient(135deg, rgba(59,130,246,0.22) 0%, rgba(99,102,241,0.2) 35%, rgba(16,185,129,0.18) 100%)'
                    : 'linear-gradient(135deg, rgba(59,130,246,0.16) 0%, rgba(99,102,241,0.12) 40%, rgba(16,185,129,0.12) 100%)',
                border: theme.palette.mode === 'dark'
                  ? '1px solid rgba(96,165,250,0.28)'
                  : '1px solid rgba(37,99,235,0.14)',
                position: 'relative',
                overflow: 'hidden',
                boxShadow: theme.palette.mode === 'dark'
                  ? '0 40px 120px -70px rgba(8,20,45,0.9)'
                  : '0 48px 120px -80px rgba(15,23,42,0.28)',
              })}
            >
              <Box
                sx={{
                  position: 'absolute',
                  inset: -28,
                  background:
                    'radial-gradient(32% 32% at 20% 20%, rgba(255,255,255,0.22), transparent 70%),' +
                    'radial-gradient(50% 60% at 120% -10%, rgba(59,130,246,0.25), transparent 70%)',
                  opacity: 0.65,
                  pointerEvents: 'none',
                }}
              />
              <Stack spacing={2.2} sx={{ position: 'relative' }}>
                <BrandLogo size={84} priority />
                <Typography
                  variant="h4"
                  component="h1"
                  fontWeight={800}
                  sx={{ letterSpacing: 0.4, lineHeight: 1.1 }}
                >
                  Acede ao ecossistema HMS
                </Typography>
                <Typography
                  variant="body1"
                  sx={{ maxWidth: 420, opacity: 0.9 }}
                >
                  Introduz as tuas credenciais para acederes ao painel HMS e acelerar o trabalho da tua equipa.
                </Typography>
                <Stack spacing={1.2} sx={{ pt: 0.5 }}>
                  {[
                    'Gestão integrada de clientes, planos e sessões.',
                    'Alertas inteligentes para aprovações e acompanhamento.',
                    'Visão 360º do negócio com métricas em tempo real.',
                  ].map((item) => (
                    <Stack key={item} direction="row" spacing={1.2} alignItems="center">
                      <CheckCircleOutline fontSize="small" color="success" />
                      <Typography variant="body2" sx={{ opacity: 0.75 }}>
                        {item}
                      </Typography>
                    </Stack>
                  ))}
                </Stack>
              </Stack>
            </Box>

            <Box sx={{ flex: 1 }}>
              <Divider sx={{ mb: 2.5, opacity: 0.5 }}>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ textTransform: 'uppercase', letterSpacing: 1.4, fontWeight: 600 }}
                >
                  Entrar na conta
                </Typography>
              </Divider>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Introduz as tuas credenciais para acederes ao painel HMS.
              </Typography>
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
                    sx={{ py: 1.2, fontWeight: 700, textTransform: 'none', borderRadius: 2.5 }}
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
            </Box>
          </Stack>
        </Paper>
      </Fade>
    </Box>
  );
}
