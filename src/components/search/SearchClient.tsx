'use client';

import * as React from 'react';
import {
  Box, Stack, TextField, InputAdornment, Typography,
  Card, CardContent, Button, Divider, Chip, CircularProgress,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import Link from 'next/link';

type Role = 'ADMIN' | 'TRAINER' | 'CLIENT';

type Item = { id: string; label: string; sub?: string | null; href?: string };
type Group = { items: Item[]; nextOffset: number | null };

type ApiResp = {
  q: string;
  users: Group;
  plans: Group;
  exercises: Group;
  sessions: Group;
};

function GroupBlock({ title, data, onMore }: { title: string; data: Group; onMore?: () => void }) {
  return (
    <Card variant="outlined">
      <CardContent>
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1 }}>
          <Typography variant="subtitle1" fontWeight={800}>{title}</Typography>
          {data.nextOffset !== null && (
            <Button size="small" onClick={onMore}>Ver mais</Button>
          )}
        </Stack>
        <Stack divider={<Divider flexItem />} spacing={1}>
          {data.items.length === 0 && (
            <Typography variant="body2" color="text.secondary">Sem resultados.</Typography>
          )}
          {data.items.map((it) => (
            <Box key={it.id} component={it.href ? Link : 'div'} href={it.href} sx={{ display: 'grid', gap: .25 }}>
              <Typography variant="body2" fontWeight={700}>{it.label}</Typography>
              {it.sub && <Typography variant="caption" color="text.secondary">{it.sub}</Typography>}
            </Box>
          ))}
        </Stack>
      </CardContent>
    </Card>
  );
}

export default function SearchClient({ initialQuery = '', role }: { initialQuery?: string; role: Role }) {
  const [q, setQ] = React.useState(initialQuery);
  const [loading, setLoading] = React.useState(false);
  const [data, setData] = React.useState<ApiResp | null>(null);
  const [offsets, setOffsets] = React.useState<{ [k in keyof Omit<ApiResp, 'q'>]?: number }>({});

  const fetchData = React.useCallback(async (append?: keyof Omit<ApiResp, 'q'>) => {
    setLoading(true);
    const params = new URLSearchParams({ q, role });
    if (append) {
      const next = offsets[append] ?? 0;
      params.set(`${append}Offset`, String(next));
    } else {
      setOffsets({});
    }
    const r = await fetch(`/api/search?${params.toString()}`, { credentials: 'include' });
    const j: ApiResp = await r.json();
    setData((prev) => {
      if (!prev || !append) return j;
      // append somente do grupo pedido
      return {
        q: j.q,
        users: append === 'users' ? { items: [...prev.users.items, ...j.users.items], nextOffset: j.users.nextOffset } : prev.users,
        plans: append === 'plans' ? { items: [...prev.plans.items, ...j.plans.items], nextOffset: j.plans.nextOffset } : prev.plans,
        exercises: append === 'exercises' ? { items: [...prev.exercises.items, ...j.exercises.items], nextOffset: j.exercises.nextOffset } : prev.exercises,
        sessions: append === 'sessions' ? { items: [...prev.sessions.items, ...j.sessions.items], nextOffset: j.sessions.nextOffset } : prev.sessions,
      };
    });
    // atualizar offsets locais
    if (append) {
      setOffsets((o) => ({ ...o, [append]: j[append].nextOffset ?? null as any }));
    } else {
      setOffsets({
        users: j.users.nextOffset ?? null as any,
        plans: j.plans.nextOffset ?? null as any,
        exercises: j.exercises.nextOffset ?? null as any,
        sessions: j.sessions.nextOffset ?? null as any,
      });
    }
    setLoading(false);
  }, [q, role, offsets]);

  // debounce da pesquisa
  React.useEffect(() => {
    const t = setTimeout(() => { if (q.trim().length) fetchData(); else setData(null); }, 240);
    return () => clearTimeout(t);
  }, [q, fetchData]);

  React.useEffect(() => {
    if (initialQuery) fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Stack spacing={2}>
      <TextField
        placeholder="Pesquisar utilizadores, planos, exercícios, sessões…"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon fontSize="small" />
            </InputAdornment>
          ),
          endAdornment: loading ? <CircularProgress size={18} /> : undefined,
        }}
      />
      {data ? (
        <Stack spacing={2}>
          <GroupBlock
            title="Utilizadores"
            data={data.users}
            onMore={data.users.nextOffset !== null ? () => fetchData('users') : undefined}
          />
          <GroupBlock
            title="Sessões"
            data={data.sessions}
            onMore={data.sessions.nextOffset !== null ? () => fetchData('sessions') : undefined}
          />
          <GroupBlock
            title="Planos"
            data={data.plans}
            onMore={data.plans.nextOffset !== null ? () => fetchData('plans') : undefined}
          />
          <GroupBlock
            title="Exercícios"
            data={data.exercises}
            onMore={data.exercises.nextOffset !== null ? () => fetchData('exercises') : undefined}
          />
        </Stack>
      ) : (
        <Stack direction="row" alignItems="center" spacing={1} sx={{ color: 'text.secondary' }}>
          <Chip label={role === 'ADMIN' ? 'Admin: pesquisa global' : role === 'TRAINER' ? 'PT: entidades atribuídas' : 'Cliente: entidades próprias'} size="small" />
          <Typography variant="body2">Começa a escrever para ver resultados.</Typography>
        </Stack>
      )}
    </Stack>
  );
}
