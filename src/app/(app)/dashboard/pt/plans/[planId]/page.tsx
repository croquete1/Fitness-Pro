// src/app/(app)/dashboard/pt/plans/[planId]/page.tsx
import * as React from 'react';
import { redirect } from 'next/navigation';
import { Box, Container, Stack, Typography, Card, CardContent, Button, Chip } from '@mui/material';
import Link from 'next/link';
import { createServerClient } from '@/lib/supabaseServer';

export const dynamic = 'force-dynamic';

type Params = { planId: string };

export default async function PlanPage({ params }: { params: Params }) {
  const { planId } = params;
  const sb = createServerClient();

  const { data: { user } } = await sb.auth.getUser();
  if (!user) redirect('/login');

  // Plano
  const { data: plan } = await sb
    .from('training_plans' as any)
    .select('id, title, description, updated_at')
    .eq('id', planId)
    .single();

  if (!plan) {
    return (
      <Container maxWidth="lg" sx={{ py: 3 }}>
        <Typography variant="h5" fontWeight={800}>🗂️ Plano</Typography>
        <Typography color="text.secondary" sx={{ mt: 2 }}>Plano não encontrado.</Typography>
      </Container>
    );
  }

  // Dias do plano
  const { data: days } = await sb
    .from('training_plan_days' as any)
    .select('id, name, order_index, notes, updated_at')
    .eq('plan_id', planId)
    .order('order_index', { ascending: true });

  return (
    <Container maxWidth="lg" sx={{ py: 3 }}>
      <Stack direction="row" alignItems="center" spacing={1}>
        <Typography variant="h5" fontWeight={800}>🗂️ {plan.title || 'Plano'}</Typography>
        <Chip size="small" label="PT" color="primary" />
      </Stack>
      {plan.description && (
        <Typography color="text.secondary" sx={{ mt: 0.5 }}>{plan.description}</Typography>
      )}

      <Stack direction="row" spacing={1.5} sx={{ mt: 2 }}>
        <Button variant="contained" component={Link} href={`/dashboard/pt/plans/${planId}/days/${encodeURIComponent('new')}`}>
          ➕ Criar dia
        </Button>
        <Button variant="outlined" component={Link} href="/dashboard/pt/plans">← Voltar</Button>
      </Stack>

      <Stack spacing={1.5} sx={{ mt: 3 }}>
        {(days ?? []).length === 0 && (
          <Typography color="text.secondary">Ainda não há dias neste plano.</Typography>
        )}

        {(days ?? []).map((d: any, idx: number) => (
          <Card key={d.id} variant="outlined">
            <CardContent sx={{ display: 'grid', gridTemplateColumns: '1fr auto', alignItems: 'center', gap: 1 }}>
              <Box>
                <Typography fontWeight={700}>📅 Dia {idx + 1}{d.name ? ` — ${d.name}` : ''}</Typography>
                {d.notes && <Typography variant="body2" color="text.secondary">{d.notes}</Typography>}
              </Box>
              <Stack direction="row" spacing={1}>
                <Button component={Link} href={`/dashboard/pt/plans/${planId}/days/${d.id}/blocks`} variant="text">🏋️ Exercícios/blocos</Button>
                <Button component={Link} href={`/dashboard/pt/plans/${planId}/days/${d.id}/blocks/order`} variant="outlined">↕️ Ordenar blocos</Button>
              </Stack>
            </CardContent>
          </Card>
        ))}
      </Stack>
    </Container>
  );
}
