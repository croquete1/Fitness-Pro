'use client';

import * as React from 'react';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import CircularProgress from '@mui/material/CircularProgress';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';

export default function UsernameField({
  value, onChange, label = 'Username',
}: {
  value: string;
  onChange: (v: string) => void;
  label?: string;
}) {
  const [checking, setChecking] = React.useState(false);
  const [availability, setAvailability] = React.useState<{ available: boolean | null; source: 'supabase' | 'fallback' | null }>({
    available: null,
    source: null,
  });

  React.useEffect(() => {
    if (!value) { setAvailability({ available: null, source: null }); return; }
    const ctrl = new AbortController();
    const t = setTimeout(async () => {
      setChecking(true);
      try {
        const res = await fetch(`/api/username/check?u=${encodeURIComponent(value)}`, { signal: ctrl.signal });
        const json = await res.json();
        const source: 'supabase' | 'fallback' | null = json?.source === 'fallback' ? 'fallback' : json?.source === 'supabase' ? 'supabase' : null;
        if (!res.ok || !json?.ok) {
          setAvailability({ available: null, source: source ?? null });
          return;
        }
        setAvailability({ available: Boolean(json.available), source });
      } catch {
        setAvailability({ available: null, source: null });
      } finally {
        setChecking(false);
      }
    }, 400);
    return () => { clearTimeout(t); ctrl.abort(); };
  }, [value]);

  const offline = availability.source === 'fallback';
  const error = availability.available === false;
  let helper = '3–20 letras/números, ponto, hífen, underscore.';
  if (value.trim()) {
    if (checking) {
      helper = 'A verificar disponibilidade…';
    } else if (error) {
      helper = 'Este username não está disponível.';
    } else if (offline) {
      helper = 'Modo offline: não foi possível confirmar disponibilidade.';
    } else if (availability.available) {
      helper = 'Disponível.';
    }
  }

  return (
    <TextField
      fullWidth
      label={label}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      error={error}
      helperText={helper}
      InputProps={{
        endAdornment: (
          <InputAdornment position="end">
            {checking ? (
              <CircularProgress size={18} />
            ) : error ? (
              <CloseIcon color="error" />
            ) : availability.available && !offline ? (
              <CheckIcon color="success" />
            ) : null}
          </InputAdornment>
        )
      }}
    />
  );
}
