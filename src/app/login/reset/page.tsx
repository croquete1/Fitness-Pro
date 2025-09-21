'use client';

import * as React from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { supabaseBrowser } from '@/lib/supabaseBrowser';
import { Box, Stack, TextField, Button, Alert, Typography, CircularProgress } from '@mui/material';

export default function ResetPasswordPage() {
  const sp = useSearchParams();
  const router = useRouter();
  const code = sp.get('code');
  const sb = supabaseBrowser();

  const [ready, setReady] = React.useState(false);
  const [password, setPassword] = React.useState('');
  const [busy, setBusy] = React.useState(false);
  const [ok, setOk] = React.useState<string | null>(null);
  const [err, setErr] = React.useState<string | null>(null);

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
    if (!ready) return;
    setBusy(true); setErr(null); setOk(null);
    const { error } = await sb.auth.updateUser({ password });
    setBusy(false);
    if (error) { setErr('Não foi possível atualizar a palavra-passe. Tenta novamente.'); return; }
    setOk('Atualizada com sucesso.');
    setTimeout(() => router.replace('/login'), 1200);
  }

  return (
    <Box sx={{ minHeight: '100dvh', display: 'grid', placeItems: 'center', p: 2 }}>
      <Box component="form" onSubmit={onSubmit}
        sx={{ width: '100%', maxWidth: 440, p: 3, borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
        <Stack spacing={2}>
          <Typography variant="h5" fontWeight={600}>Definir nova palavra-passe</Typography>
          {!ready && !err && <Alert severity="info">A validar ligação…</Alert>}
          {err && <Alert severity="error">{err}</Alert>}
          <TextField label="Nova palavra-passe" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required fullWidth inputProps={{ minLength: 6 }} disabled={!ready || !!err} />
          <Button type="submit" variant="contained" disabled={!ready || !!err || busy}>
            {busy ? <CircularProgress size={20} /> : 'Guardar'}
          </Button>
          {ok && <Alert severity="success">{ok}</Alert>}
        </Stack>
      </Box>
    </Box>
  );
}
