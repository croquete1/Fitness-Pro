// src/app/(app)/dashboard/pt/plans/[id]/edit/page.tsx
import { redirect } from 'next/navigation';
import NextDynamic from 'next/dynamic';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { Role } from '@prisma/client';
import { createServerClient } from '@/lib/supabaseServer';
import { toStatus } from '@/lib/status'; // <-- usa o util

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

const PlanEditor = NextDynamic(() => import('@/components/plan/PlanEditor'), { ssr: false });

export default async function Page({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  const me = session?.user as any;
  if (!me?.id) redirect('/login');
  if (![Role.ADMIN, Role.TRAINER].includes(me.role)) redirect('/dashboard');

  const sb = createServerClient();
  const { data: plan, error } = await sb
    .from('training_plans')
    .select('*')
    .eq('id', params.id)
    .single();

  if (error || !plan) {
    redirect('/dashboard/pt/plans');
  }
  if (me.role === Role.TRAINER && plan.trainer_id !== me.id) {
    redirect('/dashboard/pt/plans');
  }

  const initial = {
    id: plan.id as string,
    trainerId: plan.trainer_id as string,
    clientId: plan.client_id as string,
    title: (plan.title ?? '') as string,
    notes: (plan.notes ?? '') as string,
    status: toStatus(plan.status), // <-- FIX: normaliza string -> enum
    exercises: plan.exercises as any,
    updatedAt: plan.updated_at as string,
    createdAt: plan.created_at as string,
  };

  return (
    <div style={{ padding: 16, display: 'grid', gap: 12 }}>
      <div className="flex items-center justify-between">
        <h1 style={{ margin: 0 }}>Editar plano</h1>
      </div>

      <div className="card" style={{ padding: 12 }}>
        <PlanEditor mode="edit" initial={initial} />
      </div>
    </div>
  );
}
