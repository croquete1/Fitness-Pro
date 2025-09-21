// src/app/login/LoginClient.tsx
'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { signIn, useSession } from 'next-auth/react';
import Link from 'next/link';
import {
  Box, Paper, Stack, TextField, IconButton, InputAdornment, Button, Typography, Divider,
} from '@mui/material';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import Visibility from '@mui/icons-material/Visibility';
import Image from 'next/image';

export default function LoginClient() {
  const router = useRouter();
  const { status } = useSession(); // se já está autenticado, redireciona
  const [identifier, setIdentifier] = React.useState('');
  const [pw, setPw] = React.useState('');
  const [show, setShow] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [err, setErr] = React.useState<string | null>(null);

  // Se o utilizador já estiver autenticado e cair no /login, manda para /dashboard
  React.useEffect(() => {
    if (status === 'authenticated') {
      router.replace('/dashboard');
    }
  }, [status, router]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!identifier.trim() || pw.length < 6) return;

    setErr(null);
    setLoading(true);

    // Usamos redirect:false mas navegamos manualmente após sucesso
    const res = await signIn('credentials', {
      redirect: false,
      identifier: identifier.trim(),
      password: pw,
      callbackUrl: '/dashboard',
    });

    setLoading(false);

    if (res?.error) {
      // Erro genérico: credenciais inválidas / conta não aprovada / bloqueada, etc.
      setErr('Credenciais inválidas ou conta não autorizada.');
      return;
    }

    // Navega para a URL devolvida pelo NextAuth (ou /dashboard por defeito)
    const target = res?.url ?? '/dashboard';
    router.replace(target);
    // força refresh para que o App Router reidrate a sessão imediatamente
    router.refresh();
  }

  return (
    <Box sx={{ minHeight: '100dvh', display: 'grid', gridTemplateColumns: { md: '1fr 1fr', xs: '1fr' } }}>
      {/* Hero à esquerda */}
      <Box sx={{ display: { xs: 'none', md: 'block' }, position: 'relative',
        background: 'linear-gradient(135deg,#5b7cfa 0%,#9359ff 100%)' }}>
        <Box sx={{ p: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
          <Image src="/logo.png" alt="Fitness Pro" width={28} height={28} />
          <Typography fontWeight={800} color="#fff">Fitness Pro</Typography>
        </Box>
        <Box sx={{ position: 'absolute', inset: 0, display: 'grid', alignContent: 'end', p: 5, color: '#fff' }}>
          <Typography variant="h4" fontWeight={900}>Treina melhor.<br />Vive melhor.</Typography>
          <Typography sx={{ mt: 1, opacity: 0.9, maxWidth: 380 }}>
            Acompanha planos, sessões e progresso — tudo num só lugar, rápido e simples.
          </Typography>
          <Typography sx={{ mt: 6, fontSize: 12, opacity: 0.8 }}>
            © {new Date().getFullYear()} Fitness Pro
          </Typography>
        </Box>
      </Box>

      {/* Formulário */}
      <Box sx={{ display: 'grid', placeItems: 'center', p: 3 }}>
        <Paper variant="outlined" sx={{ p: 3, borderRadius: 3, width: '100%', maxWidth: 420 }}>
          <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 1 }}>
            <Image src="/logo.png" alt="Fitness Pro" width={32} height={32} />
            <Typography variant="h6" fontWeight={900}>Fitness Pro</Typography>
          </Stack>
          <Typography variant="caption" sx={{ opacity: 0.7, mb: 2, display: 'block' }}>
            Iniciar sessão
          </Typography>

          <Box component="form" onSubmit={onSubmit}>
            <Stack spacing={1.5}>
              <TextField
                label="Email ou nome de utilizador"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                inputProps={{ autoComplete: 'username' }}
                fullWidth
              />
              <TextField
                label="Palavra-passe"
                type={show ? 'text' : 'password'}
                value={pw}
                onChange={(e) => setPw(e.target.value)}
                inputProps={{ minLength: 6, autoComplete: 'current-password' }}
                fullWidth
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={() => setShow((v) => !v)} aria-label="alternar visibilidade">
                        {show ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
              <Button
                type="submit"
                variant="contained"
                disabled={loading || !identifier.trim() || pw.length < 6}
              >
                {loading ? 'A entrar…' : 'Entrar'}
              </Button>

              {!!err && (
                <Typography color="error" variant="body2" role="alert">
                  {err}
                </Typography>
              )}

              <Stack direction="row" justifyContent="space-between">
                <Link href="/login/forgot">Esqueceste-te da palavra-passe?</Link>
                <Link href="/register">Criar conta</Link>
              </Stack>
            </Stack>
          </Box>

          <Divider sx={{ my: 2 }} />
          <Typography variant="caption" sx={{ opacity: 0.7 }}>
            Após o registo, a tua conta fica pendente até aprovação por um administrador.
          </Typography>
        </Paper>
      </Box>
    </Box>
  );
}
