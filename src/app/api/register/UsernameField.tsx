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
  const [available, setAvailable] = React.useState<boolean | null>(null);

  React.useEffect(() => {
    if (!value) { setAvailable(null); return; }
    const ctrl = new AbortController();
    const t = setTimeout(async () => {
      setChecking(true);
      try {
        const res = await fetch(`/api/username/check?u=${encodeURIComponent(value)}`, { signal: ctrl.signal });
        const json = await res.json();
        setAvailable(!!json?.available);
      } catch {
        setAvailable(null);
      } finally {
        setChecking(false);
      }
    }, 400);
    return () => { clearTimeout(t); ctrl.abort(); };
  }, [value]);

  const error = available === false;
  const helper = error ? 'Este username não está disponível.' : '3–20 letras/números, ponto, hífen, underscore.';

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
            {checking ? <CircularProgress size={18} /> : available === true ? <CheckIcon color="success" /> : available === false ? <CloseIcon color="error" /> : null}
          </InputAdornment>
        )
      }}
    />
  );
}
