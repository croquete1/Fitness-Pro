'use client';

import * as React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { signIn, getSession } from 'next-auth/react';
import { Box, Stack, TextField, Button, Alert, Typography, CircularProgress, IconButton, InputAdornment } from '@mui/material';
import Link from 'next/link';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';

function homeFor(role?: string) {
  const r = String(role ?? '').toUpperCase();
  if (r === 'ADMIN') return '/dashboard/admin';
  if (r === 'PT' || r === 'TRAINER') return '/dashboard/pt';
  return '/dashboard/clients';
}

export default function LoginClient() {
  const router = useRouter();
  const sp = useSearchParams();
  const nextUrl = sp.get('next') || '';

  const [email, setEmail] = React.useState('');
  const [pw, setPw] = React.useState('');
  const [show, setShow] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [err, setErr] = React.useState<string | null>(null);

  const canSubmit = email.trim().length > 0 && pw.length > 0 && !loading;

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;
    setErr(null); setLoading(true);

    const res = await signIn('credentials', { email, password: pw, redirect: false });
    setLoading(false);

    if (!res || res.error) {
      if (res?.error === 'APPROVAL_REQUIRED') setErr('A tua conta ainda não foi aprovada por um administrador.');
      else if (res?.error === 'ACCOUNT_SUSPENDED') setErr('A tua conta está suspensa. Contacta o suporte.');
      else if (res?.error === 'ACCOUNT_NOT_LINKED') setErr('Conta não está corretamente associada. Contacta o suporte.');
      else setErr('Credenciais inválidas.');
      return;
    }

    const s = await getSession();
    const role = (s?.user as any)?.role as string | undefined;
    const target = (nextUrl && decodeURIComponent(nextUrl)) || homeFor(role) || '/dashboard';
    router.replace(target);
  }

  return (
    <Box sx={{ minHeight: '100dvh', display: 'grid', placeItems: 'center', p: 2 }}>
      <Box component="form" onSubmit={onSubmit}
        sx={{ width: '100%', maxWidth: 420, p: 3, borderRadius: 2, border: '1px solid', borderColor: 'divider', bgcolor: 'background.paper' }}>
        <Stack spacing={2}>
          <Typography variant="h5" fontWeight={600}>Iniciar sessão</Typography>

          <TextField label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required fullWidth />
          <TextField
            label="Palavra-passe"
            type={show ? 'text' : 'password'}
            value={pw}
            onChange={(e) => setPw(e.target.value)}
            required
            fullWidth
            inputProps={{ minLength: 6 }}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={() => setShow((v) => !v)} edge="end" aria-label="mostrar palavra-passe">
                    {show ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />

          <Button type="submit" variant="contained" disabled={!canSubmit}>
            {loading ? <CircularProgress size={20} /> : 'Entrar'}
          </Button>

          {err && <Alert severity="error">{err}</Alert>}

          <Stack direction="row" justifyContent="space-between">
            <Button component={Link} href="/login/forgot" variant="text">Esqueceste-te da palavra-passe?</Button>
            <Button component={Link} href="/register" variant="text">Registar</Button>
          </Stack>

          <Typography variant="caption" color="text.secondary">
            Após o registo, a tua conta ficará pendente até aprovação por um administrador.
          </Typography>
        </Stack>
      </Box>
    </Box>
  );
}
