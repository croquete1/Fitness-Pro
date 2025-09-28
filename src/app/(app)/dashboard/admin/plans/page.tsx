import { Container, Typography } from '@mui/material';
import { createServerClient } from '@/lib/supabaseServer';
import PlansGrid, { type PlanRow } from './plans.client';

export const dynamic = 'force-dynamic';

export default async function Page() {
  const sb = createServerClient();
  const { data } = await sb
    .from('training_plans')
    .select('id, title, active, updated_at, owner:profiles(full_name)')
    .order('updated_at', { ascending: false, nullsFirst: false });

  const initial: PlanRow[] = (data ?? []).map((p: any) => ({
    id: String(p.id),
    title: p.title ?? null,
    owner_name: p.owner?.full_name ?? null,
    active: !!p.active,
    updated_at: p.updated_at ?? null,
  }));

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      <Typography variant="h5" fontWeight={800} sx={{ mb: 2 }}>Planos</Typography>
      <PlansGrid initial={initial} />
    </Container>
  );
}
