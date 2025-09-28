import { createServerClient } from '@/lib/supabaseServer';
import PlansGrid, { type PlanRow } from './plans.client';

export const dynamic = 'force-dynamic';

export default async function AdminPlansPage() {
  const sb = createServerClient();
  const { data, error } = await sb
    .from('training_plans')
    .select('id, title, updated_at')
    .order('updated_at', { ascending: false, nullsFirst: false })
    .limit(500);
  if (error) console.warn('[admin/plans] fetch error:', error);

  const rows: PlanRow[] = (data ?? []).map((p: any) => ({
    id: String(p.id),
    title: p.title ?? null,
    updated_at: p.updated_at ?? null,
  }));

  return <PlansGrid initial={rows} />;
}
