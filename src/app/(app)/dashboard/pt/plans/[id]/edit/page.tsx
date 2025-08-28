// src/app/(app)/dashboard/pt/plans/[id]/edit/page.tsx
import { redirect } from 'next/navigation';
import NextDynamic from 'next/dynamic';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { Role, Status } from '@prisma/client';
import { createServerClient } from '@/lib/supabaseServer';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

// Carrega o editor no cliente
const PlanEditor = NextDynamic(() => import('@/components/plan/PlanEditor'), { ssr: false });

function toStatus(v: unknown): Status {
  const s = String(v ?? '').toUpperCase();
  if (s === 'ACTIVE') return Status.ACTIVE;
  if (s === 'PENDING') return Status.PENDING;
  if (s === 'SUSPENDED') return Status.SUSPENDED;
  // fallback seguro
  return Status.PENDING;
}

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
    redirect('/dashboard/pt/plans'); // não encontrado
  }

  // Verificação de acesso (admin tem sempre acesso; PT só ao que é dele)
  if (me.role === Role.TRAINER && plan.trainer_id !== me.id) {
    redirect('/dashboard/pt/plans');
  }

  // Converte o status string -> enum Status (tipagem do PlanEditor)
  const initial = {
    id: plan.id as string,
    trainerId: plan.trainer_id as string,
    clientId: plan.client_id as string,
    title: (plan.title ?? '') as string,
    notes: (plan.notes ?? '') as string,
    status: toStatus(plan.status), // <-- FIX DE TIPOS
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
