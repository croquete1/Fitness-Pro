// src/app/(app)/dashboard/search/SearchClient.tsx
'use client';

import * as React from 'react';
import useSWR from 'swr';
import {
  Box, Container, Stack, Typography, TextField, InputAdornment,
  List, ListItemButton, ListItemText, Divider, Button, Paper
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';

type Group = { items: { id: string; label: string; sub?: string | null; href: string }[]; nextOffset: number | null };

type ApiResp = {
  q: string;
  users: Group;
  plans: Group;
  exercises: Group;
  sessions: Group;
};

const fetcher = (url: string) => fetch(url).then((r) => r.json());

function GroupList({ title, data, onMore }: {
  title: string; data: Group; onMore?: () => void;
}) {
  return (
    <Paper variant="outlined" sx={{ p: 1, borderRadius: 2 }}>
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ px: 1, py: 0.5 }}>
        <Typography variant="subtitle1" fontWeight={800}>{title}</Typography>
        {onMore && data.nextOffset !== null && (
          <Button size="small" onClick={onMore}>Ver mais</Button>
        )}
      </Stack>
      <List dense disablePadding>
        {data.items.map((it) => (
          <ListItemButton key={it.id} component="a" href={it.href}>
            <ListItemText primary={it.label} secondary={it.sub ?? undefined} />
          </ListItemButton>
        ))}
        {data.items.length === 0 && (
          <Typography sx={{ px: 2, py: 1 }} color="text.secondary">Sem resultados.</Typography>
        )}
      </List>
    </Paper>
  );
}

export default function SearchClient({ initialQuery = '', role = 'ADMIN' }: { initialQuery?: string; role?: string }) {
  const [q, setQ] = React.useState(initialQuery);
  const [offsets, setOffsets] = React.useState({ users: 0, plans: 0, exercises: 0, sessions: 0 });

  const qs = new URLSearchParams({
    q, role,
    usersOffset: String(offsets.users),
    plansOffset: String(offsets.plans),
    exercisesOffset: String(offsets.exercises),
    sessionsOffset: String(offsets.sessions),
  }).toString();

  // debounce 300ms
  const [url, setUrl] = React.useState<string | null>(null);
  React.useEffect(() => {
    const h = setTimeout(() => setUrl(`/api/search?${qs}`), 300);
    return () => clearTimeout(h);
  }, [qs]);

  const { data } = useSWR<ApiResp>(url, fetcher);

  const more = (group: keyof typeof offsets) => () => {
    const next = data?.[group]?.nextOffset;
    if (next !== null && typeof next === 'number') {
      setOffsets((o) => ({ ...o, [group]: next }));
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 3 }}>
      <Typography variant="h5" fontWeight={800} sx={{ mb: 2 }}>🔎 Pesquisa</Typography>

      <TextField
        autoFocus
        placeholder="Pesquisa global…"
        fullWidth
        value={q}
        onChange={(e) => setQ(e.target.value)}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon fontSize="small" />
            </InputAdornment>
          ),
        }}
      />

      <Divider sx={{ my: 2 }} />

      <Stack spacing={2}>
        <GroupList title="Utilizadores"  data={data?.users     ?? { items: [], nextOffset: null }} onMore={more('users')} />
        <GroupList title="Planos"        data={data?.plans     ?? { items: [], nextOffset: null }} onMore={more('plans')} />
        <GroupList title="Exercícios"    data={data?.exercises ?? { items: [], nextOffset: null }} onMore={more('exercises')} />
        <GroupList title="Sessões"       data={data?.sessions  ?? { items: [], nextOffset: null }} onMore={more('sessions')} />
      </Stack>
    </Container>
  );
}
