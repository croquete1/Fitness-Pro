'use client';

import * as React from 'react';
import Image from 'next/image';
import { Box, Button, Container, Stack, TextField, Typography, Alert } from '@mui/material';
import { signIn } from 'next-auth/react';
import { toast } from '@/components/ui/Toaster';

export default function LoginPage() {
  const [loading, setLoading] = React.useState(false);
  const [err, setErr] = React.useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErr(null); setLoading(true);
    const f = new FormData(e.currentTarget);
    const email = String(f.get('email') || '');
    const password = String(f.get('password') || '');

    try {
      const res = await signIn('credentials', { email, password, redirect: false });
      if (!res || res.error) throw new Error(res?.error || 'Credenciais inválidas');
      toast('Sessão iniciada ✅', 2000, 'success');
      window.location.href = '/dashboard'; // redireciona genericamente
    } catch (e: any) {
      setErr(e.message || 'Falha no login');
      toast('Falha no login', 2500, 'error');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Container maxWidth="xs" sx={{ minHeight: '100dvh', display: 'grid', placeItems: 'center' }}>
      <Box component="form" onSubmit={onSubmit} sx={{ width: '100%', p: 3, borderRadius: 3, bgcolor: 'background.paper', boxShadow: 3, display:'grid', gap:2 }}>
        <Stack alignItems="center" gap={1}>
          {/* ✅ logo visível */}
          <Image src="/logo.png" alt="Fitness Pro" width={64} height={64} priority />
          <Typography variant="h5" fontWeight={800}>Entrar</Typography>
        </Stack>

        {err && <Alert severity="error">{err}</Alert>}

        <TextField name="email" label="Email" type="email" required autoComplete="username" />
        <TextField name="password" label="Palavra-passe" type="password" required autoComplete="current-password" />

        <Stack direction="row" gap={1} justifyContent="space-between" alignItems="center">
          <a href="/login/forgot" style={{ fontSize: 14 }}>Esqueceste-te?</a>
          <Button type="submit" variant="contained" disabled={loading}>{loading ? 'A entrar…' : '👉 Entrar'}</Button>
        </Stack>

        <Button href="/register">➕ Criar conta</Button>
      </Box>
    </Container>
  );
}
