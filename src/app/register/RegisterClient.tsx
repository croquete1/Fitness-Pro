// src/app/register/RegisterClient.tsx
'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Box, Paper, Stack, TextField, Button, Typography, Divider
} from '@mui/material';
import Image from 'next/image';

export default function RegisterClient() {
  const [name, setName] = React.useState('');
  const [username, setUsername] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [pw, setPw] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [err, setErr] = React.useState<string | null>(null);
  const router = useRouter();

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setLoading(true);
    const r = await fetch('/api/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: name.trim() || null, username: username.trim() || null, email: email.trim(), password: pw }),
    });
    setLoading(false);
    if (!r.ok) {
      const j = await r.json().catch(() => ({}));
      setErr(j?.message || 'Falha a criar conta.');
    } else {
      router.push('/login?created=1');
    }
  }

  return (
    <Box sx={{ minHeight: '100dvh', display: 'grid', gridTemplateColumns: { md: '1fr 1fr', xs: '1fr' } }}>
      <Box sx={{ display: { xs: 'none', md: 'block' }, background: 'linear-gradient(135deg,#5b7cfa 0%,#9359ff 100%)' }}>
        <Box sx={{ p: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
          <Image src="/logo.png" alt="Fitness Pro" width={28} height={28} />
          <Typography fontWeight={800} color="#fff">Fitness Pro</Typography>
        </Box>
      </Box>

      <Box sx={{ display: 'grid', placeItems: 'center', p: 3 }}>
        <Paper variant="outlined" sx={{ p: 3, borderRadius: 3, width: '100%', maxWidth: 420 }}>
          <Typography variant="h6" fontWeight={900}>Criar conta</Typography>
          <Box component="form" onSubmit={onSubmit} sx={{ mt: 2 }}>
            <Stack spacing={1.5}>
              <TextField label="Nome (opcional)" value={name} onChange={(e) => setName(e.target.value)} />
              <TextField label="Nome de utilizador (opcional)" value={username} onChange={(e) => setUsername(e.target.value)} />
              <TextField label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
              <TextField label="Palavra-passe" type="password" inputProps={{ minLength: 6 }} value={pw} onChange={(e) => setPw(e.target.value)} required />
              <Button type="submit" variant="contained" disabled={loading || !email || pw.length < 6}>
                {loading ? 'A criar…' : 'Criar conta'}
              </Button>
              {!!err && <Typography color="error" variant="body2">{err}</Typography>}
              <Stack direction="row" justifyContent="space-between">
                <Typography variant="body2">Já tens conta?</Typography>
                <Link href="/login">Entrar</Link>
              </Stack>
            </Stack>
          </Box>
          <Divider sx={{ mt: 2 }} />
          <Typography variant="caption" sx={{ opacity: 0.7 }}>A tua conta ficará pendente até aprovação.</Typography>
        </Paper>
      </Box>
    </Box>
  );
}
