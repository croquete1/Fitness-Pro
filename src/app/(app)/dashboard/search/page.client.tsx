'use client';

import * as React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Box, Paper, TextField, InputAdornment, Stack, Typography, List, ListItemButton, ListItemText, Divider, Button, Chip
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';

type Item = { id: string; label: string; sub?: string | null; href: string };
type Group = { items: Item[]; nextOffset: number | null };
type Payload = {
  q: string;
  users: Group;
  plans: Group;
  exercises: Group;
  sessions: Group;
};

type Props = { initialQuery?: string; role?: string };

export default function SearchClient({ initialQuery = '', role = 'ADMIN' }: Props) {
  const router = useRouter();
  const sp = useSearchParams();
  const [q, setQ] = React.useState(initialQuery);
  const [loading, setLoading] = React.useState(false);
  const [data, setData] = React.useState<Payload | null>(null);

  const fetchData = React.useCallback(async (overrides?: Partial<Record<string, number>>) => {
    if (!q.trim()) { setData(null); return; }
    setLoading(true);
    try {
      const params = new URLSearchParams({ q, role });
      if (overrides?.usersOffset) params.set('usersOffset', String(overrides.usersOffset));
      if (overrides?.plansOffset) params.set('plansOffset', String(overrides.plansOffset));
      if (overrides?.exercisesOffset) params.set('exercisesOffset', String(overrides.exercisesOffset));
      if (overrides?.sessionsOffset) params.set('sessionsOffset', String(overrides.sessionsOffset));
      const res = await fetch(`/api/search?${params.toString()}`, { cache: 'no-store' });
      if (!res.ok) throw new Error(await res.text());
      const json = (await res.json()) as Payload;
      setData(json);
    } catch (e) {
      console.error('search', e);
    } finally {
      setLoading(false);
    }
  }, [q, role]);

  // debounced search ao escrever
  React.useEffect(() => {
    const t = setTimeout(() => {
      fetchData();
      const url = new URL(window.location.href);
      url.searchParams.set('q', q);
      url.searchParams.set('role', role);
      router.replace(url.toString(), { scroll: false });
    }, 250);
    return () => clearTimeout(t);
  }, [q, role, fetchData, router]);

  function GroupList({ title, icon, group, moreKey }: { title: string; icon: string; group: Group; moreKey: 'usersOffset'|'plansOffset'|'exercisesOffset'|'sessionsOffset' }) {
    if (!group || group.items.length === 0) return null;
    return (
      <Paper variant="outlined" sx={{ p: 1.5, borderRadius: 3 }}>
        <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: .5 }}>
          <Typography variant="h6" fontWeight={800}>{icon} {title}</Typography>
          <Chip label={`${group.items.length}${group.nextOffset ? '+' : ''}`} size="small" />
        </Stack>
        <List dense disablePadding>
          {group.items.map((it) => (
            <ListItemButton key={it.id} href={it.href} component="a">
              <ListItemText primary={it.label} secondary={it.sub ?? undefined} />
            </ListItemButton>
          ))}
        </List>
        {group.nextOffset !== null && (
          <>
            <Divider sx={{ my: 1 }} />
            <Button
              variant="text"
              onClick={() => {
                fetchData({ [moreKey]: group.nextOffset } as any);
              }}
            >
              Ver mais →
            </Button>
          </>
        )}
      </Paper>
    );
  }

  return (
    <Box sx={{ py: 2 }}>
      <Paper variant="outlined" sx={{ p: 1.5, borderRadius: 3, mb: 2 }}>
        <TextField
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Pesquisar (acentos-insensível) …"
          fullWidth
          autoFocus
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon fontSize="small" />
              </InputAdornment>
            ),
          }}
        />
        <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
          <Chip label={`Role: ${role}`} size="small" />
          {loading && <Chip label="A procurar…" size="small" />}
        </Stack>
      </Paper>

      {!data && q.trim() === '' && (
        <Typography color="text.secondary">Escreve para começar a pesquisar 🔎</Typography>
      )}

      {data && (
        <Stack spacing={2}>
          <GroupList title="Utilizadores" icon="🧑‍🤝‍🧑" group={data.users} moreKey="usersOffset" />
          <GroupList title="Planos" icon="🗂️" group={data.plans} moreKey="plansOffset" />
          <GroupList title="Exercícios" icon="🏋️" group={data.exercises} moreKey="exercisesOffset" />
          <GroupList title="Sessões" icon="📅" group={data.sessions} moreKey="sessionsOffset" />
          {data.users.items.length === 0 &&
           data.plans.items.length === 0 &&
           data.exercises.items.length === 0 &&
           data.sessions.items.length === 0 && (
            <Typography color="text.secondary">Sem resultados para “{q}”.</Typography>
          )}
        </Stack>
      )}
    </Box>
  );
}
