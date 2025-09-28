'use client';

import * as React from 'react';
import useSWR from 'swr';
import { useSearchParams, useRouter } from 'next/navigation';
import { Box, Paper, Typography, Link as MLink, CircularProgress, Stack, Button } from '@mui/material';

const fetcher = (url: string) => fetch(url).then(r => r.json());

function Group({ title, items, hrefMore }: { title: string; items: any[]; hrefMore: string }) {
  return (
    <Paper sx={{ p: 2 }}>
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1 }}>
        <Typography fontWeight={800}>{title}</Typography>
        <Button href={hrefMore} component={MLink} underline="none">VER MAIS</Button>
      </Stack>
      {items.length === 0 ? (
        <Typography variant="body2" color="text.secondary">Sem resultados.</Typography>
      ) : (
        <Stack gap={1}>
          {items.map((it) => (
            <Box key={it.id} sx={{ display:'flex', alignItems:'center', gap:1.5 }}>
              <Typography fontWeight={700}>{it.title ?? it.name ?? it.email}</Typography>
              <Typography variant="body2" color="text.secondary">{it.subtitle ?? it.role ?? ''}</Typography>
            </Box>
          ))}
        </Stack>
      )}
    </Paper>
  );
}

export default function SearchPageClient() {
  const params = useSearchParams();
  const q = (params.get('q') ?? '').trim();
  const { data, isLoading } = useSWR(q ? `/api/search?q=${encodeURIComponent(q)}` : null, fetcher);

  if (!q) return <Typography variant="body2" color="text.secondary" sx={{ p: 2 }}>Escreve para pesquisar…</Typography>;

  return (
    <Box sx={{ display: 'grid', gap: 2 }}>
      <Typography variant="h5" fontWeight={800} sx={{ mt: 1 }}>Resultados para “{q}”</Typography>
      {isLoading ? <CircularProgress /> : (
        <>
          <Group title="Planos"     items={data?.plans ?? []}     hrefMore={`/dashboard/admin/plans?search=${encodeURIComponent(q)}`} />
          <Group title="Exercícios" items={data?.exercises ?? []} hrefMore={`/dashboard/admin/exercises?search=${encodeURIComponent(q)}`} />
          <Group title="Sessões"    items={data?.sessions ?? []}  hrefMore={`/dashboard/admin/sessions?search=${encodeURIComponent(q)}`} />
          <Group title="Utilizadores" items={data?.users ?? []}   hrefMore={`/dashboard/admin/users?search=${encodeURIComponent(q)}`} />
        </>
      )}
      <Typography variant="caption" color="text.secondary">Dica: abre “Ver mais” para filtrar/exportar com o DataGrid.</Typography>
    </Box>
  );
}
