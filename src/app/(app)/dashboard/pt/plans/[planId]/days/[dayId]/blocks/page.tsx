// src/app/(app)/dashboard/pt/plans/[planId]/days/[dayId]/blocks/page.tsx
import * as React from 'react';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Container, Typography, Stack, Button, Card, CardContent, Chip } from '@mui/material';
import { createServerClient } from '@/lib/supabaseServer';

export const dynamic = 'force-dynamic';

type Params = { planId: string; dayId: string };

export default async function PlanDayBlocksPage({ params }: { params: Params }) {
  const { planId, dayId } = params;
  const sb = createServerClient();

  const { data: { user } } = await sb.auth.getUser();
  if (!user) redirect('/login');

  const { data: blocks } = await sb
    .from('training_plan_blocks' as any)
    .select('id, title, notes, order_index')
    .eq('day_id', dayId)
    .order('order_index', { ascending: true });

  return (
    <Container maxWidth="lg" sx={{ py: 3 }}>
      <Stack direction="row" spacing={1} alignItems="center">
        <Typography variant="h5" fontWeight={800}>🏋️ Blocos do dia</Typography>
        <Chip size="small" label={`${(blocks ?? []).length}`} />
      </Stack>

      <Stack direction="row" spacing={1.5} sx={{ mt: 2 }}>
        <Button variant="contained" component={Link} href={`/dashboard/pt/plans/${planId}/days/${dayId}/blocks/order`}>↕️ Ordenar blocos</Button>
        <Button variant="outlined" component={Link} href={`/dashboard/pt/plans/${planId}`}>← Voltar ao plano</Button>
      </Stack>

      <Stack spacing={1.5} sx={{ mt: 3 }}>
        {(blocks ?? []).length === 0 && (
          <Typography color="text.secondary">Ainda não há blocos neste dia.</Typography>
        )}

        {(blocks ?? []).map((b: any, idx: number) => (
          <Card key={b.id} variant="outlined">
            <CardContent sx={{ display: 'grid', gridTemplateColumns: '1fr auto', alignItems: 'center', gap: 1 }}>
              <div>
                <Typography fontWeight={700}>#{b.order_index ?? idx + 1} — {b.title || 'Bloco'}</Typography>
                {b.notes && <Typography variant="body2" color="text.secondary">{b.notes}</Typography>}
              </div>
              <Stack direction="row" spacing={1}>
                <Button size="small" component={Link} href={`/dashboard/pt/plans/${planId}/days/${dayId}/blocks/${b.id}`}>✏️ Editar</Button>
              </Stack>
            </CardContent>
          </Card>
        ))}
      </Stack>
    </Container>
  );
}
