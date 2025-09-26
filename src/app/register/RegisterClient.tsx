// src/app/register/RegisterClient.tsx
'use client';
import * as React from 'react';
import { z } from 'zod';
import { RegisterSchema } from '@/lib/validation/auth';
import { Box, Paper, Stack, TextField, Button, Alert, Typography } from '@mui/material';

export default function RegisterClient() {
  const [form, setForm] = React.useState({ email: '', password: '', name: '' });
  const [loading, setLoading] = React.useState(false);
  const [err, setErr] = React.useState<string|null>(null);
  const [ok, setOk] = React.useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null); setOk(false);
    const parsed = RegisterSchema.safeParse({ ...form });
    if (!parsed.success) { setErr('Verifica os campos.'); return; }
    setLoading(true);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST', headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ ...form }),
      });
      const j = await res.json().catch(() => ({}));
      if (!res.ok) { setErr(j.error || 'Falha no registo.'); }
      else { setOk(true); }
    } catch { setErr('Falha de rede.'); }
    setLoading(false);
  }

  return (
    <Box sx={{ minHeight: '100dvh', display:'grid', placeItems:'center', p:2 }}>
      <Paper sx={{ p:3, width:'100%', maxWidth:520, borderRadius:4 }}>
        <Typography variant="h5" sx={{ mb:2 }}>Criar conta</Typography>
        <form onSubmit={onSubmit}>
          <Stack spacing={2}>
            <TextField label="Nome" value={form.name}
              onChange={(e) => setForm(s => ({...s, name:e.target.value}))}/>
            <TextField label="Email *" type="email" value={form.email}
              onChange={(e) => setForm(s => ({...s, email:e.target.value}))} required/>
            <TextField label="Palavra-passe *" type="password" value={form.password}
              onChange={(e) => setForm(s => ({...s, password:e.target.value}))} required inputProps={{ minLength:6 }}/>
            <Button type="submit" variant="contained" disabled={loading}>
              {loading ? 'A criar…' : 'Criar conta'}
            </Button>
            {err && <Alert severity="error">{err}</Alert>}
            {ok && <Alert severity="success">Conta criada! Já podes iniciar sessão.</Alert>}
          </Stack>
        </form>
      </Paper>
    </Box>
  );
}
