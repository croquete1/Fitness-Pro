// src/app/login/page.tsx
'use client';

import * as React from 'react';
import Image from 'next/image';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { z } from 'zod';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import Link from 'next/link';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import Visibility from '@mui/icons-material/Visibility';
import LightModeIcon from '@mui/icons-material/LightMode';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import { useTheme as useNextTheme } from 'next-themes';

const schema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(1, 'Palavra-passe obrigatória'),
});

export default function LoginPage() {
  const { resolvedTheme, setTheme } = useNextTheme();
  const router = useRouter();
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [submitting, setSubmitting] = React.useState(false);
  const [showPwd, setShowPwd] = React.useState(false);
  const [touched, setTouched] = React.useState<{email?: boolean; password?: boolean}>({});
  const [formError, setFormError] = React.useState<string | null>(null);

  const parsed = schema.safeParse({ email, password });
  const emailErr = !parsed.success && touched.email ? parsed.error.flatten().fieldErrors.email?.[0] : undefined;
  const pwdErr   = !parsed.success && touched.password ? parsed.error.flatten().fieldErrors.password?.[0] : undefined;

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setTouched({ email: true, password: true });
    const res = schema.safeParse({ email, password });
    if (!res.success) return;
    setSubmitting(true);
    setFormError(null);
    try {
      const r = await signIn('credentials', { email, password, redirect: false });
      if (r?.ok) {
        router.replace('/dashboard');
      } else {
        setFormError('Credenciais inválidas');
      }
    } catch (err) {
      setFormError('Ocorreu um erro ao iniciar sessão');
    } finally {
      setSubmitting(false);
    }
  }

  const dark = resolvedTheme === 'dark';

  return (
    <Box sx={{
      minHeight: '100dvh',
      display: 'grid',
      placeItems: 'center',
      p: 2,
      background:
        'radial-gradient(1200px 400px at 20% -10%, rgba(99,102,241,.18), transparent 60%), radial-gradient(1000px 360px at 80% -10%, rgba(56,189,248,.15), transparent 60%)'
    }}>
      <Card elevation={8} sx={{ width: 560, maxWidth: '100%', borderRadius: 4 }}>
        <CardHeader
          title={
            <Box sx={{ textAlign: 'center', mt: 2 }}>
              {/* LOGO — usar /logo.png (não /public/logo.png) */}
              <Image src="/logo.png" alt="Fitness Pro" width={40} height={40} priority />
              <Typography variant="h5" fontWeight={800} sx={{ mt: 1 }}>
                Bem-vindo ao Fitness Pro
              </Typography>
              <Typography variant="body2" sx={{ opacity: .75 }}>
                Inicia sessão para acederes ao teu painel (Admin, PT ou Cliente).
              </Typography>
            </Box>
          }
          action={
            <IconButton
              aria-label="Alternar tema"
              onClick={() => setTheme(dark ? 'light' : 'dark')}
              sx={{ mt: 1, mr: 1 }}
            >
              {dark ? <LightModeIcon /> : <DarkModeIcon />}
            </IconButton>
          }
          sx={{ pb: 0 }}
        />
        <CardContent sx={{ pt: 0 }}>
          <Box component="form" onSubmit={onSubmit} sx={{ display: 'grid', gap: 2, mt: 1 }}>
            <TextField
              label="Email * *"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onBlur={() => setTouched((t) => ({ ...t, email: true }))}
              error={!!emailErr}
              helperText={emailErr}
              autoComplete="email"
              fullWidth
            />
            <TextField
              label="Palavra-passe * *"
              type={showPwd ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onBlur={() => setTouched((t) => ({ ...t, password: true }))}
              error={!!pwdErr}
              helperText={pwdErr}
              autoComplete="current-password"
              fullWidth
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowPwd((v) => !v)} edge="end" aria-label="Mostrar/ocultar">
                      {showPwd ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                )
              }}
            />

            <Button
              type="submit"
              variant="contained"
              size="large"
              disabled={submitting}
              startIcon={submitting ? <CircularProgress size={18} /> : undefined}
            >
              {submitting ? 'A entrar…' : 'Entrar'}
            </Button>

            {formError && (
              <Typography color="error" variant="body2">{formError}</Typography>
            )}

            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: .5 }}>
              <Link href="/login/forgot">ESQUECESTE-TE DA PALAVRA-PASSE?</Link>
              <Link href="/register">CRIAR CONTA</Link>
            </Box>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}
