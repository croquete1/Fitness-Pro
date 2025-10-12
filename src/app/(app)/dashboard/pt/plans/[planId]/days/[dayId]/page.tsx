// src/app/(app)/dashboard/pt/plans/[planId]/days/[dayId]/page.tsx
import * as React from 'react';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Container, Typography, Stack, Button, Chip } from '@mui/material';
import { createServerClient } from '@/lib/supabaseServer';
import { withDashboardContentSx } from '@/styles/dashboardContentSx';

export const dynamic = 'force-dynamic';

type Params = { planId: string; dayId: string };

export default async function PlanDayPage({ params }: { params: Promise<Params> }) {
  const { planId, dayId } = await params;
  const sb = createServerClient();

  const { data: { user } } = await sb.auth.getUser();
  if (!user) redirect('/login');

  const { data: day } = await sb
    .from('training_plan_days' as any)
    .select('id, name, notes, order_index')
    .eq('id', dayId)
    .single();

  if (!day) {
    return (
      <Container sx={withDashboardContentSx({ display: 'grid', gap: 2 })}>
        <Typography variant="h5" fontWeight={800}>📅 Dia</Typography>
        <Typography color="text.secondary" sx={{ mt: 2 }}>Dia não encontrado.</Typography>
      </Container>
    );
  }

  return (
    <Container sx={withDashboardContentSx({ display: 'grid', gap: 2 })}>
      <Stack direction="row" spacing={1} alignItems="center">
        <Typography variant="h5" fontWeight={800}>📅 Dia {day.order_index ?? ''}{day.name ? ` — ${day.name}` : ''}</Typography>
        <Chip size="small" label="PT" />
      </Stack>
      {day.notes && <Typography color="text.secondary" sx={{ mt: .5 }}>{day.notes}</Typography>}

      <Stack direction="row" spacing={1.5} sx={{ mt: 2 }}>
        <Button variant="contained" component={Link} href={`/dashboard/pt/plans/${planId}/days/${dayId}/blocks`}>🏋️ Ver blocos</Button>
        <Button variant="outlined" component={Link} href={`/dashboard/pt/plans/${planId}`}>← Voltar ao plano</Button>
      </Stack>
    </Container>
  );
}
