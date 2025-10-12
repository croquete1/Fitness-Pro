// src/app/register/RegisterClient.tsx
'use client';
import * as React from 'react';
import { RegisterSchema } from '@/lib/validation/auth';
import { z } from 'zod';
import {
  Alert,
  Box,
  Button,
  Link as MuiLink,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import BrandLogo from '@/components/BrandLogo';
import { toast } from '@/components/ui/Toaster';
import { brand } from '@/lib/brand';

export default function RegisterClient() {
  const [form, setForm] = React.useState({ name: '', email: '', password: '' });
  const [loading, setLoading] = React.useState(false);
  const [err, setErr] = React.useState<string|null>(null);
  const [ok, setOk] = React.useState(false);
  const [fieldErr, setFieldErr] = React.useState<{ name?: string; email?: string; password?: string }>({});
  const FormSchema = React.useMemo(
    () =>
      RegisterSchema.extend({
        name: z
          .string()
          .min(1, 'Nome é obrigatório.')
          .min(2, 'Nome muito curto.')
          .max(100, 'Nome muito longo.'),
        email: z.string().min(1, 'Email é obrigatório.').email('Email inválido.'),
        password: z
          .string()
          .min(1, 'Palavra-passe obrigatória.')
          .min(6, 'Mínimo 6 caracteres.'),
      }),
    []
  );

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setOk(false);
    setFieldErr({});
    const parsed = FormSchema.safeParse({ ...form });
    if (!parsed.success) {
      const nextErrors: { name?: string; email?: string; password?: string } = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path[0] as 'name' | 'email' | 'password' | undefined;
        if (key) nextErrors[key] = issue.message;
      }
      setFieldErr(nextErrors);
      toast('Verifica os campos destacados.', 2600, 'warning');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST', headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ ...parsed.data }),
      });
      const j = await res.json().catch(() => ({}));
      if (!res.ok) {
        const message = typeof j?.error === 'string' && j.error.length > 0
          ? j.error
          : 'Falha no registo.';
        throw new Error(message);
      }
      setOk(true);
      toast('Conta criada com sucesso! 🎉', 2500, 'success');
      setForm({ name: '', email: '', password: '' });
    } catch (error: any) {
      const message = error?.message || 'Falha de rede.';
      setErr(message);
      toast(message, 2500, 'error');
    } finally {
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
        background:
          'radial-gradient(1000px 500px at 20% -10%, rgba(25,118,210,.18), transparent), ' +
          'radial-gradient(900px 520px at 90% 0%, rgba(244,67,54,.14), transparent)',
      }}
    >
      <Paper sx={{ p: 3.5, width: '100%', maxWidth: 520, borderRadius: 4, backdropFilter: 'blur(6px)' }} elevation={6}>
        <Stack spacing={0.5} sx={{ mb: 2 }} alignItems="center">
          <BrandLogo size={72} />
          <Typography variant="h5" component="h1" fontWeight={800} textAlign="center">
            Criar conta
          </Typography>
          <Typography variant="body2" textAlign="center" sx={{ opacity: 0.75 }}>
            Junta-te à equipa {brand.name}.
          </Typography>
        </Stack>

        <form onSubmit={onSubmit} noValidate>
          <Stack spacing={2}>
            <TextField
              label="Nome"
              value={form.name}
              onChange={(e) => setForm((s) => ({ ...s, name: e.target.value }))}
              onBlur={(e) => {
                const res = FormSchema.pick({ name: true }).safeParse({ name: e.target.value });
                setFieldErr((prev) => ({ ...prev, name: res.success ? undefined : res.error.issues[0]?.message }));
              }}
              error={Boolean(fieldErr.name)}
              helperText={fieldErr.name || ' '}
              autoComplete="name"
              required
            />
            <TextField
              label="Email *"
              type="email"
              value={form.email}
              onChange={(e) => setForm((s) => ({ ...s, email: e.target.value }))}
              onBlur={(e) => {
                const res = FormSchema.pick({ email: true }).safeParse({ email: e.target.value });
                setFieldErr((prev) => ({ ...prev, email: res.success ? undefined : res.error.issues[0]?.message }));
              }}
              required
              autoComplete="email"
              error={Boolean(fieldErr.email)}
              helperText={fieldErr.email || ' '}
            />
            <TextField
              label="Palavra-passe *"
              type="password"
              value={form.password}
              onChange={(e) => setForm((s) => ({ ...s, password: e.target.value }))}
              onBlur={(e) => {
                const res = FormSchema.pick({ password: true }).safeParse({ password: e.target.value });
                setFieldErr((prev) => ({ ...prev, password: res.success ? undefined : res.error.issues[0]?.message }));
              }}
              required
              inputProps={{ minLength: 6 }}
              autoComplete="new-password"
              error={Boolean(fieldErr.password)}
              helperText={fieldErr.password || ' '}
            />
            <Button type="submit" variant="contained" disabled={loading}>
              {loading ? 'A criar…' : 'Criar conta'}
            </Button>
            {err && <Alert severity="error">{err}</Alert>}
            {ok && <Alert severity="success">Conta criada! Já podes iniciar sessão.</Alert>}
            <Typography variant="body2" sx={{ textAlign: 'center' }}>
              Já tens conta?{' '}
              <MuiLink href="/login" underline="hover">
                Inicia sessão
              </MuiLink>
            </Typography>
          </Stack>
        </form>
      </Paper>
    </Box>
  );
}
