import * as React from 'react';
import { createServerClient } from '@/lib/supabaseServer';
import PlanEditor from './plan-editor.client';

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const sb = createServerClient();

  const { data: plan } = await sb.from('training_plans')
    .select('id, title')
    .eq('id', id).single();

  const { data: blocks } = await sb.from('training_plan_blocks')
    .select('id, title, order_index')
    .eq('plan_id', id)
    .order('order_index', { ascending: true });

  return <PlanEditor planId={id} title={plan?.title ?? 'Plano'} initialItems={(blocks ?? []).map((b:any)=>({id:b.id, title:b.title, order_index:b.order_index}))} />;
}
