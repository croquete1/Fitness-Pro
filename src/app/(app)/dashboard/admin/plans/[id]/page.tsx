import * as React from 'react';
import { notFound } from 'next/navigation';
import { Container, Box, Typography } from '@mui/material';
import { createServerClient } from '@/lib/supabaseServer';
import PlanFormClient, { mapRow } from '../PlanFormClient';

export const dynamic = 'force-dynamic';

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const sb = createServerClient();

  let row: any | null = null;
  const a = await sb.from('plans').select('*').eq('id', id).maybeSingle();
  if (a.data) row = a.data;
  else {
    const b = await sb.from('programs').select('*').eq('id', id).maybeSingle();
    if (b.data) row = b.data;
  }
  if (!row) return notFound();

  return (
    <Container maxWidth="sm" sx={{ display: 'grid', gap: 2 }}>
      <Typography variant="h5" fontWeight={800}>✏️ Editar plano</Typography>
      <Box sx={{ p: 3, borderRadius: 3, bgcolor: 'background.paper', border: '1px solid', borderColor: 'divider' }}>
        <PlanFormClient mode="edit" initial={mapRow(row)} />
      </Box>
    </Container>
  );
}
