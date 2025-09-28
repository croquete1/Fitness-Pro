'use client';

import * as React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Box, Stack, TextField, InputAdornment, IconButton, Typography,
  List, ListItemButton, ListItemText, Button, Paper, Divider
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import OpenInNew from '@mui/icons-material/OpenInNew';

type Item = { id: string; label: string; sub?: string | null; href: string };
type Group = { items: Item[]; nextOffset: number | null };
type Resp = { q: string; users: Group; plans: Group; exercises: Group; sessions: Group };

const groups: Array<{ key: keyof Resp; title: string }> = [
  { key: 'users', title: 'Utilizadores' },
  { key: 'plans', title: 'Planos' },
  { key: 'exercises', title: 'Exercícios' },
  { key: 'sessions', title: 'Sessões' },
];

export default function SearchClient({ initialQuery, role }: { initialQuery?: string; role: string }) {
  const sp = useSearchParams();
  const router = useRouter();
  const [q, setQ] = React.useState(initialQuery ?? (sp.get('q') ?? ''));
  const [data, setData] = React.useState<Resp | null>(null);
  const [loading, setLoading] = React.useState(false);
  const debounce = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetchSearch = React.useCallback(async (query: string, extra: Record<string, number> = {}) => {
    const u = new URL('/api/search', window.location.origin);
    u.searchParams.set('q', query);
    u.searchParams.set('role', role);
    for (const [k, v] of Object.entries(extra)) u.searchParams.set(k, String(v));
    setLoading(true);
    const res = await fetch(u.toString(), { cache: 'no-store' });
    const json = (await res.json()) as Resp;
    setData((prev) => {
      // se for “ver mais” num grupo, merge incremental
      if (prev && json.q === prev.q) {
        const merged: Resp = { ...json };
        for (const g of groups) {
          const key = g.key as keyof Resp;
          const oldG = (prev as any)[key] as Group;
          const newG = (json as any)[key] as Group;
          if (oldG?.items?.length && newG?.items?.length && (newG?.nextOffset ?? 0) > (oldG?.items?.length ?? 0)) {
            merged[key] = {
              items: [...oldG.items, ...newG.items],
              nextOffset: newG.nextOffset,
            } as any;
          }
        }
        return merged;
      }
      return json;
    });
    setLoading(false);
  }, [role]);

  // pesquisa ao escrever (debounce)
  React.useEffect(() => {
    if (debounce.current) clearTimeout(debounce.current);
    debounce.current = setTimeout(() => {
      const query = q.trim();
      const dest = query ? `/dashboard/search?q=${encodeURIComponent(query)}` : '/dashboard/search';
      router.replace(dest);
      if (query) fetchSearch(query);
      else setData(null);
    }, 350);
    return () => { if (debounce.current) clearTimeout(debounce.current); };
  }, [q, fetchSearch, router]);

  React.useEffect(() => {
    const initial = (initialQuery ?? '').trim();
    if (initial) fetchSearch(initial);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleMore = (groupKey: 'users' | 'plans' | 'exercises' | 'sessions') => {
    if (!data) return;
    const next = (data[groupKey] as Group)?.nextOffset;
    if (next == null) return;
    fetchSearch(data.q, { [`${groupKey}Offset`]: next });
  };

  return (
    <Stack spacing={2}>
      <TextField
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Pesquisar…"
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon fontSize="small" />
            </InputAdornment>
          ),
        }}
      />

      {loading && <Typography variant="body2">A pesquisar…</Typography>}

      {data && groups.map(({ key, title }) => {
        const g = data[key] as Group;
        if (!g?.items?.length) return null;
        return (
          <Paper key={String(key)} sx={{ p: 1 }}>
            <Typography variant="overline" color="text.secondary" sx={{ px: 1 }}>{title}</Typography>
            <List dense>
              {g.items.map((it) => (
                <ListItemButton key={it.id} href={it.href} component="a">
                  <ListItemText primary={it.label} secondary={it.sub ?? undefined} />
                  <IconButton edge="end" size="small">
                    <OpenInNew fontSize="inherit" />
                  </IconButton>
                </ListItemButton>
              ))}
            </List>
            <Divider />
            <Box sx={{ p: 1, textAlign: 'center' }}>
              <Button
                size="small"
                variant="outlined"
                onClick={() => handleMore(key as any)}
                disabled={g.nextOffset == null}
              >
                Ver mais
              </Button>
            </Box>
          </Paper>
        );
      })}
    </Stack>
  );
}
