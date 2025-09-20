// src/components/search/GlobalSearchBox.tsx
'use client';

import * as React from 'react';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Autocomplete, { type AutocompleteChangeReason } from '@mui/material/Autocomplete';
import CircularProgress from '@mui/material/CircularProgress';
import SearchIcon from '@mui/icons-material/Search';
import { alpha } from '@mui/material/styles';

type SearchItem = {
  id: string;
  label: string;
  href: string;
  type?: string; // 'Utilizador' | 'Plano' | ...
};

type Props = {
  onPick: (href: string) => void;
  placeholder?: string;
};

export default function GlobalSearchBox({ onPick, placeholder = 'Pesquisar…' }: Props) {
  const [input, setInput] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [options, setOptions] = React.useState<SearchItem[]>([]);
  const debounceRef = React.useRef<number | null>(null);
  const abortRef = React.useRef<AbortController | null>(null);

  // cleanup on unmount
  React.useEffect(() => {
    return () => {
      if (debounceRef.current) window.clearTimeout(debounceRef.current);
      if (abortRef.current) abortRef.current.abort();
    };
  }, []);

  React.useEffect(() => {
    if (debounceRef.current) window.clearTimeout(debounceRef.current);

    const q = input.trim();
    if (!q) {
      setOptions([]);
      return;
    }

    debounceRef.current = window.setTimeout(async () => {
      try {
        if (abortRef.current) abortRef.current.abort();
        const ctrl = new AbortController();
        abortRef.current = ctrl;

        setLoading(true);
        const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`, { signal: ctrl.signal });
        const data = await res.json().catch(() => ({}));

        const items: SearchItem[] = (data?.items ?? []).map((it: any) => ({
          id: String(it.id ?? it.href ?? crypto.randomUUID()),
          label: String(it.label ?? it.name ?? it.title ?? it.email ?? 'Resultado'),
          href: String(it.href ?? '#'),
          type: it.type ?? 'Outros',
        }));

        setOptions(items);
      } catch {
        // ignore (abort/erro rede)
        setOptions([]);
      } finally {
        setLoading(false);
      }
    }, 220) as unknown as number;
  }, [input]);

  const handleChange = (_: any, value: SearchItem | string | null, reason: AutocompleteChangeReason) => {
    if (!value) return;
    const href = typeof value === 'string' ? `/search?q=${encodeURIComponent(value)}` : value.href;
    if (href) onPick(href);
  };

  return (
    <Autocomplete<SearchItem, false, false, true>
      freeSolo
      options={options}
      filterOptions={(x) => x} // não refiltrar no cliente
      groupBy={(o) => o.type ?? 'Outros'}
      getOptionLabel={(o) => (typeof o === 'string' ? o : o.label)}
      loading={loading}
      onInputChange={(_, v) => setInput(v)}
      onChange={handleChange}
      renderInput={(params) => (
        <TextField
          {...params}
          placeholder={placeholder}
          size="small"
          InputProps={{
            ...params.InputProps,
            startAdornment: (
              <Box sx={{ display: 'flex', alignItems: 'center', pl: 1, pr: 0.5 }}>
                <SearchIcon fontSize="small" />
              </Box>
            ),
            endAdornment: (
              <>
                {loading ? <CircularProgress size={16} sx={{ mr: 1 }} /> : null}
                {params.InputProps.endAdornment}
              </>
            ),
          }}
          sx={(t) => ({
            '& .MuiOutlinedInput-root': {
              backgroundColor: alpha(t.palette.text.primary, 0.04),
              '&:hover': { backgroundColor: alpha(t.palette.text.primary, 0.08) },
            },
          })}
        />
      )}
      renderOption={(props, option) => (
        <li {...props} key={typeof option === 'string' ? option : option.id}>
          {typeof option === 'string' ? option : option.label}
        </li>
      )}
    />
  );
}
