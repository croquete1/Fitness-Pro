'use client';

import * as React from 'react';
import { Autocomplete, CircularProgress, TextField } from '@mui/material';

type Option = { id: string; label: string };

export default function AsyncAutocomplete(props: {
  label?: string;
  placeholder?: string;
  value: Option | null;
  onChange: (v: Option | null) => void;
  fetchUrl: string;
  sx?: any;
  minLength?: number;
}) {
  const { label, placeholder, value, onChange, fetchUrl, sx, minLength = 2 } = props;
  const [open, setOpen] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [options, setOptions] = React.useState<Option[]>([]);
  const [q, setQ] = React.useState('');

  React.useEffect(() => {
    let cancelled = false;
    async function run() {
      if (!open) return;
      if (q.trim().length < minLength) { setOptions([]); return; }
      setLoading(true);
      try {
        const u = new URL(fetchUrl, window.location.origin);
        u.searchParams.set('q', q.trim());
        u.searchParams.set('limit', '20');
        const r = await fetch(u.toString(), { cache: 'no-store' });
        const j = await r.json();
        if (!cancelled) setOptions(Array.isArray(j) ? j : (j.options ?? []));
      } catch {
        if (!cancelled) setOptions([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    void run();
    return () => { cancelled = true; };
  }, [open, q, fetchUrl, minLength]);

  return (
    <Autocomplete
      sx={sx}
      open={open}
      onOpen={() => setOpen(true)}
      onClose={() => setOpen(false)}
      loading={loading}
      value={value}
      onChange={(_, v) => onChange(v)}
      options={options}
      isOptionEqualToValue={(a, b) => a.id === b.id}
      getOptionLabel={(o) => o.label}
      renderInput={(params) => (
        <TextField
          {...params}
          label={label}
          placeholder={placeholder}
          onChange={(e) => setQ(e.target.value)}
          InputProps={{
            ...params.InputProps,
            endAdornment: (
              <>
                {loading ? <CircularProgress size={18} /> : null}
                {params.InputProps.endAdornment}
              </>
            ),
          }}
        />
      )}
    />
  );
}
