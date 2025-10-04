import * as React from 'react';
import { createServerClient } from '@/lib/supabaseServer';
import PlansGrid, { type PlanRow } from './plans.client';

export const dynamic = 'force-dynamic';

export default async function AdminPlansPage() {
  const sb = createServerClient();
  const { data } = await sb
    .from('training_plans')
    .select('id, title, updated_at, created_at')
    .order('updated_at', { ascending: false, nullsFirst: false });

  const initial: PlanRow[] = (data ?? []).map((p: any) => ({
    id: String(p.id),
    title: p.title ?? null,
    created_at: p.created_at ?? null,
    updated_at: p.updated_at ?? null,
  }));

  return <PlansGrid initial={initial} />;
}
