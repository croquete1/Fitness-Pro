'use client';

import * as React from 'react';
import Link from 'next/link';
import { Box, Stack, Paper, Typography, Button, TextField, InputAdornment, Divider } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';

type Item = { id: string; label: string; sub?: string | null; href: string };
type Group = { items: Item[]; nextOffset: number | null };

type Data = {
  q: string;
  users: Group;
  plans: Group;
  exercises: Group;
  sessions: Group;
};

export default function SearchClient({ initialQuery, role }: { initialQuery: string; role: string }) {
  const [q, setQ] = React.useState(initialQuery ?? '');
  const [data, setData] = React.useState<Data | null>(null);
  const [loading, setLoading] = React.useState(false);

  async function run(opts?: Partial<Record<'usersOffset' | 'plansOffset' | 'exercisesOffset' | 'sessionsOffset', number>>) {
    const u = new URL('/api/search', window.location.origin);
    u.searchParams.set('q', q);
    u.searchParams.set('role', role);
    if (opts?.usersOffset) u.searchParams.set('usersOffset', String(opts.usersOffset));
    if (opts?.plansOffset) u.searchParams.set('plansOffset', String(opts.plansOffset));
    if (opts?.exercisesOffset) u.searchParams.set('exercisesOffset', String(opts.exercisesOffset));
    if (opts?.sessionsOffset) u.searchParams.set('sessionsOffset', String(opts.sessionsOffset));

    setLoading(true);
    try {
      const res = await fetch(u.toString(), { cache: 'no-store' });
      const json = await res.json();
      setData((prev) => {
        // se existir offset num grupo, fazemos “append”; caso contrário substituímos tudo
        if (!prev || (!opts?.usersOffset && !opts?.plansOffset && !opts?.exercisesOffset && !opts?.sessionsOffset)) {
          return json;
        }
        return {
          q: json.q,
          users: opts?.usersOffset ? { items: [...(prev.users?.items ?? []), ...(json.users?.items ?? [])], nextOffset: json.users?.nextOffset ?? null } : json.users,
          plans: opts?.plansOffset ? { items: [...(prev.plans?.items ?? []), ...(json.plans?.items ?? [])], nextOffset: json.plans?.nextOffset ?? null } : json.plans,
          exercises: opts?.exercisesOffset ? { items: [...(prev.exercises?.items ?? []), ...(json.exercises?.items ?? [])], nextOffset: json.exercises?.nextOffset ?? null } : json.exercises,
          sessions: opts?.sessionsOffset ? { items: [...(prev.sessions?.items ?? []), ...(json.sessions?.items ?? [])], nextOffset: json.sessions?.nextOffset ?? null } : json.sessions,
        };
      });
    } finally {
      setLoading(false);
    }
  }

  React.useEffect(() => {
    if (q.trim()) run();
    else setData(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q, role]);

  return (
    <Stack spacing={2}>
      <Box component="form" onSubmit={(e) => { e.preventDefault(); run(); }}>
        <TextField
          fullWidth
          placeholder="Pesquisar…"
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
      </Box>

      {!q.trim() && <Typography color="text.secondary">Escreve para pesquisar (acentos-insensível se a função estiver ativa). ✨</Typography>}

      {data && (
        <Stack spacing={3}>
          <Section
            title="🧑‍🤝‍🧑 Utilizadores"
            group={data.users}
            onMore={() => data.users.nextOffset != null && run({ usersOffset: data.users.nextOffset })}
          />
          <Divider />
          <Section
            title="📒 Planos"
            group={data.plans}
            onMore={() => data.plans.nextOffset != null && run({ plansOffset: data.plans.nextOffset })}
          />
          <Divider />
          <Section
            title="🏋️ Exercícios"
            group={data.exercises}
            onMore={() => data.exercises.nextOffset != null && run({ exercisesOffset: data.exercises.nextOffset })}
          />
          <Divider />
          <Section
            title="📆 Sessões"
            group={data.sessions}
            onMore={() => data.sessions.nextOffset != null && run({ sessionsOffset: data.sessions.nextOffset })}
          />
        </Stack>
      )}
    </Stack>
  );
}

function Section({ title, group, onMore }: { title: string; group: Group; onMore: () => void }) {
  return (
    <Stack spacing={1}>
      <Typography variant="subtitle1" fontWeight={800}>{title}</Typography>
      <Stack spacing={1}>
        {group.items.length === 0 && <Typography color="text.secondary">Sem resultados.</Typography>}
        {group.items.map((it) => (
          <Paper key={it.id} variant="outlined" sx={{ p: 1.25, borderRadius: 2 }}>
            <Stack direction="row" alignItems="center" justifyContent="space-between" gap={2}>
              <Stack>
                <Typography fontWeight={700}>{it.label}</Typography>
                {it.sub && <Typography variant="body2" color="text.secondary">{it.sub}</Typography>}
              </Stack>
              <Button component={Link} href={it.href} variant="contained" size="small">Abrir</Button>
            </Stack>
          </Paper>
        ))}
      </Stack>
      {group.nextOffset != null && (
        <Box sx={{ pt: 0.5 }}>
          <Button onClick={onMore} variant="text">Ver mais</Button>
        </Box>
      )}
    </Stack>
  );
}
