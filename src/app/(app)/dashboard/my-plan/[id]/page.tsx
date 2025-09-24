// src/app/(app)/dashboard/my-plan/[id]/page.tsx
export const dynamic = 'force-dynamic';

import { redirect, notFound } from 'next/navigation';
import { createServerClient } from '@/lib/supabaseServer';
import { getSessionUserSafe } from '@/lib/session-bridge';
import { toAppRole } from '@/lib/roles';
import PlanDetailClient from './client';

type ExerciseRow = { id: string; name: string | null; gif_url?: string | null; video_url?: string | null; };
type DayItem = {
  id: string; day_index: number; order: number | null; exercise_id: string;
  sets?: number | null; reps?: string | number | null; rest_seconds?: number | null; notes?: string | null;
  exercise?: ExerciseRow | null;
};

export type PlanDetail = {
  id: string; title: string | null; status: string | null;
  start_date: string | null; end_date: string | null; client_id: string | null; trainer_id: string | null;
  days: Array<{ day_index: number; items: DayItem[] }>;
};

async function loadPlan(planId: string, userId: string, appRole: 'CLIENT' | 'PT' | 'ADMIN'): Promise<PlanDetail | null> {
  const sb = createServerClient();
  const { data: p } = await sb
    .from('training_plans')
    .select('id,title,status,start_date,end_date,client_id,trainer_id')
    .eq('id', planId).maybeSingle();
  if (!p) return null;

  if (appRole === 'CLIENT' && p.client_id !== userId) return null;
  if (appRole === 'PT' && p.trainer_id !== userId) {
    const { data: s } = await sb.from('sessions').select('id').eq('trainer_id', userId).eq('client_id', p.client_id).limit(1);
    if (!s?.length) return null;
  }

  let items: DayItem[] = [];
  try {
    const { data } = await sb
      .from('plan_day_exercises' as any)
      .select('id,day_index,order,exercise_id,sets,reps,rest_seconds,notes,exercise:exercises(id,name,gif_url,video_url)')
      .eq('plan_id', planId).order('day_index').order('order');
    if (data?.length) items = data as any;
  } catch {}
  if (!items.length) {
    const { data } = await sb
      .from('plan_day_items' as any)
      .select('id,day_index,order,exercise_id,sets,reps,rest_seconds,notes,exercise:exercises(id,name,gif_url,video_url)')
      .eq('plan_id', planId).order('day_index').order('order');
    items = (data ?? []) as any;
  }

  const days = Array.from({ length: 7 }, (_, i) => ({ day_index: i, items: items.filter(x => x.day_index === i) }));
  return { ...p, days };
}

export default async function PlanDetailPage({ params }: { params: { id: string } }) {
  const session = await getSessionUserSafe();
  const me = session?.user;
  if (!me?.id) redirect('/login');

  const appRole = toAppRole(me.role) ?? 'CLIENT';
  const plan = await loadPlan(params.id, me.id, appRole);
  if (!plan) notFound();

  return <PlanDetailClient meId={me.id} role={appRole} plan={plan} />;
}
