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
    if (!open) {
      setOptions([]);
      setLoading(false);
      return undefined;
    }

    const trimmed = q.trim();
    if (trimmed.length < minLength) {
      setOptions([]);
      setLoading(false);
      return undefined;
    }

    let active = true;
    const controller = new AbortController();
    setLoading(true);

    const handle = window.setTimeout(async () => {
      try {
        const url = new URL(fetchUrl, window.location.origin);
        url.searchParams.set('q', trimmed);
        url.searchParams.set('limit', '20');

        const response = await fetch(url.toString(), {
          cache: 'no-store',
          signal: controller.signal,
          headers: { accept: 'application/json' },
        });

        if (!response.ok) {
          if (active) {
            setOptions([]);
          }
          return;
        }

        const payload: unknown = await response
          .json()
          .catch(() => ({ options: [] as Option[] }));

        if (!active) return;

        const fromPayload = (payload as { options?: unknown })?.options;
        const nextOptions: Option[] = Array.isArray(payload)
          ? (payload as Option[])
          : Array.isArray(fromPayload)
          ? (fromPayload as Option[])
          : [];

        setOptions(nextOptions);
      } catch (error: unknown) {
        if ((error as { name?: string } | null)?.name === 'AbortError') return;
        if (active) setOptions([]);
      } finally {
        if (active) setLoading(false);
      }
    }, 180);

    return () => {
      active = false;
      controller.abort();
      window.clearTimeout(handle);
    };
  }, [open, q, fetchUrl, minLength]);

  const handleInputChange = React.useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setQ(event.target.value);
    },
    [],
  );

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
      slotProps={{
        paper: {
          elevation: 0,
          sx: { mt: 1 },
        },
        popper: {
          modifiers: [{ name: 'offset', options: { offset: [0, 8] } }],
        },
        listbox: {
          sx: {
            maxHeight: 280,
            '& .MuiAutocomplete-option + .MuiAutocomplete-option': {
              marginTop: 4,
            },
          },
        },
      }}
      renderInput={(params) => (
        <TextField
          {...params}
          label={label}
          placeholder={placeholder}
          onChange={handleInputChange}
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
