'use client';

import * as React from 'react';
import { Box, Button, Container, Stack, TextField, Typography, Alert, Link as MuiLink, Paper } from '@mui/material';
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
      // vamos sempre para /dashboard; o index lá redireciona por role
      window.location.href = '/dashboard';
    } catch (e: any) {
      setErr(e.message || 'Falha no login'); toast('Falha no login', 2500, 'error');
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
              src="/logo.png"
              alt="Fitness Pro"
              sx={{ width: 64, height: 64, objectFit: 'contain' }}
              onError={(ev: React.SyntheticEvent<HTMLImageElement>) => {
                const img = ev.currentTarget;
                const parent = img.parentElement;
                if (parent) {
                  const fallback = document.createElement('strong');
                  fallback.textContent = 'Fitness Pro';
                  fallback.style.fontSize = '1.5rem';
                  fallback.style.fontWeight = '800';
                  fallback.style.color = '#1976d2';
                  parent.replaceChild(fallback, img);
                }
              }}
            />
            <Typography variant="h5" fontWeight={800} textAlign="center">
              Bem-vindo ao Fitness Pro
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
              InputProps={{ inputProps: { inputMode: 'email' } }}
            />
            <TextField
              name="password"
              label="Palavra-passe"
              type="password"
              required
              autoComplete="current-password"
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
