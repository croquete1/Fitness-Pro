'use client';

import * as React from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { supabaseBrowser } from '@/lib/supabaseBrowser';
import {
  Box, Stack, TextField, Button, Alert, Typography, CircularProgress, Paper, Divider
} from '@mui/material';
import ThemeToggle from '@/components/ThemeToggle';
import BrandLogo from '@/components/BrandLogo';

function pwIssues(pw: string) {
  const issues: string[] = [];
  if (pw.length < 8) issues.push('min. 8');
  if (!/[A-Za-z]/.test(pw)) issues.push('letra');
  if (!/\d/.test(pw)) issues.push('número');
  return issues;
}

export default function ResetClient() {
  const sp = useSearchParams();
  const router = useRouter();
  const code = sp.get('code');
  const sb = supabaseBrowser();

  const [ready, setReady] = React.useState(false);
  const [password, setPassword] = React.useState('');
  const [busy, setBusy] = React.useState(false);
  const [ok, setOk] = React.useState<string | null>(null);
  const [err, setErr] = React.useState<string | null>(null);

  const issues = pwIssues(password);
  const valid = ready && issues.length === 0 && !busy;

  React.useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!code) { setErr('Ligação inválida.'); return; }
      const { error } = await sb.auth.exchangeCodeForSession(code);
      if (cancelled) return;
      if (error) setErr('Ligação inválida ou expirada. Pede um novo email de recuperação.');
      else setReady(true);
    })();
    return () => { cancelled = true; };
  }, [code, sb]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!valid) return;
    setBusy(true); setErr(null); setOk(null);
    const { error } = await sb.auth.updateUser({ password });
    setBusy(false);
    if (error) { setErr('Não foi possível atualizar a palavra-passe. Tenta novamente.'); return; }
    setOk('Atualizada com sucesso.');
    setTimeout(() => router.replace('/login'), 1200);
  }

  return (
    <Box sx={{
      minHeight: '100dvh',
      display: 'grid',
      placeItems: 'center',
      p: 2,
      bgcolor: 'background.default',
      backgroundImage: `
        radial-gradient(1000px 600px at 50% -10%, rgba(255,255,255,0.06), transparent),
        linear-gradient(180deg, rgba(255,255,255,0.02), transparent 120px)
      `,
    }}>
      <Paper sx={{
        width: '100%', maxWidth: 520, p: { xs: 3, sm: 4 }, borderRadius: 4,
        position: 'relative', bgcolor: 'background.paper', backdropFilter: 'saturate(120%) blur(2px)',
      }}>
        <Box sx={{ position: 'absolute', top: 8, right: 8 }}><ThemeToggle /></Box>

        <Stack alignItems="center" spacing={1.5} sx={{ mb: 1 }}>
          <BrandLogo size={56} />
          <Typography variant="h5" fontWeight={800} textAlign="center">Definir nova palavra-passe</Typography>
          <Typography variant="body2" color="text.secondary" textAlign="center">
            Introduz a tua nova palavra-passe para concluires a recuperação.
          </Typography>
        </Stack>

        <Divider sx={{ my: 2 }} />

        <Box component="form" onSubmit={onSubmit} noValidate>
          <Stack spacing={2.25}>
            {!ready && !err && <Alert severity="info">A validar ligação…</Alert>}
            {err && <Alert severity="error">{err}</Alert>}
            <TextField
              label="Nova palavra-passe"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              fullWidth
              inputProps={{ minLength: 8 }}
              disabled={!ready || !!err}
              error={issues.length > 0 && password.length > 0}
              helperText={
                password.length === 0
                  ? 'Mín. 8 caracteres, inclui letras e números'
                  : issues.length > 0
                    ? `Falta: ${issues.join(' · ')}`
                    : 'Tudo ok!'
              }
            />
            <Button type="submit" variant="contained" disabled={!valid}>
              {busy ? <CircularProgress size={20} /> : 'Guardar'}
            </Button>
            {ok && <Alert severity="success">{ok}</Alert>}
          </Stack>
        </Box>
      </Paper>
    </Box>
  );
}
