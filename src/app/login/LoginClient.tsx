// src/app/login/LoginClient.tsx
'use client';

import * as React from 'react';
import { signIn } from 'next-auth/react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Box,
  Paper,
  Stack,
  TextField,
  Button,
  Alert,
  Typography,
  CircularProgress,
  IconButton,
  InputAdornment,
  Divider,
  Fade,
} from '@mui/material';
import MailOutline from '@mui/icons-material/MailOutline';
import LockOutlined from '@mui/icons-material/LockOutlined';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import LoginIcon from '@mui/icons-material/Login';
import CheckCircleOutline from '@mui/icons-material/CheckCircleOutline';
import { keyframes } from '@mui/material/styles';
import ThemeToggle from '@/components/ThemeToggle';
import { useSearchParams } from 'next/navigation';
import { z } from 'zod';

const loginSchema = z.object({
  identifier: z.string().trim().min(1, 'Indica o email ou o username'),
  password: z.string().min(6, 'Mínimo 6 caracteres'),
});

const backgroundPulse = keyframes`
  0% {
    transform: rotate(0deg) scale(1);
    opacity: 0.55;
  }
  50% {
    transform: rotate(6deg) scale(1.08);
    opacity: 0.85;
  }
  100% {
    transform: rotate(0deg) scale(1);
    opacity: 0.55;
  }
`;

const float = keyframes`
  0% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-10px);
  }
  100% {
    transform: translateY(0px);
  }
`;

const aurora = keyframes`
  0% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0% 50%;
  }
`;

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

  const [identifier, setIdentifier] = React.useState('');
  const [pw, setPw] = React.useState('');
  const [show, setShow] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [err, setErr] = React.useState<string | null>(null);
  const [fieldErr, setFieldErr] = React.useState<{ identifier?: string; password?: string }>({});

  React.useEffect(() => { setErr(mapAuthError(errParam)); }, [errParam]);
  React.useEffect(() => {
    try {
      const last =
        localStorage.getItem('fp:lastIdentifier') ?? localStorage.getItem('fp:lastEmail');
      if (last) setIdentifier(last);
      if (localStorage.getItem('fp:lastEmail')) localStorage.removeItem('fp:lastEmail');
    } catch {}
  }, []);
  React.useEffect(() => {
    try {
      const trimmed = identifier.trim();
      if (trimmed) {
        localStorage.setItem('fp:lastIdentifier', trimmed);
      } else {
        localStorage.removeItem('fp:lastIdentifier');
      }
    } catch {}
  }, [identifier]);

  const validateField = (key: 'identifier' | 'password', value: string) => {
    const schema = key === 'identifier' ? loginSchema.shape.identifier : loginSchema.shape.password;
    const res = schema.safeParse(value);
    setFieldErr((prev) => ({ ...prev, [key]: res.success ? undefined : res.error.issues[0]?.message }));
    return res.success;
  };

  const isFormValid = loginSchema.safeParse({ identifier, password: pw }).success && !loading;

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (loading) return;

    setErr(null);
    const parsed = loginSchema.safeParse({ identifier, password: pw });
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
        identifier: parsed.data.identifier,
        password: parsed.data.password,
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
            ? 'radial-gradient(circle at 15% 15%, #0f172a 0%, #020617 45%, #010417 100%)'
            : 'radial-gradient(circle at 15% 15%, #eef2ff 0%, #e0e7ff 45%, #e2e8f0 100%)',
        '&::before': {
          content: "''",
          position: 'absolute',
          inset: '-30% -15%',
          background:
            'radial-gradient(30% 40% at 10% 20%, rgba(59,130,246,0.28), transparent 70%),' +
            'radial-gradient(24% 34% at 85% 18%, rgba(14,165,233,0.28), transparent 74%),' +
            'radial-gradient(36% 50% at 50% 120%, rgba(236,72,153,0.2), transparent 75%)',
          filter: 'blur(60px)',
          animation: `${backgroundPulse} 26s ease-in-out infinite`,
          pointerEvents: 'none',
        },
        '&::after': {
          content: "''",
          position: 'absolute',
          inset: '0',
          background:
            theme.palette.mode === 'dark'
              ? 'linear-gradient(140deg, rgba(59,130,246,0.15), rgba(236,72,153,0.12), rgba(20,184,166,0.12))'
              : 'linear-gradient(140deg, rgba(79,70,229,0.12), rgba(236,72,153,0.1), rgba(45,212,191,0.12))',
          backgroundSize: '180% 180%',
          mixBlendMode: 'screen',
          animation: `${aurora} 30s ease-in-out infinite`,
          pointerEvents: 'none',
        },
      })}
    >
      <Fade in timeout={400}>
        <Paper
          elevation={24}
          sx={{
            width: '100%',
            maxWidth: 780,
            p: { xs: 3, sm: 4 },
            borderRadius: { xs: '32px', sm: '40px' },
            position: 'relative',
            overflow: 'hidden',
            bgcolor: (theme) =>
              theme.palette.mode === 'dark'
                ? 'rgba(8, 13, 26, 0.84)'
                : 'rgba(255, 255, 255, 0.92)',
            border: (theme) =>
              theme.palette.mode === 'dark'
                ? '1px solid rgba(96,165,250,0.22)'
                : '1px solid rgba(79,70,229,0.14)',
            boxShadow: (theme) =>
              theme.palette.mode === 'dark'
                ? '0 50px 140px -70px rgba(15,23,42,0.95)'
                : '0 48px 120px -70px rgba(15,23,42,0.25)',
            backdropFilter: 'blur(20px)',
            transition: 'box-shadow 250ms ease, transform 250ms ease',
            '&:hover': {
              transform: { md: 'translateY(-4px)' },
              boxShadow: (theme) =>
                theme.palette.mode === 'dark'
                  ? '0 60px 140px -70px rgba(15,23,42,0.9)'
                  : '0 60px 150px -80px rgba(15,23,42,0.28)',
            },
            '&::before': {
              content: "''",
              position: 'absolute',
              inset: '-30% auto auto -30%',
              width: 320,
              height: 320,
              background:
                'radial-gradient(circle, rgba(59,130,246,0.35) 0%, rgba(59,130,246,0) 70%)',
              filter: 'blur(40px)',
              opacity: 0.4,
              pointerEvents: 'none',
              animation: `${float} 18s ease-in-out infinite`,
            },
            '&::after': {
              content: "''",
              position: 'absolute',
              inset: 'auto -25% -35% auto',
              width: 260,
              height: 260,
              background:
                'radial-gradient(circle, rgba(236,72,153,0.32) 0%, rgba(236,72,153,0) 70%)',
              filter: 'blur(45px)',
              opacity: 0.35,
              pointerEvents: 'none',
              animation: `${float} 22s ease-in-out infinite`,
              animationDelay: '3s',
            },
          }}
        >
          <Box sx={{ position: 'absolute', top: 12, right: 12 }}>
            <ThemeToggle />
          </Box>

          <Fade in={loading} unmountOnExit>
            <Box
              sx={{
                position: 'absolute',
                inset: 0,
                zIndex: 2,
                borderRadius: 'inherit',
                display: 'grid',
                placeItems: 'center',
                bgcolor: (theme) =>
                  theme.palette.mode === 'dark'
                    ? 'rgba(15, 23, 42, 0.75)'
                    : 'rgba(15, 23, 42, 0.55)',
                backdropFilter: 'blur(12px)',
              }}
            >
              <Stack spacing={2} alignItems="center" sx={{ color: 'common.white' }}>
                <CircularProgress size={36} thickness={4} color="inherit" />
                <Typography
                  variant="body1"
                  sx={{
                    fontWeight: 600,
                    color: 'common.white',
                    letterSpacing: 0.4,
                  }}
                >
                  A iniciar sessão…
                </Typography>
              </Stack>
            </Box>
          </Fade>

          <Stack direction={{ xs: 'column', md: 'row' }} spacing={{ xs: 3, md: 5 }} alignItems="stretch">
            <Box
              sx={(theme) => ({
                flex: 1,
                borderRadius: 3,
                p: { xs: 2.75, md: 3.75 },
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
              <Stack
                spacing={2.4}
                sx={(theme) => ({
                  position: 'relative',
                  color:
                    theme.palette.mode === 'dark'
                      ? 'rgba(226,232,240,0.95)'
                      : 'inherit',
                })}
              >
                <Box
                  sx={{
                    width: { xs: 96, sm: 110 },
                    height: { xs: 96, sm: 110 },
                    borderRadius: 5,
                    position: 'relative',
                    overflow: 'hidden',
                    boxShadow:
                      '0 22px 45px -20px rgba(15,23,42,0.55), 0 10px 24px -12px rgba(15,23,42,0.35)',
                    animation: `${float} 16s ease-in-out infinite`,
                    background:
                      'linear-gradient(140deg, rgba(59,130,246,0.2) 0%, rgba(14,165,233,0.2) 50%, rgba(16,185,129,0.22) 100%)',
                    '&::after': {
                      content: "''",
                      position: 'absolute',
                      inset: 4,
                      borderRadius: 4,
                      border: '1px solid rgba(255,255,255,0.28)',
                      mixBlendMode: 'screen',
                      pointerEvents: 'none',
                    },
                  }}
                >
                  <Image
                    src="/hms-personal-trainer.png"
                    alt="HMS Personal Trainer"
                    fill
                    priority
                    unoptimized
                    sizes="(max-width: 768px) 96px, 120px"
                    style={{ objectFit: 'contain', padding: 16 }}
                  />
                </Box>
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
                  Conecta-te à tua jornada de fitness: gere planos, acompanha evolução e mantém o contacto entre clientes e Personal Trainers.
                </Typography>
                <Stack
                  spacing={1.2}
                  sx={{
                    pt: 0.5,
                    '& svg': {
                      color: (theme) =>
                        theme.palette.mode === 'dark'
                          ? theme.palette.success.light
                          : theme.palette.success.main,
                    },
                  }}
                >
                  {[
                    'Clientes acompanham planos, sessões e métricas em tempo real.',
                    'Personal Trainers organizam treinos, avaliações e comunicação num único lugar.',
                    'Notificações inteligentes mantêm todos alinhados e informados.',
                  ].map((item) => (
                    <Stack key={item} direction="row" spacing={1.2} alignItems="center">
                      <CheckCircleOutline fontSize="small" color="success" />
                      <Typography
                        variant="body2"
                        sx={{
                          opacity: 0.82,
                          color: (theme) =>
                            theme.palette.mode === 'dark'
                              ? 'rgba(226,232,240,0.85)'
                              : theme.palette.text.secondary,
                        }}
                      >
                        {item}
                      </Typography>
                    </Stack>
                  ))}
                </Stack>
              </Stack>
            </Box>

            <Box sx={{ flex: 1 }}>
              <Divider
                sx={(theme) => ({
                  mb: 2.5,
                  opacity: 0.65,
                  '&::before, &::after': {
                    borderColor:
                      theme.palette.mode === 'dark'
                        ? 'rgba(148,163,255,0.25)'
                        : 'rgba(79,70,229,0.2)',
                  },
                })}
              >
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ textTransform: 'uppercase', letterSpacing: 1.4, fontWeight: 600 }}
                >
                  Entrar na conta
                </Typography>
              </Divider>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{
                  mb: 3,
                  maxWidth: 420,
                  lineHeight: 1.6,
                }}
              >
                Introduz as tuas credenciais para acederes à tua área HMS, quer sejas cliente ou Personal Trainer.
              </Typography>
              <form onSubmit={onSubmit} noValidate>
                <Stack spacing={2.2}>
                  <TextField
                    label="Email ou nome de utilizador *"
                    type="text"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    onBlur={(e) => validateField('identifier', e.target.value)}
                    required
                    fullWidth
                    autoFocus
                    autoComplete="username"
                    error={!!fieldErr.identifier}
                    helperText={fieldErr.identifier ?? 'Podes usar o email ou o username definido no perfil.'}
                    inputProps={{ autoCapitalize: 'none', autoCorrect: 'off', spellCheck: 'false' }}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <MailOutline fontSize="small" />
                        </InputAdornment>
                      ),
                    }}
                    sx={(theme) => ({
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2.5,
                        backgroundColor:
                          theme.palette.mode === 'dark'
                            ? 'rgba(15, 23, 42, 0.55)'
                            : 'rgba(255,255,255,0.85)',
                        transition: 'box-shadow 200ms ease, transform 200ms ease',
                        '& fieldset': {
                          borderColor:
                            theme.palette.mode === 'dark'
                              ? 'rgba(148,163,255,0.3)'
                              : 'rgba(99,102,241,0.18)',
                        },
                        '&:hover fieldset': {
                          borderColor:
                            theme.palette.mode === 'dark'
                              ? 'rgba(129,140,248,0.6)'
                              : 'rgba(79,70,229,0.45)',
                        },
                        '&.Mui-focused': {
                          boxShadow:
                            theme.palette.mode === 'dark'
                              ? '0 0 0 3px rgba(99,102,241,0.35)'
                              : '0 0 0 3px rgba(79,70,229,0.2)',
                        },
                        '&.Mui-focused fieldset': {
                          borderColor:
                            theme.palette.mode === 'dark'
                              ? 'rgba(129,140,248,0.85)'
                              : theme.palette.primary.main,
                        },
                      },
                      '& .MuiInputAdornment-root': {
                        color:
                          theme.palette.mode === 'dark'
                            ? 'rgba(226,232,240,0.8)'
                            : theme.palette.text.secondary,
                      },
                    })}
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
                    sx={(theme) => ({
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2.5,
                        backgroundColor:
                          theme.palette.mode === 'dark'
                            ? 'rgba(15, 23, 42, 0.55)'
                            : 'rgba(255,255,255,0.85)',
                        transition: 'box-shadow 200ms ease, transform 200ms ease',
                        '& fieldset': {
                          borderColor:
                            theme.palette.mode === 'dark'
                              ? 'rgba(148,163,255,0.3)'
                              : 'rgba(99,102,241,0.18)',
                        },
                        '&:hover fieldset': {
                          borderColor:
                            theme.palette.mode === 'dark'
                              ? 'rgba(129,140,248,0.6)'
                              : 'rgba(79,70,229,0.45)',
                        },
                        '&.Mui-focused': {
                          boxShadow:
                            theme.palette.mode === 'dark'
                              ? '0 0 0 3px rgba(129,140,248,0.32)'
                              : '0 0 0 3px rgba(79,70,229,0.2)',
                        },
                        '&.Mui-focused fieldset': {
                          borderColor:
                            theme.palette.mode === 'dark'
                              ? 'rgba(129,140,248,0.85)'
                              : theme.palette.primary.main,
                        },
                      },
                      '& .MuiInputAdornment-root': {
                        color:
                          theme.palette.mode === 'dark'
                            ? 'rgba(226,232,240,0.8)'
                            : theme.palette.text.secondary,
                      },
                    })}
                  />

                  <Button
                    type="submit"
                    variant="contained"
                    size="large"
                    startIcon={loading ? undefined : <LoginIcon />}
                    disabled={!isFormValid}
                    sx={(theme) => ({
                      py: 1.2,
                      fontWeight: 700,
                      textTransform: 'none',
                      borderRadius: 2.5,
                      position: 'relative',
                      overflow: 'hidden',
                      backgroundColor: 'transparent',
                      backgroundImage:
                        theme.palette.mode === 'dark'
                          ? 'linear-gradient(120deg, #4f46e5 0%, #2563eb 50%, #14b8a6 100%)'
                          : 'linear-gradient(120deg, #4338ca 0%, #2563eb 50%, #22d3ee 100%)',
                      backgroundSize: '200% 200%',
                      boxShadow:
                        theme.palette.mode === 'dark'
                          ? '0 18px 40px -18px rgba(59,130,246,0.6)'
                          : '0 18px 40px -18px rgba(37,99,235,0.5)',
                      transition: 'transform 200ms ease, box-shadow 200ms ease, background-position 300ms ease',
                      '&:hover': {
                        transform: 'translateY(-1px)',
                        backgroundPosition: 'right center',
                        boxShadow:
                          theme.palette.mode === 'dark'
                            ? '0 22px 50px -20px rgba(59,130,246,0.65)'
                            : '0 22px 50px -20px rgba(37,99,235,0.55)',
                      },
                      '&::after': {
                        content: "''",
                        position: 'absolute',
                        inset: 0,
                        background: 'linear-gradient(120deg, rgba(255,255,255,0.32), rgba(255,255,255,0))',
                        opacity: 0,
                        transition: 'opacity 250ms ease',
                      },
                      '&:hover::after': {
                        opacity: 0.35,
                      },
                    })}
                  >
                    {loading ? <CircularProgress size={20} /> : 'Entrar'}
                  </Button>

                  {err && (
                    <Alert
                      severity="error"
                      sx={(theme) => ({
                        borderRadius: 2.5,
                        bgcolor:
                          theme.palette.mode === 'dark'
                            ? 'rgba(248,113,113,0.16)'
                            : theme.palette.error.light,
                        color:
                          theme.palette.mode === 'dark'
                            ? 'rgba(254,202,202,0.95)'
                            : theme.palette.error.contrastText,
                        border:
                          theme.palette.mode === 'dark'
                            ? '1px solid rgba(248,113,113,0.35)'
                            : 'none',
                      })}
                    >
                      {err}
                    </Alert>
                  )}

                  <Stack
                    direction={{ xs: 'column', sm: 'row' }}
                    justifyContent="space-between"
                    spacing={1}
                    sx={{ pt: 0.5 }}
                  >
                    <Button
                      component={Link}
                      href="/login/forgot"
                      variant="text"
                      sx={{
                        fontWeight: 600,
                        textTransform: 'none',
                        color: (theme) =>
                          theme.palette.mode === 'dark'
                            ? 'rgba(148,163,255,0.85)'
                            : theme.palette.primary.main,
                        '&:hover': {
                          color: (theme) =>
                            theme.palette.mode === 'dark'
                              ? 'rgba(165,180,252,1)'
                              : theme.palette.primary.dark,
                        },
                      }}
                    >
                      Esqueceste-te da palavra-passe?
                    </Button>
                    <Button
                      component={Link}
                      href="/register"
                      variant="text"
                      sx={{
                        fontWeight: 600,
                        textTransform: 'none',
                        color: (theme) =>
                          theme.palette.mode === 'dark'
                            ? 'rgba(129,140,248,0.9)'
                            : theme.palette.secondary.main,
                        '&:hover': {
                          color: (theme) =>
                            theme.palette.mode === 'dark'
                              ? 'rgba(165,180,252,1)'
                              : theme.palette.secondary.dark,
                        },
                      }}
                    >
                      Criar conta
                    </Button>
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
