import * as React from 'react';
import { createServerClient } from '@/lib/supabaseServer';
import PlanEditor from './plan-editor.client';

export default async function Page({ params }: { params: { id: string } }) {
  const sb = createServerClient();

  const { data: plan } = await sb.from('training_plans')
    .select('id, title')
    .eq('id', params.id).single();

  const { data: blocks } = await sb.from('training_plan_blocks')
    .select('id, title, order_index')
    .eq('plan_id', params.id)
    .order('order_index', { ascending: true });

  return <PlanEditor planId={params.id} title={plan?.title ?? 'Plano'} initialItems={(blocks ?? []).map((b:any)=>({id:b.id, title:b.title, order_index:b.order_index}))} />;
}
